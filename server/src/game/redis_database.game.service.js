const redis_database = require('../database/redis_database.service');

async function get_active_players(key) {
  const result = await redis_database.client.get(key);

  if (!result) {
    return;
  }

  return JSON.parse(result);
}

async function store_active_players(key, value) {
  if (!value.length) {
    await redis_database.client.set(key, JSON.stringify([]));
    return;
  }

  await redis_database.client.set(key, JSON.stringify(value));
}

async function get_active_games(key) {
  const result = await redis_database.client.get(key);

  if (!result) {
    return;
  }

  return JSON.parse(result);
}

async function store_active_games(key, value) {
  if (!value.length) {
    await redis_database.client.set(key, JSON.stringify([]));
    return;
  }

  await redis_database.client.set(key, JSON.stringify(value));
}

async function store_game(game_id, value) {
  await redis_database.client.set(game_id, JSON.stringify(value));
}

async function get_game(game_id) {
  const game_data = await redis_database.client.get(game_id);

  return JSON.parse(game_data);
}

async function delete_game(game_id) {
  await redis_database.client.del(game_id);
}

async function store_game_player_turn_timeout(key, value, index) {
  let players_turn_data = JSON.parse(await redis_database.client.get(key));

  if (!players_turn_data) {
    players_turn_data = [];
  }

  if (!index) {
    players_turn_data.push(value);
  } else {
    players_turn_data[index] = value;
  }

  await redis_database.client.set(key, JSON.stringify(players_turn_data));
}

async function get_game_player_turn_timeout(key, game_id) {
  const players_turn_data = JSON.parse(await redis_database.client.get(key));

  const player_turn_data_index = players_turn_data.findIndex(
    (player_data) => player_data.game_id === game_id
  );

  if (player_turn_data_index === -1) {
    return;
  }

  return players_turn_data[player_turn_data_index];
}

async function get_game_player_turn_timeout_index(key, game_id) {
  const players_turn_data = JSON.parse(await redis_database.client.get(key));

  const player_turn_data_index = players_turn_data.findIndex(
    (player_data) => player_data.game_id === game_id
  );

  if (player_turn_data_index === -1) {
    return;
  }

  return player_turn_data_index;
}

async function delete_game_player_turn_timeout(key, game_id) {
  const players_turn_data = JSON.parse(await redis_database.client.get(key));

  const updated_players_turn_data = players_turn_data.filter(
    (player_data) => player_data.game_id !== game_id
  );

  await store_game_player_turn_timeout(key, updated_players_turn_data);
}

module.exports = {
  get_active_players,
  store_active_players,
  store_game,
  get_game,
  delete_game,
  get_active_games,
  store_active_games,
  store_game_player_turn_timeout,
  get_game_player_turn_timeout,
  get_game_player_turn_timeout_index,
  delete_game_player_turn_timeout
};
