const active_games = {};

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

module.exports = { active_games, validate_active_game_id, retrieve_indexes_by_player_move };
