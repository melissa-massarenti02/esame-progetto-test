import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import LocalStrategy from "passport-local";
import {getUserByCredentials, getUserById} from "./dao/user-dao.js";
import {getStations, getConnections} from "./dao/map-dao.js";
import {getLeaderboard} from "./dao/leaderboard-dao.js";
import {getRandomStartEndStations, shortestPath, validatePath, updateBestScore, getGameEvents, getStationInterchangeStatus} from "./dao/game-dao.js";

const app = express();
const port = 3001;

app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(session({
  secret: "secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: { 
    httpOnly: true,
    secure: false, 
    sameSite: "lax"}
}));

app.use(passport.initialize());
app.use(passport.session());

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

passport.use(new LocalStrategy(async function verify(username, password, callback) {
    try {
        if (!emailRegex.test(username)) {
            return callback(null, false, { message: "Formato email non valido" });
        }
        const user = await getUserByCredentials(username, password);
        if (!user) {
            return callback(null, false, { message: "Username o password errati" });
        }
        return callback(null, user);
    } catch (error) {
        return callback(error);
    }
}));

passport.serializeUser((user, callback) => {
    callback(null, user.id);
});

passport.deserializeUser(async (id, callback) => {
    try {
        const user = await getUserById(id);
        if (!user) {
            return callback(new Error("Utente non trovato"));
        }
        callback(null, user);
    } catch (error) {
        callback(error);
    }
});

const loggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Utente non autenticato" });
};

// --- POST /api/sessions ---
app. post("/api/sessions", function (req, res, next) {
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: info.message });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.status(200).json({ id: user.user_id, username: user.username, best_score: user.best_score });
    });
  })(req, res, next);
});

// --- DELETE /api/sessions/current ---
app.delete("/api/sessions/current", loggedIn, (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Errore durante la fase di logout" });
    }
    res.end();
  });
});

// --- GET /api/sessions/current ---
app.get("/api/sessions/current", (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json({ id: req.user.user_id, username: req.user.username, best_score: req.user.best_score });
  }else {
    res.status(401).json({ message: "Utente non autenticato, sessione non valida" });
  }
});

// --- GET /api/network ---
app.get("/api/network", loggedIn, async (req, res) => {
  try {
    const stations = await getStations();
    const connections = await getConnections();
    res.status(200).json({ stations: stations, connections: connections });
  } catch (error) {
    res.status(500).json({ message: "Errore durante il recupero delle informazioni sulla rete, errore server" });
  }
});

// --- GET /api/leaderboard ---
app.get("/api/leaderboard", loggedIn, async (req, res) => {
  try {
    const leaderboard = await getLeaderboard();
    res.status(200).json({ leaderboard: leaderboard });
  } catch (error) {
    return res.status(500).json({ message: "Errore durante il recupero della classifica, errore server" });  }
});

// --- POST /api/games ---
app.post("/api/games", loggedIn, async (req, res) => {
  try {

    let validPair = false;
    let startStation = "", endStation = "";
    let distance = 0;
    let attempts = 0;
    
    while (!validPair && attempts < 50) {
      const config = await getRandomStartEndStations();
      startStation = config.startStation;
      endStation = config.endStation;
      distance = await shortestPath(startStation, endStation);
      attempts++;

      if (distance >= 3) {
        validPair = true;
      }
    }

    if (!validPair) {
      return res.status(500).json({ message: "Impossibile trovare una coppia di stazioni valida" });
    }
    
    req.session.currentRound = {
      startStation: startStation,
      endStation: endStation,
      initialCoins: 20
    };
    res.status(200).json({ startStation: startStation, endStation: endStation, initialCoins: 20 });
  }catch (error) {
    res.status(500).json({ message: "Errore durante la creazione della partita, errore server" });
  }
});

// --- POST /api/games/validate ---
app.post("/api/games/validate", loggedIn, async (req, res) => {
  try {
    const { route } = req.body; 
    if (!route || !Array.isArray(route) || route.length === 0) {
      return res.status(400).json({ message: "Percorso non valido, formato non corretto" });
    }

    const sessionGame = req.session.currentRound;
    if (!sessionGame) {
      return res.status(400).json({ message: "Nessuna partita in corso da validare" });
    }

    let validationResult = true;
    let actualCoins = sessionGame.initialCoins; 
    const steps = [];
    const dbEvents = await getGameEvents();
    const usedTracks = new Set();

    if (route[0].from !== sessionGame.startStation) {
      validationResult = false;
    }

    let currentLine = null;

    if (validationResult) {
      for (let i = 0; i < route.length; i++) {
        const track = route[i];
        const fromSt = track.from;
        const toSt = track.to;

        if (i > 0 && fromSt !== route[i - 1].to) {
          validationResult = false;
          break;
        }

        const trackKey = [fromSt, toSt].sort().join(" <-> ");
        if (usedTracks.has(trackKey)) {
          validationResult = false;
          break;
        }
        usedTracks.add(trackKey);

        const connectionDetails = await validatePath(fromSt, toSt);
        if (!connectionDetails) {
          validationResult = false; 
          break;
        }

        const realDetails = Array.isArray(connectionDetails) ? connectionDetails[0] : connectionDetails;
        if (!realDetails) {
          validationResult = false;
          break;
        }

        const trackLine = realDetails.line_name || realDetails.linea || realDetails.line;

        if (currentLine && currentLine !== trackLine) {
          const interchangeResult = await getStationInterchangeStatus(fromSt);
          
          const isInterchange = interchangeResult && (
            interchangeResult.is_interchange === 1 || 
            interchangeResult.is_interchange === true ||
            interchangeResult.interchange === 1 ||
            interchangeResult.interchange === true ||
            interchangeResult === 1 ||
            interchangeResult === true
          );

          if (!isInterchange) {
            validationResult = false; 
            break;
          }
        }
        
        currentLine = trackLine;

        let eventSelection = { description: "Traffico regolare, nessun imprevisto riscontrato.", effect: 0 };
        if (dbEvents && dbEvents.length > 0) {
          const randomIndex = Math.floor(Math.random() * dbEvents.length);
          eventSelection = dbEvents[randomIndex];
        }

        actualCoins += eventSelection.effect;

        steps.push({ 
          from: fromSt, 
          to: toSt, 
          description: eventSelection.description, 
          effect: eventSelection.effect 
        });
      }
    }

    const lastTrack = route[route.length - 1];
    if (validationResult && (!lastTrack || lastTrack.to !== sessionGame.endStation)) {
      validationResult = false;
    }

    let finalScore = 0;
    if (!validationResult) {
      finalScore = 0;
      steps.length = 0;
    } else {
      finalScore = Math.max(0, actualCoins);
    }

    if (validationResult && req.user && req.user.user_id) {
      await updateBestScore(req.user.user_id, finalScore);
    }

    delete req.session.currentRound;
    
    return res.status(200).json({ 
      isValid: validationResult, 
      finalScore: finalScore, 
      steps: steps 
    });

  } catch (error) {
    return res.status(500).json({ message: "Errore durante la validazione del percorso, errore server" });
  }
});

// --- avvio del server ---
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});