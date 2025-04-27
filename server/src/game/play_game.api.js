const redis_database = require('../database/redis_database.service');
const { create_game } = require('./game');
const game_utils = require('./game_utils');

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

  const game_data = await redis_database.client.get(game_id);

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

    await redis_database.client.set(game_id, JSON.stringify(game));

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
}

module.exports = { play_game };
