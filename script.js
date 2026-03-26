let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

// IMAGE
let cupidImg = new Image();
cupidImg.src = "assets/cupid2.png";

let heartImg = new Image();
heartImg.src = "assets/heart2.png";

let endingImg = new Image();
endingImg.src = "assets/foto.png?v=" + Date.now();

// AUDIO
let jumpSound = new Audio("assets/jump.mp3");
let popSound = new Audio("assets/typing.mp3");
popSound.volume = 0.3;

// WEB AUDIO
let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let bgSource = null;
let bgBuffer = null;
let gainNode = audioCtx.createGain();
gainNode.connect(audioCtx.destination);

fetch("assets/bg-music.mp3")
  .then(res => res.arrayBuffer())
  .then(data => audioCtx.decodeAudioData(data))
  .then(buffer => {
    bgBuffer = buffer;
  });

function playMusic() {
  if (!bgBuffer) return;

  bgSource = audioCtx.createBufferSource();
  bgSource.buffer = bgBuffer;
  bgSource.loop = true; // loop supaya musik tetap jalan sampai ending

  bgSource.connect(gainNode);
  gainNode.gain.value = 0.7;

  bgSource.start(0);
}

// GAME DATA
let ground = canvas.height - 100;

let dino = { x: 50, y: ground, w: 80, h: 80, vy: 0 };
let gravity = 1.2;
let obstacles = [];
let score = 0;

let gameRunning = false;
let gameEnded = false;

// Untuk animasi terbang ke luar angkasa
let flyingToSpace = false;
let flySpeed = 0;
let starsAlpha = 0; // opacity bintang-bintang muncul pelan
let stars = [];

// Generate bintang acak
for (let i = 0; i < 80; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 2 + 0.5
  });
}

// START
function startGame() {
  document.getElementById("startScreen").style.display = "none";

  score = 0;
  gameEnded = false;
  flyingToSpace = false;
  flySpeed = 0;
  starsAlpha = 0;
  obstacles = [];
  dino.y = ground;
  dino.vy = 0;

  audioCtx.resume().then(() => {
    playMusic();
  });

  gameRunning = true;
  loop();
}

// JUMP (keyboard)
document.addEventListener("keydown", function(e) {
  if (!gameRunning || gameEnded) return;

  if (e.code === "Space" && dino.y >= ground) {
    dino.vy = -18;
    jumpSound.currentTime = 0;
    jumpSound.play();
  }
});

// JUMP (touch/tap untuk mobile)
document.addEventListener("touchstart", function(e) {
  if (!gameRunning || gameEnded) return;
  if (dino.y >= ground) {
    dino.vy = -18;
    jumpSound.currentTime = 0;
    jumpSound.play();
  }
});

// LOOP
function loop() {
  if (!gameRunning) return;

  // Background: gelap pelan-pelan saat mau ke luar angkasa
  if (flyingToSpace) {
    // Makin gelap
    let darkness = Math.min(starsAlpha, 1);
    let r = Math.round(255 * (1 - darkness));
    let g = Math.round(200 * (1 - darkness));
    let b = Math.round(230 * (1 - darkness));
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Bintang muncul
    ctx.fillStyle = `rgba(255,255,255,${starsAlpha})`;
    stars.forEach(s => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });

    starsAlpha += 0.012;
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // GRAVITY
  if (!flyingToSpace) {
    dino.y += dino.vy;
    dino.vy += gravity;

    if (dino.y > ground) {
      dino.y = ground;
      dino.vy = 0;
    }
  } else {
    // Mode terbang ke atas
    flySpeed += 0.4;
    dino.y -= flySpeed;
    dino.x += 1; // sedikit ke kanan biar kesan bergerak
  }

  // DRAW PLAYER
  ctx.drawImage(cupidImg, dino.x, dino.y, dino.w, dino.h);

  // OBSTACLE SPAWN (hanya sebelum ending, dan hanya setelah score > 30 biar ada jeda awal)
  if (!gameEnded && !flyingToSpace && score > 30 && Math.random() < 0.01) {
    obstacles.push({ x: canvas.width, y: ground, w: 50, h: 50 });

    popSound.currentTime = 0;
    popSound.play().catch(() => {});
  }

  // OBSTACLE UPDATE
  if (!flyingToSpace) {
    obstacles.forEach((obs) => {
      obs.x -= 4;
      ctx.drawImage(heartImg, obs.x, obs.y, obs.w, obs.h);

      // COLLISION
      if (!gameEnded &&
        dino.x < obs.x + obs.w &&
        dino.x + dino.w > obs.x &&
        dino.y < obs.y + obs.h &&
        dino.y + dino.h > obs.y
      ) {
        alert("💔 Yah gagal... ulang lagi ya!");
        location.reload();
      }
    });
  }

  // SCORE
  if (!gameEnded) {
    score++;
  }

  // HUD score (sembunyikan saat lagi terbang ke luar angkasa biar dramatis)
  if (!flyingToSpace) {
    ctx.fillStyle = "#ff1493";
    ctx.font = "20px Arial";
    ctx.fillText("Love Meter: " + score + "/500 💖", 550, 30);
  }

  // TRIGGER ENDING: mulai animasi terbang dulu
  if (score >= 500 && !gameEnded) {
    gameEnded = true;
    flyingToSpace = true;
    obstacles = []; // bersihkan rintangan
  }

  // Setelah cupid keluar layar (terbang ke atas), tampilkan ending screen
  if (flyingToSpace && dino.y < -100) {
    gameRunning = false;
    showEnding();
    return;
  }

  requestAnimationFrame(loop);
}

// ENDING
function showEnding() {
  let endScreen = document.getElementById("endScreen");
  endScreen.classList.remove("hidden");
  endScreen.style.display = "flex";

  // Pasang foto
  let img = document.getElementById("couplePhoto");
  img.src = endingImg.src;

  // Typewriter pesan
  typeWriter(romanticText, "message", 40);
}

// TEXT
let romanticText = "Hari ini bukan cuma tentang ulang tahun kamu... tapi tentang betapa beruntungnya dunia karena punya kamu ❤️";

// TYPEWRITER
function typeWriter(text, elementId, speed = 50) {
  let i = 0;
  let el = document.getElementById(elementId);

  el.innerHTML = "";

  function typing() {
    if (i < text.length) {
      el.innerHTML += text.charAt(i);

      popSound.currentTime = 0;
      popSound.play().catch(() => {});

      i++;
      setTimeout(typing, speed);
    }
  }

  typing();
}