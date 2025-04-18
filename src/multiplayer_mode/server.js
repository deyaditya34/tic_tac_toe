const express = require('express');
const { create_new } = require('./game');
const gameplay = require('./gameplay');

const server = express();

server.use(express.json());

let game_id = 0;

server.post('/game_init', (req, res) => {
  const new_game = create_new();
  game_id++;
  gameplay.active_games[game_id] = new_game;

  return res.json({ game_id: game_id });
});

server.get('/get_game_state/:game_id', (req, res) => {
  const game_id = req.params.game_id;

  const game_id_exist = gameplay.validate_active_game_id(game_id);

  if (!game_id_exist) {
    return res.json({
      success: false,
      error: 'game_id doesnot exist',
    });
  }

  const parse_game = gameplay.active_games[game_id];
  let player_won;
  let current_player;

  if (parse_game.status === 'GAME_OVER' && parse_game.moves_played < 9) {
    player_won = parse_game.players[parse_game.current_player_turn];
  } else {
    current_player = parse_game.players[parse_game.current_player_turn];
  }

  const game_board = parse_game.board;
  const players = Object.keys(parse_game.players);
  const game_status = parse_game.status;

  return res.json({
    success: true,
    message: 'game status shown below',
    player_won,
    game_board,
    current_player,
    game_status,
    players,
  });
});

server.post('/make_move/:game_id/:player_id/:move', (req, res) => {
  const game_id = req.params.game_id;
  const move = req.params.move;
  const player_id = req.params.player_id;

  const game_id_exist = gameplay.validate_active_game_id(game_id);

  if (!game_id_exist) {
    return res.json({
      success: false,
      error: 'game id doesnot exist',
    });
  }

  const parse_game = gameplay.active_games[game_id];

  if (parse_game.status === 'GAME_OVER') {
    const game_board = parse_game.board;
    const current_player = parse_game.players[parse_game.current_player_turn];

    return res.json({
      success: false,
      message: `'${current_player}' - won the game.`,
      game_board,
      current_player,
    });
  }

  if (!Number.isNaN(move) && Number(move) < 1 && Number(move) > 9) {
    const game_board = parse_game.board;
    const current_player = parse_game.players[parse_game.current_player_turn];

    return res.json({
      success: false,
      error: 'move is invalid. The move should be from 1 - 9',
      game_board,
      current_player,
    });
  }

  const { index1, index2 } = gameplay.retrieve_indexes_by_player_move(
    Number(move)
  );

  let [ok, message] = parse_game.process_input({ player_id, index1, index2 });

  const game_board = parse_game.board;
  if (parse_game.status === 'GAME_OVER') {
    return res.json({
      success: ok,
      error: message,
      game_board,
    });
  }

  return res.json({
    success: ok,
    message,
    game_board,
    current_player: parse_game.players[parse_game.current_player_turn],
  });
});

server.listen(8090, () => {
  console.log('server is running at 8090');
});
