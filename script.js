let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

// LOAD IMAGE
let cupidImg = new Image();
cupidImg.src = "assets/cupid.png";

let heartImg = new Image();
heartImg.src = "assets/heart.png";

// SOUND
let jumpSound = new Audio("assets/jump.mp3");
let bgMusic = new Audio("assets/bg-music.mp3");
bgMusic.loop = true;

let dino = { x: 50, y: 150, w: 40, h: 40, vy: 0 };
let gravity = 1.2;
let obstacles = [];
let score = 0;
let gameRunning = false;

function startGame() {
  document.getElementById("startScreen").style.display = "none";
  gameRunning = true;
  bgMusic.play();
  loop();
}

document.addEventListener("keydown", function(e) {
  if (e.code === "Space" && dino.y === 150) {
    dino.vy = -15;
    jumpSound.play();
  }
});

function loop() {
  if (!gameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // DRAW CUPID
  ctx.drawImage(cupidImg, dino.x, dino.y, dino.w, dino.h);

  // GRAVITY
  dino.y += dino.vy;
  dino.vy += gravity;

  if (dino.y > 150) {
    dino.y = 150;
    dino.vy = 0;
  }

  // OBSTACLE
  if (Math.random() < 0.02) {
    obstacles.push({ x: 800, y: 150, w: 30, h: 30 });
  }

  obstacles.forEach((obs) => {
    obs.x -= 6;
    ctx.drawImage(heartImg, obs.x, obs.y, obs.w, obs.h);

    // COLLISION
    if (
      dino.x < obs.x + obs.w &&
      dino.x + dino.w > obs.x &&
      dino.y < obs.y + obs.h &&
      dino.y + dino.h > obs.y
    ) {
      gameRunning = false;
      bgMusic.pause();
      alert("💔 Yah gagal... ulang lagi ya!");
      location.reload();
    }
  });

  // SCORE
  score++;
  ctx.fillStyle = "#ff1493";
  ctx.font = "16px Arial";
  ctx.fillText("Love Meter: " + score + "/500 💖", 600, 20);

  // WIN
  if (score >= 500) {
    gameRunning = false;
    bgMusic.pause();
    showEnding();
    return;
  }

  requestAnimationFrame(loop);
}

// ENDING EFFECT
function showEnding() {
  let end = document.getElementById("endScreen");
  end.classList.remove("hidden");

  typeWriter(romanticText, "message", 40);

  // CONFETTI SIMPLE
  for (let i = 0; i < 100; i++) {
    let div = document.createElement("div");
    div.style.position = "fixed";
    div.style.width = "10px";
    div.style.height = "10px";
    div.style.background = "pink";
    div.style.top = "0";
    div.style.left = Math.random() * 100 + "%";
    div.style.animation = "fall 3s linear";
    document.body.appendChild(div);
    
  }
}
// TEKS ROMANTIS
let romanticText = "Hari ini bukan cuma tentang ulang tahun kamu... tapi tentang betapa beruntungnya dunia karena punya kamu. Aku bersyukur bisa kenal kamu, bisa ada di cerita kamu, dan semoga... aku tetap jadi bagian dari hari-hari kamu ke depan. Happy Birthday ❤️";

// TYPEWRITER EFFECT
function typeWriter(text, elementId, speed = 50) {
  let i = 0;
  let el = document.getElementById(elementId);

  function typing() {
    if (i < text.length) {
      el.innerHTML += text.charAt(i);
      i++;
      setTimeout(typing, speed);
    }
  }

  el.innerHTML = ""; // reset
  typing();
}
let typingSound = new Audio("assets/typing.mp3");

function typeWriter(text, elementId, speed = 50) {
  let i = 0;
  let el = document.getElementById(elementId);

  function typing() {
    if (i < text.length) {
      el.innerHTML += text.charAt(i);
      typingSound.currentTime = 0;
      typingSound.play();
      i++;
      setTimeout(typing, speed);
    }
  }

  el.innerHTML = "";
  typing();
}