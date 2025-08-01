// =========================================================
// Bagian 1: Definisi Aset dan Elemen HTML (DOM Elements)
// =========================================================

// Objek untuk mendefinisikan konfigurasi setiap aset animasi.
// *** PENTING: SESUAIKAN 'frames' SESUAI JUMLAH FILE PNG ANDA DI SETIAP FOLDER! ***
const animations = {
  hugoIdle: {
    frames: 39,
    prefix: "frame_",
    path: "assets/hugo_idle/",
    loop: true,
    fps: 39,
  },
  heheIdle: {
    frames: 34,
    prefix: "frame_",
    path: "assets/hehe_idle/",
    loop: true,
    fps: 20,
  },
  battleAnimation: {
    frames: 60,
    prefix: "frame_",
    path: "assets/battle_animation/",
    loop: false,
    fps: 10,
  },
  hugoWin: {
    frames: 14,
    prefix: "frame_",
    path: "assets/hugo_win/",
    loop: false,
    fps: 14,
  },
  heheWin: {
    frames: 16,
    prefix: "frame_",
    path: "assets/hehe_win/",
    loop: false,
    fps: 16,
  },
  hugoLose: {
    frames: 10,
    prefix: "frame_",
    path: "assets/hugo_lose/",
    loop: false,
    fps: 10,
  },
  heheLose: {
    frames: 10,
    prefix: "frame_",
    path: "assets/hehe_lose/",
    loop: false,
    fps: 10,
  },
  drawAnimation: {
    frames: 1,
    prefix: "frame_",
    path: "assets/draw_animation/",
    loop: false,
    fps: 0,
  },
};

// Objek untuk menyimpan semua objek Image yang sudah dimuat (preload)
const preloadedImages = {};

// Mendapatkan referensi ke elemen-elemen HTML utama
const hugoAnimationImg = document.getElementById("hugo-animation");
const heheAnimationImg = document.getElementById("hehe-animation");
const vsAnimationImg = document.getElementById("vs-animation");
const battleAnimationContainer = document.getElementById(
  "battle-animation-container"
);
const battleSceneAnimationImg = document.getElementById(
  "battle-scene-animation"
);

const betCountdownSpan = document.getElementById("bet-countdown");
const currentRoundSpan = document.getElementById("current-round");
const betOptions = document.querySelectorAll(".bet-option");
const betInput = document.getElementById("bet-input");
const betMinusBtn = document.querySelector(".bet-minus");
const betPlusBtn = document.querySelector(".bet-plus");
const userCoinsSpan = document.getElementById("user-coins");
const currentWonSpan = document.getElementById("current-won");

const resultOverlay = document.getElementById("result-overlay");
const closeResultButton = document.getElementById("close-result-button");
const resultWinnerImg = document.getElementById("result-winner-img");
const resultVictoryText = document.getElementById("result-victory-text");
const resultIdSpan = document.getElementById("result-id");
const resultBetAmountSpan = document.getElementById("result-bet-amount");
const resultWonAmountSpan = document.getElementById("result-won-amount");
const resultCountdownSpan = document.querySelector(".result-countdown");
const biggestWinnersList = document.querySelector(".biggest-winners-list");

// === ELEMEN BARU UNTUK RIWAYAT DAN LEADERBOARD ===
const historyItemsContainer = document.querySelector(".history-items"); // Untuk riwayat hasil putaran
// Tombol Local/Global sudah dihapus dari HTML
const leaderboardDateOptions = document.querySelectorAll(
  ".leaderboard-date-options .date-button"
); // Tombol Today/Yesterday
const leaderboardLists = document.querySelectorAll(".leaderboard-list"); // Kontainer daftar peringkat

// Variabel state permainan
let currentBetAmount = parseInt(betInput.value);
let selectedBetOption = null;
let userBalance = parseInt(userCoinsSpan.textContent);
let currentRound = parseInt(currentRoundSpan.textContent);
let gameHistory = []; // Array untuk menyimpan hasil putaran terakhir (misal 10 putaran terakhir)

// Timer IDs untuk clearInterval agar bisa menghentikan timer yang sedang berjalan
let betTimer;
let resultTimer;
let battleDurationTimer;
let winLoseAnimationTimer; // Timer untuk animasi menang/kalah di arena

// requestAnimationFrame IDs untuk menghentikan animasi spesifik
let hugoAnimationFrameId;
let heheAnimationFrameId;
let battleSceneAnimationFrameId;

