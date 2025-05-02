const game_utils = require('./game_utils');
const { create_game } = require('./game');
const config = require('../config');
const game_service_in_memory = require('./redis_database.game.service');

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

  const game_data = await game_service_in_memory.get_game(game_id);

  if (!game_data) {
    return res.json({
      success: false,
      message: 'game id doesnot exist',
    });
  }

  const game = new create_game(game_data);

  if (game.status !== 'WAITING_FOR_PLAYERS') {
    return res.json({
      success: false,
      message: 'players joining completed in this game.',
    });
  }

  const active_players_list = await game_service_in_memory.get_active_players(
    config.ACTIVE_PLAYERS_ID_LIST
  );

  const player_already_in_game = active_players_list.find(
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

  await game_service_in_memory.store_game(game_id, game);

  const active_games_list = await game_service_in_memory.get_active_games(
    config.ACTIVE_GAMES_ID_LIST
  );

  const update_active_games_list = active_games_list.filter(
    (active_game_id) => active_game_id !== game_id
  );

  await game_service_in_memory.store_active_games(
    config.ACTIVE_GAMES_ID_LIST,
    update_active_games_list
  );

  active_players_list.push(player);

  await game_service_in_memory.store_active_players(
    config.ACTIVE_PLAYERS_ID_LIST,
    active_players_list
  );

  const current_player_turn = game.current_player_turn;
  const current_player_deactivated_time =
    new Date(Date.now() + config.PLAYER_TURN_TIMEOUT * 1000 * 60);
  const is_deactivated = false;
  
  await game_service_in_memory.store_game_player_turn_timeout(
    config.CURRENT_PLAYER_TURN_LIST,
    {
      game_id,
      player_turn: current_player_turn,
      deactivated_time: current_player_deactivated_time,
      is_deactivated,
    }
  );

  return res.json({
    success: add_player,
    message,
    game_id,
  });
}

module.exports = { join_game };
