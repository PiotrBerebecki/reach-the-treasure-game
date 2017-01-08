console.clear();


// canvas and context
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');


// initial position
let x = 10;
let y = 10;

// dimenstions
let w = 20;
let h = 20;

// moving speed
let speedX = 4;
let speedY;


const clearCanvas = () => {
  ctx.clearRect(0, 0, 400, 300);
};

const draw = () => {
  ctx.fillStyle = 'red';
  ctx.fillRect(x, y, w, h);
};



const update = () => {
  let isBeyondRightLimit = x >= 380;
  let isBeyondLeftLimit = x <= 0;
  
  let isWithinSpeedYBoost = x >= 100 && x <= 150;
  
  if (isBeyondRightLimit) {
    speedX = -speedX;
  } else if (isBeyondLeftLimit) {
    speedX = -speedX;
  }
  
  if (isWithinSpeedYBoost) {
    speedY = 1;
    y = y + speedY;
  } else {
    speedY = 0;
  }
  
  x = x + speedX;
};


let requestId;

const start = () => {
  clearCanvas();
  draw();
  update();
  
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
