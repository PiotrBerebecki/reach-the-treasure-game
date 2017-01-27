console.clear();



const state = {
  currentRound: 1,
  totalEnemies: 1,
  totalGoals: 3,
  isGameLive: false,
  isGamePaused: false,
  
  minEnemySpeed: 1,
  maxEnemySpeed: 2,
  goalSpeed: 0.5,
  playerSpeed: 2,
  
  minMathChallenge: 1,
  maxMathChallenge: 12,
  correctAnswerIndex: null,
  animationRequestId: null,
  
  touchDirectionStart: {
    x: null,
    y: null
  },
  touchDirectionMove: {
    x: null,
    y: null
  },
};



const controller = {
  init: function() {
    view.init();
    
    // to avoid undefined player on 
    // key presses/touches before start
    view.player = this.createFreshPlayer();
    view.displayRound(state.currentRound);
  },
  
  startGame: function() {
    state.isGameLive = !state.isGameLive;
    
    view.player = this.createFreshPlayer();
    view.goals = this.createFreshGoals();
    view.enemiesVertical = this.createFreshEnemies('vertical');
    view.enemiesHorizontal = this.createFreshEnemies('horizontal');
    
    if (state.isGameLive) {
      view.startButton.textContent = 'Stop this round';
      view.showNextChallenge(this.generateMathChallenge());
      this.playGame();
    } else {
      view.startButton.textContent = 'Continue the treasure hunt';
      view.pauseButton.textContent = 'Pause';
      state.isGamePaused = false;
      this.cancelAnimation();
      view.drawBackground();
    }
    
    this.toggleChallenge();
  },
  
  playGame: function() { 
    view.drawBackground();
    view.drawPlayer();
    view.updatePlayer();
    
    const { goals, player, enemiesVertical, enemiesHorizontal } = view;
    
    for (let i = 0; i < state.totalGoals; i++) {
      view.drawGoal(goals[i]);
      
      // To save cost, check collision with goal only if close
      if (Math.abs(player.x - goals[i].x) <= player.w && this.checkCollisionGoal(player, goals[i])) {
        if (view.answersImageDOM[state.correctAnswerIndex].src === goals[i].image.src) {
          return this.finishAfterCollisionGoal(goals[i], 'correct');
        } else {
          return this.finishAfterCollisionGoal(goals[i], 'wrong');
        }
      }
      
      view.updateGoal(goals[i]);
    }
    
    state.animationRequestId = window.requestAnimationFrame(this.playGame);
    
    for (let i = 0; i < state.totalEnemies; i++) {
      view.drawEnemy(enemiesVertical[i]);
      view.drawEnemy(enemiesHorizontal[i]);
      
      if (player.doneFirstMove) {
        if (this.checkCollisionEnemy(player, enemiesVertical[i])) {
          return this.finishAfterCollisionEnemy(enemiesVertical[i], i);
        }
        
        if (this.checkCollisionEnemy(player, enemiesHorizontal[i])) {
          return this.finishAfterCollisionEnemy(enemiesHorizontal[i], i);
        } 
      }
      view.updateEnemy(enemiesVertical[i]);
      view.updateEnemy(enemiesHorizontal[i]);
    }
  },

  pauseGame: function() {
    if (!state.isGameLive) { return; }
      
    state.isGamePaused = !state.isGamePaused;
    
    if (state.isGamePaused) {
      window.cancelAnimationFrame(state.animationRequestId);
      state.animationRequestId = undefined;
      view.pauseButton.textContent = 'Resume';
    } else {
      view.pauseButton.textContent = 'Pause';
      this.playGame();
    }
  },
  
  cancelAnimation: function() {
    window.cancelAnimationFrame(state.animationRequestId);
    state.animationRequestId = undefined;
  },

  finishAfterCollisionEnemy: function(successfulEnemy, indexOfSuccessfulEnemy) {
    state.isGameLive = false;
    view.startButton.textContent = 'Try this round again';
    this.cancelAnimation();
    view.drawBackground();
    
    const { drawEnemy, 
            drawPlayer,
            drawAllGoals,
            enemiesVertical,
            enemiesHorizontal,
            player,
            sprites } = view;
    
    if (successfulEnemy.type === 'vertical') {
      for (let j = 0; j < state.totalEnemies; j++) {
        if (j !== indexOfSuccessfulEnemy) {
          drawEnemy(enemiesVertical[j]);
        }
        drawEnemy(enemiesHorizontal[j]);
      }
    } else {
      for (let j = 0; j < state.totalEnemies; j++) {
        if (j !== indexOfSuccessfulEnemy) {
          drawEnemy(enemiesHorizontal[j]);
        }
        drawEnemy(enemiesVertical[j]);
      }
    }

    player.image = sprites.playerUnhappy;
    drawPlayer();
    drawEnemy(successfulEnemy);
    drawAllGoals();
  },


  finishAfterCollisionGoal: function(goal, result) {
    state.isGameLive = false;
    this.cancelAnimation();
    view.drawBackground();
    
    const { player,
            sprites,
            startButton,
            drawPlayer,
            drawAllGoals,
            drawEnemy,
            enemiesVertical,
            enemiesHorizontal } = view;
    
    view.answersDOM.forEach((answer, index) => {
      if (index !== state.correctAnswerIndex) {
        answer.classList.add('wrong-answer');
      }
    });
    
    if (result === 'correct') {
      player.image = sprites.playerHappy;
      startButton.removeEventListener('click', this.startGame);
      setTimeout(() => {
        startButton.addEventListener('click', this.startGame);
        this.nextRound();
      }, 2000);
    } else {
      startButton.textContent = 'Try this round again';
      player.image = sprites.playerUnhappy;
    }

    drawPlayer();
    drawAllGoals();
    
    enemiesVertical.forEach((enemy, index) => {
      drawEnemy(enemy);
      drawEnemy(enemiesHorizontal[index]);
    });
  },

  
  nextRound: function () {
    // temporarily prevent player from moving
    // after reaching the goal
    window.removeEventListener('keydown', this.movePlayer);
    document.removeEventListener('touchstart', this.processTouchStart);
    document.removeEventListener('touchmove', this.processTouchMove);
    
    setTimeout(() => {
      window.addEventListener('keydown', this.movePlayer);
      document.addEventListener('touchstart', this.processTouchStart);
      document.addEventListener('touchmove', this.processTouchMove);
    }, 200);
    
    state.currentRound += 1;
    view.displayRound(state.currentRound);
    state.totalEnemies = state.currentRound;
    state.minEnemySpeed *= 0.95;
    state.maxEnemySpeed *= 0.95;
    state.goalSpeed *= 0.98;
    
    this.cancelAnimation();
    this.createFreshBackground();
    this.createFreshPlayer();
    this.createFreshGoals();
    this.createFreshEnemiesVertical();
    this.createFreshEnemiesHorizontal();
    
    state.isGameLive = true;
    this.showNextChallenge();
    this.playGame();
  },

  generateMathChallenge: function () {
    const num00 = helpers.getRandomNumber(state.minMathChallenge, state.maxMathChallenge);
    const num01 = helpers.getRandomNumber(state.minMathChallenge, state.maxMathChallenge);
    const correct = num00 * num01;
    
    let shiftModifier1, shiftModifier2;
    let multiModifier1 = 1;
    let multiModifier2 = 1;
    
    // if >= 5
    if (correct >= 5) {
      shiftModifier1 = Math.random() > 0.5 ? -2 : 2;
      shiftModifier2 = Math.random() > 0.5 ? -4 : 4;
    // if < 5
    } else {
      shiftModifier1 = 1;
      shiftModifier2 = 2;
    }
    
    // if one num is 1
    if (num00 === 1 || num01 === 1) {
      multiModifier2 = 2;
      shiftModifier2 = 0;
    // if 5
      if (correct === 5) {
        shiftModifier1 = 10;
      }
    }
    
    // if number 20, 30, 40 ... 120
    if (correct % 10 === 0 && correct >= 20) {
      shiftModifier1 = Math.random() > 0.5 ? -10 : 10;
      shiftModifier2 = Math.random() > 0.5 ? 5 : correct / 10;
    // if 15, 25, 45, 55
    } else if (correct % 5 === 0 && correct >= 15) {
      shiftModifier1 = Math.random() > 0.5 ? -10 : 10;
      shiftModifier2 = Math.random() > 0.5 ? -5 : 5;
    }
    
    const answers = [
      correct,
      correct * multiModifier1 + shiftModifier1,
      correct * multiModifier2 + shiftModifier2
    ];
    
    return { num00, num01, correct, answers };
  },
  
  loadSprites: function() {
    const sprites = {};
    
    sprites.playerRegular = new Image();
    sprites.playerRegular.src = './public/images/player-regular.png';
    
    sprites.playerInvisible = new Image();
    sprites.playerInvisible.src = './public/images/player-invisible.png';
    
    sprites.playerHappy = new Image();
    sprites.playerHappy.src = './public/images/player-happy.png';
    
    sprites.playerUnhappy = new Image();
    sprites.playerUnhappy.src = './public/images/player-unhappy.png';
    
    sprites.enemy = new Image();
    sprites.enemy.src = './public/images/enemy.png';
    
    for (let i = 0; i < state.totalGoals; i++) {
      sprites[`goal0${i}`] = new Image();
      sprites[`goal0${i}`].src = `./public/images/goal-0${i}.png`;
    }
    
    for (let i = 0; i < 3; i++) {
      sprites[`background0${i}`] = new Image();
      if (i === 0) {
        sprites[`background0${i}`].onload = () => view.drawBackground();
      }
      sprites[`background0${i}`].src = `./public/images/background-0${i}.jpg`;
    }

    return sprites;
  },
  
  createFreshBackground: function() {
    const backgroundNumber = (state.currentRound - 1) % 3;
    return {
      image: view.sprites[`background0${backgroundNumber}`]
    };
  },
  
  createFreshPlayer: function() {
    const x = state.currentRound % 2 === 1 ? 
          view.minDistanceFromEdge :
          view.canvasWidth - state.goalSize - view.minDistanceFromEdge;
      
    return {
      x: x,
      y: view.playerInitialYPosition,
      w: state.playerSize,
      h: state.playerSize,
      speed: state.playerSpeed,
      isMoving: false,
      doneFirstMove: false,
      isUpdated: false,
      movingDirection: null,
      isLeftArrowDown: false,
      isUpArrowDown: false,
      isRightArrowDown: false,
      isDownArrowDown: false,
      image: view.sprites.playerInvisible,
    };
  },

  createFreshGoals: function() {  
    const x = state.currentRound % 2 === 1 ? 
      view.canvasWidth - state.goalSize - view.minDistanceFromEdge :
      view.minDistanceFromEdge;
    
    const distBetweenGoals = view.canvasPlayableHeight/2 / (state.totalGoals+1);
    
    const { goal00, goal01, goal02 } = view.sprites;
    const shuffledGoalImages = helpers.shuffleArray([goal00, goal01, goal02]);
    
    const goals = [];
    
    for (let i = 0; i < state.totalGoals; i++) {
      let goal = {
        x: x,
        y: view.canvasBottomLimit + (distBetweenGoals + i*distBetweenGoals*3) - view.goalSize/2,
        w: view.goalSize,
        h: view.goalSize,
        speedY: state.goalSpeed * (Math.random() >= 0.5 ? 1 : -1),
        image: shuffledGoalImages[i]
      };
      goals[i] = goal;
    }
    
    return goals;
  },

  randomiseEnemyPosition: function(pawnSize, canvasDimension) {
    return helpers.getRandomNumber(pawnSize, canvasDimension - pawnSize * 2);
  },

  createFreshEnemies: function(type) {
    let possibleSpeeds = [];
    
    for (let j = 0; j < state.totalEnemies; j++) {
      // include || 1 to avoid dividing by 0 if only 1 enemy
      possibleSpeeds.push(state.minEnemySpeed + j *
       (state.maxEnemySpeed-state.minEnemySpeed)/((state.totalEnemies-1) || 1));
    }
  
    const enemies = [];
    const { enemySize } = view;
    
    const getXPositionVertial = (i) => {
      return (distBetweenEnemies + i*distBetweenEnemies) - enemySize/2;
    };
    
    const getYPositionVertial = (i) => {
      return view.canvasBottomLimit + this.randomiseEnemyPosition(enemySize, view.canvasPlayableHeight);
    };
    
    const getXPositionHorizontal = (i) => {
      return this.randomiseEnemyPosition(enemySize, view.canvasWidth);
    };
    
    const getYPositionHorizontal = (i) => {
      return view.canvasBottomLimit + (distBetweenEnemies + i*distBetweenEnemies) - enemySize/2;
    };
    
    let canvasDimension;
    let calculateXPosition, calculateYPosition;
    let speedXDivisor, speedYDivisor;
    
    
    if (type === 'vertical') {
      canvasDimension = view.canvasWidth;
      calculateXPosition = getXPositionVertial;
      calculateYPosition = getYPositionVertial;
      speedXDivisor = 10;
      speedYDivisor = 1;
    } else {
      canvasDimension = view.canvasPlayableHeight;
      calculateXPosition = getXPositionHorizontal;
      calculateYPosition = getYPositionHorizontal;
      speedXDivisor = 1;
      speedYDivisor = 10;
    }
    
    const distBetweenEnemies = canvasDimension / (state.totalEnemies+1);
    
    for (let i = 0; i < state.totalEnemies; i++) {
      
      let randomSpeedIndex = helpers.getRandomNumber(0, possibleSpeeds.length-1);
      let enemySpeed = possibleSpeeds.splice(randomSpeedIndex, 1)[0];
      
      let enemy = {
        x: calculateXPosition(i),
        y: calculateYPosition(i),
        w: enemySize,
        h: enemySize,
        speedX: enemySpeed/speedXDivisor * (Math.random() >= 0.5 ? 1 : -1),
        speedY: enemySpeed/speedYDivisor * (Math.random() >= 0.5 ? 1 : -1),
        type: type
      };
      enemies[i] = enemy;
    }
    
    return enemies;
  },
  
  checkCollisionGoal: function(player, goal) {
    const playerCircle = {radius: view.playerRadius, x: player.x, y: player.y};
    const goalCircle   = {radius: view.goalRadius,   x: goal.x,   y: goal.y};

    const dx = playerCircle.x - goalCircle.x;
    const dy = playerCircle.y - goalCircle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance < playerCircle.radius + goalCircle.radius;
  },


  checkCollisionEnemy: function(player, rect) {
    const isCollision = player.x + player.w >= rect.x + 1.5 &&
                        rect.x + rect.w >= player.x + 1.5 &&
                        player.y + player.h >= rect.y + 1.5 &&
                        rect.y + rect.h >= player.y + 1.5;
    return isCollision;
  },
  
  toggleChallenge: function() {
    view.challengeDOM.style.display = state.isGameLive ? 'flex' : 'none';
  },
  
  // control with keyboard
  movePlayer: function(e) {
    const { player } = view;
    
    if (!player.isUpdated && state.isGameLive) {
      player.doneFirstMove = true;
      player.image = view.sprites.playerRegular;
      player.isUpdated = true;
    }
    
    player.isMoving = true;
   
    switch(e.keyCode) {
      case 37:
        player.movingDirection = 'left';
        player.isLeftArrowDown = true;
        break;
      case 38:
        player.movingDirection = 'up';
        player.isUpArrowDown = true;
        break;
      case 39:
        player.movingDirection = 'right';
        player.isRightArrowDown = true;
        break;
      case 40:
        player.movingDirection = 'down';
        player.isDownArrowDown = true;
        break;
    }
  },

  stopPlayer: function(e) {
    const { player } = view;
    
    switch(e.keyCode) {
      case 37:
        player.isLeftArrowDown = false;
        break;
      case 38:
        player.isUpArrowDown = false;
        break;
      case 39:
        player.isRightArrowDown = false;
        break;
      case 40:
        player.isDownArrowDown = false;
        break;
      default:
        return;
    }
    
    // continue movement when one key is released 
    // while another is still down
    if (player.isLeftArrowDown  ||
        player.isUpArrowDown    ||
        player.isRightArrowDown ||
        player.isDownArrowDown) {
      return;
    } else {
      player.isMoving = false;
    }
  },

  processTouchStart: function(e) {
    const { player } = view;
    const { touchDirectionStart, touchDirectionMove } = state;
    
    if (!player.isUpdated && state.isGameLive) {
      player.doneFirstMove = true;
      player.image = view.sprites.playerRegular;
      player.isUpdated = true;
    }
    [touchDirectionStart.x, touchDirectionStart.y] = 
      [e.touches[0].clientX, e.touches[0].clientY];
  },

  processTouchMove: function(e) {
    const { player } = view;
    const { touchDirectionStart, touchDirectionMove } = state;
    
    e.preventDefault();
    [touchDirectionMove.x, touchDirectionMove.y] = 
      [e.changedTouches[0].clientX, e.changedTouches[0].clientY];
    
    const changeX = touchDirectionMove.x - touchDirectionStart.x;
    const changeY = touchDirectionMove.y - touchDirectionStart.y;
    
    [touchDirectionStart.x, touchDirectionStart.y] = 
      [touchDirectionMove.x, touchDirectionMove.y];
    
    const changeXAbs = Math.abs(changeX);
    const changeYAbs = Math.abs(changeY);
    
    // ignore ambiguous move
    if (changeXAbs === changeYAbs) {
      return;
    }
    
    const isMoveHorizontal = changeXAbs > changeYAbs;
    let isMoveRight, isMoveLeft, isMoveDown, isMoveUp;
    
    if (isMoveHorizontal) {
      // ignore minor direction changes
      if (changeXAbs < 1) { return; }
      isMoveRight = changeX > 0;
      isMoveLeft = !isMoveRight;
    } else {
      // ignore minor direction changes
      if (changeYAbs < 1) { return; }
      isMoveDown = changeY > 0;
      isMoveUp = !isMoveDown;
    }
    
    player.isMoving = true;
    player.movingDirection = 'left';
      
    switch (true) {
      case isMoveRight:
        player.movingDirection = 'right';
        break;
      case isMoveLeft:
        player.movingDirection = 'left';
        break;
      case isMoveDown:
        player.movingDirection = 'down';
        break;
      case isMoveUp:
        player.movingDirection = 'up';
        break;
    }
  }
};



