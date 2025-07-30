// =========================================================
// Bagian 1: Definisi Aset dan Elemen HTML (DOM Elements)
// =========================================================

// Objek untuk mendefinisikan konfigurasi setiap aset animasi.
// *** PENTING: SESUAIKAN 'frames' SESUAI JUMLAH FILE PNG ANDA DI SETIAP FOLDER! ***
// Contoh: Jika hugo_idle memiliki frame_01.png hingga frame_39.png, maka frames: 39
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
    frames: 47,
    prefix: "frame_",
    path: "assets/battle_animation/",
    loop: false,
    fps: 15,
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
    path: "assets/hehe_lose",
    loop: false,
    fps: 10,
  },
  drawAnimation: {
    frames: 8,
    prefix: "frame_",
    path: "assets/draw_animation/",
    loop: false,
    fps: 10,
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
const leaderboardTabs = document.querySelectorAll(
  ".leaderboard-tabs .tab-button"
); // Tombol Local/Global
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

// requestAnimationFrame IDs untuk menghentikan animasi spesifik
let hugoAnimationFrameId;
let heheAnimationFrameId;
let battleSceneAnimationFrameId;

let isBattleInProgress = false; // Flag untuk status fase battle

// === DATA DUMMY UNTUK LEADERBOARD (INI AKAN DIGANTI DENGAN DATA DARI BACKEND DI MASA DEPAN) ===
const leaderboardData = {
  local: {
    today: [
      { rank: 1, username: "LocalChamp", coins: 25000 },
      { rank: 2, username: "LuckyLocal", coins: 20000 },
      { rank: 3, username: "BetMaster", coins: 15000 },
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
      { rank: 2, username: "LocalRiser", coins: 12000 },
      { rank: 3, username: "OldSchool", coins: 10000 },
      { rank: 4, username: "PastWinner", coins: 9000 },
      { rank: 5, username: "ArchivePro", coins: 7000 },
    ],
  },
  global: {
    today: [
      { rank: 1, username: "GlobalLegend", coins: 1000000 },
      { rank: 2, username: "WorldWinner", coins: 800000 },
      { rank: 3, username: "CoinKing", coins: 700000 },
      { rank: 4, username: "UniversalAce", coins: 600000 },
      { rank: 5, username: "TopTier", coins: 500000 },
      { rank: 6, username: "MegaBets", coins: 450000 },
      { rank: 7, username: "GlobalGiant", coins: 400000 },
      { rank: 8, username: "ElitePlayer", coins: 350000 },
      { rank: 9, username: "StarGamer", coins: 300000 },
      { rank: 10, username: "Champion", coins: 250000 },
    ],
    yesterday: [
      { rank: 1, username: "GlobalChampYesterday", coins: 900000 },
      { rank: 2, username: "UniverseBet", coins: 750000 },
      { rank: 3, username: "OldWorldKing", coins: 650000 },
      { rank: 4, username: "AncientHero", coins: 580000 },
      { rank: 5, username: "PastGlory", coins: 500000 },
    ],
  },
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
  // PERBAIKAN: Hanya tampilkan "Battle: [waktu]s"
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
  // Berikan sedikit waktu agar display:flex diterapkan sebelum opacity berubah
  setTimeout(() => {
    battleAnimationContainer.classList.add("active-display"); // Mengatur display:flex
    battleAnimationContainer.classList.add("fade-in"); // Menampilkan dengan transisi opacity
  }, 350); // Delay ini harus lebih besar dari transisi opacity karakter/VS

  // Mainkan animasi battle di elemen battleSceneAnimationImg.
  playAnimation(battleSceneAnimationImg, animations.battleAnimation);
  // CATATAN: showResult() akan dipanggil setelah 'battleDurationTimer' selesai,
  // bukan oleh callback animasi battle. Ini memastikan fase battle berlangsung 5 detik.

  let battleTimeLeft = 5; // Durasi total fase battle dalam detik
  // betCountdownSpan.textContent = `Battle: ${battleTimeLeft}s`; // Baris ini tidak perlu diubah karena sudah di atas

  // Hentikan timer sebelumnya jika ada
  if (battleDurationTimer) clearInterval(battleDurationTimer);

  battleDurationTimer = setInterval(() => {
    battleTimeLeft--;
    // PERBAIKAN: Hanya tampilkan "Battle: [sisa_waktu]s" selama countdown
    betCountdownSpan.textContent = `Battle: ${battleTimeLeft}s`; // Update countdown teks

    if (battleTimeLeft <= 0) {
      clearInterval(battleDurationTimer);
      showResult(); // Panggil fungsi showResult setelah durasi battle selesai
    }
  }, 1000);
}

/**
 * Menampilkan overlay hasil pertarungan, memperbarui status koin,
 * dan memutar animasi menang/kalah pada karakter.
 */
function showResult() {
  // Flag untuk memastikan fungsi hanya berjalan sekali per putaran hasil
  if (!resultOverlay.classList.contains("fade-in")) {
    // Periksa kelas fade-in
    console.log("Showing Result!");
    stopAllAnimations(); // Hentikan semua animasi yang mungkin masih berjalan
    clearInterval(battleDurationTimer); // Pastikan timer durasi battle berhenti

    // Sembunyikan kontainer animasi battle dengan efek transisi
    battleAnimationContainer.classList.remove("fade-in");
    battleAnimationContainer.classList.remove("active-display"); // Hapus display flex
    setTimeout(() => {
      battleAnimationContainer.style.display = "none";
    }, 300); // Sesuaikan dengan durasi transisi opacity di CSS Anda

    // Tampilkan overlay hasil dengan efek transisi
    resultOverlay.style.display = "flex"; // Mengatur display agar transisi opacity bekerja
    setTimeout(() => {
      resultOverlay.classList.add("fade-in"); // Tampilkan dengan transisi opacity
    }, 350); // Sedikit delay untuk memungkinkan rendering awal

    // ==== LOGIKA PENENTUAN PEMENANG (SANGAT SIMPLIFIKASI untuk frontend saja) ====
    // Dalam aplikasi nyata, hasil ini akan dikirim dari server setelah perhitungan backend
    const outcomes = ["hugo", "hehe", "draw"];
    const randomOutcome = outcomes[Math.floor(Math.random() * outcomes.length)]; // Menentukan pemenang secara acak
    let winnerChar = null;
    let wonAmount = 0;

    // *******************************************************************
    // *** PENTING: PASTIKAN KARAKTER DITAMPILKAN KEMBALI DI SINI ***
    // *******************************************************************
    hugoAnimationImg.classList.remove("hidden-element"); // Menampilkan kembali Hugo
    heheAnimationImg.classList.remove("hidden-element"); // Menampilkan kembali Hehe
    vsAnimationImg.classList.add("hidden-element"); // Ikon VS tetap tersembunyi di fase hasil

    // Berikan sedikit waktu agar elemen render sebelum transisi opacity
    setTimeout(() => {
      hugoAnimationImg.classList.add("fade-in");
      heheAnimationImg.classList.add("fade-in");
    }, 350); // Delay sama atau lebih besar dari transisi opacity battle container

    // Perbarui UI karakter di arena menjadi frame terakhir atau winner pose
    if (randomOutcome === "hugo") {
      playAnimation(hugoAnimationImg, animations.hugoWin); // Hugo menang
      playAnimation(heheAnimationImg, animations.heheLose); // <--- KOREKSI: Hehe KALAH
      winnerChar = "Hugo";
      resultWinnerImg.src = "assets/icons/hugo-icon.png";
      resultVictoryText.textContent = "VICTORY";
      resultVictoryText.style.color = "#76ff03"; // Hijau terang
    } else if (randomOutcome === "hehe") {
      // Bagian ini sudah benar: Hehe menang, Hugo kalah
      playAnimation(heheAnimationImg, animations.heheWin);
      playAnimation(hugoAnimationImg, animations.hugoLose);
      winnerChar = "Hehe";
      resultWinnerImg.src = "assets/icons/hehe-icon.png";
      resultVictoryText.textContent = "VICTORY";
      resultVictoryText.style.color = "#76ff03"; // Hijau terang
    } else {
      // Seri/Imbang
      // Bagian ini sudah benar
      playAnimation(hugoAnimationImg, animations.drawAnimation);
      playAnimation(heheAnimationImg, animations.drawAnimation);
      winnerChar = "Draw";
      resultWinnerImg.src = "assets/icons/draw-icon.png";
      resultVictoryText.textContent = "DRAW!";
      resultVictoryText.style.color = "#ffeb3b"; // Kuning
    }

    // Perbarui detail taruhan dan koin user di overlay hasil
    resultIdSpan.textContent = "1119084843"; // ID dummy
    resultBetAmountSpan.textContent = selectedBetOption ? currentBetAmount : 0;

    if (selectedBetOption === randomOutcome) {
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
      wonAmount = 0; // Kalah
      if (selectedBetOption) {
        // Hanya kurangi koin jika user benar-benar pasang bet
        userBalance -= currentBetAmount;
      }
      currentWonSpan.textContent = "0";
    }
    resultWonAmountSpan.textContent = wonAmount;
    userCoinsSpan.textContent = userBalance; // Perbarui saldo koin di footer

    // Update daftar "Biggest Winners" (menggunakan data dummy)
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
    updateGameHistory(randomOutcome);

    // Memulai countdown untuk menutup overlay hasil
    let resultTimeLeft = 5;
    resultCountdownSpan.textContent = `${resultTimeLeft}s`;
    if (resultTimer) clearInterval(resultTimer); // Pastikan timer sebelumnya berhenti

    resultTimer = setInterval(() => {
      resultTimeLeft--;
      resultCountdownSpan.textContent = `${resultTimeLeft}s`;
      if (resultTimeLeft <= 0) {
        clearInterval(resultTimer);
        hideResultAndStartNewRound(); // Mulai putaran baru setelah hasil selesai ditampilkan
      }
    }, 1000);
  }
}

/**
 * Menyembunyikan overlay hasil dan menginisialisasi ulang game untuk putaran baru.
 */
function hideResultAndStartNewRound() {
  resultOverlay.classList.remove("fade-in"); // Hapus fade-in dari overlay hasil
  setTimeout(() => {
    resultOverlay.classList.remove("active-display"); // Hapus display flex
    resultOverlay.style.display = "none"; // Sembunyikan sepenuhnya setelah transisi
  }, 300); // Sesuaikan dengan durasi transisi opacity di CSS Anda

  clearInterval(resultTimer); // Pastikan timer hasil berhenti

  stopAllAnimations(); // Pastikan semua animasi berhenti

  // Reset status taruhan dan UI terkait
  selectedBetOption = null;
  betOptions.forEach((option) => option.classList.remove("active"));
  currentBetAmount = 10; // Reset ke default jumlah bet
  betInput.value = currentBetAmount;
  currentWonSpan.textContent = "0"; // Reset jumlah kemenangan di footer

  currentRound++; // Naikkan nomor putaran
  currentRoundSpan.textContent = currentRound;
  startBetCountdown(); // Mulai fase "Bet Time" untuk putaran baru
}

// =========================================================
// Bagian 4: Event Listeners (Interaksi Pengguna)
// =========================================================

// Event listener untuk pilihan taruhan (Hugo, Seri, Hehe)
betOptions.forEach((option) => {
  option.addEventListener("click", () => {
    if (isBattleInProgress) return; // Jangan izinkan taruhan saat battle berlangsung

    // Logika toggle pilihan taruhan:
    if (selectedBetOption === option.dataset.option) {
      // Jika opsi yang sama diklik lagi, batalkan pilihan (toggle off)
      selectedBetOption = null;
      option.classList.remove("active");
      document.getElementById(`${option.dataset.option}-bet`).textContent = "0";
      return; // Keluar dari fungsi karena sudah di-toggle off
    }

    // Hapus kelas 'active' dari semua opsi lain dan reset tampilan bet mereka
    betOptions.forEach((opt) => {
      opt.classList.remove("active");
      document.getElementById(`${opt.dataset.option}-bet`).textContent = "0";
    });

    // Tambahkan kelas 'active' ke opsi yang baru diklik
    option.classList.add("active");
    selectedBetOption = option.dataset.option; // Simpan opsi yang dipilih

    // Tampilkan jumlah taruhan saat ini pada opsi yang dipilih
    document.getElementById(`${selectedBetOption}-bet`).textContent =
      currentBetAmount;
  });
});

// Event listener untuk tombol (-) mengurangi jumlah taruhan
betMinusBtn.addEventListener("click", () => {
  if (isBattleInProgress) return;
  if (currentBetAmount > 10) {
    // Batas minimal bet adalah 10 koin
    currentBetAmount -= 10; // Kurangi 10 koin
    betInput.value = currentBetAmount;
    // Perbarui tampilan bet pada opsi yang dipilih (jika ada)
    if (selectedBetOption) {
      document.getElementById(`${selectedBetOption}-bet`).textContent =
        currentBetAmount;
    }
  }
});

// Event listener untuk tombol (+) menambah jumlah taruhan
betPlusBtn.addEventListener("click", () => {
  if (isBattleInProgress) return;
  // Maksimal bet adalah saldo koin yang dimiliki user
  if (currentBetAmount + 10 <= userBalance) {
    // Pastikan setelah ditambah tidak melebihi saldo
    currentBetAmount += 10; // Tambah 10 koin
    betInput.value = currentBetAmount;
    // Perbarui tampilan bet pada opsi yang dipilih (jika ada)
    if (selectedBetOption) {
      document.getElementById(`${selectedBetOption}-bet`).textContent =
        currentBetAmount;
    }
  } else if (currentBetAmount < userBalance) {
    // Jika tidak bisa menambah 10, tambahkan sisa hingga saldo maksimal
    currentBetAmount = userBalance; // Set jumlah bet ke saldo maksimal
    betInput.value = currentBetAmount;
    if (selectedBetOption) {
      document.getElementById(`${selectedBetOption}-bet`).textContent =
        currentBetAmount;
    }
  } else {
    // Opsional: berikan feedback visual bahwa saldo tidak cukup
    console.log("Saldo tidak cukup untuk menambah bet lebih banyak!");
  }
});

// Event listener untuk menutup overlay hasil secara manual
closeResultButton.addEventListener("click", hideResultAndStartNewRound);

// === EVENT LISTENERS UNTUK LEADERBOARD ===
leaderboardTabs.forEach((tab) => {
  tab.addEventListener("click", handleLeaderboardTabClick);
});

leaderboardDateOptions.forEach((dateBtn) => {
  dateBtn.addEventListener("click", handleLeaderboardDateClick);
});

// =========================================================
// Bagian 5: Fungsi Leaderboard & Riwayat Result
// =========================================================

/**
 * Mengisi daftar leaderboard berdasarkan tab (local/global) dan tanggal (today/yesterday).
 * @param {string} tab - 'local' atau 'global'.
 * @param {string} date - 'today' atau 'yesterday'.
 */
function populateLeaderboard(tab, date) {
  const listContainer = document.getElementById(`${tab}-${date}`);
  if (
    listContainer &&
    leaderboardData &&
    leaderboardData[tab] &&
    leaderboardData[tab][date]
  ) {
    listContainer.innerHTML = leaderboardData[tab][date]
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
    console.warn(`Leaderboard data not found for ${tab}-${date}`);
    if (listContainer) {
      listContainer.innerHTML =
        '<div class="leaderboard-item">No data available.</div>';
    }
  }
}

/**
 * Menangani klik pada tombol tab leaderboard (Local/Global).
 * @param {Event} event - Objek event klik.
 */
function handleLeaderboardTabClick(event) {
  const tab = event.target.dataset.tab;
  if (tab) {
    // Hapus kelas 'active' dari semua tombol tab
    leaderboardTabs.forEach((btn) => btn.classList.remove("active"));
    // Tambahkan kelas 'active' ke tombol yang diklik
    event.target.classList.add("active");

    // Dapatkan tanggal yang sedang aktif
    const activeDateButton = document.querySelector(
      ".leaderboard-date-options .date-button.active"
    );
    const activeDate = activeDateButton
      ? activeDateButton.dataset.date
      : "today"; // Default to 'today'

    // Sembunyikan semua daftar leaderboard
    leaderboardLists.forEach((list) => list.classList.add("hidden"));

    // Tampilkan daftar yang sesuai dengan tab dan tanggal aktif
    const targetList = document.getElementById(`${tab}-${activeDate}`);
    if (targetList) {
      targetList.classList.remove("hidden");
      populateLeaderboard(tab, activeDate); // Isi ulang data
    }
  }
}

/**
 * Menangani klik pada tombol opsi tanggal leaderboard (Today/Yesterday).
 * @param {Event} event - Objek event klik.
 */
function handleLeaderboardDateClick(event) {
  const date = event.target.dataset.date;
  if (date) {
    // Hapus kelas 'active' dari semua tombol tanggal
    leaderboardDateOptions.forEach((btn) => btn.classList.remove("active"));
    // Tambahkan kelas 'active' ke tombol yang diklik
    event.target.classList.add("active");

    // Dapatkan tab yang sedang aktif
    const activeTabButton = document.querySelector(
      ".leaderboard-tabs .tab-button.active"
    );
    const activeTab = activeTabButton ? activeTabButton.dataset.tab : "local"; // Default to 'local'

    // Sembunyikan semua daftar leaderboard
    leaderboardLists.forEach((list) => list.classList.add("hidden"));

    // Tampilkan daftar yang sesuai dengan tab dan tanggal aktif
    const targetList = document.getElementById(`${activeTab}-${date}`);
    if (targetList) {
      targetList.classList.remove("hidden");
      populateLeaderboard(activeTab, date); // Isi ulang data
    }
  }
}

/**
 * Menambahkan hasil putaran ke riwayat game dan memperbarui tampilan.
 * @param {string} winner - 'hugo', 'hehe', atau 'draw'.
 */
function updateGameHistory(winner) {
  // Tambahkan hasil terbaru di awal array (agar yang terbaru muncul paling kiri/atas)
  gameHistory.unshift(winner);
  if (gameHistory.length > 10) {
    // Batasi riwayat hingga 10 hasil terakhir
    gameHistory.pop(); // Hapus item terlama jika melebihi batas
  }

  if (historyItemsContainer) {
    // Bangun string HTML untuk item riwayat
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
        // Tambahkan kelas 'history-item' dan kelas spesifik untuk warna
        return `<div class="history-item ${className}">${text}</div>`;
      })
      .join(""); // Gabungkan semua item menjadi satu string HTML
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

  // Menginisialisasi leaderboard dengan data default (local, today)
  populateLeaderboard("local", "today");

  // Memulai fase "Bet Time" untuk putaran pertama game
  startBetCountdown();
});