let isBattleInProgress = false; // Flag untuk status fase battle

// === DATA DUMMY UNTUK LEADERBOARD (SEKARANG LANGSUNG 'today' dan 'yesterday') ===
const leaderboardData = {
  today: [
    { rank: 1, username: "TopPlayer1", coins: 25000 },
    { rank: 2, username: "AceGamer", coins: 20000 },
    { rank: 3, username: "ProBet", coins: 15000 },
    { rank: 4, username: "GamerX", coins: 12000 },
    { rank: 5, username: "CoolPlayer", coins: 10000 },
    { rank: 6, username: "FastFinger", coins: 8000 },
    { rank: 7, username: "NetWin", coins: 7500 },
    { rank: 8, username: "KingCoin", coins: 6000 },
    { rank: 9, username: "QuickWin", coins: 5000 },
    { rank: 10, username: "SmallBet", coins: 4000 },
  ],
  yesterday: [
    { rank: 1, username: "YesterdayHero", coins: 18000 },
    { rank: 2, username: "OldChamp", coins: 12000 },
    { rank: 3, username: "PastWinner", coins: 10000 },
    { rank: 4, username: "ArchivePro", coins: 9000 },
    { rank: 5, username: "Memories", coins: 7000 },
  ],
};

// =========================================================
// Bagian 2: Fungsi Utilitas Animasi
// =========================================================

/**
 * Memuat semua frame animasi ke memori (preload) untuk mencegah flicker.
 * @param {Object} animConfig - Konfigurasi animasi (dari objek animations)
 */
function preloadAnimation(animConfig) {
  if (!preloadedImages[animConfig.path]) {
    preloadedImages[animConfig.path] = [];
  }

  for (let i = 1; i <= animConfig.frames; i++) {
    const img = new Image();
    img.src = `${animConfig.path}${animConfig.prefix}${String(i).padStart(
      2,
      "0"
    )}.png`;

    img.onerror = () => {
      console.error(
        `ERROR: Failed to load image: ${img.src}. Check path and filename.`,
        animConfig
      );
    };
    // console.log(`Preloading: ${img.src}`); // Debugging: Uncomment to see preloading paths

    preloadedImages[animConfig.path].push(img);
  }
}

/**
 * Memutar animasi frame-by-frame pada elemen <img> yang diberikan.
 * Mengelola loop dan callback untuk animasi non-loop.
 * @param {HTMLElement} imgElement - Elemen <img> untuk memutar animasi.
 * @param {Object} animConfig - Konfigurasi animasi (dari objek animations).
 * @param {Function} [callback] - Fungsi yang dipanggil setelah animasi selesai (jika tidak loop).
 */
