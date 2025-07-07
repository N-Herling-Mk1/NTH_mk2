const alertDisplay = document.getElementById('alertDisplay');

function createSpark() {
  const spark = document.createElement('div');
  spark.classList.add('spark');

  const maxX = alertDisplay.clientWidth - 10;
  const maxY = alertDisplay.clientHeight - 10;
  spark.style.left = `${Math.random() * maxX}px`;
  spark.style.top = `${Math.random() * maxY}px`;

  alertDisplay.appendChild(spark);

  let flickerCount = 0;
  const flickerLimit = 10 + Math.floor(Math.random() * 20);

  function flicker() {
    flickerCount++;
    spark.style.opacity = 0.4 + Math.random() * 0.6;
    spark.style.transform = `scale(${0.5 + Math.random()}) rotate(${Math.random() * 30}deg)`;
    if (flickerCount < flickerLimit) {
      setTimeout(flicker, 50 + Math.random() * 150);
    } else {
      spark.remove();
    }
  }
  flicker();
}

export function animateSparks(duration = 4000) {
  const interval = setInterval(createSpark, 300);
  setTimeout(() => clearInterval(interval), duration);
}

export function powerOnAnimation() {
  alertDisplay.textContent = 'Powering ON...';
  animateSparks(5000);
}
