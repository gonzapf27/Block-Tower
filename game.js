// Constantes que no dependen del DOM
const STATES = {
  BOUNCING: "bouncing",
  FALLING: "falling",
  GAMEOVER: "gameover",
};
const colorPalette = [
  ["#FF9AA2", "#FFB7B2"],
  ["#FFDAC1", "#E2F0CB"],
  ["#B5EAD7", "#C7CEEA"],
  ["#E2F0CB", "#FFDAC1"],
  ["#C7CEEA", "#FF9AA2"],
  ["#8BD3E6", "#6EB5C0"],
  ["#FFC300", "#FF5733"],
  ["#58B19F", "#2C3E50"],
  ["#9B59B6", "#8E44AD"],
  ["#3498DB", "#2980B9"],
];
const initialBlockWidth = 150;
const initialBlockHeight = 50;

// Variables globales
let canvas, ctx, canvasWidth, canvasHeight, scoreElement;
let score = 0,
  state = STATES.BOUNCING,
  xSpeed = 1,
  ySpeed = 0,
  current = 1,
  newBlockWidth = initialBlockWidth;
let blocks = [],
  particles = [];

// Funciones del juego
function resizeCanvas() {
  const container = document.querySelector('.game-container');
  const containerWidth = container.clientWidth;
  const scale = Math.min(1, containerWidth / 500);
  
  canvas.style.width = `${500 * scale}px`;
  canvas.style.height = `${500 * scale}px`;
}

function initializeDOMElements() {
  canvas = document.getElementById("myCanvas");
  if (canvas) {
    ctx = canvas.getContext("2d");
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
    resizeCanvas();
  }
  scoreElement = document.getElementById("score");
}

function randomColor() {
  return colorPalette[Math.floor(Math.random() * colorPalette.length)];
}

function createParticles(x, y, color) {
  for (let i = 0; i < 15; i++) {
    particles.push({
      x: x + Math.random() * 50 - 25,
      y,
      vx: Math.random() * 4 - 2,
      vy: -Math.random() * 3 - 1,
      size: Math.random() * 6 + 2,
      color: color[0],
      life: 30,
    });
  }
}

function updateParticles() {
  particles = particles.filter((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.size *= 0.95;
    p.life--;
    ctx.globalAlpha = p.life / 30;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    return p.life > 0 && p.size >= 0.5;
  });
  ctx.globalAlpha = 1;
}

function initGame() {
  blocks = [
    {
      x: canvasWidth / 2 - newBlockWidth / 2,
      y: canvasHeight * 0.8 - initialBlockHeight / 2,
      width: newBlockWidth,
      height: initialBlockHeight,
      color: colorPalette[0],
    },
  ];
  state = STATES.BOUNCING;
  createNewBlock();
}

function resetGame() {
  particles = [];
  score = 0;
  scoreElement.textContent = score;
  newBlockWidth = initialBlockWidth;
  xSpeed = 1;
  ySpeed = 0;
  current = 1;
  initGame();
  drawFrame();
}

function createNewBlock() {
  blocks.push({
    x: 0,
    y: 0,
    width: newBlockWidth,
    height: initialBlockHeight,
    color: randomColor(),
  });
  ySpeed = 0;
  xSpeed = Math.min(Math.abs(xSpeed) + 1, 4);
  current = blocks.length - 1;
}

function handleCollisions() {
  const currentBlock = blocks[current],
    pastBlock = blocks[current - 1];
  if (
    state === STATES.BOUNCING &&
    (currentBlock.x <= 0 || currentBlock.x + currentBlock.width >= canvasWidth)
  ) {
    xSpeed = -xSpeed;
  } else if (
    state === STATES.FALLING &&
    currentBlock.y + currentBlock.height >= pastBlock.y
  ) {
    if (
      currentBlock.x + currentBlock.width <= pastBlock.x ||
      currentBlock.x >= pastBlock.x + pastBlock.width
    ) {
      stopGame();
    } else {
      const newX = Math.max(currentBlock.x, pastBlock.x);
      newBlockWidth =
        Math.min(
          currentBlock.x + currentBlock.width,
          pastBlock.x + pastBlock.width
        ) - newX;
      score += Math.floor(newBlockWidth);
      scoreElement.textContent = score;
      createParticles(
        currentBlock.x + currentBlock.width / 2,
        currentBlock.y + currentBlock.height,
        currentBlock.color
      );
      Object.assign(currentBlock, { x: newX, width: newBlockWidth });
      createNewBlock();
      state = STATES.BOUNCING;
    }
  }
}

function stopGame() {
  xSpeed = ySpeed = 0;
  state = STATES.GAMEOVER;
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.font = "48px Arial";
  ctx.fillText("¡Juego Terminado!", canvasWidth / 2, canvasHeight / 2 - 30);
  ctx.font = "32px Arial";
  ctx.fillText("Puntuación: " + score, canvasWidth / 2, canvasHeight / 2 + 30);
  ctx.font = "18px Arial";
  ctx.fillText(
    "Presiona ESPACIO/Click para volver a jugar",
    canvasWidth / 2,
    canvasHeight / 2 + 80
  );
}

function handleScroll() {
  if (blocks.length < 2) return;
  const blockTowerHeight = canvasHeight - blocks[current - 1].y;
  if (blockTowerHeight > canvasHeight * 0.6)
    blocks.forEach((block) => (block.y += 1));
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
  gradient.addColorStop(0, "#2c3e50");
  gradient.addColorStop(1, "#1a1a2e");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = 1;
  for (let i = 0; i < canvasWidth; i += 20) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvasHeight);
    ctx.stroke();
  }
  for (let i = 0; i < canvasHeight; i += 20) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(canvasWidth, i);
    ctx.stroke();
  }
}

function drawFrame() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  drawBackground();
  blocks.forEach((block, i) => {
    if (i === current) {
      if (state === STATES.FALLING) block.y += ySpeed;
      else if (state === STATES.BOUNCING) block.x += xSpeed;
    }
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    const gradient = ctx.createLinearGradient(
      block.x,
      block.y,
      block.x,
      block.y + block.height
    );
    gradient.addColorStop(0, block.color[0]);
    gradient.addColorStop(1, block.color[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(block.x, block.y, block.width, block.height);
    ctx.shadowColor = "transparent";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 2;
    ctx.strokeRect(block.x, block.y, block.width, block.height);
  });
  updateParticles();
  handleCollisions();
  handleScroll();
  if (state !== STATES.GAMEOVER) requestAnimationFrame(drawFrame);
}

function dropPiece() {
  ySpeed += 5;
  state = STATES.FALLING;
}

// Inicialización del juego solo si estamos en el navegador
if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    initializeDOMElements();
    initGame();
    drawFrame();

    function handleAction() {
      if (state === STATES.BOUNCING) dropPiece();
      else if (state === STATES.GAMEOVER) resetGame();
    }
    
    canvas.addEventListener("click", handleAction);
    window.addEventListener("keydown", (event) => {
      if (event.key === " ") handleAction();
    });

    window.addEventListener("resize", resizeCanvas);
  });
}
