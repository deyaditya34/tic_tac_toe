const redis_database = require('../database/redis_database.service');
const game_utils = require('./game_utils');
const { create_game } = require('./game');

async function get_game_state(req, res) {
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

  const game_data = await redis_database.client.get(game_id);

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
}

module.exports = { get_game_state };
