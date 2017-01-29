const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, '../public')));

app.listen(3000, () => {
  console.log('Listening on port 3000, visit http://localhost:3000');
});

console.log('started');
