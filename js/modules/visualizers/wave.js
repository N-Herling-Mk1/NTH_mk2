// wave.js
export function wave(ctx, dataArray, canvas) {
  const bufferLength = dataArray.length;
  const bands = 5;
  const bandWidth = Math.floor(bufferLength / bands);
  const colors = ['#FF4B4B', '#FFAA33', '#33FF99', '#3399FF', '#AA33FF'];
  const time = performance.now() / 1000;

  for (let b = 0; b < bands; b++) {
    const bandData = dataArray.slice(b * bandWidth, (b + 1) * bandWidth);
    const amp = bandData.reduce((a, v) => a + v, 0) / bandData.length;
    const phase = time * (b + 1) * 2;

    ctx.strokeStyle = colors[b];
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let x = 0; x < canvas.width; x++) {
      const freq = 0.02 + 0.005 * b;
      const y = canvas.height / 2 +
        Math.sin(x * freq + phase) * (amp / 2) +
        (Math.random() - 0.5) * 5;

      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }

    ctx.stroke();
  }
}
