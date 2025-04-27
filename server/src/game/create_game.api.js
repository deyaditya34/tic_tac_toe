const crypto = require('crypto');
const redis_database = require("../database/redis_database.service");
const {create_game} = require("./game");
const game_utils = require("./game_utils");
const config = require("../config");

async function create_new_game(req, res) {
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

  const active_players_list = await redis_database.client.get(
    config.ACTIVE_PLAYERS_ID_LIST
  );
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

    const existing_game_id = await redis_database.client.get(game_id);

    if (!existing_game_id) {
      break;
    }
  }

  await redis_database.client.set(game_id, JSON.stringify(new_game));

  const game_data = await redis_database.client.get(game_id);
  const game = new create_game(JSON.parse(game_data));

  const [add_player, message] = game.add_player(player);

  if (!add_player) {
    await redis_database.client.del(game_id);

    return res.json({
      success: add_player,
      message,
    });
  }

  await redis_database.client.set(game_id, JSON.stringify(game));

  const active_games_list = await redis_database.client.get(
    config.ACTIVE_GAMES_ID_LIST
  );

  if (!active_games_list) {
    await redis_database.client.set(
      config.ACTIVE_GAMES_ID_LIST,
      JSON.stringify([game_id])
    );
  } else {
    const active_games_list_parsed = JSON.parse(active_games_list);
    active_games_list_parsed.push(game_id);

    await redis_database.client.set(
      config.ACTIVE_GAMES_ID_LIST,
      JSON.stringify(active_games_list_parsed)
    );
  }

  if (!active_players_list) {
    await redis_database.client.set(
      config.ACTIVE_PLAYERS_ID_LIST,
      JSON.stringify([player])
    );
  } else {
    active_players_list_parsed.push(player);

    await redis_database.client.set(
      config.ACTIVE_PLAYERS_ID_LIST,
      JSON.stringify(active_players_list_parsed)
    );
  }

  return res.json({
    success: add_player,
    message,
    game_id,
  });
}


module.exports = {create_new_game}