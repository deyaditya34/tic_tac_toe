const redis_database = require("../database/redis_database.service");
const game_utils = require("./game_utils");
const {create_game} = require("./game");
const config = require("../config");

async function join_game(req, res) {
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

  const active_players_list = await redis_database.client.get(
    config.ACTIVE_PLAYERS_ID_LIST
  );
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

  await redis_database.client.set(game_id, JSON.stringify(game));

  const active_games_list = await redis_database.client.get(
    config.ACTIVE_GAMES_ID_LIST
  );
  const active_games_list_parsed = JSON.parse(active_games_list);
  const update_active_games_list = active_games_list_parsed.find(
    (active_game_id) => active_game_id !== game_id
  );

  if (!update_active_games_list) {
    await redis_database.client.set(
      config.ACTIVE_GAMES_ID_LIST,
      JSON.stringify([])
    );
  } else {
    await redis_database.client.set(
      config.ACTIVE_GAMES_ID_LIST,
      JSON.stringify(update_active_games_list)
    );
  }

  active_players_list_parsed.push(player);

  await redis_database.client.set(
    config.ACTIVE_PLAYERS_ID_LIST,
    JSON.stringify(active_players_list_parsed)
  );

  return res.json({
    success: add_player,
    message,
    game_id,
  });
}

module.exports = {join_game}