const view = {
  sprites: {},
  background: {},
  player: {},
  goals: [],
  enemiesVertical: [],
  enemiesHorizontal: [],
  minDistanceFromEdge: 1,
  
  init: function() {
    this.sprites = controller.loadSprites();
    this.background = controller.createFreshBackground();
    
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvasWidth = this.canvas.width;
    this.canvasHeight = this.canvas.height;
    this.canvasBottomLimit = Math.round(this.canvasHeight * 0.2026);
    this.canvasPlayableHeight = this.canvasHeight - this.canvasBottomLimit;
    
    this.playerSize = 20;
    this.goalSize = 20;
    this.enemySize = 20;
    this.playerRadius = this.playerSize / 2;
    this.goalRadius = this.goalSize / 2;
    this.playerInitialYPosition = this.canvasBottomLimit + this.canvasPlayableHeight / 2 - this.playerSize / 2;
    
    this.challengeDOM = document.getElementById('challenge');
    this.roundDOM = document.getElementById('round');
    this.num00DOM = document.getElementById('num-00');
    this.num01DOM = document.getElementById('num-01');
    this.answersTextDOM = Array.from(document.getElementsByClassName('answer-text'));
    this.answersImageDOM = Array.from(document.getElementsByClassName('answer-image'));
    this.answersDOM = Array.from(document.getElementsByClassName('answer-group'));
    
    this.startButton = document.getElementById('start-button');
    this.pauseButton = document.getElementById('pause-button');

    this.startButton.addEventListener('click', controller.startGame.bind(controller));
    this.pauseButton.addEventListener('click', controller.pauseGame.bind(controller));
    
    document.addEventListener('touchstart', controller.processTouchStart);
    document.addEventListener('touchmove', controller.processTouchMove);
    document.addEventListener('touchend', () => {
      this.player.isMoving = false;
    });
    
    window.addEventListener('keydown', controller.movePlayer);
    window.addEventListener('keyup', controller.stopPlayer);
  },
  
  displayRound: function(currentRound) {
    this.roundDOM.textContent = `${currentRound}:`;
  },
  
  drawGoal: function(goal) {
    const { x, y, w, h, image } = goal;
    this.ctx.drawImage(image, x, y, w, h);
  }, 

  drawAllGoals: function() {
    this.goals.forEach(goal => {
      this.drawGoal(goal);
    });
  },

  updateGoal: function(goal) {
    const { y, h, speedY } = goal;
    const { canvasHeight, minDistanceFromEdge, canvasBottomLimit } = this;
    
    if (y >= canvasHeight - h - minDistanceFromEdge) {
      goal.speedY = -speedY;
    } else if (y <= minDistanceFromEdge + canvasBottomLimit) {
      goal.speedY = -speedY;
    }
    
    goal.y += goal.speedY;   
  },

  drawEnemy: function(enemy) {
    const { x, y, w, h } = enemy;
    this.ctx.drawImage(this.sprites.enemy, x, y, w, h);
  },

  updateEnemy: function(enemy) {
    const { x, y, w, h, speedX, speedY } = enemy;
    const { canvasHeight, canvasWidth, minDistanceFromEdge, canvasBottomLimit } = this;
    
    if (y >= canvasHeight - h - minDistanceFromEdge) {
      enemy.speedY = -speedY;
    } else if (y <= minDistanceFromEdge + canvasBottomLimit) {
      enemy.speedY = -speedY;
    }
    
    enemy.y += enemy.speedY;  

    if (x >= canvasWidth - w - minDistanceFromEdge) {
      enemy.speedX = -speedX;
    } else if (x <= minDistanceFromEdge) {
      enemy.speedX = -speedX;
    }
    
    enemy.x += enemy.speedX;  
  },

  showNextChallenge: function(challenge) {
    const { num00, num01, correct, answers } = challenge;
    const shuffledAnswers = helpers.shuffleArray(answers);
    state.correctAnswerIndex = shuffledAnswers.findIndex(answer => answer === correct);
    const goalLinks = helpers.shuffleArray([
      'public/images/goal-00.png',
      'public/images/goal-01.png',
      'public/images/goal-02.png'
    ]);
    
    this.num00DOM.textContent = num00;
    this.num01DOM.textContent = num01;
    shuffledAnswers.forEach((answer, index) => {
      this.answersTextDOM[index].textContent = shuffledAnswers[index];
      this.answersImageDOM[index].src = goalLinks[index];
    });
    
    this.answersDOM.forEach((answer, index) => {
      answer.classList.remove('wrong-answer');
    });
  },
  
  drawBackground: function() {
    this.ctx.drawImage(this.background.image, 0, 0, this.canvasWidth, this.canvasHeight);
  },

  drawPlayer: function() {
    const { x, y, w, h, image } = this.player;
    this.ctx.drawImage(image, x, y, w, h);
  },

  updatePlayer: function() {
    const { minDistanceFromEdge, player, canvasBottomLimit, canvasWidth, canvasHeight } = this;
    if (player.isMoving) {
      switch(player.movingDirection) {
        case 'left':
          player.x -= player.speed;
          if (player.x <= minDistanceFromEdge) {
            player.x = minDistanceFromEdge;
          }
          break;
        case 'up':
          player.y -= player.speed;
          if (player.y <= minDistanceFromEdge + canvasBottomLimit) {
            player.y = minDistanceFromEdge + canvasBottomLimit;
          }
          break;
        case 'right':
          player.x += player.speed;
          if (player.x >= canvasWidth - player.w - minDistanceFromEdge) { 
            player.x = canvasWidth - player.w - minDistanceFromEdge;
          }
          break;
        case 'down':
          player.y += player.speed;
          if (player.y >= canvasHeight - player.h - minDistanceFromEdge) { 
            player.y = canvasHeight - player.h - minDistanceFromEdge;
          }
          break;
      }
    }
  },
  
};



const helpers = {
  getRandomNumber: function(min, max) {
    return Math.floor(Math.random() * (max + 1 - min) + min);
  },
  shuffleArray: function(array) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      let temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }
};



// Adjust styling for touch devices
(function adjustTouch() {
  // Test if the user's device supports touch
  const isTouch =  !!('ontouchstart' in window) || 
                    window.navigator.msMaxTouchPoints > 0;
  // Add CSS classes only for non-touch devices. 
  // This prevents touch devices from having 
  // buttons stuck in the CSS hover state.
  if (!isTouch) {
    const buttonDOM = document.querySelectorAll('.button');
    buttonDOM.forEach(button => {
      button.classList.add('non-touch');
    });
  }
}());


controller.init();
