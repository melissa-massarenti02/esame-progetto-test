import '../db.js';

// --- recupero delle stanze di gioco esistenti nel db ---
export const getStations = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM stations';
        db.all(sql, [], (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
};

// --- recupero di tutte le tratte (connessioni) tra ciascuna stazione ---
export const getConnections = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM connections';
        db.all(sql, [], (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
};