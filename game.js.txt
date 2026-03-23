const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let characterType = null;
let gameStarted = false;
let score = 0;
let speed = 5;

// elegir personaje
function selectCharacter(type) {
  characterType = type;
  gameStarted = true;
  document.getElementById("menu").style.display = "none";
}

// jugador
let player = {
  x: 80,
  y: 200,
  width: 30,
  height: 40,
  velocityY: 0,
  gravity: 0.6,
  jump: -12
};

// obstáculos
let obstacles = [];

function createObstacle() {
  obstacles.push({
    x: canvas.width,
    y: 220,
    width: 20,
    height: 40
  });
}

setInterval(createObstacle, 1500);

// salto
function jump() {
  if (player.y >= 200) {
    player.velocityY = player.jump;
  }
}

document.addEventListener("keydown", e => {
  if (e.code === "Space") jump();
});

canvas.addEventListener("click", jump);

// física
function updatePlayer() {
  player.velocityY += player.gravity;
  player.y += player.velocityY;

  if (player.y > 200) {
    player.y = 200;
    player.velocityY = 0;
  }
}

// obstáculos
function updateObstacles() {
  for (let obs of obstacles) {
    obs.x -= speed;
  }
}

// colisión
function checkCollision() {
  for (let obs of obstacles) {
    if (
      player.x < obs.x + obs.width &&
      player.x + player.width > obs.x &&
      player.y < obs.y + obs.height &&
      player.y + player.height > obs.y
    ) {
      alert("💀 Game Over - Puntaje: " + score);
      location.reload();
    }
  }
}

// dibujar personaje
function drawPlayer() {
  ctx.fillStyle = characterType === "boy" ? "blue" : "pink";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // cabeza
  ctx.fillStyle = "#ffe0bd";
  ctx.beginPath();
  ctx.arc(player.x + 15, player.y - 10, 10, 0, Math.PI * 2);
  ctx.fill();

  // ojos
  ctx.fillStyle = "black";
  ctx.fillRect(player.x + 10, player.y - 12, 2, 2);
  ctx.fillRect(player.x + 18, player.y - 12, 2, 2);
}

// loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameStarted) {
    updatePlayer();
    updateObstacles();
    checkCollision();

    drawPlayer();

    // obstáculos
    ctx.fillStyle = "red";
    for (let obs of obstacles) {
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    }

    // puntaje
    score++;
    document.getElementById("score").innerText = score;

    // dificultad
    if (score % 200 === 0) {
      speed += 0.5;
    }
  }

  requestAnimationFrame(gameLoop);
}

gameLoop();
