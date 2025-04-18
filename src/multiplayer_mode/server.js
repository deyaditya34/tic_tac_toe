const express = require('express');
const config = require('../config');
const { create_new } = require('./game');
const gameplay = require('./gameplay');

async function start() {
  const server = express();
  console.log('connecting to database..');
  const client = await gameplay.initialize_redis();
  console.log('connected to database.\nStarting server..');
  server.use(express.json());

  let game_id = 0;

  server.post('/game_init', async (req, res) => {
    const new_game = create_new();
    game_id++;

    await client.set(game_id.toString(), JSON.stringify(new_game));
    // gameplay.active_games[game_id] = new_game;
    console.log('game initialised -', await client.get(game_id.toString()));
    return res.json({ game_id });
  });

  server.get('/get_game_state/:game_id', async (req, res) => {
    const game_id = req.params.game_id;

    // const game_id_exist = gameplay.validate_active_game_id(game_id);
    const game = await client.get(game_id);

    if (!game) {
      return res.json({
        success: false,
        error: 'game_id doesnot exist',
      });
    }
    const parse_game = JSON.parse(game);
    // const parse_game = gameplay.active_games[game_id];

    const game_board = parse_game.board;
    const game_status = parse_game.status;
    const player_won = parse_game.player_won;
    const current_player = parse_game.players[parse_game.current_player_turn];
    const players_list = Object.keys(parse_game.players);
    const players = [
      {
        player_1: players_list[0],
        player_move: parse_game.players[players_list[0]],
      },
      {
        player_2: players_list[1],
        player_move: parse_game.players[players_list[1]],
      },
    ];
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

    const game = await client.get(game_id);
    // const game_id_exist = gameplay.validate_active_game_id(game_id);

    if (!game) {
      return res.json({
        success: false,
        error: 'game id doesnot exist',
      });
    }

    // const parse_game = gameplay.active_games[game_id];
    const parse_game = JSON.parse(game);

    if (parse_game.status !== 'INITIALISED') {
      return res.json({
        success: false,
        message: 'players joining completed in this game.',
      });
    }

    const players_list_in_game = Object.keys(parse_game.players);

    if (!players_list_in_game.length) {
      parse_game.players[player] = 'X';
      parse_game.current_player_turn = player;

      await client.set(game_id.toString(), JSON.stringify(parse_game));

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

      parse_game.players[player] = 'O';
      parse_game.status = 'IN_PLAY_MODE';

      await client.set(game_id.toString(), JSON.stringify(parse_game));

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

    // const game_id_exist = gameplay.validate_active_game_id(game_id);
    const game = await client.get(game_id);

    if (!game) {
      return res.json({
        success: false,
        error: 'game id doesnot exist',
      });
    }
    console.log('game -', game);
    // const parse_game = gameplay.active_games[game_id];
    const parse_game = JSON.parse(game);

    if (parse_game.status === 'GAME_OVER') {
      const game_board = parse_game.board;
      const current_player = parse_game.current_player_turn;

      return res.json({
        success: false,
        message: `'${current_player}' - won the game.`,
        game_board,
        current_player,
      });
    }

    if (parse_game.status === 'INITIALISED') {
      const game_board = parse_game.board;
      const players = parse_game.players;

      return res.json({
        success: false,
        message: 'waiting for players to join in this game.',
        game_board,
        players,
      });
    }

    if (parse_game.status === 'IN_PLAY_MODE') {
      if (!Number.isNaN(move) && Number(move) < 1 && Number(move) > 9) {
        const game_board = parse_game.board;
        const current_player = parse_game.current_player_turn;

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

      let [ok, message] = parse_game.process_input({
        player_name: player,
        index1,
        index2,
      });

      const game_board = parse_game.board;
      if (parse_game.status === 'GAME_OVER') {
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
        current_player: parse_game.current_player_turn,
      });
    }
  });

  server.listen(8090, () => {
    console.log('server is running at 8090');
  });
}

start();
