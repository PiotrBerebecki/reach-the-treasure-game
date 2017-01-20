console.clear();


// invoked at the bottom
const gameInit = () => {
  loadSprites();
  setPawnSize(20);
  getPlayerInitialYPosition();
  // to avoid undefined player on 
  // key presses/touches before start
  createFreshPlayer();
  displayRound(round);
};



// define canvas
const canvas = document.getElementById('display__canvas');
const ctx = canvas.getContext('2d');
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
const canvasBottomLimit = Math.round(canvasHeight * 0.313);
const canvasPlayableHeight = canvasHeight - canvasBottomLimit;



// define game variables
let round = 11;
let totalEnemies = round;
let minEnemySpeed = 1;
let maxEnemySpeed = minEnemySpeed + 1;
const totalGoals = 3;
let goalSpeed = 0.5;
const playerSpeed = 2;

const minMathChallenge = 1;
const maxMathChallenge = 12;


const roundDOM = document.getElementById('round');

const displayRound = (round) => {
  roundDOM.textContent = `${round}:`;
};

const nextRound = () => {
  // temporarily prevent player from moving
  // after reaching the goal
  window.removeEventListener('keydown', movePlayer);
  document.removeEventListener('touchstart', processTouchStart);
  document.removeEventListener('touchmove', processTouchMove);
  
  setTimeout(() => {
    window.addEventListener('keydown', movePlayer);
    document.addEventListener('touchstart', processTouchStart);
    document.addEventListener('touchmove', processTouchMove);
  }, 200);
  
  round += 1;
  displayRound(round);
  totalEnemies = round;
  minEnemySpeed *= 0.95;
  maxEnemySpeed *= 0.95;
  goalSpeed *= 0.98;
  
  cancelAnimation();
  createFreshPlayer();
  createFreshGoals();
  createFreshEnemiesVertical();
  createFreshEnemiesHorizontal();
  
  isGameLive = true;
  showNextChallenge();
  playGame();
};

const minDistanceFromEdge = 1;

let playerSize;
let goalSize;
let enemySize;
let playerRadius;
let goalRadius;


const setPawnSize = (size) => {
  playerSize = size;
  goalSize = size;
  enemySize = size;
  playerRadius = size / 2;
  goalRadius = size / 2;
};



// load all images
const sprites = {};
const loadSprites = () => {
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
  
  for (let i = 0; i < totalGoals; i++) {
    sprites[`goal0${i}`] = new Image();
    sprites[`goal0${i}`].src = `./public/images/goal-0${i}.png`;
  }
  
  sprites.background = new Image();
  sprites.background.onload = () => drawBackground();
  sprites.background.src = './public/images/background.jpg';
};



// helpers
const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max + 1 - min) + min);
};

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
};



// math challenge
const generateMathChallenge = () => {
  
  const num00 = getRandomNumber(minMathChallenge, maxMathChallenge);
  // const num00 = 11;
  const num01 = getRandomNumber(minMathChallenge, maxMathChallenge);
  // const num01 = 10;
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
};


// display next challenge
const num00DOM = document.getElementById('num-00');
const num01DOM = document.getElementById('num-01');
const answersTextDOM = Array.from(document.getElementsByClassName('answer-text'));
const answersImageDOM = Array.from(document.getElementsByClassName('answer-image'));
const answersDOM = Array.from(document.getElementsByClassName('answer-group'));

let correctAnswerIndex;

const showNextChallenge = () => {
  const { num00, num01, correct, answers } = generateMathChallenge();
  const shuffledAnswers = shuffleArray(answers);
  correctAnswerIndex = shuffledAnswers.findIndex(answer => answer === correct);
  const goalLinks = shuffleArray([
    'public/images/goal-00.png',
    'public/images/goal-01.png',
    'public/images/goal-02.png'
  ]);
  
  num00DOM.textContent = num00;
  num01DOM.textContent = num01;
  shuffledAnswers.forEach((answer, index) => {
    answersTextDOM[index].textContent = shuffledAnswers[index];
    answersImageDOM[index].src = goalLinks[index];
  });
  
  answersDOM.forEach((answer, index) => {
    answer.classList.remove('wrong-answer');
  });
};


