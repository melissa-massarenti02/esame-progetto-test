import db from '../db.js';
import crypto from 'crypto';

// --- Recupera utente da user_id - mantiene sessione attiva ---

export const getUserById = (user_id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE user_id = ?';
        db.get(sql, [user_id], (err, row) => {
            if (err) {
                reject(err);
            } else if (row === undefined) {
                resolve({ error: 'Utente con id ' + user_id + ' non trovato.' });
            } else {
                resolve(row);
            }
        });
    });
};

// --- operazione di verifica delle redenziali fase Login ---
export const getUserByCredentials = (username, password) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE username = ?';
        db.get(sql, [username], (err, row) => {
            if (err) {
                reject(err);
            } else if (row === undefined) {
                resolve({ error: 'Username ' + username + ' non trovato.' });
            } else {
                const user = {id: row.user_id, username: row.username, best_score: row.best_score};

                // --- ricalcolo hash con sale memorizzato ---
                crypto.scrypt(password, row.salt, 32, function (err, hasPW) {
                    if (err) {
                        reject(err);
                    } else {
                        const dbHash = Buffer.from(row.hash, 'hex');
                        if (!crypto.timingSafeEqual(dbHash, hasPW)) {
                            resolve(false);
                        } else {
                            resolve(user);
                        }
                    }
                });
            }
        });
    });
};