function playAnimation(imgElement, animConfig, callback = null) {
  // Hentikan animasi sebelumnya pada elemen ini jika ada, agar tidak tumpang tindih
  let currentAnimationFrameIdToCancel;
  if (imgElement.id === "hugo-animation") {
    currentAnimationFrameIdToCancel = hugoAnimationFrameId;
  } else if (imgElement.id === "hehe-animation") {
    currentAnimationFrameIdToCancel = heheAnimationFrameId;
  } else if (imgElement.id === "battle-scene-animation") {
    currentAnimationFrameIdToCancel = battleSceneAnimationFrameId;
  }
  if (currentAnimationFrameIdToCancel) {
    cancelAnimationFrame(currentAnimationFrameIdToCancel);
  }

  let frameIndex = 0;
  let lastTimestamp = 0;
  const frameDuration = 1000 / animConfig.fps; // Durasi tampilan setiap frame dalam milidetik

  function animate(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const elapsed = timestamp - lastTimestamp; // Waktu berlalu sejak frame terakhir diupdate

    // Perbarui frame hanya jika waktu yang diperlukan sudah berlalu
    if (elapsed > frameDuration) {
      // Pastikan array gambar sudah di-preload dan indeksnya valid
      if (
        preloadedImages[animConfig.path] &&
        frameIndex < preloadedImages[animConfig.path].length
      ) {
        imgElement.src = preloadedImages[animConfig.path][frameIndex].src;
      } else {
        console.warn(
          `[Animation Warning] Frame ${frameIndex} out of bounds or images not fully preloaded for ${animConfig.path}. Check 'frames' count in animations object or preloading.`
        );
        stopAllAnimations(); // Jika terjadi masalah, hentikan animasi agar tidak terus error
        return;
      }
      // Perbarui lastTimestamp, mengurangi sisa waktu untuk akurasi yang lebih baik
      lastTimestamp = timestamp - (elapsed % frameDuration);

      frameIndex++; // Pindah ke frame berikutnya

      // Cek apakah sudah mencapai akhir animasi
      if (frameIndex >= animConfig.frames) {
        if (animConfig.loop) {
          frameIndex = 0; // Kembali ke awal jika animasi diatur untuk loop
        } else {
          // Animasi selesai dan tidak di-loop
          if (callback) callback(); // Panggil callback jika disediakan
          // Hentikan requestAnimationFrame untuk animasi ini agar tidak terus berjalan
          if (imgElement.id === "hugo-animation")
            cancelAnimationFrame(hugoAnimationFrameId);
          else if (imgElement.id === "hehe-animation")
            cancelAnimationFrame(heheAnimationFrameId);
          else if (imgElement.id === "battle-scene-animation")
            cancelAnimationFrame(battleSceneAnimationFrameId);
          return; // Hentikan fungsi animate()
        }
      }
    }
    // Lanjutkan animasi di frame berikutnya
    const nextAnimationFrameId = requestAnimationFrame(animate);

    // Simpan ID requestAnimationFrame untuk elemen yang sedang dianimasikan
    if (imgElement.id === "hugo-animation") {
      hugoAnimationFrameId = nextAnimationFrameId;
    } else if (imgElement.id === "hehe-animation") {
      heheAnimationFrameId = nextAnimationFrameId;
    } else if (imgElement.id === "battle-scene-animation") {
      battleSceneAnimationFrameId = nextAnimationFrameId;
    }
  }
  // Mulai animasi
  const initialAnimationFrameId = requestAnimationFrame(animate);
  // Simpan ID animasi awal
  if (imgElement.id === "hugo-animation") {
    hugoAnimationFrameId = initialAnimationFrameId;
  } else if (imgElement.id === "hehe-animation") {
    heheAnimationFrameId = initialAnimationFrameId;
  } else if (imgElement.id === "battle-scene-animation") {
    battleSceneAnimationFrameId = initialAnimationFrameId;
  }
}

/**
 * Menghentikan semua animasi requestAnimationFrame yang sedang berjalan.
 */
function stopAllAnimations() {
  cancelAnimationFrame(hugoAnimationFrameId);
  cancelAnimationFrame(heheAnimationFrameId);
  cancelAnimationFrame(battleSceneAnimationFrameId);
}

// =========================================================
// Bagian 3: Logika Game Inti
// =========================================================

/**
 * Memulai fase "Bet Time", mengatur ulang UI, dan memulai animasi idle.
 */
function startBetCountdown() {
  isBattleInProgress = false;
  betCountdownSpan.textContent = "13s";
  let timeLeft = 13;

  // Reset pot dan bet user di UI
  document.getElementById("hugo-pot").textContent = "0";
  document.getElementById("draw-pot").textContent = "0";
  document.getElementById("hehe-pot").textContent = "0";
  document.getElementById("hugo-bet").textContent = "0";
  document.getElementById("draw-bet").textContent = "0";
  document.getElementById("hehe-bet").textContent = "0";

  // Pastikan opsi taruhan bisa diklik dan hapus highlight dari putaran sebelumnya
  betOptions.forEach((option) => {
    option.classList.remove("active");
    option.style.pointerEvents = "auto"; // Aktifkan klik
  });
  betMinusBtn.style.pointerEvents = "auto";
  betPlusBtn.style.pointerEvents = "auto";

  // Tampilkan kembali karakter Hugo, Hehe, dan ikon VS
  hugoAnimationImg.classList.remove("hidden-element");
  heheAnimationImg.classList.remove("hidden-element");
  vsAnimationImg.classList.remove("hidden-element");

  hugoAnimationImg.classList.add("fade-in");
  heheAnimationImg.classList.add("fade-in");
  vsAnimationImg.classList.add("fade-in");

  // Sembunyikan kontainer animasi battle dengan efek transisi
  battleAnimationContainer.classList.remove("active-display"); // Hapus display flex
  battleAnimationContainer.classList.remove("fade-in"); // Hapus opacity 1
  // Berikan sedikit waktu transisi opacity sebelum mengatur display: none
  setTimeout(() => {
    battleAnimationContainer.style.display = "none"; // Sembunyikan sepenuhnya setelah transisi
  }, 300); // Durasi ini harus cocok dengan transisi opacity di CSS Anda

  // Play idle animations untuk Hugo dan Hehe
  playAnimation(hugoAnimationImg, animations.hugoIdle);
  playAnimation(heheAnimationImg, animations.heheIdle);

  // Hentikan timer sebelumnya jika ada
  if (betTimer) clearInterval(betTimer);

  betTimer = setInterval(() => {
    timeLeft--;
    betCountdownSpan.textContent = `${timeLeft}s`;

    if (timeLeft <= 0) {
      clearInterval(betTimer);
      betCountdownSpan.textContent = "0s";
      // Kunci taruhan setelah waktu habis
      betOptions.forEach((option) => (option.style.pointerEvents = "none"));
      betMinusBtn.style.pointerEvents = "none";
      betPlusBtn.style.pointerEvents = "none";
      simulateBattle(); // Lanjutkan ke fase simulasi pertarungan
    }
  }, 1000);
}

