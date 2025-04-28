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

module.exports = {
  get_active_players,
  store_active_players,
  store_game,
  get_game,
  delete_game,
  get_active_games,
  store_active_games,
};
