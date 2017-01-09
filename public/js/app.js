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


const clearCanvas = () => {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
};


const drawEnemies = () => {
  enemies.forEach(enemy => {
    let { x, y, w, h } = enemy;
    ctx.fillStyle = enemyColor;
    ctx.fillRect(x - (w/2), y, w, h);
  });
};


const updateEnemies = () => {
  enemies.forEach(enemy => {
    const { y, speed } = enemy;
    
    if (y >= 100) {
      enemy.speed = -speed;
    } else if (y <= 0) {
      enemy.speed = -speed;
    }
    
    enemy.y = y + enemy.speed;  
  });
};



// start & pause logic
let requestId;

const start = () => {
  clearCanvas();
  updateEnemies();
  drawEnemies();
  requestId = window.requestAnimationFrame(start);
};


let isPaused = true;

const pauseGame = () => {
  if (isPaused) {
    start();
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