/**
 * Mensimulasikan fase pertarungan, menyembunyikan karakter, menampilkan animasi battle,
 * dan memulai countdown durasi battle.
 */
function simulateBattle() {
  isBattleInProgress = true;
  betCountdownSpan.textContent = `Battle: 5s`; // Teks awal saat battle dimulai

  stopAllAnimations(); // Hentikan semua animasi yang sedang berjalan (idle, dll.)

  // Sembunyikan karakter Hugo, Hehe, dan ikon VS dengan menambahkan kelas 'hidden-element'
  hugoAnimationImg.classList.remove("fade-in");
  heheAnimationImg.classList.remove("fade-in");
  vsAnimationImg.classList.remove("fade-in");

  setTimeout(() => {
    // Berikan waktu untuk transisi opacity
    hugoAnimationImg.classList.add("hidden-element");
    heheAnimationImg.classList.add("hidden-element");
    vsAnimationImg.classList.add("hidden-element");
  }, 300); // Sesuaikan dengan durasi transisi opacity di CSS Anda

  // Tampilkan kontainer animasi battle di tengah
  battleAnimationContainer.style.display = "flex"; // Mengatur display agar transisi opacity bekerja
  setTimeout(() => {
    battleAnimationContainer.classList.add("active-display"); // Mengatur display:flex
    battleAnimationContainer.classList.add("fade-in"); // Menampilkan dengan transisi opacity
  }, 350); // Delay ini harus lebih besar dari transisi opacity karakter/VS

  // Mainkan animasi battle di elemen battleSceneAnimationImg.
  playAnimation(battleSceneAnimationImg, animations.battleAnimation);
  // CATATAN: showWinLoseAnimationInArena() akan dipanggil setelah 'battleDurationTimer' selesai.

  let battleTimeLeft = 5; // Durasi total fase battle dalam detik
  betCountdownSpan.textContent = `Battle: ${battleTimeLeft}s`;

  // Hentikan timer sebelumnya jika ada
  if (battleDurationTimer) clearInterval(battleDurationTimer);

  battleDurationTimer = setInterval(() => {
    battleTimeLeft--;
    betCountdownSpan.textContent = `Battle: ${battleTimeLeft}s`;

    if (battleTimeLeft <= 0) {
      clearInterval(battleDurationTimer);
      showWinLoseAnimationInArena(); // Panggil fungsi ini setelah battle utama selesai
    }
  }, 1000);
}

/**
 * Fungsi baru: Menampilkan animasi menang/kalah di arena setelah battle selesai.
 * Ini adalah fase transisi sebelum overlay hasil muncul.
 */
