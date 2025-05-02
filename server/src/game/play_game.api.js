const { create_game } = require('./game');
const game_utils = require('./game_utils');
const game_service_in_memory = require('./redis_database.game.service');
const config = require('../config');

async function play_game(req, res) {
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

  const game_data = await game_service_in_memory.get_game(game_id);

  if (!game_data) {
    return res.json({
      success: false,
      error: 'game id doesnot exist',
    });
  }

  const game = new create_game(game_data);

  if (game.status === 'GAME_OVER') {
    const current_player = game.get_current_player(
      game.players,
      game.current_player_turn
    );

    return res.json({
      success: false,
      message: `'${current_player}' - won the game.`,
      game_board: game.board,
    });
  }

  if (game.status === 'WAITING_FOR_PLAYERS') {
    return res.json({
      success: false,
      message: 'waiting for players to join in this game.',
      game_board: game.board,
      players: game.players,
    });
  }

  if (game.status === 'IN_PLAY_MODE') {
    if (!Number.isNaN(move) && Number(move) < 1 && Number(move) > 9) {
      return res.json({
        success: false,
        error: 'move is invalid. The move should be from 1 - 9',
        game_board: game.board,
        current_player: game.get_current_player(
          game.players,
          game.current_player_turn
        ),
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

    await game_service_in_memory.store_game(game_id, game);

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
      const game_players = game.players;

      const active_players_list =
        await game_service_in_memory.get_active_players(
          config.ACTIVE_PLAYERS_ID_LIST
        );

      const update_active_players_list = active_players_list.filter(
        (player_name) =>
          player_name !== game_players[0].player_name ||
          player_name !== game_players[1].player_name
      );

      await game_service_in_memory.store_active_players(
        config.ACTIVE_PLAYERS_ID_LIST,
        update_active_players_list
      );

      await game_service_in_memory.delete_game_player_turn_timeout(
        config.CURRENT_PLAYER_TURN_LIST,
        game_id
      );

      return res.json({
        success: ok,
        error: message,
        game_board: game.board,
      });
    }

    const current_player_turn = game.current_player_turn;
    const current_player_deactivated_time = new Date(
      Date.now() + config.PLAYER_TURN_TIMEOUT * 1000 * 60
    );
    const is_deactivated = false;

    const game_player_turn_timeout_index =
      await game_service_in_memory.get_game_player_turn_timeout_index(
        config.CURRENT_PLAYER_TURN_LIST,
        game_id
      );

    await game_service_in_memory.store_game_player_turn_timeout(
      config.CURRENT_PLAYER_TURN_LIST,
      {
        game_id,
        player_turn: current_player_turn,
        deactivated_time: current_player_deactivated_time,
        is_deactivated,
      },
      game_player_turn_timeout_index
    );

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
}

module.exports = { play_game };
