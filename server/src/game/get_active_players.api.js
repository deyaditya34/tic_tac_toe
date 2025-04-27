const redis_database = require('../database/redis_database.service');
const config = require("../config");

async function get_active_players(req, res) {
  const active_players_list = await redis_database.client.get(
    config.ACTIVE_PLAYERS_ID_LIST
  );

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
}

module.exports = { get_active_players };
