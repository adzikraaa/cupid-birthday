const CONFIG = {
  birthdayName: "Nama Kamu",
  photoUrl: "assets/cupid2.png",
  message: "Selamat ulang tahun ❤️",
  devName: "Kamu",
  targetDistance: 500
};

document.getElementById('ending-name').textContent =
  `🎉 Happy Birthday, ${CONFIG.birthdayName}! 🎉`;

document.getElementById('ending-message').innerHTML =
  CONFIG.message;

document.querySelector('.dev-signature').textContent =
  `— dibuat oleh ${CONFIG.devName}`;

document.getElementById('ending-photo').src =
  CONFIG.photoUrl;

const dino = document.getElementById('dino');
const obstaclesContainer = document.getElementById('obstacles');
const scoreDisplay = document.getElementById('score-display');
const progressBar = document.getElementById('progress-bar');
const bgm = document.getElementById('bgm');

let gameRunning = false;
let distance = 0;
let speed = 5;
let obstacles = [];
let dinoY = 0;
let dinoVY = 0;
let isOnGround = true;

function startGame() {
  document.getElementById('intro').style.display = 'none';
  document.getElementById('game-container').style.display = 'block';

  gameRunning = true;
  bgm.play().catch(()=>{});
  loop();
}

function loop() {
  if (!gameRunning) return;

  distance += 1;
  scoreDisplay.textContent = distance + " M";

  if (distance >= CONFIG.targetDistance) {
    triggerEnding();
    return;
  }

  requestAnimationFrame(loop);
}

function triggerEnding() {
  gameRunning = false;

  document.getElementById('game-container').style.display = 'none';
  document.getElementById('ending').style.display = 'flex';
}

function restartGame() {
  location.reload();
}