const game_utils = require('./game_utils');
const { create_game } = require('./game');
const game_service_in_memory = require('./redis_database.game.service');

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

  const game_data = await game_service_in_memory.get_game(game_id);

  if (!game_data) {
    return res.json({
      success: false,
      error: 'game_id doesnot exist',
    });
  }

  const game = new create_game(game_data);

  return res.json({
    success: true,
    message: 'game status shown below',
    game_board: game.board,
    game_status: game.status,
    player_won: game.player_won,
    current_player: game.get_current_player(
      game.players,
      game.current_player_turn
    ),
    players: game.players,
  });
}

module.exports = { get_game_state };
