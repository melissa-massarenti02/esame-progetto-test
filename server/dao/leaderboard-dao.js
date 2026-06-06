import db from '../db.js';

// --- recupero score list utenti in ordine decrescente ---
export const getLeaderboard = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT username, best_score FROM users ORDER BY best_score DESC';
        db.all(sql, [], (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
};
