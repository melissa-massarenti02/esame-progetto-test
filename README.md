[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/iZes9Qfg)
# Exam #1: "Ultima Corsa"
## Student: s351695 MASSARENTI MELISSA 

## React Client Application Routes

- Route `/`: Il punto di ingresso principale e gateway dinamico dell'applicazione.Il motore di gioco vero e proprio, accessibile esclusivamente agli utenti autenticati tramite una barriera di protezione (Auth Guard).
- Route `/leaderboard`: La schermata delle statistiche globali e della competizione.
- Route `*`: La rotta globale per la gestione degli errori e delle pagine non trovate.

## API Server

- POST `/api/sessions`
  - request parameters: none
  - request body content:
  ```json
    {
      "username": "MarcoTorino",
      "password": "password123"
    }
  ```
  - response body content:
  ```json
    {
      "id": 1,
      "username": "MarcoTorino",
      "best_score": 22
    }
  ```
  - possible responses: `200`OK, `401` Unauthorized, `500` Internal Server Error

- GET `/api/sessions/current`
  - request parameters: none
  - request body content: none
  - response body content:
  ```json
    {
      "id": 1,
      "username": "MarcoTorino",
      "best_score": 22
    }
  ```
  - possible responses: `200`OK, `401` Unauthorized
  
- DELETE `/api/sessions/current`
  - request parameters: none
  - request body content: none
  - response body content: none
  - possible responses: `200`OK, `401` Unauthorized

  - GET `/api/network`
  - request parameters: none
  - request body content: none
  - response body content:
  ```json
    {
      "stations": [
        {"id": 1, "name": "Porta Nuova", "is_interchange": 1},
        {"id": 2, "name": "Mole Antonelliana", "is_interchange": 0},
        {"id": 3, "name": "Piazza Castello", "is_interchange": 1}
      ],
      "connections": [
        {"id": 1, "station_a_name": "Mole Antonelliana", "station_b_name": "Porta Nuova", "line_name": "Linea Rossa", "line_color": "#FF00A0"},
        {"id": 2, "station_a_name": "Piazza Castello", "station_b_name": "Porta Nuova", "line_name": "Linea Blu", "line_color": "#00E5FF"},
        ...
      ]
    }
  ```
  - possible responses: `200`OK, `401` Unauthorized

- POST `/api/games`
  - request parameters: none
  - request body content: none
  - response body content:
  ```json
    {
      "startStation": "Porta Nuova",
      "endStation": "Mole Antonelliana",
      "initialCoins": 20
    }
  ```
  - possible responses: `200`OK, `401` Unauthorized, '500' errore server
  
- POST `/api/games/validate`
  - request parameters: none
  - request body content: none
  ```json
    {
      "route": [
        {"from": "Porta Nuova", "to": "Piazza Castello"},
        {"from": "Piazza Castello", "to": "Mole Antonelliana"}
      ]
    }
  ```
  - response body content:
  ```json
    {
      "isValid": true,
      "finalScore": 18,
      "steps": [
        {
          "from": "Porta Nuova",
          "to": "Piazza Castello",
          "description": "Binario corretto, viaggio scorrevole.",
          "effect": 0
        },
        {
          "from": "Piazza Castello",
          "to": "Mole Antonelliana",
          "description": "Controllore pignolo, multa sul biglietto!",
          "effect": -2
        }
      ]
    }
  ```
  - possible responses: `200`OK, `400` Bad Request, `401` Unauthorized

- GET `/api/leaderboard`
  - request parameters: none
  - request body content: none
  - response body content:
  ```json
    [
      {"username": "MarcoTorino", "best_score": 24},
      {"username": "AliceCyber", "best_score": 18},
      {"username": "UserTest3", "best_score": 12}
    ]
  ```
  - possible responses: `200`OK, `401` Unauthorized 

## Database Tables

- Table `users` - contains: user_id, username, hash, salt, best_score
- Table `stations` - contains: station_id, name, is_interchange
- Table `connections` - contains: connection_id, station_a_name, station_b_name, line_name, line_color
- Table `events` - contains: event_id, description, effect

## Main React Components

- `ListOfSomething` (in `List.js`): component purpose and main functionality
- `GreatButton` (in `GreatButton.js`): component purpose and main functionality
- ...

(only _main_ components, minor ones may be skipped)

## Screenshot

![Screenshot](./img/screenshot.jpg)

## Users Credentials

- username: `melissa@polito.it`, password: `PoliTo26` 
- username: `ale@webapp.it`, password: `WebApp2026`
- username: `sara@exam.it`, password: `Exam2026`

## Use of AI Tools
Briefly describe whether you used any AI tools (e.g., ChatGPT, GitHub Copilot, Claude) while working on this project, for which purposes (e.g., clarifying concepts, debugging, generating code), and how you verified or adapted their output.
If you did not use any AI tools, simply state so.
