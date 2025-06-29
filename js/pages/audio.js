// Element references
const dropZone = document.getElementById('dropZone');
const audioPlayer = document.getElementById('audioPlayer');
const playlist = document.getElementById('playlist');
const canvas = document.getElementById('spectrum');
const ctx = canvas.getContext('2d');
const playPauseBtn = document.getElementById('playPauseBtn');
const rewindBtn = document.getElementById('rewindBtn');
const forwardBtn = document.getElementById('forwardBtn');
const progressSlider = document.getElementById('progressSlider');
const trackTitle = document.getElementById('trackTitle');

// Track list & current track index
let tracks = [];
let currentIndex = -1;

// Audio context & analyser setup variables
let audioContext, analyser, source, dataArray, bufferLength;

// Viridis-style gradient for colors
const viridisGradient = [
  "#440154", "#482878", "#3E4989", "#31688E", "#26828E",
  "#1F9E89", "#35B779", "#6DCD59", "#B4DE2C", "#FDE725"
];

// Setup Web Audio API context and analyser node
function setupAudioContext() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 128; // 64 frequency bins
  bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);

  source = audioContext.createMediaElementSource(audioPlayer);
  source.connect(analyser);
  analyser.connect(audioContext.destination);
}

// Visualizer state
let currentVisualizer = 'bars';
let drawLoopId;

// Visualizer mode radio buttons event listener
document.querySelectorAll('input[name="vizMode"]').forEach(radio => {
  radio.addEventListener('change', e => {
    currentVisualizer = e.target.value;
    cancelAnimationFrame(drawLoopId);
    runVisualizer();
  });
});

// Main visualizer animation loop
function runVisualizer() {
  if (!analyser) return;

  analyser.getByteFrequencyData(dataArray);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  switch (currentVisualizer) {
    case 'bars': drawBars(); break;
    case 'wave': drawWave(); break;
    case 'ring': drawRing(); break;
    case 'matrix': drawMatrix(); break;
    case 'orbit': drawOrbit(); break;
  }

  drawLoopId = requestAnimationFrame(runVisualizer);
}

// Bars visualizer
function drawBars() {
  const barWidth = canvas.width / bufferLength;
  for (let i = 0; i < bufferLength; i++) {
    const val = dataArray[i];
    const height = (val / 255) * canvas.height;
    const colorIndex = Math.floor((val / 255) * (viridisGradient.length - 1));
    ctx.fillStyle = viridisGradient[colorIndex];
    ctx.fillRect(i * barWidth, canvas.height - height, barWidth, height);
  }
}

