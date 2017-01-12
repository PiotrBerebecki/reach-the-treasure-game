console.clear();


// show deployment time
const now = new Date();
const nowTime = now.toLocaleTimeString('en-GB', { hour12: false });
const nowDate = now.toLocaleDateString();

const titleEl = document.querySelector('h4');
titleEl.textContent = `${titleEl.textContent} - ${nowDate} ${nowTime}`;



// define global dimensions
const minDistanceFromEdge = 1;



// define canvas
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
const canvasColor = 'white';


// define player
const playerHeight = 20;
const playerWidth = 20;
const playerColor = '#03a9f4';

const playerInitialYPosition = canvasHeight / 2 - playerHeight / 2;

let player;

const createFreshPlayer = () => {
  player = {
    x: minDistanceFromEdge,
    y: playerInitialYPosition,
    w: playerWidth,
    h: playerHeight,
    speed: 2,
    isMoving: false,
    movingDirection: null,
    isLeftArrowDown: false,
    isUpArrowDown: false,
    isRightArrowDown: false,
    isDownArrowDown: false,
    color: playerColor
  };
};

createFreshPlayer();


// define goal
const goalHeight = 20;
const goalWidth = 20;
const goalColor = '#4CAF50';

const goalInitialYPosition = canvasHeight / 2 - goalHeight / 2;

const goal = {
  x: canvasWidth - goalWidth - minDistanceFromEdge,
  y: goalInitialYPosition,
  w: 20,
  h: 20,
  color: goalColor
};


// define enemiesVertical
let enemyWidth = 20;
const enemyHeight = 20;
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
  const enemyTotal = 11;
  const minEnemySpeed = 1;
  const maxEnemySpeed = 2;
  enemiesVertical = [];
  let possibleSpeeds = [];
  const distBetweenEnemies = canvasWidth / (enemyTotal+1);
  
  for (let j = 0; j < enemyTotal; j++) {
    // include || 1 to avoid dividing by 0 if only 1 enemy
    possibleSpeeds.push(minEnemySpeed + j *
     (maxEnemySpeed-minEnemySpeed)/(enemyTotal-1) || 1);
  }
  
  for (let i = 0; i < enemyTotal; i++) {
    
    let randomSpeedIndex = getRandomNumber(0, possibleSpeeds.length-1);
    let enemySpeed = possibleSpeeds.splice(randomSpeedIndex, 1)[0];
    
    let enemy = {
      x: (distBetweenEnemies + i*distBetweenEnemies) - enemyWidth/2,
      y: randomiseEnemyPosition(enemyHeight, canvasHeight),
      w: enemyWidth,
      h: enemyHeight,
      speed: (enemySpeed+1) * (Math.random() >= 0.5 ? 1 : -1),
      color: enemyColor
    };
    enemiesVertical[i] = enemy;
  }
  
  // console.log(enemiesVertical[0].x);
};

createFreshEnemiesVertical();


// horizontal enemies
let enemiesHorizontal;

const createFreshEnemiesHorizontal = () => {  
  enemiesHorizontal = [];
  let possibleSpeeds = [1,2,3];
  
  for (let i = 0; i < 3; i++) {
    
    let randomSpeedIndex = getRandomNumber(0, possibleSpeeds.length-1);
    let enemySpeed = possibleSpeeds.splice(randomSpeedIndex, 1)[0];
    
    let enemy = {
      x: randomiseEnemyPosition(enemyWidth, canvasWidth),
      y: (i+1) * 100 - enemyHeight/2,
      w: enemyWidth,
      h: enemyHeight,
      speed: (enemySpeed+1) * (Math.random() >= 0.5 ? 1 : -1),
      color: enemyColor
    };
    enemiesHorizontal[i] = enemy;
  }
};

// createFreshEnemiesHorizontal();



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

const updateEnemyVertical = (enemy) => {
  const { y, h, speed } = enemy;
  
  if (y >= canvasHeight - h) {
    enemy.speed = -speed;
  } else if (y <= 0) {
    enemy.speed = -speed;
  }
  
  enemy.y += enemy.speed;  
};

const updateEnemyHorizontal = (enemy) => {
  const { x, w, speed } = enemy;
  
  if (x >= canvasHeight - w) {
    enemy.speed = -speed;
  } else if (x <= 0) {
    enemy.speed = -speed;
  }
  
  enemy.x += enemy.speed;  
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
  // e.preventDefault();
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
  [touchDirectionStart.x, touchDirectionStart.y] = [e.touches[0].clientX, e.touches[0].clientY];
};

const processTouchMove = e => {
  e.preventDefault();
  [touchDirectionMove.x, touchDirectionMove.y] = [e.changedTouches[0].clientX, e.changedTouches[0].clientY];
  
  const changeX = touchDirectionMove.x - touchDirectionStart.x;
  const changeY = touchDirectionMove.y - touchDirectionStart.y;
  
  [touchDirectionStart.x, touchDirectionStart.y] = [touchDirectionMove.x, touchDirectionMove.y];
  
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
  
  // console.log(changeXAbs, changeYAbs);

  player.isMoving = true;
  player.movingDirection = 'left';
    
  switch (true) {
    case isMoveRight:
      console.log('right');
      player.movingDirection = 'right';
      break;
    case isMoveLeft:
      console.log('left');
      player.movingDirection = 'left';
      break;
    case isMoveDown:
      console.log('down');
      player.movingDirection = 'down';
      break;
    case isMoveUp:
      console.log('up');
      player.movingDirection = 'up';
      break;
    default: 
      console.log('unknown direction');
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
  createFreshEnemiesVertical();
  // createFreshEnemiesHorizontal();
  createFreshPlayer();
};

const playGame = () => {
  // clearCanvas();
  
  drawBackground();
  
  drawPlayer();
  
  requestId = window.requestAnimationFrame(playGame);

  enemiesVertical.forEach(enemy => {
    drawEnemy(enemy);
    updateEnemyVertical(enemy);
    
    if (checkCollision(player, enemy)) {
      finishAfterCollision('you lost');
    }
  });
  
  // enemiesHorizontal.forEach(enemy => {
  //   drawEnemy(enemy);
  //   updateEnemyHorizontal(enemy);
    
  //   if (checkCollision(player, enemy)) {
  //     finishAfterCollision('you lost');
  //   }
  // });
  
  drawGoal();
  
  if (checkCollision(player, goal)) {
    finishAfterCollision('you won');
  }
  
  // break up draw and update player
  // to better show the alignment of collision
  updatePlayer();
};


// track game state
let isGameLive = false;
let isGamePaused = false;


const startGame = () => {
  // console.clear();
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
    createFreshEnemiesVertical();
    // createFreshEnemiesHorizontal();
    createFreshPlayer();
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
