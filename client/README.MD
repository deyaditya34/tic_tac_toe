# Tic Tac Toe Client

## Project Overview

This is the **_CLI Application_** for the Tic Tac Toe game.  
It provides an interactive interface for players to engage in a multiplayer Tic Tac Toe game.  
The client communicates seamlessly with the server to ensure real-time gameplay.

## Features

- Interactive Tic Tac Toe game board.
- Real-time updates and game state management.
- Communication with the server for multiplayer functionality.

## Technologies Used

- **Axios** - To interact with the authentication server and the game server.
- **Readline** - To take the players input from time to time.

## Installation

1. Navigate to the `client` directory:

2. Install dependencies:
   ```
   npm install
   ```
3. Copy the ".env.example" file and rename it as ".env". Modify the values as needed per requirements.

4. Start the server:
   ```
   npm start
   ```

## Architecture Overview

- The entire client application is mainly divided into four stages:
  - **Player Token**:
    - Players are first asked to register and then login.
    - All the request are being sent to the authentication server.
    - Till the tokens get generated, this entire thing is stuck in the same loop.
  - **Game Id**:
    - The next phase is to generate the game id for the players.
    - From here onwards, all the requests are being sent to the game server.
    - Players can generate new game id's or can join active games that are waiting for players depending upon their choice.
    - Till the game id's generate, this entire thing too is stuck in the same loop.
  - **Game Status**:
    - After the player joins, the game state is changed to play mode.
    - Once the game is in play mode, it sends request constantly to the game server to check its status till the game is not completed.
    - It checks the current player turn, and requires input from the appropriate current player.
    - If the player move is validated, it changes the current player to the other player and checks for the game status again.
    - Till the game status is not showing as 'game over', this entire thing too is stuck in the same loop.
    - If the game is over, the game server displays the game state to the other player.
  - **Valid Move**:
    - Once the current players receives the request from the client server to respond with a valid move.
    - It parses, sanitizes the input and sends the request to the game server.
    - Till the game server responds positively for the players move, this entire things is stuck in the same loop.
    - It then displays the game state to the current player.
    - It helps in to display the game state to the current player if it wins in the move.
- For more understanding please go through the **_detailed logic flow_** in the **README** file of the game server api's and it will get a lot easier to understand. 
---

