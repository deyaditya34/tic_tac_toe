const config = require('../config');
const game_service_in_memory = require('./redis_database.game.service');

async function get_active_players(req, res) {
  const active_players_list = await game_service_in_memory.get_active_players(
    config.ACTIVE_PLAYERS_ID_LIST
  );

  if (!active_players_list) {
    return res.json({
      success: false,
      message: 'No players active at this moment.',
    });
  }

  return res.json({
    success: true,
    message: 'active players list shown',
    active_players: active_players_list,
  });
}

module.exports = { get_active_players };
