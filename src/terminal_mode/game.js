function create_new() {
  return {
    status: 'playing',
    current_player_turn: 0,
    moves_played: 0,
    status_message: null,
    players: {
      0: 'X',
      1: 'O',
    },
    board: [
      ['_', '_', '_'],
      ['_', '_', '_'],
      ['_', '_', '_'],
    ],

    process_input(game_input) {
      const update_board_successful = this.update_board(
        this.board,
        game_input.index1,
        game_input.index2,
        this.players,
        this.current_player_turn
      );

      if (!update_board_successful) {
        this.status_message = `Current move is invalid as it is not empty. Current player is - '${
          this.players[this.current_player_turn]
        }'.\n`;

        return;
      }

      this.moves_played++;
      const current_player_won = this.check_player_won(
        this.board,
        game_input.index1,
        game_input.index2,
        this.players[this.current_player_turn]
      );

      if (current_player_won) {
        this.status_message = `Congrats '${
          this.players[this.current_player_turn]
        }' won the game.\n`;

        this.status = 'GAME_OVER';
        return;
      }

      const is_game_draw = this.game_draw(this.moves_played);

      if (is_game_draw) {
        this.status_message = `This game is draw.\n`;

        this.status = 'GAME_OVER';
        return;
      }

      this.status_message = `Player - '${
        this.players[this.current_player_turn]
      }' move completed.\n`;
      this.current_player_turn = (this.current_player_turn + 1) % 2;
    },

    get_state() {
      return JSON.parse(JSON.stringify(this));
    },

    update_indexes(indexes, index1, index2) {
      (indexes.index1 = index1), (indexes.index2 = index2);
    },

    validate_current_player_turn(current_player_input, current_player_turn) {
      if (current_player_input === this.players[current_player_turn]) {
        return true;
      }

      return false;
    },

    update_board(board, index1, index2, players, current_player_turn) {
      if (board[index1][index2] === '_') {
        board[index1][index2] = players[current_player_turn];
        return true;
      } else {
        return false;
      }
    },

    change_player_turn(current_player_turn, total_players) {
      current_player_turn = (current_player_turn + 1) % total_players;
    },

    check_player_won(board, index1, index2, current_player) {
      if (
        board[index1][index2] === board[index1][1] &&
        board[index1][1] === board[index1][2] &&
        board[index1][0] === current_player
      ) {
        return true;
      }

      if (
        board[0][index2] === board[1][index2] &&
        board[1][index2] === board[2][index2] &&
        board[0][index2] === current_player
      ) {
        return true;
      }

      if (
        index1 === index2 &&
        board[0][0] === board[1][1] &&
        board[2][2] === board[0][0]
      ) {
        return true;
      }

      if (
        (index1 === index2 || Math.abs(index1 - index2) === 2) &&
        board[2][0] === board[1][1] &&
        board[1][1] === board[0][2] &&
        board[1][1] === current_player
      ) {
        return true;
      }
    },

    game_draw(moves_played) {
      if (moves_played === 9) {
        return true;
      } else {
        return false;
      }
    },

    reset_game() {
      (this.board = [
        ['_', '_', '_'],
        ['_', '_', '_'],
        ['_', '_', '_'],
      ]),
        (this.indexesindexes = {
          index1: null,
          index2: null,
        }),
        (this.current_player_turn = 0),
        (this.moves_played = 0),
        (this.required_input = 'MAKE_MOVE'),
        (this.status_message = null);
    },
  };
}

module.exports = { create_new };
