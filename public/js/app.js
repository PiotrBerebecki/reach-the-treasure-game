console.clear();


// canvas and context
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');


// canvas dimensions
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;


// define enemies
const enemies = [
  {
    x: 100,
    y: 10,
    w: 20,
    h: 20,
    speed: 2,
  },
  {
    x: 200,
    y: 10,
    w: 20,
    h: 20,
    speed: 3,
  },
  {
    x: 300,
    y: 10,
    w: 20,
    h: 20,
    speed: 4,
  }
];

const enemyColor = 'tomato';


// define player
const playerHeight = 20;
const playerInitialYPosition = canvasHeight / 2 - playerHeight / 2;

const player = {
  x: 10,
  y: playerInitialYPosition,
  w: 20,
  h: playerHeight,
  speed: 2,
  isMoving: false,
  movingDirection: null,
  isLeftArrowDown: false,
  isUpArrowDown: false,
  isRightArrowDown: false,
  isDownArrowDown: false,
  color: 'blue'
};


// utilities
const clearCanvas = () => {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
};


// enemy movement
const drawEnemy = (enemy) => {
  const { x, y, w, h } = enemy;
  ctx.fillStyle = enemyColor;
  ctx.fillRect(x - (w/2), y, w, h);
};


const updateEnemy = (enemy) => {
  const { y, h, speed } = enemy;
  
  if (y >= canvasHeight - h) {
    enemy.speed = -speed;
  } else if (y <= 0) {
    enemy.speed = -speed;
  }
  
  enemy.y += enemy.speed;  
};


// player movement
const drawPlayer = () => {
  const { x, y, w, h } = player;
  ctx.fillStyle = player.color;
  ctx.fillRect(x, y, w, h);
};

const updatePlayer = () => {
  if (player.isMoving) {
    switch(player.movingDirection) {
      case 'left':
        player.x -= player.speed;
        if (player.x <= 0) { player.x = 0; }
        break;
      case 'up':
        player.y -= player.speed;
        if (player.y <= 0) { player.y = 0; }
        break;
      case 'right':
        player.x += player.speed;
        if (player.x >= canvasWidth - player.w) { player.x = canvasWidth - player.w; }
        break;
      case 'down':
        player.y += player.speed;
        if (player.y >= canvasHeight - player.h) { player.y = canvasHeight - player.h; }
        break;
    }
  }
};


// move and stop player logic
const movePlayer = e => {
  e.preventDefault();
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





// player movement on touch devices
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

const playGame = () => {
  clearCanvas();
  
  enemies.forEach(enemy => {
    drawEnemy(enemy);
    updateEnemy(enemy);
  });
  
  drawPlayer();
  updatePlayer();
  
  requestId = window.requestAnimationFrame(playGame);
};


let isPaused = true;

const pauseGame = () => {
  if (isPaused) {
    playGame();
    pauseButton.textContent = 'Pause';
  } else {
    window.cancelAnimationFrame(requestId);
    requestId = undefined;
    pauseButton.textContent = 'Start';
  }
  isPaused = !isPaused;
};

const pauseButton = document.querySelector('button');
pauseButton.addEventListener('click', pauseGame);


// show deployment time
const now = new Date().toLocaleTimeString('en-GB', { hour12: false });
const titleEl = document.querySelector('h3');
titleEl.textContent = `${titleEl.textContent} - ${now}`;
