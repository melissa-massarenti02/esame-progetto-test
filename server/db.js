import sqlite3 from 'sqlite3';

// --- proceder con apertura connesione al database ---
const db = new sqlite3.Database('database.db', (err) => {
    if (err) {
        console.error('Errore di connessione al database', err.message);
        throw err;
    }else {
        console.log('Connessione al dbatabase avvenuta con successo');
    }
});

export default db;