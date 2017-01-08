console.clear();

// select
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

ctx.fillStyle = 'red';
ctx.fillRect(10, 10, 20, 20);

const step = () => {
  console.log('step');
};

step();
