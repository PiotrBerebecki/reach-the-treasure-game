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
const player = {
  x: 10,
  y: 100,
  w: 20,
  h: 20,
  speed: 2,
  isMoving: false,
  movingDirection: null,
  isLeftArrowDown: false,
  isUpArrowDown: false,
  isRightArrowDown: false,
  isDownArrowDown: false
};

const playerColor = 'blue';


// utilities
const clearCanvas = () => {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
};


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


// drawPlayer
const drawPlayer = () => {
  const { x, y, w, h } = player;
  ctx.fillStyle = playerColor;
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


// player move
window.addEventListener('keydown', function(e) {
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
});

window.addEventListener('keyup', function(e) {
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
  
  if (player.isLeftArrowDown  ||
      player.isUpArrowDown    ||
      player.isRightArrowDown ||
      player.isDownArrowDown) {
    return;
  } else {
    player.isMoving = false;
  }
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
