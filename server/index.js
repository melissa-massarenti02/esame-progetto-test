import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import LocalStrategy from "passport-local";
import {getUserByCredentials, getUserById} from "./dao/user-dao.js";
import {getStations, getConnections} from "./dao/map-dao.js";
import {getLeaderboard} from "./dao/leaderboard-dao.js";
import {getRandomStartEndStations} from "./dao/game-dao.js";

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

passport.use(new LocalStrategy(async function verify(username, password, callback) {
    try {
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
      return res.status(200).json({ message: "Sessione creata con successo", user });
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
    res.status(200).json({ user: req.user });
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
    res.status(401).json({ message: "Utente non autenticato, sessione non valida" });
  }
});

// --- POST /api/game ---
app.post("/api/game", loggedIn, async (req, res) => {
  try {
    const config = await getRandomStartEndStations();
    res.status(200).json({ startStation: config.startStation, endStation: config.endStation, initialCoins: 20 });
  } catch (error) {
    res.status(401).json({ message: "Utente non autenticato, sessione non valida" });
  }
});

// --- avvio del server ---
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});