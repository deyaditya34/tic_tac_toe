const express = require('express');
const { createClient } = require('redis');
const crypto = require('crypto');
const morgan = require('morgan');
const config = require('./config');
const { create_game } = require('./game');
const game_utils = require('./game_utils');

async function start() {
  const server = express();
  console.log('connecting to database..');
  const client = await createClient({database: 1})
    .on('error', (err) => console.log('Redis Client Error', err))
    .connect();
  console.log('connected to database.\nStarting server..');
  await client.flushDb();

  server.use(
    morgan(':method :url :status :res[content-length] - :response-time ms')
  );

  server.post('/api/game', async (req, res) => {
    const player_token = req.headers?.token;
    const new_game = new create_game();

    if (!player_token) {
      return res.json({
        success: false,
        message: 'player token is missing',
      });
    }

    const player = game_utils.decrypt_token(player_token);

    if (!player) {
      return res.json({
        success: false,
        message: 'invalid player',
      });
    }

    const active_players_list = await client.get(config.ACTIVE_PLAYERS_ID_LIST);
    const active_players_list_parsed = JSON.parse(active_players_list);

    if (active_players_list) {
      const player_already_in_game = active_players_list_parsed.find(
        (active_player) => active_player === player
      );

      if (player_already_in_game) {
        return res.json({
          success: false,
          message: 'player is already enrolled in another game.',
        });
      }
    }

    let game_id;

    while (true) {
      game_id = crypto.randomUUID();

      const existing_game_id = await client.get(game_id);

      if (!existing_game_id) {
        break;
      }
    }

    await client.set(game_id, JSON.stringify(new_game));

    const game_data = await client.get(game_id);
    const game = new create_game(JSON.parse(game_data));

    const [add_player, message] = game.add_player(player);

    if (!add_player) {
      await client.del(game_id);

      return res.json({
        success: add_player,
        message,
      });
    }

    await client.set(game_id, JSON.stringify(game));

    const active_games_list = await client.get(config.ACTIVE_GAMES_ID_LIST);

    if (!active_games_list) {
      await client.set(config.ACTIVE_GAMES_ID_LIST, JSON.stringify([game_id]));
    } else {
      const active_games_list_parsed = JSON.parse(active_games_list);
      active_games_list_parsed.push(game_id);

      await client.set(
        config.ACTIVE_GAMES_ID_LIST,
        JSON.stringify(active_games_list_parsed)
      );
    }

    if (!active_players_list) {
      await client.set(config.ACTIVE_PLAYERS_ID_LIST, JSON.stringify([player]));
    } else {
      active_players_list_parsed.push(player);

      await client.set(
        config.ACTIVE_PLAYERS_ID_LIST,
        JSON.stringify(active_players_list_parsed)
      );
    }

    return res.json({
      success: add_player,
      message,
      game_id,
    });
  });

  server.get('/api/game/players/active', async (req, res) => {
    const active_players_list = await client.get(config.ACTIVE_PLAYERS_ID_LIST);
    console.log('active players list', active_players_list);
    if (!active_players_list) {
      return res.json({
        success: false,
        message: 'No players active at this moment.',
      });
    }

    const active_players_list_parsed = JSON.parse(active_players_list);

    return res.json({
      success: true,
      message: 'active players list shown',
      active_players_list_parsed,
    });
  });

  server.get('/api/game/games/active', async (req, res) => {
    const active_games_list = await client.get(config.ACTIVE_GAMES_ID_LIST);

    if (!active_games_list) {
      return res.json({
        success: false,
        message: 'No games to join at this moment.',
      });
    }

    const active_games_list_parsed = JSON.parse(active_games_list);

    return res.json({
      success: true,
      message: 'active games list shown',
      active_games_list_parsed,
    });
  });

  server.get('/api/game/:game_id', async (req, res) => {
    const game_id = req.params.game_id;
    const player_token = req.headers?.token;

    if (!player_token) {
      return res.json({
        success: false,
        message: 'player token is missing',
      });
    }

    const player = game_utils.decrypt_token(player_token);

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
        error: 'game_id doesnot exist',
      });
    }

    const game = new create_game(JSON.parse(game_data));

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

  server.post('/api/game/:game_id/join', async (req, res) => {
    const game_id = req.params.game_id;
    const player_token = req.headers?.token;

    if (!player_token) {
      return res.json({
        success: false,
        message: 'player token is missing',
      });
    }

    const player = game_utils.decrypt_token(player_token);

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

    const game = new create_game(JSON.parse(game_data));

    if (game.status !== 'WAITING_FOR_PLAYERS') {
      return res.json({
        success: false,
        message: 'players joining completed in this game.',
      });
    }

    const active_players_list = await client.get(config.ACTIVE_PLAYERS_ID_LIST);
    const active_players_list_parsed = JSON.parse(active_players_list);

    const player_already_in_game = active_players_list_parsed.find(
      (active_player) => active_player === player
    );

    if (player_already_in_game) {
      return res.json({
        success: false,
        message: 'player is already enrolled in another game.',
      });
    }

    const [add_player, message] = game.add_player(player);

    if (!add_player) {
      return res.json({
        success: add_player,
        message,
        game_id,
      });
    }

    await client.set(game_id, JSON.stringify(game));

    const active_games_list = await client.get(config.ACTIVE_GAMES_ID_LIST);
    const active_games_list_parsed = JSON.parse(active_games_list);
    const update_active_games_list = active_games_list_parsed.find(
      (active_game_id) => active_game_id !== game_id
    );

    if (!update_active_games_list) {
      await client.set(config.ACTIVE_GAMES_ID_LIST, JSON.stringify([]));
    } else {
      await client.set(
        config.ACTIVE_GAMES_ID_LIST,
        JSON.stringify(update_active_games_list)
      );
    }

    active_players_list_parsed.push(player);

    await client.set(
      config.ACTIVE_PLAYERS_ID_LIST,
      JSON.stringify(active_players_list_parsed)
    );

    return res.json({
      success: add_player,
      message,
      game_id,
    });
  });

  server.post('/api/game/:game_id/play', async (req, res) => {
    const game_id = req.params.game_id;
    const move = req.query.move;
    const player_token = req.headers?.token;

    if (!player_token) {
      return res.json({
        success: false,
        message: 'player token is missing',
      });
    }

    if (!move) {
      return res.json({
        success: false,
        message: 'player move is required',
      });
    }

    const player = game_utils.decrypt_token(player_token);

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

    const game = new create_game(JSON.parse(game_data));

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

      const { index1, index2 } = game_utils.retrieve_indexes_by_player_move(
        Number(move)
      );

      let [ok, message] = game.process_input({
        player_name: player,
        index1,
        index2,
      });

      await client.set(game_id, JSON.stringify(game));

      if (!ok) {
        return res.json({
          success: ok,
          error: message,
          game_board: game.board,
          current_player: game.get_current_player(
            game.players,
            game.current_player_turn
          ),
        });
      }

      if (game.status === 'GAME_OVER') {
        return res.json({
          success: ok,
          error: message,
          game_board: game.board,
        });
      }

      return res.json({
        success: ok,
        message,
        game_board: game.board,
        current_player: game.get_current_player(
          game.players,
          game.current_player_turn
        ),
      });
    }
  });

  server.listen(config.SERVER_PORT, () => {
    console.log(`server is running at ${config.SERVER_PORT}`);
  });
}

start();
