# Tic Tac Toe Server

## Project Overview

This repository contains the server-side implementation for the Tic Tac Toe game. The server is responsible for managing the game logic, handling player interactions, and facilitating communication between users.

## Features

- **Game State Management**: Supports multiple game sessions simultaneously, ensuring each session is isolated.
- **Player Connection Handling**: Manages player connections and disconnections gracefully.
- **Move Validation**: Ensures all moves are valid and enforces the rules of Tic Tac Toe.
- **Error Handling**: Returns meaningful error messages for invalid requests or actions.

## Technologies Used

- **Node.js** - backend runtime environment
- **Express.js** - HTTP server framework for handling API requests.
- **Redis** - In-memory database for managing game sessions and player data efficiently.
- **Crypto** - Utilized for generating secure and random game IDs to uniquely identify each game session.
- **Morgan** - Middleware for logging HTTP requests and responses.

## Installation

1. Navigate to the `server` directory:

2. Install dependencies:
   ```
   npm install
   ```
3. Copy the ".env.example" file and rename it as ".env". Modify the values as needed per requirements.

4. Start the server:
   ```
   npm start
   ```

## Start the server and test the application endpoints.

## API Endpoints

The server exposes the following RESTful API endpoints:

### API Endpoints

#### POST _/api/game_

- **Description**: Initializes a new game session. This endpoint creates a unique game session, returns the initial game state and adds the player who initialised the game.

- **Detailed Logic Flow**:

  - The player's token is validated, and their name is extracted.
  - A check is performed to ensure the player is not already participating in another game.
  - A unique Game id is generated.
  - A new instance of the game is created.
  - The game is stored in memory with reference to the UUID created.
  - The player is added to the game newly created.
  - The game is updated and re-stored in memory against the UUID.
  - The game id is stored in the active games list as it is waiting for other player to join.
  - The player is also stored in the active players list so that the player cannot join multiple games at once.
  - If in any stage, the flow breaks, the server sends the response accordingly.

- **Headers**:

  ```json
  {
    "token": "player token"
  }
  ```

- **Response**:
  - **200 Created**: initiazed new game.
  ```json
  {
    "success": true,
    "message": "player added along with the player name and the player character",
    "game_id": "string"
  }
  ```
  - **400 Bad Request**: Validation error or missing fields.
  ```json
  {
    "success": false,
    "message": "error message"
  }
  ```

---

#### POST _/api/game/:game_id/join_

- **Description**: Here the users can join the active games that are waiting for players to join.

- **Detailed Logic Flow**:

  - The player's token is validated, and their name is extracted.
  - A check is performed to ensure the player is not already participating in another game.
  - The game id is validated.
  - The game status is validated whether it is waiting for players to join.
  - The player is added to the game.
  - The player is also stored in the active players list so that the player cannot join multiple games at once.
  - The game id is removed from active games list as it no longer needs to add more players.
  - The game status is changed to play mode.
  - If in any stage, the flow breaks, the server sends the response accordingly.

- **Path Parameters**:
  ```json
  {
    "game_id": "unique game id"
  }
  ```
- **Headers**:

  ```json
  {
    "token": "player token"
  }
  ```

- **Response**:
  - **200 Created**:
  ```json
  {
    "success": true,
    "message": "player added details",
    "game_id": "game_id"
  }
  ```
  - **400 validation errors or missing fields**:
  ```json
  {
    "success": false,
    "error": "error message"
  }
  ```

---

### POST _api/game/:game_id/play_

- **Description**: Here the users can play their move.
- **Detailed Logic Flow**:

  - The player's token is validated, and their name is extracted.
  - The game id is validated.
  - The game status is validated whether it is in play mode or not.
  - The player move is parsed and sanitized to insert in the game.
  - The player move is validated whether the move is valid at that point of time.
  - The player move is inserted and the game is updated.
  - The current player is changed and the game is waiting for the next player to play the move.
  - If the game status shows as game over, the players are removed from the active players list.
  - If in any stage, the flow breaks, the server sends the response accordingly.

- **Path Parameters**:
  ```json
  {
    "game_id": "unique game id"
  }
  ```
- **Query Parameters**:
  ```json
  {
    "move": "player move"
  }
  ```
- **Headers**:

  ```json
  {
    "token": "player token"
  }
  ```

- **Response**:
  - **200 Created**:
  ```json
  {
    "success": true,
    "message": "player move related details",
    "game_board": "game_board representation in nested array",
    "current_player": "current player and current player character"
  }
  ```
  - **400 validation errors or missing fields**:
  ```json
  {
    "success": false,
    "error": "error message",
    "game_board": "game_board representation in nested array",
    "current_player": "current player and current player character"
  }
  ```

---

#### GET _/api/game/players/active_

- **Description**: Gets all the active players at the moment.

- **Response**:
  - **200 Created**: active players found
  ```json
  {
    "success": true,
    "message": "active players list shown",
    "active_players_list_parsed": "players list"
  }
  ```
  - **200 Created**: active players not found
  ```json
  {
    "success": false,
    "message": "No players active at this moment"
  }
  ```

---

#### GET _/api/game/games/active_

- **Description**: Gets all the active games being played at the moment.

- **Response**:
  - **200 Created**: active games found
  ```json
  {
    "success": true,
    "message": "active games list shown",
    "active_games_list_parsed": "games list"
  }
  ```
  - **200 Created**: active games not found
  ```json
  {
    "success": false,
    "message": "No games to join at this moment"
  }
  ```

---

#### GET _/api/game/:game_id_

- **Description**: Retrieves the current state of a specific game session. This endpoint provides details about the ongoing game.

- **Path Parameters**:
  ```json
  {
    "game_id": "unique game id"
  }
  ```
- **Headers**:

  ```json
  {
    "token": "player token"
  }
  ```

- **Response**:
  - **200 Created**:
  ```json
  {
    "success": true,
    "message": "game status shown below",
    "game_board": "game board representation in nested array",
    "game_status": "IN_PLAY_MODE | WAITING_FOR_PLAYERS | GAME_OVER",
    "player_won": "player name | null",
    "current_player": "player_name",
    "players": "player names along with their characters"
  }
  ```
  - **400 validation errors or missing fields**:
  ```json
  {
    "success": false,
    "error": "error message"
  }
  ```

---
