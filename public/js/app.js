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
  y: canvasHeight / 2 - 10,
  w: 20,
  h: 20,
  speed: 2,
  isMoving: false,
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
    player.x += player.speed;
  }
};


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
