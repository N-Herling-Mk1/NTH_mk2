document.addEventListener("DOMContentLoaded", () => {
  const placeholder = document.getElementById("dashboard-placeholder");

  fetch("dashboard.html")
    .then(res => res.text())
    .then(html => {
      placeholder.innerHTML = html;
      initDashboardLogic();
    })
    .catch(err => {
      console.error("Failed to load dashboard:", err);
    });
});

function initDashboardLogic() {
  // 🕒 Local Time
  function updateTime() {
    const now = new Date();
    const timeEl = document.getElementById("localTime");
    if (timeEl) {
      timeEl.textContent = "🕒 " + now.toLocaleTimeString();
    }
  }
  updateTime();
  setInterval(updateTime, 1000);

  // 🤓 Fun Fact
  const funFacts = [
    "Sharks existed before trees.",
    "Bananas are berries, but strawberries aren't.",
    "The moon has moonquakes.",
    "Octopuses have three hearts.",
    "JavaScript was created in 10 days."
  ];
  function showFact() {
    const factEl = document.getElementById("funFact");
    if (factEl) {
      const fact = funFacts[Math.floor(Math.random() * funFacts.length)];
      factEl.textContent = "🤓 Fun Fact: " + fact;
    }
  }
  showFact();
  setInterval(showFact, 10000);

  // 🌡️ Weather - ToDo
  const weatherEl = document.getElementById("weather");
  if (weatherEl) {
    weatherEl.textContent = "🌡️ Weather: ToDo";
  }

  // 💾 RAM Usage (Chrome only)
  const ramEl = document.getElementById("ramUsage");
  if (performance.memory && ramEl) {
    const total = (performance.memory.jsHeapSizeLimit / 1048576).toFixed(1);
    setInterval(() => {
      const used = (performance.memory.usedJSHeapSize / 1048576).toFixed(1);
      ramEl.textContent = `💾 RAM: ${used} / ${total} MB`;
    }, 2000);
  } else if (ramEl) {
    ramEl.textContent = "💾 RAM: N/A";
  }

  // Buttons
  const backBtn = document.getElementById("backBtn");
  const downloadBtn = document.getElementById("downloadCvBtn");

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.location.href = "carousel.html";
    });
  }

  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      window.open("../assets/docs/NHerling_CV.pdf", "_blank");
    });
  }
}
