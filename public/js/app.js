console.clear();


// show deployment time
const now = new Date();
const nowTime = now.toLocaleTimeString('en-GB', { hour12: false });
const nowDate = now.toLocaleDateString();

const titleEl = document.querySelector('h4');
titleEl.textContent = `${titleEl.textContent} - ${nowDate} ${nowTime}`;



// define canvas
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
const canvasColor = 'white';


// define game variables
let round = 1;
let enemyTotal = round;
let minEnemySpeed = 1;
let maxEnemySpeed = minEnemySpeed + 1;

const displayRound = (round) => {
  console.log('Round', round);
};

displayRound(round);

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
  }, 1000);
  
  round += 1;
  displayRound(round);
  enemyTotal = round;
  minEnemySpeed *= 0.95;
  maxEnemySpeed *= 0.95;
  
  cancelAnimation();
  createFreshPlayer();
  craeteFreshGoal();
  createFreshEnemiesVertical();
  createFreshEnemiesHorizontal();
  playGame();
};

const minDistanceFromEdge = 1;

let playerSize;
let goalSize;
let enemySize;

const setPawnSize = (size) => {
  playerSize = size;
  goalSize = size;
  enemySize = size;
};
setPawnSize(20);



// define player
const playerColor = 'rgba(3,169,244,1)';
const playerColorInitial = 'rgba(3,169,244,0.3)';
const playerInitialYPosition = canvasHeight / 2 - playerSize / 2;
let player;

const createFreshPlayer = () => {
  
  const x = round % 2 === 1 ? 
        minDistanceFromEdge :
        canvasWidth - goalSize - minDistanceFromEdge;
  
  player = {
    x: x,
    y: playerInitialYPosition,
    w: playerSize,
    h: playerSize,
    speed: 2,
    isMoving: false,
    doneFirstMove: false,
    isUpdated: false,
    movingDirection: null,
    isLeftArrowDown: false,
    isUpArrowDown: false,
    isRightArrowDown: false,
    isDownArrowDown: false,
    color: playerColorInitial,
  };
};

createFreshPlayer();


// define goal
const goalColor = '#4CAF50';

const goalInitialYPosition = canvasHeight / 2 - goalSize / 2;
let goal;

const craeteFreshGoal = () => {  
  const x = round % 2 === 1 ? 
    canvasWidth - goalSize - minDistanceFromEdge :
    minDistanceFromEdge;
  
  goal = {
    x: x,
    y: goalInitialYPosition,
    w: goalSize,
    h: goalSize,
    color: goalColor
  };
};

craeteFreshGoal();


// define enemies
const enemyColor = 'tomato';

const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max + 1 - min) + min);
};

const randomiseEnemyPosition = (enemyDimension, canvasDimension) => {
  return getRandomNumber(enemyDimension, canvasDimension - enemyDimension * 2);
};

// vertical enemies
let enemiesVertical;

const createFreshEnemiesVertical = () => {
  enemiesVertical = [];
  let possibleSpeeds = [];
  const distBetweenEnemies = canvasWidth / (enemyTotal+1);
  
  for (let j = 0; j < enemyTotal; j++) {
    // include || 1 to avoid dividing by 0 if only 1 enemy
    possibleSpeeds.push(minEnemySpeed + j *
     (maxEnemySpeed-minEnemySpeed)/(enemyTotal-1) || 1);
  }
  
  // console.log(possibleSpeeds[possibleSpeeds.length-1]);
    
  for (let i = 0; i < enemyTotal; i++) {
    
    let randomSpeedIndex = getRandomNumber(0, possibleSpeeds.length-1);
    let enemySpeed = possibleSpeeds.splice(randomSpeedIndex, 1)[0];
    
    let enemy = {
      x: (distBetweenEnemies + i*distBetweenEnemies) - enemySize/2,
      y: randomiseEnemyPosition(enemySize, canvasHeight),
      w: enemySize,
      h: enemySize,
      speedX: enemySpeed/10 * (Math.random() >= 0.5 ? 1 : -1),
      speedY: enemySpeed    * (Math.random() >= 0.5 ? 1 : -1),
      color: enemyColor
    };
    enemiesVertical[i] = enemy;
  }
};

createFreshEnemiesVertical();


// horizontal enemies
let enemiesHorizontal;

