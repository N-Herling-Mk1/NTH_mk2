import { viridisGradient } from '../utils/gradient.js';

// bars.js
export function bars(ctx, dataArray, canvas) {
  const bufferLength = dataArray.length;
  const barWidth = canvas.width / bufferLength;
  for (let i = 0; i < bufferLength; i++) {
    const val = dataArray[i];
    const height = (val / 255) * canvas.height;
    const colorIndex = Math.floor((val / 255) * (viridisGradient.length - 1));
    ctx.fillStyle = viridisGradient[colorIndex];
    ctx.fillRect(i * barWidth, canvas.height - height, barWidth, height);
  }
}