function showWinLoseAnimationInArena() {
  stopAllAnimations(); // Hentikan animasi battle
  // Sembunyikan kontainer animasi battle
  battleAnimationContainer.classList.remove("fade-in");
  battleAnimationContainer.classList.remove("active-display");
  setTimeout(() => {
    battleAnimationContainer.style.display = "none";
  }, 300); // Sesuaikan dengan durasi transisi opacity

  // ==== LOGIKA PENENTUAN PEMENANG (SANGAT SIMPLIFIKASI untuk frontend saja) ====
  // Ini harusnya datang dari server di aplikasi nyata
  const outcomes = ["hugo", "hehe", "draw"];
  const randomOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];

  // Tampilkan kembali karakter Hugo dan Hehe di arena
  hugoAnimationImg.classList.remove("hidden-element");
  heheAnimationImg.classList.remove("hidden-element");
  vsAnimationImg.classList.add("hidden-element"); // Ikon VS tetap tersembunyi

  // Berikan sedikit waktu agar elemen render sebelum transisi opacity
  setTimeout(() => {
    hugoAnimationImg.classList.add("fade-in");
    heheAnimationImg.classList.add("fade-in");
  }, 350); // Delay sama atau lebih besar dari transisi battle container

  // Perbarui UI karakter di arena menjadi pose menang/kalah yang sesuai
  if (randomOutcome === "hugo") {
    playAnimation(hugoAnimationImg, animations.hugoWin); // Hugo menang
    playAnimation(heheAnimationImg, animations.heheLose); // Hehe kalah
  } else if (randomOutcome === "hehe") {
    playAnimation(heheAnimationImg, animations.heheWin); // Hehe menang
    playAnimation(hugoAnimationImg, animations.hugoLose); // Hugo kalah
  } else {
    // Seri/Imbang
    playAnimation(hugoAnimationImg, animations.drawAnimation);
    playAnimation(heheAnimationImg, animations.drawAnimation);
  }

  // Tentukan waktu berapa lama animasi menang/kalah ini terlihat di arena
  const winLoseDisplayDuration = 2000; // 2 detik dalam milidetik

  // Update teks countdown di arena untuk menunjukkan "Result will appear in X s"
  betCountdownSpan.textContent = `Result: ${winLoseDisplayDuration / 1000}s`;
  let resultDisplayTimeLeft = winLoseDisplayDuration / 1000;

  // Hentikan timer sebelumnya jika ada
  if (winLoseAnimationTimer) clearInterval(winLoseAnimationTimer);

  winLoseAnimationTimer = setInterval(() => {
    resultDisplayTimeLeft--;
    betCountdownSpan.textContent = `Result: ${resultDisplayTimeLeft}s`;
    if (resultDisplayTimeLeft <= 0) {
      clearInterval(winLoseAnimationTimer);
      showResult(randomOutcome); // Panggil showResult dengan hasil akhir
    }
  }, 1000);
}

/**
 * Menampilkan overlay hasil pertarungan, memperbarui status koin,
 * dan menginisialisasi leaderboard/riwayat.
 * @param {string} finalOutcome - Hasil akhir putaran ('hugo', 'hehe', atau 'draw').
 */
function showResult(finalOutcome) {
  // Flag untuk memastikan fungsi hanya berjalan sekali per putaran hasil
  if (!resultOverlay.classList.contains("fade-in")) {
    console.log("Showing Result Overlay!");
    stopAllAnimations(); // Hentikan animasi menang/kalah di arena
    clearInterval(winLoseAnimationTimer); // Pastikan timer animasi menang/kalah berhenti

    // Sembunyikan karakter dan ikon VS di arena lagi sebelum overlay muncul
    hugoAnimationImg.classList.remove("fade-in");
    heheAnimationImg.classList.remove("fade-in");
    vsAnimationImg.classList.add("hidden-element"); // VS tetap hidden

    setTimeout(() => {
      hugoAnimationImg.classList.add("hidden-element");
      heheAnimationImg.classList.add("hidden-element");
    }, 300); // Sesuaikan dengan transisi opacity

    // Tampilkan overlay hasil: Mengatur display dan kemudian menambahkan kelas untuk transisi slide-up
    resultOverlay.style.display = "flex";
    setTimeout(() => {
      resultOverlay.classList.add("fade-in"); // Memicu transisi slide-up (transform: translateY(-100%))
    }, 50); // Sedikit delay agar display diterapkan sebelum transisi

    // ==== PERBARUI UI DI OVERLAY HASIL ====
    let wonAmount = 0;
    let winnerChar = "";

    if (finalOutcome === "hugo") {
      winnerChar = "Hugo";
      resultWinnerImg.src = "assets/icons/hugo-icon.png";
      resultVictoryText.textContent = "VICTORY";
      resultVictoryText.style.color = "#76ff03";
    } else if (finalOutcome === "hehe") {
      winnerChar = "Hehe";
      resultWinnerImg.src = "assets/icons/hehe-icon.png";
      resultVictoryText.textContent = "VICTORY";
      resultVictoryText.style.color = "#76ff03";
    } else {
      // Draw
      winnerChar = "Draw";
      resultWinnerImg.src = "assets/icons/draw-icon.png";
      resultVictoryText.textContent = "DRAW!";
      resultVictoryText.style.color = "#ffeb3b";
    }

    resultIdSpan.textContent = "1119084843";
    resultBetAmountSpan.textContent = selectedBetOption ? currentBetAmount : 0;

    if (selectedBetOption === finalOutcome) {
      let multiplier = 0;
      if (selectedBetOption === "hugo" || selectedBetOption === "hehe") {
        multiplier = 2;
      } else if (selectedBetOption === "draw") {
        multiplier = 30;
      }
      wonAmount = currentBetAmount * multiplier;
      userBalance += wonAmount;
      currentWonSpan.textContent = wonAmount;
    } else {
      wonAmount = 0;
      if (selectedBetOption) {
        userBalance -= currentBetAmount;
      }
      currentWonSpan.textContent = "0";
    }
    resultWonAmountSpan.textContent = wonAmount;
    userCoinsSpan.textContent = userBalance;

    biggestWinnersList.innerHTML = `
            <div class="winner-item">
                <img src="assets/icons/gambar-1.png" alt="Avatar">
                <span>Mr.Xyzin</span>
                <span class="coins">20</span>
            </div>
            <div class="winner-item">
                <img src="assets/icons/gambar-2.png" alt="Avatar">
                <span>Re_Juve</span>
                <span class="coins">7000</span>
            </div>
        `;
    // === PERBAIKAN: Update Riwayat Result ===
    updateGameHistory(finalOutcome);

    // Memulai countdown untuk menutup overlay hasil
    let resultTimeLeft = 5;
    resultCountdownSpan.textContent = `${resultTimeLeft}s`;
    if (resultTimer) clearInterval(resultTimer);

    resultTimer = setInterval(() => {
      resultTimeLeft--;
      resultCountdownSpan.textContent = `${resultTimeLeft}s`;
      if (resultTimeLeft <= 0) {
        clearInterval(resultTimer);
        hideResultAndStartNewRound();
      }
    }, 1000);
  }
}

