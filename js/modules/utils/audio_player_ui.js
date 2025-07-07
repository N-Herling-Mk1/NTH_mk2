// ========== EXPORTS ==========
export {
  loadTrack,
  playlist,
  currentTrackIndex,
  audio,
  playPauseBtn,
  progressSlider,
  volumeSlider,
  isPowerOn,
  togglePower
};



// ========== ELEMENT SELECTORS ==========
const audio = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const stopBtn = document.getElementById('stopBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const volumeSlider = document.getElementById('volumeSlider');
const progressSlider = document.getElementById('progressSlider');
const currentTimeDisplay = document.getElementById('currentTime');
const durationDisplay = document.getElementById('duration');
const trackTitle = document.getElementById('trackTitle');
const powerBtn = document.getElementById('powerBtn');
const pulseBar = document.getElementById('pulseBar');

// ========== STATE ==========
let isPlaying = false;
let isPowerOn = false;
let currentTrackIndex = 0;

const playlist = [
  { title: "Track 1 - Sample", file: "audio/track1.mp3" },
  { title: "Track 2 - Sample", file: "audio/track2.mp3" }
];

// ========== INITIALIZATION ==========

document.addEventListener('DOMContentLoaded', () => {
  init();
});

function init() {
  loadTrack(currentTrackIndex);
  updatePowerUI();
  attachEventListeners();
}

// ========== LOAD TRACK ==========
function loadTrack(index) {
  const track = playlist[index];
  if (!track) return;

  audio.src = track.file;
  trackTitle.textContent = `Now Playing: ${track.title}`;
  audio.load();
}

// ========== AUDIO CONTROLS ==========
function togglePlayPause() {
  if (audio.paused) {
    audio.play();
    isPlaying = true;
    playPauseBtn.textContent = '⏸️';
  } else {
    audio.pause();
    isPlaying = false;
    playPauseBtn.textContent = '▶️';
  }
}

function stopAudio() {
  audio.pause();
  audio.currentTime = 0;
  isPlaying = false;
  playPauseBtn.textContent = '▶️';
}

function playNextTrack() {
  currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
  loadTrack(currentTrackIndex);
  if (isPlaying) audio.play();
}

function playPreviousTrack() {
  currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
  loadTrack(currentTrackIndex);
  if (isPlaying) audio.play();
}

// ========== POWER STATE & PULSE ==========
function togglePower() {
  isPowerOn = !isPowerOn;
  updatePowerUI();

  // Console alert
  console.log(`Power ${isPowerOn ? 'ON' : 'OFF'}`);
}

// Global variable to track current skin, default 'skin1'
let currentSkin = 'skin_x';

function updatePowerUI() {
  if (!pulseBar || !powerBtn) return;

  const container = pulseBar.parentElement; // typically #pulseBarContainer
  const alertBox = document.getElementById('alertDisplay');

  const toggleClass = (el, onClass, offClass) => {
    el.classList.toggle(onClass, isPowerOn);
    el.classList.toggle(offClass, !isPowerOn);
  };

  // Toggle power classes
  toggleClass(container, 'power-on', 'power-off');
  toggleClass(pulseBar, 'power-on', 'power-off');
  toggleClass(powerBtn, 'power-on', 'power-off');

  if (alertBox) {
    if (!isPowerOn) {
      // Power OFF state: red alert, always visible
      alertBox.classList.add('power-off');
      alertBox.classList.remove('power-on', 'skin1', 'skin2', 'skin3');
      alertBox.textContent = 'Power Off';
      alertBox.style.opacity = '1';
      alertBox.style.pointerEvents = 'auto';
    } else {
      // Power ON state: skin color alert, visible
      alertBox.classList.add('power-on', currentSkin);
      alertBox.classList.remove('power-off');
      alertBox.textContent = `Power On — ${currentSkin.replace('skin', 'Skin ')}`;
      alertBox.style.opacity = '1';
      alertBox.style.pointerEvents = 'auto';
    }
  }

  // Ensure the pulse is visible
  pulseBar.style.opacity = '1';
}

//========= SKIN BUTTONS ============
// Call this function when skin buttons are clicked
function updateSkinUI(skinId) {
  currentSkin = skinId;
   console.log(`Skin changed to: ${skinId}`); // ← for dev

  // Update alert display if power is ON
  if (isPowerOn) {
    const alertBox = document.getElementById('alertDisplay');
    if (alertBox) {
      alertBox.classList.remove('skin1', 'skin2', 'skin3');
      alertBox.classList.add(currentSkin);
      alertBox.textContent = `Power On — ${currentSkin.replace('skin', 'Skin ')}`;
    }
  }
}



// ========== PROGRESS & TIME ==========
function updateProgress() {
  if (!progressSlider) return;

  progressSlider.max = audio.duration || 0;
  progressSlider.value = audio.currentTime;

  if (currentTimeDisplay) {
    currentTimeDisplay.textContent = formatTime(audio.currentTime);
  }
  if (durationDisplay) {
    durationDisplay.textContent = formatTime(audio.duration);
  }
}

function formatTime(seconds) {
  if (isNaN(seconds)) return "00:00";
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

// ========== EVENT LISTENERS ==========
function attachEventListeners() {
  console.log("Attaching event listeners...");

  playPauseBtn?.addEventListener('click', togglePlayPause);
  stopBtn?.addEventListener('click', stopAudio);
  nextBtn?.addEventListener('click', playNextTrack);
  prevBtn?.addEventListener('click', playPreviousTrack);
  powerBtn?.addEventListener('click', togglePower);

  volumeSlider?.addEventListener('input', () => {
    audio.volume = volumeSlider.value / 100;
  });

  progressSlider?.addEventListener('input', () => {
    audio.currentTime = progressSlider.value;
  });

  audio.addEventListener('timeupdate', updateProgress);

  // Skin button listeners
  const s1 = document.getElementById('skin1');
  const s2 = document.getElementById('skin2');
  const s3 = document.getElementById('skin3');

  console.log('Skin buttons:', s1, s2, s3);

  s1?.addEventListener('click', () => {
    console.log('Clicked Skin 1');
    updateSkinUI('skin1');
  });

  s2?.addEventListener('click', () => {
    console.log('Clicked Skin 2');
    updateSkinUI('skin2');
  });

  s3?.addEventListener('click', () => {
    console.log('Clicked Skin 3');
    updateSkinUI('skin3');
  });
}



setInterval(pulseAnimation, 150);


