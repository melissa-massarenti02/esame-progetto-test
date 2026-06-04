import sqlite3 from 'sqlite3';
import crypto from 'crypto';
import fs from 'fs';

const DB_SOURCE = 'database.db';

// --- eliminare residui di vecchi database. Fresh start. ---
if (fs.existsSync(DB_SOURCE)) {
    fs.unlinkSync(DB_SOURCE);
}

// --- creazione del database ---
const db = new sqlite3.Database(DB_SOURCE, (err) => {
    if (err) {
            console.error(err.message);
            throw err;
        } else {
            console.log('Database creato con successo.');
            initializeDatabase();
        }
    });

// --- best ptactice: generazione PBKDF2 o Scrypt per gestione della sicurezza ---
function generateHashSalt(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 32).toString('hex');
    return { hash, salt };
}

function initializeDatabase() {
    db.serialize(() => {
        // --- creazione tabelle ---

        // --- tabella utenti ---
        db.run(`CREATE TABLE users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username VARCHAR(255) NOT NULL UNIQUE,
            hash VARCHAR(255) NOT NULL,
            salt VARCHAR(255) NOT NULL,
            best_score INTEGER DEFAULT 0
        )`, (err) => {
            if (err) {
                console.error('Errore durante la creazione della tabella users:', err.message);
            } else {
                console.log('Tabella users creata con successo.');
            }
        });
        
        // --- tabella stations ---
        db.run(`CREATE TABLE stations (
            station_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(255) NOT NULL,
            is_interchange BOOLEAN NOT NULL CHECK (is_interchange IN (0, 1))
        )`, (err) => {
            if (err) {
                console.error('Errore durante la creazione della tabella stations:', err.message);
            } else {
                console.log('Tabella stations creata con successo.');
            }
        });

        // --- tabella connections ---
        db.run(`CREATE TABLE connections (
            connection_id INTEGER PRIMARY KEY AUTOINCREMENT,
            station_a_name VARCHAR(255) NOT NULL,
            station_b_name VARCHAR(255) NOT NULL,
            line_name VARCHAR(255) NOT NULL,
            line_color VARCHAR(255) NOT NULL,
            FOREIGN KEY (station_a_name) REFERENCES stations(name),
            FOREIGN KEY (station_b_name) REFERENCES stations(name)
        )`, (err) => {
            if (err) {
                console.error('Errore durante la creazione della tabella connections:', err.message);
            } else {
                console.log('Tabella connections creata con successo.');
            }
        });

        // --- tabella eventi ---
        db.run(`CREATE TABLE events (
            event_id INTEGER PRIMARY KEY AUTOINCREMENT,
            description TEXT NOT NULL,
            effect INTEGER NOT NULL CHECK (effect BETWEEN -4 AND 4)
        )`, (err) => {
            if (err) {
                console.error('Errore durante la creazione della tabella events:', err.message);
            } else {
                console.log('Tabella events creata con successo.');
            }
        });

        
        // --- popolamento delle 4 tabellecreate ---

        const user1 = generateHashSalt('PoliTo26');
        const user2 = generateHashSalt('WebApp2026');
        const user3 = generateHashSalt('Exam2026');

        // --- popolamento tabella users ---
        const genUser = db.prepare(`INSERT INTO users (username, hash, salt, best_score) VALUES (?, ?, ?, ?)`);
        genUser.run('Melissa02', user1.hash, user1.salt, 24);
        genUser.run('AleColombs', user2.hash, user2.salt, 15);
        genUser.run('Sara11', user3.hash, user3.salt, 0);
        genUser.finalize((err) => {
            if (err) {
                console.error('Errore durante l\'inserimento degli utenti:', err.message);
            } else {
                console.log('Utenti inseriti con successo.');
            }
        });

        // --- popolamento tabella stations ---
        const genStation = db.prepare(`INSERT INTO stations (name, is_interchange) VALUES (?, ?)`);
        // --- stazioni is_interchange = 1 ---
        genStation.run('Porta Nuova', 1);
        genStation.run('Porta Susa', 1);
        genStation.run('Piazza Castello', 1);
        genStation.run('Gran Madre', 1);

        // --- stazioni is_interchange = 0 ---
        genStation.run('Re Umberto', 0);
        genStation.run('Vittorio Veneto', 0);
        genStation.run('Superga', 0);
        genStation.run('Giardini Reali', 0);
        genStation.run('Mole Antonelliana', 0);
        genStation.run('Politecnico', 0);
        genStation.run('Monte dei Cappuccini', 0);
        genStation.run('Piazza San Carlo', 0);
        genStation.finalize((err) => {
            if (err) {
                console.error('Errore durante l\'inserimento delle stazioni:', err.message);
            } else {
                console.log('Stazioni inserite con successo.');
            }
        });

        // --- popolamento tabella connections ---
        const genConnection = db.prepare(`INSERT INTO connections (station_a_name, station_b_name, line_name, line_color) VALUES (?, ?, ?, ?)`);

        // --- Linea 1: ROSSA ---
        genConnection.run('Porta Nuova', 'Re Umberto', 'Linea 1', 'Rosso');
        genConnection.run('Re Umberto', 'Vittorio Veneto', 'Linea 1', 'Rosso');
        genConnection.run('Vittorio Veneto', 'Piazza Castello', 'Linea 1', 'Rosso');
        genConnection.run('Piazza Castello', 'Gran Madre', 'Linea 1', 'Rosso');

        // --- Linea 2: BLU ---
        genConnection.run('Porta Susa', 'Superga', 'Linea 2', 'Blu');
        genConnection.run('Superga', 'Giardini Reali', 'Linea 2', 'Blu');
        genConnection.run('Giardini Reali', 'Mole Antonelliana', 'Linea 2', 'Blu');
        genConnection.run('Mole Antonelliana', 'Gran Madre', 'Linea 2', 'Blu');

        // --- Linea 3: VERDE ---
        genConnection.run('Porta Nuova', 'Politecnico', 'Linea 3', 'Verde');
        genConnection.run('Politecnico', 'Monte dei Cappuccini', 'Linea 3', 'Verde');
        genConnection.run('Monte dei Cappuccini', 'Piazza Castello', 'Linea 3', 'Verde');
        genConnection.run('Piazza Castello', 'Gran Madre', 'Linea 3', 'Verde');

        // --- Linea 4: GIALLA ---
        genConnection.run('Porta Susa', 'Politecnico', 'Linea 4', 'Giallo');
        genConnection.run('Politecnico', 'Re Umberto', 'Linea 4', 'Giallo');
        genConnection.run('Re Umberto', 'Piazza Castello', 'Linea 4', 'Giallo');
        genConnection.run('Piazza Castello', 'Gran Madre', 'Linea 4', 'Giallo');
        genConnection.finalize((err) => {
            if (err) {
                console.error('Errore durante l\'inserimento delle connessioni:', err.message);
            } else {
                console.log('Connessioni inserite con successo.');
            }
        });

        // --- popolamento tabella events ---
        const genEvent = db.prepare(`INSERT INTO events (description, effect) VALUES (?, ?)`);
        genEvent.run('Semaforo verde prioritario, viaggio rapidissimo!', 2);
        genEvent.run('Controllore pignolo a bordo, multa sul biglietto!', -2);
        genEvent.run('Treno di nuova generazione, comfort e bonus velocità.', 1);
        genEvent.run('Guasto temporaneo allo scambio, rallentamento sulla linea.', -1);
        genEvent.run('Trovate monete smarrite sul sedile, che fortuna!', 3);
        genEvent.run('Sciopero improvviso del personale, banchina affollata.', -3);
        genEvent.run('Bonus del Sindaco: incentivo mobilità green!', 4);
        genEvent.run('Ladri di token in azione nella stazione di interscambio!', -4);
        genEvent.run('Traffico regolare, nessun imprevisto riscontrato.', 0);
        genEvent.finalize((err) => {
            if (err) {
                console.error('Errore durante l\'inserimento degli eventi:', err.message);
            } else {
                console.log('Eventi inseriti con successo.');
            }
        });

        console.log('Database completo inizializzato con successo.');

    });
}