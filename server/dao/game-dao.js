import db from '../db.js';

// --- estrazione della stazione di partenza e arrivo casuali dal db per nuova partita ---
export const getRandomStartEndStations = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT name FROM stations ORDER BY RANDOM() LIMIT 2';
        db.all(sql, [], (err, rows) => {
            if (err) {
                return reject(err);
            }
            if (rows.length < 2) {
                return reject(new Error("Stazioni insufficienti nel database"));
            }
            resolve({ startStation: rows[0].name, endStation: rows[1].name });
        });
    });
}