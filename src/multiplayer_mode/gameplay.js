const jwt = require('jsonwebtoken');
const config = require('../config');

function validate_active_game_id(game_id) {
  if (!active_games[game_id]) {
    return false;
  }

  return true;
}

function retrieve_indexes_by_player_move(number) {
  let index1;
  let index2;

  if (number === 1) {
    index1 = 0;
    index2 = 0;
  }

  if (number === 2) {
    index1 = 0;
    index2 = 1;
  }

  if (number === 3) {
    index1 = 0;
    index2 = 2;
  }

  if (number === 4) {
    index1 = 1;
    index2 = 0;
  }

  if (number === 5) {
    index1 = 1;
    index2 = 1;
  }

  if (number === 6) {
    index1 = 1;
    index2 = 2;
  }

  if (number === 7) {
    index1 = 2;
    index2 = 0;
  }

  if (number === 8) {
    index1 = 2;
    index2 = 1;
  }

  if (number === 9) {
    index1 = 2;
    index2 = 2;
  }

  return { index1, index2 };
}

function decrypt_token(token) {
  try {
    const payload = jwt.decode(token, config.JWT_SECRET);

    return payload.username;
  } catch (err) {
    return null;
  }
}

module.exports = {
  validate_active_game_id,
  retrieve_indexes_by_player_move,
  decrypt_token,
};

// demo - eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImRlbW8iLCJpYXQiOjE3NDQ5NTU5NzJ9.wx4LFVAbQDP1ig_FEf0wm4hKm0dnp1TsP8Y8fZVOxkE
// demo1 - eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImRlbW8xIiwiaWF0IjoxNzQ0OTU4MDU5fQ.fgfSHSRLtHCtyTosehMx_aOMgbm55zS3iU-EvuQQLxY
// demo2 - eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImRlbW8yIiwiaWF0IjoxNzQ0OTU4MTA5fQ.gdr-9VjXRpZZHy126oww2Ws0HeNTPJIlJMAxQJL8-DI
// https://0x0.st/8OMl.js
