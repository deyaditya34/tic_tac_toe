const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask_question(input) {
  return new Promise((resolve) => {
    rl.question(input, (answer) => resolve(answer));
  });
}

function close_readline() {
  rl.close();
  rl.removeAllListeners();
}

async function make_move() {
  while (true) {
    const result = await ask_question(
      "Please type a number from '1' and '9'\n"
    );
    const valid_num = Number(result.toString());
    const is_valid_num = Number.isNaN(valid_num);

    if (!is_valid_num && valid_num <= 9 && valid_num >= 1) {
      return valid_num;
    }
  }
}

async function select_player() {
  while (true) {
    const result = await ask_question("Choose your player - 'X' or 'O'\n");
    const parsed_result = result.toString();

    if (parsed_result === 'X' || parsed_result === 'O') {
      return parsed_result;
    }
  }
}

async function restart_game() {
  while (true) {
    const result = await ask_question(
      "Type 'yes' to restart the game or 'no' to quit the game.\n"
    );
    const parsed_result = result.toString();

    if (parsed_result === 'yes' || parsed_result === 'no') {
      return parsed_result;
    }
  }
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

async function get_relevant_input(game_state) {
  switch (game_state.required_input) {
    case 'MAKE_MOVE':
      const selected_player = await select_player();
      const player_move = await make_move();
      const { index1, index2 } = retrieve_indexes_by_player_move(player_move);

      return { selected_player, index1, index2 };

    case 'GAME_OVER':
      const game_restart = await restart_game();

      return { game_restart };
  }
}

module.exports = {
  get_relevant_input,
  close_readline,
};
