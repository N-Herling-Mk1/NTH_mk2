import { viridisGradient } from '../utils/gradient.js';

const gridSize = 30; // grid dimension (30x30)
const spacing = 15; // space between points
const rippleSpeed = 0.8; // ripple expansion speed
const maxRippleRadius = gridSize * spacing * 0.7;

function project3D(x, y, z, canvas) {
  // simple perspective projection onto 2D canvas
  const dist = 400;
  const scale = dist / (dist + z);
  return {
    x: canvas.width / 2 + x * scale,
    y: canvas.height / 2 - y * scale,
  };
}

export function ripplesVisualizer(ctx, dataArray, canvas, sampleRate = 44100) {
  const time = performance.now() / 1000;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Center coordinates in plane space
  const centerX = (gridSize / 2) * spacing;
  const centerY = (gridSize / 2) * spacing;

  // For each grid point, calculate ripple height
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const x = i * spacing - centerX;
      const y = j * spacing - centerY;

      // distance from center (ripple origin)
      const distFromCenter = Math.sqrt(x * x + y * y);

      // Calculate ripple wave based on expanding circle radius (time)
      const rippleRadius = (time * rippleSpeed) % maxRippleRadius;

      // Wave effect: difference between current radius and point distance
      const wave = Math.cos((distFromCenter - rippleRadius) * 0.3);

      // Map distFromCenter to freq index for modulation
      const freqIndex = Math.floor((distFromCenter / maxRippleRadius) * dataArray.length);
      const freqVal = dataArray[freqIndex] || 0;

      // Height modulated by freqVal and wave amplitude
      const height = wave * (freqVal / 255) * 50;

      // Project 3D point (x, y, height) to 2D canvas coords
      const pos2D = project3D(x, y, height, canvas);

      // Color index based on height, map to viridisGradient
      const colorIndex = Math.min(
        viridisGradient.length - 1,
        Math.floor(((height + 50) / 100) * viridisGradient.length)
      );
      const color = viridisGradient[colorIndex];

      // Draw circle with fuzzy edges (using shadowBlur)
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(pos2D.x, pos2D.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
}
