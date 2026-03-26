let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

// IMAGE
let cupidImg = new Image();
cupidImg.src = "assets/cupid.png";

let heartImg = new Image();
heartImg.src = "assets/heart.png";

// FOTO ENDING (WAJIB ADA FILE INI)
let endingImg = new Image();
endingImg.src = "assets/foto.png?v=" + Date.now(); // anti cache

// AUDIO SFX
let jumpSound = new Audio("assets/jump.mp3");
let popSound = new Audio("assets/typing.mp3"); // ganti dari pop.mp3
popSound.volume = 0.3;

// 🔥 WEB AUDIO ENGINE (ANTI MATI)
let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let bgSource = null;
let bgBuffer = null;
let gainNode = audioCtx.createGain();
gainNode.connect(audioCtx.destination);

// LOAD MUSIC
fetch("assets/bg-music.mp3")
  .then(res => res.arrayBuffer())
  .then(data => audioCtx.decodeAudioData(data))
  .then(buffer => {
    bgBuffer = buffer;
  });

// PLAY MUSIC
function playMusic() {
  if (!bgBuffer) return;

  if (bgSource) {
    try { bgSource.stop(); } catch(e){}
  }

  bgSource = audioCtx.createBufferSource();
  bgSource.buffer = bgBuffer;
  bgSource.loop = false; // 🔥 biar lagu jalan sampe selesai

  bgSource.connect(gainNode);
  gainNode.gain.value = 0.7;

  bgSource.start(0);
}

// FADE
function fadeVolume(target, duration = 500) {
  let start = gainNode.gain.value;
  let step = (target - start) / (duration / 50);

  let interval = setInterval(() => {
    gainNode.gain.value += step;

    if (
      (step > 0 && gainNode.gain.value >= target) ||
      (step < 0 && gainNode.gain.value <= target)
    ) {
      gainNode.gain.value = target;
      clearInterval(interval);
    }
  }, 50);
}

// GAME DATA
let dino = { x: 50, y: 150, w: 40, h: 40, vy: 0 };
let gravity = 1.2;
let obstacles = [];
let score = 0;

let gameRunning = false;
let gameEnded = false;

// START
function startGame() {
  document.getElementById("startScreen").style.display = "none";

  audioCtx.resume().then(() => {
    playMusic();
  });

  gameRunning = true;
  loop();
}

// JUMP (MATIIN PAS ENDING)
document.addEventListener("keydown", function(e) {
  if (gameEnded) return;

  if (e.code === "Space" && dino.y === 150) {
    dino.vy = -18;
    jumpSound.currentTime = 0;
    jumpSound.play();
  }
});

// LOOP
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 🔥 GAME MASIH JALAN WALAU ENDING
  if (gameRunning || gameEnded) {

    // karakter
    ctx.drawImage(cupidImg, dino.x, dino.y, dino.w, dino.h);

    if (!gameEnded) {
      dino.y += dino.vy;
      dino.vy += gravity;

      if (dino.y > 150) {
        dino.y = 150;
        dino.vy = 0;
      }

      // spawn obstacle
      if (Math.random() < 0.01) {
        obstacles.push({ x: 800, y: 150, w: 30, h: 30 });

        popSound.currentTime = 0;
        popSound.play().catch(()=>{});
      }
    }

    // obstacle tetap jalan
    obstacles.forEach((obs) => {
      obs.x -= 4;
      ctx.drawImage(heartImg, obs.x, obs.y, obs.w, obs.h);

      if (!gameEnded &&
        dino.x < obs.x + obs.w &&
        dino.x + dino.w > obs.x &&
        dino.y < obs.y + obs.h &&
        dino.y + dino.h > obs.y
      ) {
        gameRunning = false;
        fadeVolume(0.2, 300);
        alert("💔 Yah gagal... ulang lagi ya!");
        location.reload();
      }
    });

    // score berhenti di 500
    if (!gameEnded) {
      score++;
    }

    ctx.fillStyle = "#ff1493";
    ctx.fillText("Love Meter: " + score + "/500 💖", 600, 20);

    // 🔥 TRIGGER ENDING
    if (score >= 500 && !gameEnded) {
      gameEnded = true;
      showEnding();
    }
  }

  requestAnimationFrame(loop);
}

// ENDING
function showEnding() {
  fadeVolume(0.3, 800);

  // FOTO
  let img = document.getElementById("endingPhoto");
  img.src = endingImg.src;

  // TEXT
  typeWriter(romanticText, "message", 40);
}

// TEXT
let romanticText = "Hari ini bukan cuma tentang ulang tahun kamu... tapi tentang betapa beruntungnya dunia karena punya kamu ❤️";

// TYPEWRITER + SOUND
function typeWriter(text, elementId, speed = 50) {
  let i = 0;
  let el = document.getElementById(elementId);

  el.innerHTML = "";

  function typing() {
    if (i < text.length) {
      el.innerHTML += text.charAt(i);

      popSound.currentTime = 0;
      popSound.play().catch(()=>{});

      i++;
      setTimeout(typing, speed);
    }
  }

  typing();
}