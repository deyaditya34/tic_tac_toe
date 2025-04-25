require('dotenv').config();

module.exports = {
  SERVER_PORT: process.env.SERVER_PORT,
  JWT_SECRET: process.env.JWT_SECRET,
  ACTIVE_GAMES_ID_LIST: process.env.ACTIVE_GAMES_ID_LIST,
  ACTIVE_PLAYERS_ID_LIST: process.env.ACTIVE_PLAYERS_ID_LIST,
};
