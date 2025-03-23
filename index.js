// Data modelling questions
// System Design Questions
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let ticTacToe = [
  ['_', '_', '_'],
  ['_', '_', '_'],
  ['_', '_', '_'],
];

const players = {
  player1: 'X',
  player2: 'O',
};

let index1;
let index2;

let currentPlayer = players.player1;
let movesPlayed = 0;

function countMovesPlayed() {
  movesPlayed++;
}

function gameDraw() {
  if (movesPlayed === 9) {
    return true;
  }
}

function changePlayer() {
  if (currentPlayer === players.player1) {
    currentPlayer = players.player2;
  } else {
    currentPlayer = players.player1;
  }
}

function checkPlayerWon() {
  if (
    ticTacToe[0][0] !== '_' &&
    ticTacToe[0][1] !== '_' &&
    ticTacToe[0][2] !== '_'
  ) {
    if (
      ticTacToe[0][0] === ticTacToe[0][1] &&
      ticTacToe[0][1] === ticTacToe[0][2]
    ) {
      return true;
    }
  }
  if (
    ticTacToe[1][0] !== '_' &&
    ticTacToe[1][1] !== '_' &&
    ticTacToe[1][2] !== '_'
  ) {
    if (
      ticTacToe[1][0] === ticTacToe[1][1] &&
      ticTacToe[1][1] === ticTacToe[1][2]
    ) {
      return true;
    }
  }
  if (
    ticTacToe[2][0] !== '_' &&
    ticTacToe[2][1] !== '_' &&
    ticTacToe[2][2] !== '_'
  ) {
    if (
      ticTacToe[2][0] === ticTacToe[2][1] &&
      ticTacToe[2][1] === ticTacToe[2][2]
    ) {
      return true;
    }
  }
  if (
    ticTacToe[0][0] !== '_' &&
    ticTacToe[1][0] !== '_' &&
    ticTacToe[2][0] !== '_'
  ) {
    if (
      ticTacToe[0][0] === ticTacToe[1][0] &&
      ticTacToe[1][0] === ticTacToe[2][0]
    ) {
      return true;
    }
  }
  if (
    ticTacToe[0][1] !== '_' &&
    ticTacToe[1][1] !== '_' &&
    ticTacToe[2][1] !== '_'
  ) {
    if (
      ticTacToe[0][1] === ticTacToe[1][1] &&
      ticTacToe[1][1] === ticTacToe[2][1]
    ) {
      return true;
    }
  }
  if (
    ticTacToe[0][2] !== '_' &&
    ticTacToe[1][2] !== '_' &&
    ticTacToe[2][2] !== '_'
  ) {
    if (
      ticTacToe[0][2] === ticTacToe[1][2] &&
      ticTacToe[1][2] === ticTacToe[2][2]
    ) {
      return true;
    }
  }
  if (
    ticTacToe[0][0] !== '_' &&
    ticTacToe[1][1] !== '_' &&
    ticTacToe[2][2] !== '_'
  ) {
    if (
      ticTacToe[0][0] === ticTacToe[1][1] &&
      ticTacToe[1][1] === ticTacToe[2][2]
    ) {
      return true;
    }
  }
  if (
    ticTacToe[0][2] !== '_' &&
    ticTacToe[1][1] !== '_' &&
    ticTacToe[2][0] !== '_'
  ) {
    if (
      ticTacToe[0][2] === ticTacToe[1][1] &&
      ticTacToe[1][1] === ticTacToe[2][0]
    ) {
      return true;
    }
  }
  return false;
}

function validatePlayerMove(index1, index2, value) {
  if (ticTacToe[index1][index2] === '_') {
    ticTacToe[index1][index2] = value;
  } else {
    return 'not empty';
  }
}

function playGame(index1, index2) {
  const validateMove = validatePlayerMove(index1, index2, currentPlayer);

  if (validateMove) {
    return validateMove;
  }
}

function filterPlayerMove(number) {
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
}

function displayTicTacToe(ticTacToe) {
  console.log(
    `${ticTacToe[0].join('\t')}\n${ticTacToe[1].join(
      '\t'
    )}\n${ticTacToe[2].join('\t')}`
  );
}

function displayInitialGameRules() {
  console.log(`Starting the game...\nCurrent Player is ${currentPlayer}`);
  console.log(`Please type a number from '1' and '9'`);
}

function displayCurrentPlayer() {
  console.log(`current player is ${currentPlayer}`);
}

process.stdin.on('data', (data) => {
  const parsedData = data.toString();
  const isValidNum = !Number.isNaN(Number(parsedData));

  if (!isValidNum || Number(parsedData) > 9 || Number(parsedData) < 1) {
    console.log('please type a number between 1 and 9');
    displayCurrentPlayer();
    displayTicTacToe(ticTacToe);
  } else {
    filterPlayerMove(Number(parsedData));
    const playMoveError = playGame(index1, index2);

    if (playMoveError) {
      console.log(playMoveError);
      displayCurrentPlayer();
      displayTicTacToe(ticTacToe);

      return;
    }

    countMovesPlayed();
    const playerWon = checkPlayerWon();

    if (playerWon) {
      console.log(`Congrats ${currentPlayer}. You won the game!!!`);
      ticTacToe = [
        ['_', '_', '_'],
        ['_', '_', '_'],
        ['_', '_', '_'],
      ];
      currentPlayer = players.player1;
      displayInitialGameRules();
      displayTicTacToe(ticTacToe);
      return;
    }

    const isGameDraw = gameDraw();

    if (isGameDraw) {
      console.log(`The game is draw.\nRestarting the Game...`);
      ticTacToe = [
        ['_', '_', '_'],
        ['_', '_', '_'],
        ['_', '_', '_'],
      ];
      currentPlayer = players.player1;
      displayInitialGameRules();
      displayTicTacToe(ticTacToe);
      return;
    }

    changePlayer();
    displayCurrentPlayer();

    displayTicTacToe(ticTacToe);
  }
});

displayInitialGameRules();

