const redis_database = require('../database/redis_database.service');
const config = require("../config")

async function get_active_games(req, res) {
  const active_games_list = await redis_database.client.get(
    config.ACTIVE_GAMES_ID_LIST
  );

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
}

module.exports = { get_active_games };
