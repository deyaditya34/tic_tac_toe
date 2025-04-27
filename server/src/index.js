const express = require('express');
const morgan = require('morgan');
const config = require('./config');
const redis_database = require('./database/redis_database.service');

const { join_game } = require('./game/join_game.api');
const { play_game } = require('./game/play_game.api');
const { create_new_game } = require('./game/create_game.api');
const { get_game_state } = require('./game/get_game_state.api');
const { get_active_games } = require('./game/get_active_games.api');
const { get_active_players } = require('./game/get_active_players.api');

async function start() {
  const server = express();
  console.log('connecting to database..');

  await redis_database.initialize_redis();

  console.log('connected to database.\nStarting server..');
  await redis_database.client.flushDb();

  server.use(
    morgan(':method :url :status :res[content-length] - :response-time ms')
  );

  server.post('/api/game', create_new_game);

  server.get('/api/game/players/active', get_active_players);

  server.get('/api/game/games/active', get_active_games);

  server.get('/api/game/:game_id', get_game_state);

  server.post('/api/game/:game_id/join', join_game);

  server.post('/api/game/:game_id/play', play_game);

  server.listen(config.SERVER_PORT, () => {
    console.log(`server is running at ${config.SERVER_PORT}`);
  });
}

start();
