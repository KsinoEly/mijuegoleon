const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const bgMusic = document.getElementById("bgMusic");

let characterType = null;
let gameStarted = false;
let gameOver = false;
let paused = false;
let score = 0;
let speed = 3.2;

const btnPause = document.getElementById("btnPause");
const btnRestart = document.getElementById("btnRestart");
const controlsDiv = document.getElementById("controls");
const menuDiv = document.getElementById("menu");

// Controles salto múltiple
let jumpPressed = false;
let jumpCount = 0;
const maxJumps = 2; // doble salto permitido

// Personaje
let player = {
  x: 80,
  y: 200,
  width: 30,
  height: 40,
  velocityY: 0,
  gravity: 0.6,
  jumpPower: -12,
  onGround: false,
  onPlatform: false
};

// Obstáculos y plataformas
let obstacles = [];
let particles = [];

let obstacleCount = 0;

// Dibujar personaje estilo caricatura
function drawCharacter(x, y, type) {
  ctx.fillStyle = type === "boy" ? "#3498db" : "#e91e63";
  ctx.fillRect(x, y, 30, 40);

  ctx.fillStyle = "#ffe0bd";
  ctx.beginPath();
  ctx.arc(x + 15, y - 10, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(x + 8, y - 12, 3, 0, Math.PI * 2);
  ctx.arc(x + 22, y - 12, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x + 15, y - 5, 8, 0, Math.PI);
  ctx.stroke();
}

// Crear obstáculos, plataformas y escaleras
function createObstacle() {
  if (!gameOver && gameStarted && !paused) {
    obstacleCount++;
    if (obstacleCount % 7 === 0) {
      // Escalera de 2 escalones pegados, para subir saltando
      // escalón más bajo
      obstacles.push({ x: canvas.width, y: 260, width: 20, height: 20, type: "step" });
      // escalón más alto pegado a la derecha
      obstacles.push({ x: canvas.width + 20, y: 220, width: 20, height: 40, type: "step" });

      // espacio extra para saltar después de escalera
      obstacles.push({ x: canvas.width + 90, y: 220, width: 20, height: 40, type: "normal" });
    } else if (obstacleCount % 5 === 0) {
      // Plataforma para caminar arriba
      obstacles.push({ x: canvas.width, y: 180, width: 60, height: 20, type: "platform" });

      // espacio para próximo obstáculo
      obstacles.push({ x: canvas.width + 90, y: 220, width: 20, height: 40, type: "normal" });
    } else {
      // Obstáculo normal (cuadrado, círculo o triángulo)
      const shapes = ["square", "circle", "triangle"];
      const shapeType = shapes[Math.floor(Math.random() * shapes.length)];
      obstacles.push({ x: canvas.width, y: 220, width: 20, height: 40, type: shapeType });
    }
  }
}
setInterval(createObstacle, 2000);

// Partículas al perder
function createParticles(x, y) {
  for (let i = 0; i < 25; i++) {
    particles.push({
      x,
      y,
      size: Math.random() * 5 + 2,
      speedX: (Math.random() - 0.5) * 5,
      speedY: (Math.random() - 0.5) * 5,
      alpha: 1
    });
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.x += p.speedX;
    p.y += p.speedY;
    p.alpha -= 0.03;
    if (p.alpha <= 0) particles.splice(i, 1);
  }
}

function drawParticles() {
  particles.forEach(p => {
    ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });
}

// Control de salto presionado
function startJump() {
  jumpPressed = true;
  if (jumpCount < maxJumps) {
    player.velocityY = player.jumpPower;
    jumpCount++;
    player.onGround = false;
    player.onPlatform = false;
  }
}

function stopJump() {
  jumpPressed = false;
}

// Eventos para salto continuo
document.addEventListener("keydown", e => {
  if (e.code === "Space") {
    if (!jumpPressed) startJump();
  }
});

document.addEventListener("keyup", e => {
  if (e.code === "Space") {
    stopJump();
    jumpCount = 0; // resetear doble salto al soltar tecla
  }
});

canvas.addEventListener("touchstart", e => {
  e.preventDefault();
  if (!jumpPressed) startJump();
});

canvas.addEventListener("touchend", e => {
  e.preventDefault();
  stopJump();
  jumpCount = 0;
});

// Elegir personaje
function selectCharacter(type) {
  characterType = type;
  gameStarted = true;
  gameOver = false;
  paused = false;
  menuDiv.style.display = "none";
  controlsDiv.style.display = "block";
  resetGame();
  bgMusic.play().catch(() => {});
}

// Botones pausar y reiniciar
btnPause.addEventListener("click", () => {
  if (!gameStarted) return;
  paused = !paused;
  btnPause.textContent = paused ? "Continuar" : "Pausar";
  if (paused) {
    bgMusic.pause();
  } else {
    bgMusic.play().catch(() => {});
  }
});

btnRestart.addEventListener("click", () => {
  if (!gameStarted) return;
  resetGame();
});

// Resetear juego
function resetGame() {
  player.y = 200;
  player.velocityY = 0;
  obstacles = [];
  particles = [];
  score = 0;
  speed = 3.2;
  gameOver = false;
  paused = false;
  jumpCount = 0;
  btnPause.textContent = "Pausar";
  bgMusic.play().catch(() => {});
}

// Actualizar jugador con gravedad y colisiones
function updatePlayer() {
  player.velocityY += player.gravity;
  player.y += player.velocityY;

  // Pisar suelo (base)
  if (player.y > 200) {
    player.y = 200;
    player.velocityY = 0;
    player.onGround = true;
    jumpCount = 0;
  }

  // Revisar si está sobre plataforma o escalón para "caminar"
  player.onPlatform = false;

  for (let obs of obstacles) {
    if (
      (obs.type === "platform" || obs.type === "step") &&
      player.x + player.width > obs.x &&
      player.x < obs.x + obs.width
    ) {
      // chequea si pies del jugador están justo sobre el obstáculo
      let playerFeet = player.y + player.height;
      let platformTop = obs.y;
      if (
        playerFeet >= platformTop - 5 && // permite un margen de caída
        playerFeet <= platformTop + 10 &&
        player.velocityY >= 0
      ) {
        player.y = platformTop - player.height;
        player.velocityY = 0;
        player.onPlatform = true;
        jumpCount = 0; // reinicia saltos al estar en plataforma o escalón
      }
    }
  }
}

// Mover obstáculos y limpiar fuera de pantalla
function updateObstacles() {
  for (let i = obstacles.length - 1; i >= 0; i--) {
    let obs = obstacles[i];
    obs.x -= speed;
    if (obs.x + obs.width < 0) obstacles.splice(i, 1);
  }
}

// Chequeo colisiones frontales y pérdida
function checkCollision() {
  for (let obs of obstacles) {
    // Colisión frontal (jugador choca)
    if (
      player.x < obs.x + obs.width &&
      player.x + player.width > obs.x &&
      player.y < obs.y + obs.height &&
      player.y + player.height > obs.y
    ) {
      // Colisión válida: pierde
      if (!gameOver) {
        gameOver = true;
        createParticles(player.x + player.width / 2, player.y + player.height / 2);
        bgMusic.pause();
      }
    }
  }
}

// Dibujar personaje
function drawPlayer() {
  drawCharacter(player.x, player.y, characterType);
}

// Dibujar obstáculos según tipo
function drawObstacles() {
  for (let obs of obstacles) {
    switch (obs.type) {
      case "square":
        ctx.fillStyle = "red";
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        break;
      case "circle":
        ctx.fillStyle = "green";
        ctx.beginPath();
        ctx.arc(obs.x + obs.width / 2, obs.y + obs.height / 2, obs.width / 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      case "triangle":
        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.moveTo(obs.x, obs.y + obs.height);
        ctx.lineTo(obs.x + obs.width / 2, obs.y);
        ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
        ctx.closePath();
        ctx.fill();
        break;
      case "platform":
        ctx.fillStyle = "#5555ff";
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        break;
      case "step":
        ctx.fillStyle = "#9999ff";
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        break;
    }
  }
}

// Dibujar partículas
function drawParticles() {
  particles.forEach(p => {
    ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });
}

// Dibujar Game Over
function drawGameOver() {
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText("GAME OVER", 280, 120);

  ctx.font = "20px Arial";
  ctx.fillText("Puntaje: " + score, 320, 160);

  ctx.font = "16px Arial";
  ctx.fillText("Toca o presiona espacio para reiniciar", 180, 200);
}

// Loop principal
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameStarted) {
    if (!gameOver && !paused) {
      updatePlayer();
      updateObstacles();
      checkCollision();

      score++;
      document.getElementById("score").innerText = score;

      if (score % 300 === 0) {
        speed += 0.3;
      }
    }

    drawPlayer();
    drawObstacles();
    updateParticles();
    drawParticles();

    if (gameOver) {
      drawGameOver();
    }
  }

  requestAnimationFrame(gameLoop);
}

gameLoop();

// Selección personaje
function selectCharacter(type) {
  characterType = type;
  gameStarted = true;
  gameOver = false;
  paused = false;
  menuDiv.style.display = "none";
  controlsDiv.style.display = "block";
  resetGame();
  bgMusic.play().catch(() => {});
}
