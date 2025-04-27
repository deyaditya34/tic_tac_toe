const config = require('../config');
const game_service_in_memory = require('./redis_database.game.service');

async function get_active_games(req, res) {
  const active_games_list = await game_service_in_memory.get_active_games(
    config.ACTIVE_GAMES_ID_LIST
  );

  if (!active_games_list) {
    return res.json({
      success: false,
      message: 'No games to join at this moment.',
    });
  }

  return res.json({
    success: true,
    message: 'active games list shown',
    active_games: active_games_list,
  });
}

module.exports = { get_active_games };
