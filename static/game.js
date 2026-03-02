// Game parameters
const GRID_SIZE = 15;
const CELL_SIZE = 28; // matches CSS --cell-size
const MOVE_INTERVAL_MS = 1000; // 1 space per second

// Canvas setup
const canvas = document.getElementById('gameCanvas');
canvas.width = GRID_SIZE * CELL_SIZE;
canvas.height = GRID_SIZE * CELL_SIZE;
const ctx = canvas.getContext('2d');

// UI elements
const playBtn = document.getElementById('playBtn');
const restartBtn = document.getElementById('restartBtn');
const instructionsBtn = document.getElementById('instructionsBtn');
const closeInstructions = document.getElementById('closeInstructions');
const instructionsModal = document.getElementById('instructions');
const overlay = document.getElementById('overlay');
const overlayContent = document.getElementById('overlayContent');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highScore');

// Game state
let snake = [];
let direction = {x:1,y:0}; // moving right at start
let nextDirection = {x:1,y:0};
let apple = {x:0,y:0};
let score = 0;
let highScore = 0;
let running = false;
let timerId = null;

function initGame(){
  // initial snake of length 3 centered
  const center = Math.floor(GRID_SIZE/2);
  snake = [
    {x:center+1,y:center},
    {x:center,y:center},
    {x:center-1,y:center}
  ];
  direction = {x:1,y:0};
  nextDirection = {x:1,y:0};
  score = 0;
  loadHighScore();
  spawnApple();
  updateUI();
  draw();
}

function startGame(){
  if(running) return;
  running = true;
  playBtn.classList.add('hidden');
  restartBtn.classList.remove('hidden');
  timerId = setInterval(gameTick, MOVE_INTERVAL_MS);
}

function stopGame(){
  running = false;
  if(timerId) clearInterval(timerId);
}

function restartGame(){
  stopGame();
  initGame();
  startGame();
}

function gameTick(){
  // apply buffered direction
  direction = nextDirection;
  const head = {...snake[0]};
  const newHead = {x: head.x + direction.x, y: head.y + direction.y};

  // collisions
  if(newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE){
    gameOver();
    return;
  }
  if(snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)){
    gameOver();
    return;
  }

  // move
  snake.unshift(newHead);

  // apple check
  if(newHead.x === apple.x && newHead.y === apple.y){
    score++;
    updateUI();
    spawnApple();
  } else {
    snake.pop();
  }

  draw();
}

function gameOver(){
  stopGame();
  const isNewHigh = checkAndSaveHighScore();
  overlayContent.innerHTML = `<h3>Game Over</h3><p>Your score: ${score}</p>` + (isNewHigh ? '<p><strong>New high score!</strong></p>' : '');
  overlay.classList.remove('hidden');
}

function spawnApple(){
  let pos;
  do{
    pos = {x: Math.floor(Math.random()*GRID_SIZE), y: Math.floor(Math.random()*GRID_SIZE)};
  } while(snake.some(seg => seg.x === pos.x && seg.y === pos.y));
  apple = pos;
}

function draw(){
  // clear
  ctx.fillStyle = '#e8f0ff';
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // draw grid (optional subtle lines)
  ctx.strokeStyle = 'rgba(0,0,0,0.04)';
  for(let i=0;i<=GRID_SIZE;i++){
    ctx.beginPath();
    ctx.moveTo(i*CELL_SIZE,0);
    ctx.lineTo(i*CELL_SIZE,canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0,i*CELL_SIZE);
    ctx.lineTo(canvas.width,i*CELL_SIZE);
    ctx.stroke();
  }

  // draw apple
  ctx.fillStyle = 'red';
  ctx.fillRect(apple.x*CELL_SIZE + 2, apple.y*CELL_SIZE + 2, CELL_SIZE-4, CELL_SIZE-4);

  // draw snake
  for(let i=0;i<snake.length;i++){
    const s = snake[i];
    ctx.fillStyle = (i===0)?'#145214':'#2ea44f';
    ctx.fillRect(s.x*CELL_SIZE + 1, s.y*CELL_SIZE + 1, CELL_SIZE-2, CELL_SIZE-2);
  }
}

function setDirection(dx,dy){
  // prevent reversing direction directly
  if(dx === -direction.x && dy === -direction.y) return;
  nextDirection = {x:dx,y:dy};
}

// keyboard
window.addEventListener('keydown', (e)=>{
  if(!running && ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) return; // don't accept unless running
  switch(e.key){
    case 'ArrowUp': setDirection(0,-1); break;
    case 'ArrowDown': setDirection(0,1); break;
    case 'ArrowLeft': setDirection(-1,0); break;
    case 'ArrowRight': setDirection(1,0); break;
  }
});

// UI handlers
playBtn.addEventListener('click', ()=>{
  initGame();
  startGame();
});

restartBtn.addEventListener('click', ()=>{
  restartGame();
  overlay.classList.add('hidden');
});

instructionsBtn.addEventListener('click', ()=>{instructionsModal.classList.remove('hidden');});
closeInstructions.addEventListener('click', ()=>{instructionsModal.classList.add('hidden');});

overlay.addEventListener('click', (e)=>{ if(e.target===overlay) overlay.classList.add('hidden'); });

function updateUI(){
  scoreEl.textContent = score;
  highScoreEl.textContent = highScore;
}

function loadHighScore(){
  const hs = parseInt(localStorage.getItem('snake_high_score')||'0',10);
  highScore = isNaN(hs)?0:hs;
}

function checkAndSaveHighScore(){
  loadHighScore();
  if(score > highScore){
    highScore = score;
    localStorage.setItem('snake_high_score', String(highScore));
    updateUI();
    return true;
  }
  return false;
}

// Initialize visuals
initGame();