/**
 * Menyembunyikan overlay hasil dan menginisialisasi ulang game untuk putaran baru.
 */
function hideResultAndStartNewRound() {
  resultOverlay.classList.remove("fade-in"); // Hapus kelas untuk transisi slide-up
  setTimeout(() => {
    // Berikan waktu untuk transisi slide-down selesai
    resultOverlay.classList.remove("active-display");
    resultOverlay.style.display = "none"; // Sembunyikan sepenuhnya
  }, 500); // Durasi ini harus cocok dengan transform transition di CSS (0.5s)

  clearInterval(resultTimer); // Pastikan timer hasil berhenti

  stopAllAnimations(); // Pastikan semua animasi berhenti

  // Reset status taruhan dan UI terkait
  selectedBetOption = null;
  betOptions.forEach((option) => option.classList.remove("active"));
  currentBetAmount = 10;
  betInput.value = currentBetAmount;
  currentWonSpan.textContent = "0";

  currentRound++;
  currentRoundSpan.textContent = currentRound;
  startBetCountdown();
}

// =========================================================
// Bagian 4: Event Listeners (Interaksi Pengguna)
// =========================================================

// Event listener untuk pilihan taruhan (Hugo, Seri, Hehe)
betOptions.forEach((option) => {
  option.addEventListener("click", () => {
    if (isBattleInProgress) return;

    if (selectedBetOption === option.dataset.option) {
      selectedBetOption = null;
      option.classList.remove("active");
      document.getElementById(`${option.dataset.option}-bet`).textContent = "0";
      return;
    }

    betOptions.forEach((opt) => {
      opt.classList.remove("active");
      document.getElementById(`${opt.dataset.option}-bet`).textContent = "0";
    });

    option.classList.add("active");
    selectedBetOption = option.dataset.option;

    document.getElementById(`${selectedBetOption}-bet`).textContent =
      currentBetAmount;
  });
});

// Event listener untuk tombol (-) mengurangi jumlah taruhan
betMinusBtn.addEventListener("click", () => {
  if (isBattleInProgress) return;
  if (currentBetAmount > 10) {
    currentBetAmount -= 10;
    betInput.value = currentBetAmount;
    if (selectedBetOption) {
      document.getElementById(`${selectedBetOption}-bet`).textContent =
        currentBetAmount;
    }
  }
});

