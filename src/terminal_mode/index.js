const game = require('./game');
const input = require('./input');

async function main() {
  while (true) {
    const game1 = game.create_new();
    render_game_to_console(game1.get_state());

    while (true) {
      const game_input = await input.get_relevant_input(game1.get_state());
      game1.process_input(game_input);
      render_game_to_console(game1.get_state());

      if (game1.status === 'GAME_OVER') {
        break;
      }
    }

    const play_again = await input.ask_question("Do you want to play again ('y/n')");

    if (play_again !== "y" && play_again !== "Y") {
      input.close_readline();
      break;
    }
  }
}

function render_game_to_console(game_state) {
  if (game_state.status_message) {
    console.log(game_state.status_message);
  }

  console.log(
    `${game_state.board[0].join('\t')}\n${game_state.board[1].join(
      '\t'
    )}\n${game_state.board[2].join('\t')}\n`
  );

  console.log(
    `Current player is - '${
      game_state.players[game_state.current_player_turn]
    }'`
  );
}

main();