// toggle challenge on / off
const challengeDOM = document.getElementById('display__challenge');

const toggleChallenge = () => {
  challengeDOM.style.display = isGameLive ? 'block' : 'none';
};



// define player
let player;
let playerInitialYPosition;

const getPlayerInitialYPosition = () => {
  playerInitialYPosition = canvasBottomLimit + canvasPlayableHeight / 2 - playerSize / 2;
};


const createFreshPlayer = () => {
  const x = round % 2 === 1 ? 
        minDistanceFromEdge :
        canvasWidth - goalSize - minDistanceFromEdge;
    
  player = {
    x: x,
    y: playerInitialYPosition,
    w: playerSize,
    h: playerSize,
    speed: playerSpeed,
    isMoving: false,
    doneFirstMove: false,
    isUpdated: false,
    movingDirection: null,
    isLeftArrowDown: false,
    isUpArrowDown: false,
    isRightArrowDown: false,
    isDownArrowDown: false,
    image: sprites.playerInvisible,
  };
};




// define goal
let goals = [];

const createFreshGoals = () => {  
  const x = round % 2 === 1 ? 
    canvasWidth - goalSize - minDistanceFromEdge :
    minDistanceFromEdge;
  
  const distBetweenGoals = canvasPlayableHeight/2 / (totalGoals+1);
  
  const shuffledGoalImages = shuffleArray([sprites.goal00, sprites.goal01, sprites.goal02]);
  
  for (let i = 0; i < totalGoals; i++) {
    let goal = {
      x: x,
      y: canvasBottomLimit + (distBetweenGoals + i*distBetweenGoals*3) - goalSize/2,
      w: goalSize,
      h: goalSize,
      speedY: goalSpeed * (Math.random() >= 0.5 ? 1 : -1),
      image: shuffledGoalImages[i]
    };
    goals[i] = goal;
  }
};


// define enemies
const randomisePosition = (pawnSize, canvasDimension) => {
  return getRandomNumber(pawnSize, canvasDimension - pawnSize * 2);
};

// vertical enemies
let enemiesVertical = [];

const createFreshEnemiesVertical = () => {
  let possibleSpeeds = [];
  
  for (let j = 0; j < totalEnemies; j++) {
    // include || 1 to avoid dividing by 0 if only 1 enemy
    possibleSpeeds.push(minEnemySpeed + j *
     (maxEnemySpeed-minEnemySpeed)/((totalEnemies-1) || 1));
  }
  
  const distBetweenEnemies = canvasWidth / (totalEnemies+1);
    
  for (let i = 0; i < totalEnemies; i++) {
    
    let randomSpeedIndex = getRandomNumber(0, possibleSpeeds.length-1);
    let enemySpeed = possibleSpeeds.splice(randomSpeedIndex, 1)[0];
    
    let enemy = {
      x: (distBetweenEnemies + i*distBetweenEnemies) - enemySize/2,
      y: canvasBottomLimit + randomisePosition(enemySize, canvasPlayableHeight),
      w: enemySize,
      h: enemySize,
      speedX: enemySpeed/10 * (Math.random() >= 0.5 ? 1 : -1),
      speedY: enemySpeed    * (Math.random() >= 0.5 ? 1 : -1),
      type: 'vertical'
    };
    enemiesVertical[i] = enemy;
  }
};


// horizontal enemies
let enemiesHorizontal = [];

