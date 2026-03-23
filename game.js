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

let jumpPressed = false;
let jumpCount = 0;
const maxJumps = 2;

// Superpoder invencible
let superPower = false;
let superPowerTimer = 0;

// Jugador
let player = {
  x: 80,
  y: 200,
  width: 30,
  height: 40,
  velocityY: 0,
  gravity: 0.6,
  jumpPower: -12,
  onGround: false,
  onPlatform: false,
  runFrame: 0
};

let obstacles = [];
let particles = [];
let floatingLetters = [];

let obstacleCount = 0;

// Dibujar jugador animado corriendo
function drawCharacter(x, y, type) {
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

  if (type === "girl") {
    ctx.fillStyle = "#ffcc00";
    ctx.beginPath();
    ctx.moveTo(x + 15, y - 22);
    ctx.lineTo(x + 5, y - 2);
    ctx.lineTo(x + 25, y - 2);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = type === "boy" ? "#3498db" : "#e91e63";
  ctx.fillRect(x, y, 30, 40);

  let frame = Math.sin(player.runFrame) * 5;

  ctx.strokeStyle = "#000";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y + 10);
  ctx.lineTo(x - 5, y + 20 + frame);
  ctx.moveTo(x + 30, y + 10);
  ctx.lineTo(x + 35, y + 20 - frame);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + 8, y + 40);
  ctx.lineTo(x + 5, y + 50 - frame);
  ctx.moveTo(x + 22, y + 40);
  ctx.lineTo(x + 25, y + 50 + frame);
  ctx.stroke();
}

// Obstáculos
function createObstacle() {
  if (!gameOver && gameStarted && !paused) {
    obstacleCount++;
    if (obstacleCount % 7 === 0) {
      obstacles.push({ x: canvas.width, y: 260, width: 20, height: 20, type: "step" });
      obstacles.push({ x: canvas.width + 20, y: 220, width: 20, height: 40, type: "step" });
      obstacles.push({ x: canvas.width + 90, y: 220, width: 20, height: 40, type: "normal" });
    } else if (obstacleCount % 5 === 0) {
      obstacles.push({ x: canvas.width, y: 180, width: 60, height: 20, type: "platform" });
      obstacles.push({ x: canvas.width + 90, y: 220, width: 20, height: 40, type: "normal" });
    } else {
      const shapes = ["square", "circle", "triangle"];
      const shapeType = shapes[Math.floor(Math.random() * shapes.length)];
      obstacles.push({ x: canvas.width, y: 220, width: 20, height: 40, type: shapeType });
    }
  }
}
setInterval(createObstacle, 2000);

// Superpoder
function createLetter() {
  if (!gameOver && gameStarted && !paused) {
    floatingLetters.push({
      x: canvas.width + 50,
      y: Math.random() * 150 + 50,
      width: 20,
      height: 20,
      char: "L",
      phase: 0
    });
  }
}
setInterval(createLetter, 7000);