const createFreshEnemiesHorizontal = () => {
  enemiesHorizontal = [];
  let possibleSpeeds = [];
  const distBetweenEnemies = canvasHeight / (enemyTotal+1);
  
  for (let j = 0; j < enemyTotal; j++) {
    // include || 1 to avoid dividing by 0 if only 1 enemy
    possibleSpeeds.push(minEnemySpeed + j *
     (maxEnemySpeed-minEnemySpeed)/(enemyTotal-1) || 1);
  }
  
  for (let i = 0; i < enemyTotal; i++) {
    
    let randomSpeedIndex = getRandomNumber(0, possibleSpeeds.length-1);
    let enemySpeed = possibleSpeeds.splice(randomSpeedIndex, 1)[0];
    
    let enemy = {
      x: randomiseEnemyPosition(enemySize, canvasWidth),
      y: (distBetweenEnemies + i*distBetweenEnemies) - enemySize/2,
      w: enemySize,
      h: enemySize,
      speedX: enemySpeed    * (Math.random() >= 0.5 ? 1 : -1),
      speedY: enemySpeed/10 * (Math.random() >= 0.5 ? 1 : -1),
      color: enemyColor
    };
    enemiesHorizontal[i] = enemy;
  }
};

createFreshEnemiesHorizontal();



// canvas draw
const drawBackground = () => {
  ctx.fillStyle = canvasColor;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
};

drawBackground();


// player draw and movement
const drawPlayer = () => {
  const { x, y, w, h, color } = player;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
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
        if (player.y <= minDistanceFromEdge) {
          player.y = minDistanceFromEdge;
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


// goal draw
const drawGoal = () => {
  const { x, y, w, h, color } = goal;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
};


// enemy draw and movement
const drawEnemy = (enemy) => {
  const { x, y, w, h, color } = enemy;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
};

const updateEnemy = (enemy) => {
  const { x, y, w, h, speedX, speedY } = enemy;
  
  if (y >= canvasHeight - h) {
    enemy.speedY = -speedY;
  } else if (y <= 0) {
    enemy.speedY = -speedY;
  }
  
  enemy.y += enemy.speedY;  

  if (x >= canvasWidth - w) {
    enemy.speedX = -speedX;
  } else if (x <= 0) {
    enemy.speedX = -speedX;
  }
  
  enemy.x += enemy.speedX;  
};



// detect collision between player and enemy
const checkCollision = (player, rect) => {
  const isCollision = player.x + player.w >= rect.x &&
                      rect.x + rect.w >= player.x &&
                      player.y + player.h >= rect.y &&
                      rect.y + rect.h >= player.y;
  return isCollision;
};


// control with keyboard
const movePlayer = e => {
  if (!player.isUpdated && isGameLive) {
    player.doneFirstMove = true;
    player.color = playerColor;
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
    player.color = playerColor;
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

const clearCanvas = () => {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
};

const cancelAnimation = () => {
  window.cancelAnimationFrame(requestId);
  requestId = undefined;
};

const finishAfterCollision = (msg) => {
  console.log(msg);
  startButton.textContent = 'Restart';
  isGameLive = false;
  cancelAnimation();
  createFreshPlayer();
  craeteFreshGoal();
  createFreshEnemiesVertical();
  createFreshEnemiesHorizontal();
};

const playGame = () => {  
  drawBackground();
  drawPlayer();
  drawGoal();
  
  requestId = window.requestAnimationFrame(playGame);
  
  if (checkCollision(player, goal)) {
    return nextRound();
  }
  
  for (let i = 0; i < enemyTotal; i++) {
    drawEnemy(enemiesVertical[i]);
    drawEnemy(enemiesHorizontal[i]);
    
    if (player.doneFirstMove) {
      if (checkCollision(player, enemiesVertical[i])) {
        finishAfterCollision('you lost');
      }
      if (checkCollision(player, enemiesHorizontal[i])) {
        finishAfterCollision('you lost');
      }
    }
    
    updateEnemy(enemiesVertical[i]);
    updateEnemy(enemiesHorizontal[i]);
  }
  
  // break up draw and update player
  // to better show the alignment of collision
  updatePlayer();
};


// track game state
let isGameLive = false;
let isGamePaused = false;


const startGame = () => {
  isGameLive = !isGameLive;
  
  if (isGameLive) {
    startButton.textContent = 'Stop';
    playGame();
  } else {
    startButton.textContent = 'Start';
    isGamePaused = false;
    cancelAnimation();
    clearCanvas();
    drawBackground();
    createFreshPlayer();
    craeteFreshGoal();
    createFreshEnemiesVertical();
    createFreshEnemiesHorizontal();
  }  
};


const pauseGame = () => {
  if (!isGameLive) { return; }
    
  isGamePaused = !isGamePaused;
  
  if (isGamePaused) {
    window.cancelAnimationFrame(requestId);
    requestId = undefined;
  } else {
    playGame();
  }
};

const startButton = document.getElementById('start-button');
const pauseButton = document.getElementById('pause-button');

startButton.addEventListener('click', startGame);
pauseButton.addEventListener('click', pauseGame);