const createFreshEnemiesHorizontal = () => {
  let possibleSpeeds = [];
  
  for (let j = 0; j < totalEnemies; j++) {
    // include || 1 to avoid dividing by 0 if only 1 enemy
    possibleSpeeds.push(minEnemySpeed + j *
     (maxEnemySpeed-minEnemySpeed)/((totalEnemies-1) || 1));
  }
  
  const distBetweenEnemies = canvasPlayableHeight / (totalEnemies+1);
  
  for (let i = 0; i < totalEnemies; i++) {
    
    let randomSpeedIndex = getRandomNumber(0, possibleSpeeds.length-1);
    let enemySpeed = possibleSpeeds.splice(randomSpeedIndex, 1)[0];
    
    let enemy = {
      x: randomisePosition(enemySize, canvasWidth),
      y: canvasBottomLimit + (distBetweenEnemies + i*distBetweenEnemies) - enemySize/2,
      w: enemySize,
      h: enemySize,
      speedX: enemySpeed    * (Math.random() >= 0.5 ? 1 : -1),
      speedY: enemySpeed/10 * (Math.random() >= 0.5 ? 1 : -1),
      type: 'horizontal'
    };
    enemiesHorizontal[i] = enemy;
  }
};



// background draw
const drawBackground = () => {
  ctx.drawImage(sprites.background, 0, 0, canvasWidth, canvasHeight);
};


// player draw and movement
const drawPlayer = () => {
  const { x, y, w, h, image } = player;
  ctx.drawImage(image, x, y, w, h);
};

const updatePlayer = () => {
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
};


// goal draw and movement
const drawGoal = (goal) => {
  const { x, y, w, h, image } = goal;
  ctx.drawImage(image, x, y, w, h);
};

const drawAllGoals = () => {
  goals.forEach(goal => {
    drawGoal(goal);
  });
};

const updateGoal = (goal) => {
  const { y, h, speedY } = goal;
  
  if (y >= canvasHeight - h - minDistanceFromEdge) {
    goal.speedY = -speedY;
  } else if (y <= minDistanceFromEdge + canvasBottomLimit) {
    goal.speedY = -speedY;
  }
  
  goal.y += goal.speedY;   
};


// enemy draw and movement
const drawEnemy = (enemy) => {
  const { x, y, w, h } = enemy;
  ctx.drawImage(sprites.enemy, x, y, w, h);
};

const updateEnemy = (enemy) => {
  const { x, y, w, h, speedX, speedY } = enemy;
  
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
};



// detect collision between player and goal
const checkCollisionGoal = (player, goal) => {
  const playerCircle = {radius: playerRadius, x: player.x, y: player.y};
  const goalCircle   = {radius: goalRadius,   x: goal.x,   y: goal.y};

  const dx = playerCircle.x - goalCircle.x;
  const dy = playerCircle.y - goalCircle.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  return distance < playerCircle.radius + goalCircle.radius;
};


// detect collision between player and enemy
const checkCollisionEnemy = (player, rect) => {
  const isCollision = player.x + player.w >= rect.x + 1.5 &&
                      rect.x + rect.w >= player.x + 1.5 &&
                      player.y + player.h >= rect.y + 1.5 &&
                      rect.y + rect.h >= player.y + 1.5;
  return isCollision;
};


