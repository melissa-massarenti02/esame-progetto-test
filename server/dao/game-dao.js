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

// --- creazione della lista delle adiacenze a partire da connessioni db ---
export const createGraph = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT station_a_name, station_b_name FROM connections';
        db.all(sql, [], (err, rows) => {
            if (err) {
                return reject(err);
            }
            const graph = {};
            rows.forEach(row => {
                if (!graph[row.station_a_name]) {
                    graph[row.station_a_name] = [];
                }
                if (!graph[row.station_b_name]) {
                    graph[row.station_b_name] = [];
                }
                graph[row.station_a_name].push(row.station_b_name);
                graph[row.station_b_name].push(row.station_a_name);
            });
            resolve(graph);
        });
    });
}

// --- implementazione dell'algoritmo delle distanze ---
export const shortestPath = async (start, end) => {
    const graph = await createGraph();
    
    if (!graph[start] || !graph[end]) {
        return -1;
    }
    if (start === end) {
        return 0;
    }

    const queue = [[start, 0]];
    const visited = new Set();

    while (queue.length > 0) {
        const [current, distance] = queue.shift();
        if (current === end) {
            return distance;
        }

        for (const neighbor of graph[current]) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push([neighbor, distance + 1]);
            }
        }
    }
    return -1;
};

// --- controllo esistenza collegamento tra due stazioni ---
export const validatePath = (fromStation, toStation) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT line_name, line_color FROM connections WHERE (station_a_name = ? AND station_b_name = ?) OR (station_a_name = ? AND station_b_name = ?)';
        db.get(sql, [fromStation, toStation, toStation, fromStation], (err, row) => {
            if (err) {
                return reject(err);
            }
            resolve(row);
        });
    });
};

// --- verifica se una stazione è anche un nodo di interscambio ---
export const getStationInterchangeStatus = (stationName) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT is_interchange FROM stations WHERE name = ?';
        db.get(sql, [stationName], (err, row) => {
            if (err) {
                return reject(err);
            }
            resolve(row ? row.is_interchange === 1 : false);
        });
    });
};

// --- aggiornamento best score nel db, se score corrente è migliore ---
export const updateBestScore = (userId, score) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE users SET best_score = ? WHERE user_id = ? AND ? > best_score';
        db.run(sql, [score, userId, score], function(err) {
            if (err) {
                return reject(err);
            }
            resolve(this.changes > 0);
        });
    });
};

// --- estrazione degli eventi di gioco da database ---
export const getGameEvents = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT description, effect FROM events';
        db.all(sql, [], (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
};