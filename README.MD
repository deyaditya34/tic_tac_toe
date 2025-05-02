# Tic Tac Toe

## Project Overview
This is a implementation of the classic Tic Tac Toe game. The application allows two players to compete against each other in a turn-based manner. The game is designed to be lightweight, intuitive, and easy to use.

- **Independent Services**: The project consist of three different services.
    - **Auth Server**: This is a auth service for the players authentication. It is a complete independent service and can be switched with any other authentication service.
    - **Game Server**: The game server is a independent service focussed on creating and managing the states of the game.
    - **Game Client**: This a CLI application for the players to play the game. This client can easily be switched with any other client service. 


- **How it works**: 
    - The game server expects a JWT Token for the players authentication.
    - The client requests the auth server to authenticate the players and get the JWT Token.
    - The game server also has the same JWT_SECRET_KEY as the auth server through which it can validate the player tokens.    


## Features

- **Two-Player Mode**: Play with a friend in a local multiplayer setup.
- **Player Timeout Mode**: Introduces a time-bound gameplay feature where each player must make their move within a specified time limit. Failure to do so results in an automatic timeout, awarding the victory to the opposing player.
- **Dynamic Board**: Displays the current state of the game board after every move.
- **Win Detection**: Automatically detects when a player wins or if the game ends in a draw.
- **Error Handling**: Prevents invalid moves such as overwriting an already occupied cell.
- **CLI Client**: All the features of the game can be tested and played from the CLI application.

## Note: _Please go through the readme file of each service for more clear documentation of each service._

## Future Enhancements

- Add a single-player mode with AI.
- Implement a graphical user interface (GUI).
- Allow customization of board size.
