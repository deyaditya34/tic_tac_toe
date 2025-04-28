const game_service_in_memory = require('./redis_database.game.service');
const game_utils = require('./game_utils');
const { create_game } = require('./game');
const config = require('../config');

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

  let active_players_list = await game_service_in_memory.get_active_players(
    config.ACTIVE_PLAYERS_ID_LIST
  );

  if (active_players_list) {
    const player_already_in_game = active_players_list.find(
      (active_player) => active_player === player
    );

    if (player_already_in_game) {
      return res.json({
        success: false,
        message: 'player is already enrolled in another game.',
      });
    }
  }

  let game_id = await game_utils.generate_game_id();

  await game_service_in_memory.store_game(game_id, new_game);

  const game_data = await game_service_in_memory.get_game(game_id);
  const game = new create_game(game_data);

  const [add_player, message] = game.add_player(player);

  if (!add_player) {
    await game_service_in_memory.delete_game(game_id);

    return res.json({
      success: add_player,
      message,
    });
  }

  await game_service_in_memory.store_game(game_id, game);

  let active_games_list = await game_service_in_memory.get_active_games(
    config.ACTIVE_GAMES_ID_LIST
  );

  if (active_games_list) {
    active_games_list.push(game_id);
  } else {
    active_games_list = [game_id];
  }

  await game_service_in_memory.store_active_games(
    config.ACTIVE_GAMES_ID_LIST,
    active_games_list
  );

  if (active_players_list) {
    active_players_list.push(player);
  } else {
    active_players_list = [player];
  }

  await game_service_in_memory.store_active_players(
    config.ACTIVE_PLAYERS_ID_LIST,
    active_players_list
  );

  return res.json({
    success: add_player,
    message,
    game_id,
  });
}

module.exports = { create_new_game };
