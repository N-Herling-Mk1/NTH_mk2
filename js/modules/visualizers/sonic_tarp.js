import { viridisGradient } from '../utils/gradient.js';

const gridSize = 30;
const spacing = 20;
let bounceMultiplier = 40; // Default value, controlled by UI slider

const points = [];
for (let i = 0; i <= gridSize; i++) {
  for (let j = 0; j <= gridSize; j++) {
    points.push({
      baseX: i - gridSize / 2,
      baseZ: j - gridSize / 2,
      y: 0,
      wobblePhaseX: Math.random() * Math.PI * 2,
      wobblePhaseY: Math.random() * Math.PI * 2,
      wobblePhaseZ: Math.random() * Math.PI * 2,
    });
  }
}

// --- Rotation Utilities ---
function rotateY(x, z, angle) {
  return {
    x: x * Math.cos(angle) - z * Math.sin(angle),
    z: x * Math.sin(angle) + z * Math.cos(angle),
  };
}

function rotateX(y, z, angle) {
  return {
    y: y * Math.cos(angle) - z * Math.sin(angle),
    z: y * Math.sin(angle) + z * Math.cos(angle),
  };
}

function project(x, y, z, canvas, cameraDist) {
  const scale = cameraDist / (cameraDist + z);
  return {
    x: canvas.width / 2 + x * scale,
    y: canvas.height / 2 + y * scale,
    scale,
  };
}

// --- Main Render Function ---
export function sonic_tarp(ctx, dataArray, canvas, sampleRate = 44100) {
  const time = performance.now() / 1000;

  const rotationAngleY = time * 0.1;
  const rotationAngleX = time * 0.05;
  const cameraDist = 3000;

  const bufferLength = dataArray.length;
  const nyquist = sampleRate / 2;
  const freqPerBin = nyquist / bufferLength;

  // Average amplitude in 300–3000 Hz range
  let vocalSum = 0;
  let vocalCount = 0;
  for (let i = 0; i < bufferLength; i++) {
    const freq = i * freqPerBin;
    if (freq >= 300 && freq <= 3000) {
      vocalSum += dataArray[i];
      vocalCount++;
    }
  }
  const vocalAvg = vocalCount ? vocalSum / vocalCount : 0;
  const intensity = vocalAvg / 255;
  const maxHeight = bounceMultiplier * intensity;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#000011';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.lineCap = 'round';

  const wobbleAmp = 6 * intensity;

  points.forEach((pt) => {
    const xPos = pt.baseX * spacing;
    const zPos = pt.baseZ * spacing;

    const dist = Math.sqrt(pt.baseX * pt.baseX + pt.baseZ * pt.baseZ);
    const wave = Math.sin(dist * 1.5 - time * 3);
    const noise = (Math.random() - 0.5) * 0.05 * intensity * bounceMultiplier;

    pt.y = wave * maxHeight + noise;

    const wobbleX = Math.sin(time * 1.3 + pt.wobblePhaseX) * wobbleAmp;
    const wobbleY = Math.sin(time * 1.7 + pt.wobblePhaseY) * wobbleAmp;
    const wobbleZ = Math.sin(time * 2.1 + pt.wobblePhaseZ) * wobbleAmp;

    pt.renderX = xPos + wobbleX;
    pt.renderY = pt.y + wobbleY;
    pt.renderZ = zPos + wobbleZ;
  });

  drawMeshLines(ctx, canvas, cameraDist, rotationAngleY, rotationAngleX, maxHeight);
}

function drawMeshLines(ctx, canvas, cameraDist, rotY, rotX, maxHeight) {
  for (let i = 0; i <= gridSize; i++) {
    ctx.beginPath();
    for (let j = 0; j <= gridSize; j++) {
      const pt = points[i * (gridSize + 1) + j];
      const rotated = rotatePoint(pt.renderX, pt.renderY, pt.renderZ, rotY, rotX);
      const proj = project(rotated.x, rotated.y, rotated.z, canvas, cameraDist);
      ctx.strokeStyle = getColor(pt.renderY, maxHeight);
      j === 0 ? ctx.moveTo(proj.x, proj.y) : ctx.lineTo(proj.x, proj.y);
    }
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  for (let j = 0; j <= gridSize; j++) {
    ctx.beginPath();
    for (let i = 0; i <= gridSize; i++) {
      const pt = points[i * (gridSize + 1) + j];
      const rotated = rotatePoint(pt.renderX, pt.renderY, pt.renderZ, rotY, rotX);
      const proj = project(rotated.x, rotated.y, rotated.z, canvas, cameraDist);
      ctx.strokeStyle = getColor(pt.renderY, maxHeight);
      i === 0 ? ctx.moveTo(proj.x, proj.y) : ctx.lineTo(proj.x, proj.y);
    }
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function rotatePoint(x, y, z, angleY, angleX) {
  let r = rotateY(x, z, angleY);
  let rx = rotateX(y, r.z, angleX);
  return { x: r.x, y: rx.y, z: rx.z };
}

function getColor(height, maxHeight) {
  let index = Math.floor(((height + maxHeight) / (2 * maxHeight)) * (viridisGradient.length - 1));
  index = Math.min(Math.max(index, 0), viridisGradient.length - 1);
  return viridisGradient[index];
}

// --- External Setter for Slider Control ---
export function setBounceMultiplier(value) {
  bounceMultiplier = value;
}