function createParticles(x, y) {
  for (let i = 0; i < 25; i++) {
    particles.push({
      x, y, size: Math.random() * 5 + 2,
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

// Saltar
function startJump() {
  jumpPressed = true;
  if (jumpCount < maxJumps) {
    player.velocityY = player.jumpPower;
    jumpCount++;
    player.onGround = false;
    player.onPlatform = false;
  }
}
function stopJump() { jumpPressed = false; }

document.addEventListener("keydown", e => { if (e.code === "Space") if(!jumpPressed) startJump(); });
document.addEventListener("keyup", e => { if (e.code === "Space") { stopJump(); jumpCount=0; }});
canvas.addEventListener("touchstart", e => { e.preventDefault(); if(!jumpPressed) startJump(); });
canvas.addEventListener("touchend", e => { e.preventDefault(); stopJump(); jumpCount=0; });

// Selección personaje
function selectCharacter(type) {
  characterType = type;
  gameStarted = true;
  gameOver = false;
  paused = false;
  menuDiv.style.display = "none";
  controlsDiv.style.display = "block";
  resetGame();
  bgMusic.play().catch(()=>{});
}

// Pausar/reiniciar
btnPause.addEventListener("click", () => {
  if(!gameStarted) return;
  paused=!paused;
  btnPause.textContent = paused?"Continuar":"Pausar";
  if(paused) bgMusic.pause(); else bgMusic.play().catch(()=>{});
});
btnRestart.addEventListener("click", ()=>{ if(!gameStarted) return; resetGame(); });

function resetGame() {
  player.y=200; player.velocityY=0; player.runFrame=0;
  obstacles=[]; particles=[]; floatingLetters=[];
  score=0; speed=3.2; gameOver=false;
  jumpCount=0; superPower=false; superPowerTimer=0;
  btnPause.textContent="Pausar";
  bgMusic.play().catch(()=>{});
}

function updatePlayer() {
  player.velocityY += player.gravity;
  player.y += player.velocityY;

  player.onGround=false; player.onPlatform=false;

  if(player.y>200){ player.y=200; player.velocityY=0; player.onGround=true; jumpCount=0; }

  for(let obs of obstacles){
    if((obs.type==="platform"||obs.type==="step") && player.x+player.width>obs.x && player.x<obs.x+obs.width){
      let playerFeet=player.y+player.height;
      let platformTop=obs.y;
      if(playerFeet>=platformTop-5 && playerFeet<=platformTop+10 && player.velocityY>=0){
        player.y=platformTop-player.height;
        player.velocityY=0;
        player.onPlatform=true;
        jumpCount=0;
      }
    }
  }

  if(superPower){ superPowerTimer-=1/60; if(superPowerTimer<=0) superPower=false; }

  player.runFrame += 0.2;
}

function updateObstacles(){
  for(let i=obstacles.length-1;i>=0;i--){ obstacles[i].x-=speed; if(obstacles[i].x+obstacles[i].width<0) obstacles.splice(i,1); }
  for(let i=floatingLetters.length-1;i>=0;i--){
    floatingLetters[i].x-=speed;
    floatingLetters[i].phase +=0.1;
  }
}

// Colisiones solo frontal
function checkCollision(){
  for(let obs of obstacles){
    if(obs.type!=="platform" && obs.type!=="step"){
      // colisión frontal
      if(player.x < obs.x + obs.width && player.x + player.width > obs.x &&
         player.y + player.height > obs.y && player.y < obs.y + obs.height){
        if(!superPower && (player.x + player.width - player.velocityY <= obs.x || player.x - player.velocityY >= obs.x + obs.width)){
          gameOver=true; createParticles(player.x+player.width/2,player.y+player.height/2); bgMusic.pause();
        }
      }
    }
  }

  for(let i=floatingLetters.length-1;i>=0;i--){
    let l=floatingLetters[i];
    l.y += Math.sin(l.phase)*0.5;
    if(player.x<l.x+l.width && player.x+player.width>l.x && player.y<l.y+l.height && player.y+player.height>l.y){
      superPower=true;
      superPowerTimer=3;
      floatingLetters.splice(i,1);
    }
  }
}

function drawPlayer(){ drawCharacter(player.x,player.y,characterType); }
function drawObstacles(){
  for(let obs of obstacles){
    let glow = Math.sin(Date.now()/200)*0.5+0.5;
    switch(obs.type){
      case "square": ctx.fillStyle=`rgba(255,0,0,${0.8+0.2*glow})`; ctx.fillRect(obs.x,obs.y,obs.width,obs.height); break;
      case "circle": ctx.fillStyle=`rgba(0,255,0,${0.8+0.2*glow})`; ctx.beginPath(); ctx.arc(obs.x+obs.width/2,obs.y+obs.height/2,obs.width/2,0,Math.PI*2); ctx.fill(); break;
      case "triangle": ctx.fillStyle=`rgba(255,165,0,${0.8+0.2*glow})`; ctx.beginPath(); ctx.moveTo(obs.x,obs.y+obs.height); ctx.lineTo(obs.x+obs.width/2,obs.y); ctx.lineTo(obs.x+obs.width,obs.y+obs.height); ctx.closePath(); ctx.fill(); break;
      case "platform": ctx.fillStyle=`rgba(85,85,255,${0.8+0.2*glow})`; ctx.fillRect(obs.x,obs.y,obs.width,obs.height); break;
      case "step": ctx.fillStyle=`rgba(153,153,255,${0.8+0.2*glow})`; ctx.fillRect(obs.x,obs.y,obs.width,obs.height); break;
    }
  }

  floatingLetters.forEach(l=>{
    ctx.fillStyle="yellow";
    ctx.font="20px Arial";
    ctx.fillText(l.char,l.x,l.y+15);

    if(superPower){
      ctx.strokeStyle=`rgba(255,255,0,${Math.sin(Date.now()/100)*0.5+0.5})`;
      ctx.lineWidth=4;
      ctx.beginPath();
      ctx.arc(player.x+player.width/2,player.y+player.height/2,40,0,Math.PI*2);
      ctx.stroke();
    }
  });
}

function drawGameOver(){
  ctx.fillStyle="white"; ctx.font="30px Arial"; ctx.fillText("GAME OVER",280,120);
  ctx.font="20px Arial"; ctx.fillText("Puntaje: "+score,320,160);
  ctx.font="16px Arial"; ctx.fillText("Toca o presiona espacio para reiniciar",180,200);
}

function gameLoop(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if(gameStarted){
    if(!gameOver && !paused){
      updatePlayer();
      updateObstacles();
      checkCollision();
      score++;
      document.getElementById("score").innerText=score;
      if(score%300===0) speed+=0.3;
    }
    drawPlayer();
    drawObstacles();
    updateParticles();
    drawParticles();
    if(gameOver) drawGameOver();
  }
  requestAnimationFrame(gameLoop);
}
gameLoop();