// Wave visualizer - multi-colored chaotic sine waves by frequency bands
function drawWave() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const numBands = 5; // split into 5 frequency bands
  const bandWidth = Math.floor(bufferLength / numBands);
  const colors = ['#FF4B4B', '#FFAA33', '#33FF99', '#3399FF', '#AA33FF'];

  for (let b = 0; b < numBands; b++) {
    // Average amplitude in this band
    const bandData = dataArray.slice(b * bandWidth, (b + 1) * bandWidth);
    const amplitude = bandData.reduce((a, v) => a + v, 0) / bandData.length;

    ctx.strokeStyle = colors[b];
    ctx.lineWidth = 2;
    ctx.beginPath();

    // Use a random phase offset based on time and band to create chaotic effect
    const time = performance.now() / 1000;
    const phaseOffset = time * (b + 1) * 2;

    for (let x = 0; x < canvas.width; x++) {
      // Frequency controls sine wave "frequency"
      const freq = 0.02 + 0.005 * b;
      // Add some randomness to amplitude for chaos
      const noise = (Math.random() - 0.5) * 5;

      const y = canvas.height / 2 +
                Math.sin(x * freq + phaseOffset) * (amplitude / 2) +
                noise;

      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

// Ring visualizer
function drawRing() {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const radius = 40;
  for (let i = 0; i < bufferLength; i++) {
    const angle = (i / bufferLength) * Math.PI * 2;
    const length = dataArray[i] / 2;
    const x1 = cx + Math.cos(angle) * radius;
    const y1 = cy + Math.sin(angle) * radius;
    const x2 = cx + Math.cos(angle) * (radius + length);
    const y2 = cy + Math.sin(angle) * (radius + length);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    const colorIndex = Math.floor((dataArray[i] / 255) * (viridisGradient.length - 1));
    ctx.strokeStyle = viridisGradient[colorIndex];
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

// Matrix visualizer
function drawMatrix() {
  ctx.font = '16px monospace';
  for (let i = 0; i < bufferLength; i++) {
    const val = dataArray[i];
    const chars = '01';
    const char = chars[Math.floor(Math.random() * chars.length)];
    const x = (i / bufferLength) * canvas.width;
    const y = canvas.height - (val / 255) * canvas.height;
    ctx.fillStyle = '#0f0';
    ctx.fillText(char, x, y);
  }
}

// Orbit visualizer - rotating satellites around a sphere
let rotationAngle = 0;
const orbitRadius = 100;
const satelliteRadius = 5;
const numSatellites = 30;

// Generate satellites with spherical coords (theta, phi)
const satellites = [];
for (let i = 0; i < numSatellites; i++) {
  const theta = Math.acos(1 - 2 * (i + 0.5) / numSatellites);
  const phi = Math.PI * (1 + Math.sqrt(5)) * i; // golden angle
  satellites.push({ theta, phi });
}

// Project 3D point to 2D canvas
function project(x, y, z) {
  const distance = 400;
  const scale = distance / (distance + z);
  return {
    x: canvas.width / 2 + x * scale,
    y: canvas.height / 2 + y * scale,
    scale
  };
}

// Rotate point around Y axis
function rotateY(x, z, angle) {
  return {
    x: x * Math.cos(angle) - z * Math.sin(angle),
    z: x * Math.sin(angle) + z * Math.cos(angle)
  };
}

function drawOrbit() {
  rotationAngle += 0.01;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  satellites.forEach((sat, i) => {
    // Sphere 3D coords
    let x = orbitRadius * Math.sin(sat.theta) * Math.cos(sat.phi);
    let y = orbitRadius * Math.cos(sat.theta);
    let z = orbitRadius * Math.sin(sat.theta) * Math.sin(sat.phi);

    // Rotate around Y axis
    const rotated = rotateY(x, z, rotationAngle);
    x = rotated.x;
    z = rotated.z;

    // Project to 2D
    const pos = project(x, y, z);

    // Map frequency data to satellite color
    const freqVal = dataArray[i % bufferLength];
    const colorIndex = Math.floor((freqVal / 255) * (viridisGradient.length - 1));
    ctx.fillStyle = viridisGradient[colorIndex];

    // Draw satellite as circle with size based on scale (perspective)
    const size = satelliteRadius * pos.scale;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
    ctx.fill();
  });
}

// Render playlist
function renderPlaylist() {
  playlist.innerHTML = '';
  tracks.forEach((track, index) => {
    const li = document.createElement('li');
    li.textContent = track.name;
    if (index === currentIndex) li.classList.add('active');
    li.addEventListener('click', () => playTrack(index));
    playlist.appendChild(li);
  });
}

// Play a track
function playTrack(index) {
  if (index < 0 || index >= tracks.length) return;
  currentIndex = index;
  audioPlayer.src = tracks[index].url;
  audioPlayer.play();
  trackTitle.textContent = tracks[index].name;
  renderPlaylist();
}

// Drag and drop handling
dropZone.addEventListener('dragover', e => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('audio/'));

  files.forEach(file => {
    const url = URL.createObjectURL(file);
    tracks.push({ name: file.name, url });
  });

  renderPlaylist();

  if (currentIndex === -1 && tracks.length > 0) playTrack(0);
});

// Custom controls
playPauseBtn.addEventListener('click', () => {
  if (audioPlayer.paused) audioPlayer.play();
  else audioPlayer.pause();
});

// Toggle play/pause icon on button
audioPlayer.addEventListener('play', () => {
  playPauseBtn.textContent = '⏸️';
  if (!audioContext) {
    setupAudioContext();
    runVisualizer();
  } else if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
});

audioPlayer.addEventListener('pause', () => {
  playPauseBtn.textContent = '▶️';
});

rewindBtn.addEventListener('click', () => {
  audioPlayer.currentTime = Math.max(audioPlayer.currentTime - 10, 0);
});

forwardBtn.addEventListener('click', () => {
  audioPlayer.currentTime = Math.min(audioPlayer.currentTime + 10, audioPlayer.duration);
});

progressSlider.addEventListener('input', e => {
  if (audioPlayer.duration) {
    audioPlayer.currentTime = (e.target.value / 100) * audioPlayer.duration;
  }
});

audioPlayer.addEventListener('timeupdate', () => {
  if (audioPlayer.duration) {
    const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressSlider.value = percent;
  }
});

// Setup canvas size for high-DPI displays
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * dpr;
  canvas.height = canvas.clientHeight * dpr;
  ctx.scale(dpr, dpr);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