// control with keyboard
const movePlayer = e => {
  if (!player.isUpdated && isGameLive) {
    player.doneFirstMove = true;
    player.image = sprites.playerRegular;
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
};

const stopPlayer = e => {
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
};

window.addEventListener('keydown', movePlayer);
window.addEventListener('keyup', stopPlayer);



// control with touch
const touchDirectionStart = {
  x: null,
  y: null
};

const touchDirectionMove = {
  x: null,
  y: null
};

const processTouchStart = e => {
  if (!player.isUpdated && isGameLive) {
    player.doneFirstMove = true;
    player.image = sprites.playerRegular;
    player.isUpdated = true;
  }
  [touchDirectionStart.x, touchDirectionStart.y] = 
    [e.touches[0].clientX, e.touches[0].clientY];
};

const processTouchMove = e => {
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
};

document.addEventListener('touchstart', processTouchStart);
document.addEventListener('touchmove', processTouchMove);
document.addEventListener('touchend', () => {
  player.isMoving = false;
});


// play game & pause logic
let requestId;

const cancelAnimation = () => {
  window.cancelAnimationFrame(requestId);
  requestId = undefined;
};

const finishAfterCollisionEnemy = (successfulEnemy, indexOfSuccessfulEnemy) => {
  isGameLive = false;
  startButton.textContent = 'Try this round again';
  cancelAnimation();
  drawBackground();
  
  if (successfulEnemy.type === 'vertical') {
    for (let j = 0; j < totalEnemies; j++) {
      if (j !== indexOfSuccessfulEnemy) {
        drawEnemy(enemiesVertical[j]);
      }
      drawEnemy(enemiesHorizontal[j]);
    }
  } else {
    for (let j = 0; j < totalEnemies; j++) {
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
};


const finishAfterCollisionGoal = (goal, result) => {
  isGameLive = false;
  cancelAnimation();
  drawBackground();
  
  answersDOM.forEach((answer, index) => {
    if (index !== correctAnswerIndex) {
      answer.classList.add('wrong-answer');
    }
  });
  
  if (result === 'correct') {
    player.image = sprites.playerHappy;
    startButton.removeEventListener('click', startGame);
    setTimeout(() => {
      startButton.addEventListener('click', startGame);
      nextRound();
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
};



const playGame = () => {  
  drawBackground();
  drawPlayer();
  updatePlayer();
  
  for (let i = 0; i < totalGoals; i++) {
    drawGoal(goals[i]);
    
    // To save cost, check collision with goal only if close
    if (Math.abs(player.x - goals[i].x) <= player.w && checkCollisionGoal(player, goals[i])) {
      if (answersImageDOM[correctAnswerIndex].src === goals[i].image.src) {
        return finishAfterCollisionGoal(goals[i], 'correct');
      } else {
        return finishAfterCollisionGoal(goals[i], 'wrong');
      }
    }
    
    updateGoal(goals[i]);
  }
  
  requestId = window.requestAnimationFrame(playGame);
  
  for (let i = 0; i < totalEnemies; i++) {
    drawEnemy(enemiesVertical[i]);
    drawEnemy(enemiesHorizontal[i]);
    
    if (player.doneFirstMove) {
      if (checkCollisionEnemy(player, enemiesVertical[i])) {
        return finishAfterCollisionEnemy(enemiesVertical[i], i);
      }
      
      if (checkCollisionEnemy(player, enemiesHorizontal[i])) {
        return finishAfterCollisionEnemy(enemiesHorizontal[i], i);
      } 
    }
    updateEnemy(enemiesVertical[i]);
    updateEnemy(enemiesHorizontal[i]);
  }
};


// track game state
let isGameLive = false;
let isGamePaused = false;


const startGame = () => {
  isGameLive = !isGameLive;
  
  createFreshPlayer();
  createFreshGoals();
  createFreshEnemiesVertical();
  createFreshEnemiesHorizontal();
  
  if (isGameLive) {
    startButton.textContent = 'Stop this round';
    showNextChallenge();
    playGame();
  } else {
    startButton.textContent = 'Continue the treasure hunt';
    isGamePaused = false;
    cancelAnimation();
    drawBackground();
  }
  
  toggleChallenge();
};


const pauseGame = () => {
  if (!isGameLive) { return; }
    
  isGamePaused = !isGamePaused;
  
  if (isGamePaused) {
    window.cancelAnimationFrame(requestId);
    requestId = undefined;
    pauseButton.textContent = 'Resume';
  } else {
    pauseButton.textContent = 'Pause';
    playGame();
  }
};

const startButton = document.getElementById('start-button');
const pauseButton = document.getElementById('pause-button');

startButton.addEventListener('click', startGame);
pauseButton.addEventListener('click', pauseGame);


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


gameInit();
