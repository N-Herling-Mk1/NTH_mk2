// --- imports ----- (Art Vandelay is an importer/exporter)
import { bars } from '../modules/visualizers/bars.js';
import { viridisGradient } from '../modules/utils/gradient.js';
import { wave } from '../modules/visualizers/wave.js';
import { ring } from '../modules/visualizers/ring.js';
import { ripplesVisualizer } from '../modules/visualizers/ripples.js';
import { orbit } from '../modules/visualizers/orbit.js';
import { sonic_tarp, setBounceMultiplier } from '../modules/visualizers/sonic_tarp.js';


(() => {
  // === DOM References ===
  const dropZone = document.getElementById('dropZone');
  const audioPlayer = document.getElementById('audioPlayer');
  const playlist = document.getElementById('playlist');
  const canvas = document.getElementById('canvas_html');
  const ctx = canvas.getContext('2d');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const rewindBtn = document.getElementById('rewindBtn');
  const forwardBtn = document.getElementById('forwardBtn');
  const progressSlider = document.getElementById('progressSlider');
  const trackTitle = document.getElementById('trackTitle');

  const sonicTarpControls = document.getElementById('sonicTarpControls');
  const bounceSlider = document.getElementById('bounceSlider');

  // === Audio Setup ===
  let tracks = [], currentIndex = -1;
  let audioContext, analyser, source, dataArray, bufferLength;
  let currentVisualizer = 'bars';
  let animationId;

  // === Canvas DPI Setup ===
  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // === Audio Context Initialization ===
  function setupAudioContext() {
    if (audioContext) return;
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    source = audioContext.createMediaElementSource(audioPlayer);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
  }

  // === Main animation loop ===
  function runVisualizer() {
    if (!analyser) return;

    analyser.getByteFrequencyData(dataArray);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // === Fallback glowData ===
    const isIdle = !audioPlayer || audioPlayer.paused || audioPlayer.readyState < 3;
    const glowData = isIdle ? new Uint8Array(256).fill(60) : dataArray;

    switch (currentVisualizer) {
      case 'bars':
        bars(ctx, dataArray, canvas, viridisGradient);
        break;
      case 'wave':
        wave(ctx, dataArray, canvas);
        break;
      case 'ring':
        ring(ctx, dataArray, canvas);
        break;
      case 'sonic_tarp':
        sonic_tarp(ctx, dataArray, canvas);
        break;
      case 'orbit':
        orbit(ctx, glowData, canvas, 44100 / 50);
        break;
      case 'ripples':
        ripplesVisualizer(ctx, glowData, canvas, 44100 / 10);
        break;
      default:
        console.warn(`[visualizer] Unknown visualizer: "${currentVisualizer}"`);
    }

    animationId = requestAnimationFrame(runVisualizer);
  }

  // === Playlist Rendering ===
  function renderPlaylist() {
    playlist.innerHTML = '';
    tracks.forEach((track, i) => {
      const li = document.createElement('li');
      li.textContent = track.name;
      if (i === currentIndex) li.classList.add('active');
      li.addEventListener('click', () => playTrack(i));
      playlist.appendChild(li);
    });
  }

  // === Track Playback Handling ===
  function playTrack(index) {
    if (index < 0 || index >= tracks.length) return;
    currentIndex = index;
    audioPlayer.src = tracks[index].url;
    audioPlayer.play();
    trackTitle.textContent = tracks[index].name;
    renderPlaylist();
  }

  // === Drag & Drop Audio Files ===
  dropZone.addEventListener('dragover', e => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', e => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('dragover');

    const files = Array.from(e.dataTransfer.files);
    const allowedExtensions = ['.mp3', '.wav', '.ogg', '.aac', '.m4a', '.mp4'];

    const acceptedFiles = files.filter(file => {
      const name = file.name.toLowerCase();
      return allowedExtensions.some(ext => name.endsWith(ext));
    });

    if (acceptedFiles.length === 0) {
      alert('Please drop valid audio files (mp3, wav, ogg, aac, m4a, mp4).');
      return;
    }

    acceptedFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      tracks.push({ name: file.name, url });
    });

    if (currentIndex === -1 && tracks.length > 0) {
      playTrack(0);
    }

    renderPlaylist();
  });

  // === Controls ===
  playPauseBtn.addEventListener('click', () => {
    audioPlayer.paused ? audioPlayer.play() : audioPlayer.pause();
  });

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
      progressSlider.value = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    }
  });

  // === Visualizer Mode Switching and Bounce slider visibility ===
  function updateVisualizerControls(name) {
    if (name === 'sonic_tarp') {
      sonicTarpControls.style.display = 'block';
    } else {
      sonicTarpControls.style.display = 'none';
    }
  }

  document.querySelectorAll('input[name="vizMode"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      currentVisualizer = e.target.value;
      updateVisualizerControls(currentVisualizer);
      if (animationId) cancelAnimationFrame(animationId);
      runVisualizer();
    });
  });

  // Bounce slider input event updates bounce multiplier in sonic_tarp
  bounceSlider.addEventListener('input', () => {
    const val = parseFloat(bounceSlider.value);
    setBounceMultiplier(val);
  });

  // Initialize UI state
  updateVisualizerControls(currentVisualizer);

})();
