import { viridisGradient } from '../utils/gradient.js';

const orbitRadius = 100;
const numArcs = 150;
const arcs = [];
const ripples = [];

for (let i = 0; i < numArcs; i++) {
  arcs.push({
    thetaStart: Math.random() * Math.PI,
    phiStart: Math.random() * 2 * Math.PI,
    thetaLength: Math.PI / 6 + Math.random() * Math.PI / 6,
    phiLength: Math.PI / 6 + Math.random() * Math.PI / 6,
    phaseOffset: Math.random() * Math.PI * 2,
  });
}

function rotateY(x, z, angle) {
  return {
    x: x * Math.cos(angle) - z * Math.sin(angle),
    z: x * Math.sin(angle) + z * Math.cos(angle),
  };
}

function project(x, y, z, canvas) {
  const dist = 400;
  const scale = dist / (dist + z);
  return {
    x: canvas.width / 2 + x * scale,
    y: canvas.height / 2 + y * scale,
    scale,
  };
}

// === Ripple system ===
function spawnRipple(x, y, color) {
  ripples.push({
    x,
    y,
    radius: 5,
    maxRadius: 50,
    opacity: 1,
    color
  });
}

function updateAndDrawRipples(ctx) {
  for (let i = ripples.length - 1; i >= 0; i--) {
    const r = ripples[i];
    r.radius += 1.5;
    r.opacity -= 0.05;

    if (r.opacity <= 0) {
      ripples.splice(i, 1);
      continue;
    }

    ctx.beginPath();
    ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
    ctx.strokeStyle = r.color;
    ctx.globalAlpha = r.opacity;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

export function orbit(ctx, dataArray, canvas, sampleRate = 44100 / 50) {
  const time = performance.now() / 2000;
  const rotationAngle = time * 0.05;
  const bufferLength = dataArray.length;

  const nyquist = sampleRate / 2;
  const freqPerBin = nyquist / bufferLength;

  arcs.forEach((arc, i) => {
    const freq = i * freqPerBin;
    const speedBase = getSpeedForFreq(freq);
    const speed = speedBase * (1 + i * 0.05);
    const offset = arc.phaseOffset;
    const progress = (time * speed + offset) % 1;
    const segmentLength = 0.3;
    const steps = 50;

    let startT = progress;
    let endT = progress + segmentLength;
    if (endT > 1) endT -= 1;

    ctx.beginPath();

    function getArcPoint(t) {
      const theta = arc.thetaStart + arc.thetaLength * t;
      const phi = arc.phiStart + arc.phiLength * t;

      let x = orbitRadius * Math.sin(theta) * Math.cos(phi);
      let y = orbitRadius * Math.cos(theta);
      let z = orbitRadius * Math.sin(theta) * Math.sin(phi);

      const rotated = rotateY(x, z, rotationAngle);
      x = rotated.x;
      z = rotated.z;

      return project(x, y, z, canvas);
    }

    const drawSegment = (start, end) => {
      for (let step = 0; step <= steps; step++) {
        const t = start + (end - start) * (step / steps);
        const pos = getArcPoint(t);
        step === 0 ? ctx.moveTo(pos.x, pos.y) : ctx.lineTo(pos.x, pos.y);
      }
    };

    if (startT < endT) {
      drawSegment(startT, endT);
    } else {
      drawSegment(startT, 1);
      drawSegment(0, endT);
    }

    const freqIndex = Math.floor((i / numArcs) * bufferLength);
    const freqVal = dataArray[freqIndex] || 0;
    const colorIndex = Math.floor((freqVal / 255) * (viridisGradient.length - 1));
    const baseColor = viridisGradient[colorIndex];

    ctx.strokeStyle = baseColor;
    ctx.lineWidth = 2 + freqVal / 128;
    ctx.shadowColor = baseColor;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // === Trigger ripple if vocal frequency range and loud enough
    if (freq >= 300 && freq <= 3000 && freqVal > 180) {
      const pos = getArcPoint(0);
      spawnRipple(pos.x, pos.y, baseColor);
    }
  });

  updateAndDrawRipples(ctx);
}

function getSpeedForFreq(freq) {
  if (freq < 300) return 0.1;
  else if (freq < 1000) return 0.3;
  else if (freq < 3000) return 0.5;
  else return 0.7;
}
