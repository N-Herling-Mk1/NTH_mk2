export function rotateY(x, z, angle) {
  return {
    x: x * Math.cos(angle) - z * Math.sin(angle),
    z: x * Math.sin(angle) + z * Math.cos(angle)
  };
}

export function project(x, y, z, canvasWidth, canvasHeight) {
  const dist = 400;
  const scale = dist / (dist + z);
  return {
    x: canvasWidth / 2 + x * scale,
    y: canvasHeight / 2 + y * scale,
    scale
  };
}
