const express = require('express');
const { createClient } = require('redis');
const config = require('../config');
const { create_game } = require('./game');
const gameplay = require('./gameplay');

async function start() {
  const server = express();
  console.log('connecting to database..');
  const client = await createClient()
    .on('error', (err) => console.log('Redis Client Error', err))
    .connect();
  console.log('connected to database.\nStarting server..');
  server.use(express.json());

  let game_id = 0;

  server.post('/game_init', async (req, res) => {
    const new_game = create_game();
    game_id++;

    await client.set(game_id.toString(), JSON.stringify(new_game));

    return res.json({ game_id });
  });

  server.get('/get_game_state/:game_id', async (req, res) => {
    const game_id = req.params.game_id;

    const game_data = await client.get(game_id);

    if (!game_data) {
      return res.json({
        success: false,
        error: 'game_id doesnot exist',
      });
    }
    const game = create_game(JSON.parse(game_data));

    const game_board = game.board;
    const game_status = game.status;
    const player_won = game.player_won;
    const current_player = game.get_current_player(
      game.players,
      game.current_player_turn
    );
    const players = game.players;
    return res.json({
      success: true,
      message: 'game status shown below',
      game_board,
      game_status,
      player_won,
      current_player,
      players,
    });
  });

  server.post('/join_game/:game_id', async (req, res) => {
    const game_id = req.params.game_id;
    const player_token = req.body?.token;

    if (!player_token) {
      return res.json({
        success: false,
        message: 'player token is missing',
      });
    }

    const player = gameplay.decrypt_token(player_token);

    if (!player) {
      return res.json({
        success: false,
        message: 'invalid player',
      });
    }

    const game_data = await client.get(game_id);
    const parsed_game_data = JSON.parse(game_data);

    if (!game_data) {
      return res.json({
        success: false,
        error: 'game id doesnot exist',
      });
    }

    const game = create_game(JSON.parse(game_data));

    if (game.status !== 'WAITING_FOR_PLAYERS') {
      return res.json({
        success: false,
        message: 'players joining completed in this game.',
      });
    }

    const players_list_in_game = game.players;

    if (!players_list_in_game.length) {
      const player_details = {};
      player_details.player_name = player;
      player_details.character = 'X';

      parsed_game_data.players.push(player_details);

      await client.set(game_id.toString(), JSON.stringify(parsed_game_data));

      return res.json({
        success: true,
        message: `'${player}' joined in game -'${game_id}' with move assigned - 'X'.`,
      });
    }

    if (players_list_in_game.length === 1) {
      if (player === players_list_in_game[0]) {
        return res.json({
          success: false,
          message: 'player already joined the game.',
        });
      }

      const player_details = {};
      player_details.player_name = player;
      player_details.character = 'O';

      parsed_game_data.players.push(player_details);
      parsed_game_data.status = 'IN_PLAY_MODE';

      await client.set(game_id.toString(), JSON.stringify(parsed_game_data));

      return res.json({
        success: true,
        message: `'${player}' joined in game - '${game_id}' with move assigned - 'O'.`,
      });
    }
  });

  server.post('/make_move/:game_id/:move', async (req, res) => {
    const game_id = req.params.game_id;
    const move = req.params.move;
    const player_token = req.body?.token;

    if (!player_token) {
      return res.json({
        success: false,
        message: 'player token is missing',
      });
    }

    const player = gameplay.decrypt_token(player_token);

    if (!player) {
      return res.json({
        success: false,
        message: 'invalid player',
      });
    }

    const game_data = await client.get(game_id);

    if (!game_data) {
      return res.json({
        success: false,
        error: 'game id doesnot exist',
      });
    }

    const game = create_game(JSON.parse(game_data));

    if (game.status === 'GAME_OVER') {
      const game_board = game.board;
      const current_player = game.get_current_player(
        game.players,
        game.current_player_turn
      );

      return res.json({
        success: false,
        message: `'${current_player}' - won the game.`,
        game_board,
      });
    }

    if (game.status === 'WAITING_FOR_PLAYERS') {
      const game_board = game.board;
      const players = game.players;

      return res.json({
        success: false,
        message: 'waiting for players to join in this game.',
        game_board,
        players,
      });
    }

    if (game.status === 'IN_PLAY_MODE') {
      if (!Number.isNaN(move) && Number(move) < 1 && Number(move) > 9) {
        const game_board = game.board;
        const current_player = game.get_current_player(
          game.players,
          game.current_player_turn
        );

        return res.json({
          success: false,
          error: 'move is invalid. The move should be from 1 - 9',
          game_board,
          current_player,
        });
      }

      const { index1, index2 } = gameplay.retrieve_indexes_by_player_move(
        Number(move)
      );

      let [ok, message] = game.process_input({
        player_name: player,
        index1,
        index2,
      });

      const game_board = game.board;
      if (game.status === 'GAME_OVER') {
        return res.json({
          success: ok,
          error: message,
          game_board,
        });
      }

      return res.json({
        success: ok,
        message,
        game_board,
        current_player: game.get_current_player(
          game.players,
          game.current_player_turn
        ),
      });
    }
  });

  server.listen(8090, () => {
    console.log(`server is running at 8090`);
  });
}

start();
