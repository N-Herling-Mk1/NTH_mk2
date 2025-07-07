// ring.js
import { viridisGradient } from '../utils/gradient.js';

export function ring(ctx, dataArray, canvas) {
  const bufferLength = dataArray.length;
  const cx = canvas.width / 2, cy = canvas.height / 2, radius = 40;

  for (let i = 0; i < bufferLength; i++) {
    const angle = (i / bufferLength) * Math.PI * 2;
    const len = dataArray[i] / 2;
    const x1 = cx + Math.cos(angle) * radius;
    const y1 = cy + Math.sin(angle) * radius;
    const x2 = cx + Math.cos(angle) * (radius + len);
    const y2 = cy + Math.sin(angle) * (radius + len);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = viridisGradient[Math.floor((dataArray[i] / 255) * (viridisGradient.length - 1))];
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}
