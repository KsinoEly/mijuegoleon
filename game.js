const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let characterType = null;
let gameStarted = false;
let gameOver = false;
let score = 0;
let speed = 2.5; // empieza más lento

// elegir personaje
function selectCharacter(type) {
  characterType = type;
  gameStarted = true;
  gameOver = false;
  document.getElementById("menu").style.display = "none";
  resetGame();
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

let obstacles = [];

// crear obstáculos
function createObstacle() {
  if (!gameOver && gameStarted) {
    obstacles.push({
      x: canvas.width,
      y: 220,
      width: 20,
      height: 40
    });
  }
}
setInterval(createObstacle, 2000); // menos obstáculos = más fácil

// salto o reinicio
function handleInput() {
  if (!gameStarted) return;

  if (gameOver) {
    resetGame();
    return;
  }

  if (player.y >= 200) {
    player.velocityY = player.jump;
  }
}

// teclado
document.addEventListener("keydown", e => {
  if (e.code === "Space") handleInput();
});

// táctil
canvas.addEventListener("click", handleInput);
canvas.addEventListener("touchstart", handleInput);

// reiniciar juego
function resetGame() {
  player.y = 200;
  player.velocityY = 0;
  obstacles = [];
  score = 0;
  speed = 2.5; // reinicia lento
  gameOver = false;
}

// física
function updatePlayer() {
  player.velocityY += player.gravity;
  player.y += player.velocityY;

  if (player.y > 200) {
    player.y = 200;
    player.velocityY = 0;
  }
}

// mover obstáculos
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
      gameOver = true;
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

// dibujar GAME OVER
function drawGameOver() {
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText("GAME OVER", 280, 120);

  ctx.font = "20px Arial";
  ctx.fillText("Puntaje: " + score, 320, 160);

  ctx.font = "16px Arial";
  ctx.fillText("Toca o presiona espacio para reiniciar", 180, 200);
}

// loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameStarted) {
    if (!gameOver) {
      updatePlayer();
      updateObstacles();
      checkCollision();

      score++;
      document.getElementById("score").innerText = score;

      // dificultad progresiva más lenta
      if (score % 300 === 0) {
        speed += 0.3;
      }
    }

    drawPlayer();

    // obstáculos
    ctx.fillStyle = "red";
    for (let obs of obstacles) {
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    }

    if (gameOver) {
      drawGameOver();
    }
  }

  requestAnimationFrame(gameLoop);
}

gameLoop();vvvvvv
