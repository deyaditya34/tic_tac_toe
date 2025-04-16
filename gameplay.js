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
  
  function resetTicTacToe() {
    ticTacToe = [
      ['_', '_', '_'],
      ['_', '_', '_'],
      ['_', '_', '_'],
    ];
  }
  
  function gameDraw() {
    if (movesPlayed === 9) {
      return true;
    } else {
      return false;
    }
  }
  
  function changePlayer() {
    if (currentPlayer === players.player1) {
      currentPlayer = players.player2;
    } else {
      currentPlayer = players.player1;
    }
  }
  
  function checkPlayerWon(row, column, player) {
    if (
      ticTacToe[row][0] === ticTacToe[row][1] &&
      ticTacToe[row][1] === ticTacToe[row][2] &&
      ticTacToe[row][0] === player
    ) {
      return true;
    }
  
    if (
      ticTacToe[0][column] === ticTacToe[1][column] &&
      ticTacToe[1][column] === ticTacToe[2][column] &&
      ticTacToe[0][column] === player
    ) {
      return true;
    }
  
    if (
      row === column &&
      ticTacToe[0][0] === ticTacToe[1][1] &&
      ticTacToe[2][2] === ticTacToe[0][0]
    ) {
      return true;
    }
  
    if (
      (row === column || Math.abs(row - column) === 2) &&
      ticTacToe[2][0] === ticTacToe[1][1] &&
      ticTacToe[1][1] === ticTacToe[0][2] &&
      ticTacToe[1][1] === player
    ) {
      return true;
    }
  }
  
  function validatePlayerMove(playerValue) {
    if (ticTacToe[index1][index2] === '_') {
      ticTacToe[index1][index2] = playerValue;
      return true;
    } else {
      return false;
    }
  }
  
  function changeIndexAccordingToNumber(number) {
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
  
  function displayInitialGameRules() {
    console.log(`Starting the game...\nCurrent Player is ${currentPlayer}`);
    console.log(`Please type a number from '1' and '9'`);
  }
  
  function displayCurrentPlayer() {
    console.log(`current player is ${currentPlayer}`);
  }
  
  function playGame(num) {
    changeIndexAccordingToNumber(num);
  
    const validateMove = validatePlayerMove(currentPlayer);
  
    if (!validateMove) {
      console.log(
        `\n'${num}' is already filled. Please retry with a different value.`
      );
      displayCurrentPlayer();
      displayTicTacToe(ticTacToe);
      return;
    } else {
      console.clear();
      console.log(`\n'Player - '${currentPlayer}' move is - '${num}'`);
    }
  
    countMovesPlayed();
    const playerWon = checkPlayerWon(index1, index2, currentPlayer);
  
    if (playerWon) {
      console.clear();
      console.log(`Congrats ${currentPlayer}. You won the game!!!`);
      movesPlayed = 0;
      resetTicTacToe();
      currentPlayer = players.player1;
      displayInitialGameRules();
      displayTicTacToe(ticTacToe);
      return;
    }
  
    const isGameDraw = gameDraw();
  
    if (isGameDraw) {
      console.clear();
      console.log(`The game is draw.\nRestarting the Game...`);
      movesPlayed = 0;
      resetTicTacToe();
      currentPlayer = players.player1;
      displayInitialGameRules();
      displayTicTacToe(ticTacToe);
      return;
    }
  
    changePlayer();
    displayCurrentPlayer();
  
    displayTicTacToe(ticTacToe);
  }
  
  process.stdin.on('data', (data) => {
    const parsedData = data.toString();
    const isValidNum = !Number.isNaN(Number(data.toString()));
    const validNum = Number(data.toString());
  
    if (!isValidNum || Number(validNum) > 9 || Number(validNum) < 1) {
      console.clear();
      console.log(
        `Invalid Input - '${parsedData}' by player '${currentPlayer}'.\nPlease type a number between 1 and 9`
      );
      displayCurrentPlayer();
      displayTicTacToe(ticTacToe);
    } else {
      playGame(validNum);
    }
  });
  
  displayInitialGameRules();
  