// Event listener untuk tombol (+) menambah jumlah taruhan
betPlusBtn.addEventListener("click", () => {
  if (isBattleInProgress) return;
  if (currentBetAmount + 10 <= userBalance) {
    currentBetAmount += 10;
    betInput.value = currentBetAmount;
    if (selectedBetOption) {
      document.getElementById(`${selectedBetOption}-bet`).textContent =
        currentBetAmount;
    }
  } else if (currentBetAmount < userBalance) {
    currentBetAmount = userBalance;
    betInput.value = currentBetAmount;
    if (selectedBetOption) {
      document.getElementById(`${selectedBetOption}-bet`).textContent =
        currentBetAmount;
    }
  } else {
    console.log("Saldo tidak cukup untuk menambah bet lebih banyak!");
  }
});

// Event listener untuk menutup overlay hasil secara manual
closeResultButton.addEventListener("click", hideResultAndStartNewRound);

// =========================================================
// Bagian 5: Fungsi Leaderboard & Riwayat Result
// =========================================================

// Fungsi untuk mengelola leaderboard - HANYA TODAY/YESTERDAY
/**
 * Mengisi daftar leaderboard berdasarkan tanggal (today/yesterday).
 * @param {string} date - 'today' atau 'yesterday'.
 */
function populateLeaderboard(date) {
  // ID daftar sekarang hanya today-list atau yesterday-list
  const listContainer = document.getElementById(`${date}-list`);
  if (listContainer && leaderboardData && leaderboardData[date]) {
    listContainer.innerHTML = leaderboardData[date]
      .map(
        (item) => `
            <div class="leaderboard-item">
                <span class="rank">${item.rank}</span>
                <span class="username">${item.username}</span>
                <span class="coins">${item.coins.toLocaleString()}</span>
            </div>
        `
      )
      .join("");
  } else {
    console.warn(`Leaderboard data not found for ${date}`);
    if (listContainer) {
      listContainer.innerHTML =
        '<div class="leaderboard-item">No data available.</div>';
    }
  }
}

// Event listeners untuk tombol opsi tanggal leaderboard (Today/Yesterday)
leaderboardDateOptions.forEach((dateBtn) => {
  dateBtn.addEventListener("click", handleLeaderboardDateClick);
});

/**
 * Menangani klik pada tombol opsi tanggal leaderboard (Today/Yesterday).
 * @param {Event} event - Objek event klik.
 */
function handleLeaderboardDateClick(event) {
  const date = event.target.dataset.date;
  if (date) {
    leaderboardDateOptions.forEach((btn) => btn.classList.remove("active"));
    event.target.classList.add("active");

    // Sembunyikan semua daftar leaderboard yang ada (today-list, yesterday-list)
    document.getElementById("today-list").classList.add("hidden");
    document.getElementById("yesterday-list").classList.add("hidden");

    // Tampilkan daftar yang sesuai dengan tanggal aktif
    const targetList = document.getElementById(`${date}-list`);
    if (targetList) {
      targetList.classList.remove("hidden");
      populateLeaderboard(date); // Isi ulang data
    }
  }
}

/**
 * Menambahkan hasil putaran ke riwayat game dan memperbarui tampilan.
 * @param {string} winner - 'hugo', 'hehe', atau 'draw'.
 */
function updateGameHistory(winner) {
  gameHistory.unshift(winner);
  if (gameHistory.length > 10) {
    gameHistory.pop();
  }

  if (historyItemsContainer) {
    historyItemsContainer.innerHTML = gameHistory
      .map((result) => {
        let className = "";
        let text = "";
        if (result === "hugo") {
          className = "hugo";
          text = "Hugo Win";
        } else if (result === "draw") {
          className = "draw";
          text = "Draw";
        } else if (result === "hehe") {
          className = "hehe";
          text = "Hehe Win";
        }
        return `<div class="history-item ${className}">${text}</div>`;
      })
      .join("");
  }
}

// =========================================================
// Bagian 6: Inisialisasi Game
// =========================================================

// Fungsi yang akan dijalankan setelah seluruh DOM (HTML) selesai dimuat
document.addEventListener("DOMContentLoaded", () => {
  // Memuat semua gambar animasi ke memori saat game dimulai
  for (const animKey in animations) {
    preloadAnimation(animations[animKey]);
  }

  // Menginisialisasi leaderboard dengan data default (today)
  populateLeaderboard("today");

  // Memulai fase "Bet Time" untuk putaran pertama game
  startBetCountdown();
});
