function create_new() {
  return {
    status: 'INITIALISED',
    current_player_turn: 0,
    player_won: null,
    moves_played: 0,
    status_message: null,
    players: {},
    board: [
      ['_', '_', '_'],
      ['_', '_', '_'],
      ['_', '_', '_'],
    ],

    process_input(game_input) {
      const current_player_validated = this.validate_current_player_turn(
        game_input.player_name,
        this.current_player_turn
      );

      if (!current_player_validated) {
        let error_message = `Current player is - '${this.current_player_turn}'. Please wait for your turn.`;

        return [false, error_message];
      }

      const update_board_successful = this.update_board(
        this.board,
        game_input.index1,
        game_input.index2,
        this.players,
        this.current_player_turn
      );

      if (!update_board_successful) {
        let error_message = `Current move is invalid as it is not empty. Current player is - '${this.current_player_turn}'.`;

        return [false, error_message];
      }

      this.moves_played++;
      const current_player_won = this.check_player_won(
        this.board,
        game_input.index1,
        game_input.index2,
        this.players[this.current_player_turn]
      );

      if (current_player_won) {
        this.player_won = this.current_player_turn;
        let success_message = `Congrats '${this.current_player_turn}' won the game.`;

        this.status = 'GAME_OVER';
        return [false, success_message];
      }

      const is_game_draw = this.game_draw(this.moves_played);

      if (is_game_draw) {
        let success_message = `This game is draw.`;

        this.status = 'GAME_OVER';
        return [false, success_message];
      }

      let success_message = `Player - '${this.current_player_turn}' move completed.`;

      const change_player = this.change_current_player_turn(
        this.players,
        this.current_player_turn
      );
      this.current_player_turn = change_player;

      return [true, success_message];
    },

    get_state() {
      return JSON.parse(JSON.stringify(this));
    },

    

    change_current_player_turn(players, current_player_turn) {
      const players_list = Object.keys(players);

      if (current_player_turn === players_list[0]) {
        current_player_turn = players_list[1];
      } else {
        current_player_turn = players_list[0];
      }

      return current_player_turn;
    },

    validate_current_player_turn(player_input_name, current_player_turn) {
      if (player_input_name === current_player_turn) {
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
  };
}

module.exports = { create_new };
