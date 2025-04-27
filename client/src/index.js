const axios = require('axios');
const readline = require('readline');
const config = require('./config');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask_question(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  let player_token;
  let player_name;

  while (!player_token) {
    const user_log_in = await ask_question(
      `Press 1 to register or 2 to login\n`
    );

    const answer_string = user_log_in.toString();
    const parsed_answer = Number(answer_string);

    if (
      !Number.isNaN(answer_string) &&
      (parsed_answer === 1 || parsed_answer === 2)
    ) {
      const username = await ask_question('Please provide your username\n');
      const password = await ask_question('please provide a password\n');

      if (parsed_answer === 1) {
        try {
          const register_user = await axios.post(
            `http://localhost:${config.AUTH_PORT}/api/auth/register`,
            {
              username: username,
              password: password,
            }
          );

          const result = await register_user.data;

          if (result) {
            console.log(result.data);

            const login = await ask_question(
              'Press "1" to login automatically or any other key to login manually\n'
            );

            const answer_string = login.toString();
            const parsed_answer = Number(answer_string);

            if (parsed_answer === 1) {
              const login_user = await axios.post(
                `http://localhost:${config.AUTH_PORT}/api/auth/login`,
                {
                  username: username,
                  password: password,
                }
              );

              const result = await login_user.data;

              player_token = result.token;
              player_name = username;
              console.log(result.data);
            }
          }
        } catch (err) {
          console.log('error :', err.message);
        }
      } else {
        try {
          const login_user = await axios.post(
            `http://localhost:${config.AUTH_PORT}/api/auth/login`,
            {
              username: username,
              password: password,
            }
          );

          const result = await login_user.data;

          if (result) {
            player_token = result.token;
            player_name = username;
            console.log(result.data);
          }
        } catch (err) {
          console.log('error :', err.message);
        }
      }
    }
  }

  let game_id;
  while (!game_id) {
    const question = await ask_question(
      'Press 1 to create your own game or 2 to enter existing game\n'
    );

    const parsed_answer = Number(question.toString());

    if (parsed_answer === 1 || parsed_answer === 2) {
      if (parsed_answer === 1) {
        try {
          const new_game = await axios.post(
            `http://localhost:${config.GAME_SERVER_PORT}/api/game`,
            {},
            {
              headers: {
                token: player_token,
              },
            }
          );

          const result = await new_game.data;
          console.log(result);
          game_id = result.game_id;
        } catch (err) {
          console.log(err);
        }
      } else {
        const existing_game_list = await axios.get(
          `http://localhost:${config.GAME_SERVER_PORT}/api/game/games/active`
        );

        const result = await existing_game_list.data;

        if (result.success && result.active_games_list_parsed.length) {
          const active_games_list = result.active_games;

          const question = await ask_question(
            `Out of the active games - '${active_games_list.join(
              '  '
            )}', type the index of the game id you want to enter\n`
          );

          const parsed_answer = Number(question.toString());
          const game_list_length = active_games_list.length;

          if (
            !Number(isNaN(question.toString())) &&
            parsed_answer <= game_list_length &&
            parsed_answer !== 0
          ) {
            const player_join_game = await axios.post(
              `http://localhost:${config.GAME_SERVER_PORT}/api/game/${
                active_games_list[parsed_answer - 1]
              }/join`,
              {},
              {
                headers: {
                  token: player_token,
                },
              }
            );

            const result = await player_join_game.data;

            if (result.success) {
              game_id = active_games_list[parsed_answer - 1];
              console.log(result.message);
            } else {
              console.log(result.message);
            }
          }
        } else {
          console.log('No active games to join at this moment');
        }
      }
    }
  }

  const game_state = await axios.get(
    `http://localhost:${config.GAME_SERVER_PORT}/api/game/${game_id}`,
    {
      headers: {
        token: player_token,
      },
    }
  );

  const result = await game_state.data;
  console.log(result);

  let game_status;
  while (!game_status) {
    const game_state = await axios.get(
      `http://localhost:${config.GAME_SERVER_PORT}/api/game/${game_id}`,
      {
        headers: {
          token: player_token,
        },
      }
    );

    const result = await game_state.data;

    if (result.game_status === 'GAME_OVER') {
      game_status = 'GAME_OVER';

      console.log(result.message);
      console.log(result.game_board);
      console.log(`'${result.player_won}' won the game`);
      console.log(`game status - '${result.game_status}'`);
      console.log(`players - '${JSON.stringify(result.players)}'`);
      rl.close();
    }

    if (
      result.game_status === 'IN_PLAY_MODE' &&
      result.current_player === player_name
    ) {
      let valid_move;
      console.log(result.game_board);
      while (!valid_move) {
        const question = await ask_question(
          "Please play your move from '1' to '9'\n"
        );
        const parsed_answer = Number(question.toString());

        if (
          !Number.isNaN(question.toString()) &&
          parsed_answer !== 0 &&
          (parsed_answer >= 1 || parsed_answer <= 9)
        ) {
          const player_move = await axios.post(
            `http://localhost:${config.GAME_SERVER_PORT}/api/game/${game_id}/play`,
            {},
            {
              headers: {
                token: player_token,
              },
              params: {
                move: parsed_answer,
              },
            }
          );
          const result = await player_move.data;

          if (result.success) {
            valid_move = true;
          }
          if (result?.error) {
            console.log(result.error);
          }
          if (result?.message) {
            console.log(result.message);
          }
          if (result?.current_player) {
            console.log(`current player - '${result.current_player}'`);
          }
        }
      }
    }
  }
}

main();
