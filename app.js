// ============================================================
// Core date/program math
// ============================================================
function startOfDay(d) { const c = new Date(d); c.setHours(0, 0, 0, 0); return c; }
function daysBetween(a, b) { return Math.round((startOfDay(b) - startOfDay(a)) / 86400000); }

function getProgramInfo(today) {
  const start = new Date(PROGRAM_START_DATE + "T00:00:00");
  const daysSince = daysBetween(start, today);
  if (daysSince < 0) return { started: false, daysSince };
  const weekNumber = Math.floor(daysSince / 7) + 1;
  const isDeload = weekNumber % 4 === 0;
  const cyclePos = (weekNumber - 1) % 8;
  const block = cyclePos < 4 ? "A" : "B";
  return { started: true, daysSince, weekNumber, isDeload, block };
}

function dietIndexFor(today) {
  const start = new Date(PROGRAM_START_DATE + "T00:00:00");
  let daysSince = daysBetween(start, today);
  if (daysSince < 0) daysSince = daysBetween(start, new Date()); // fallback before start date
  return ((daysSince % 6) + 6) % 6;
}

// ============================================================
// Rendering: header (clock + weather)
// ============================================================
function renderHeader() {
  const now = new Date();
  document.getElementById("liveDate").textContent = now.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  document.getElementById("liveTime").textContent = now.toLocaleTimeString();
}

function weatherCodeToText(code) {
  const map = {
    0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Fog", 48: "Fog", 51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle",
    61: "Light rain", 63: "Rain", 65: "Heavy rain", 71: "Light snow", 73: "Snow",
    75: "Heavy snow", 80: "Rain showers", 81: "Rain showers", 82: "Violent showers",
    95: "Thunderstorm", 96: "Thunderstorm w/ hail", 99: "Thunderstorm w/ hail",
  };
  return map[code] || "—";
}

async function loadWeather() {
  const el = document.getElementById("weatherChip");
  if (!("geolocation" in navigator)) {
    el.textContent = "Weather unavailable (no geolocation)";
    return;
  }
  navigator.geolocation.getCurrentPosition(async (pos) => {
    try {
      const { latitude, longitude } = pos.coords;
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code`;
      const res = await fetch(url);
      const json = await res.json();
      const c = json.current;
      el.textContent = `${Math.round(c.temperature_2m)}°C · ${weatherCodeToText(c.weather_code)} · ${c.relative_humidity_2m}% humidity`;
      const hint = document.getElementById("hydrationHint");
      if (c.temperature_2m >= 30) {
        hint.style.display = "block";
        hint.textContent = `It's ${Math.round(c.temperature_2m)}°C — as a heavy sweater, aim for the top end of 4–4.5L water today and don't skip the electrolytes on training days.`;
      } else {
        hint.style.display = "none";
      }
    } catch (e) {
      el.textContent = "Weather unavailable";
    }
  }, () => {
    el.textContent = "Enable location to see local weather & hydration tips";
  });
}

// ============================================================
// LocalStorage check-off helpers
// ============================================================
function todayKey(prefix) {
  const d = new Date();
  return `${prefix}:${d.toISOString().slice(0, 10)}`;
}
function getChecked(key) {
  try { return JSON.parse(localStorage.getItem(key) || "{}"); } catch { return {}; }
}
function setChecked(key, obj) { localStorage.setItem(key, JSON.stringify(obj)); }

// ============================================================
// Render: My Day
// ============================================================
function renderMyDay() {
  const now = new Date();
  const weekday = now.getDay();
  const info = getProgramInfo(now);

  const bannerEl = document.getElementById("programBanner");
  if (!info.started) {
    bannerEl.textContent = `Program starts ${new Date(PROGRAM_START_DATE + "T00:00:00").toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}.`;
  } else {
    bannerEl.textContent = `Week ${info.weekNumber} · Block ${info.block}${info.isDeload ? " · DELOAD WEEK — cut volume ~40–50%" : ""}`;
  }

  const split = WEEKLY_SPLIT[weekday];
  document.getElementById("todayFocus").textContent = split.focus;
  document.getElementById("todayReps").textContent = split.reps;
  document.getElementById("todayMuscles").textContent = split.muscles;

  const exList = (info.started && info.block === "B" ? EXERCISES_BLOCK_B : EXERCISES_BLOCK_A)[weekday] || [];
  const exEl = document.getElementById("exerciseList");
  exEl.innerHTML = "";
  if (exList.length === 0) {
    exEl.innerHTML = "<li>Full rest day — no lifting.</li>";
  } else {
    exList.forEach((ex) => {
      const li = document.createElement("li");
      li.textContent = info.isDeload ? ex + "  (deload: ~40–50% fewer sets)" : ex;
      exEl.appendChild(li);
    });
  }

  // Private area (meds/supplements) — loaded separately via authenticated API call
  loadPrivateSection();

  // Water tracker
  renderWaterTracker();

  // Targets table
  const tEl = document.getElementById("targetsList");
  tEl.innerHTML = "";
  TARGETS.forEach(([k, v]) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${k}:</strong> ${v}`;
    tEl.appendChild(li);
  });
}

// ============================================================
// Private area: login gate + meds/supplements (server-fetched only)
// ============================================================
async function loadPrivateSection() {
  try {
    const res = await fetch("/api/private-data", { credentials: "same-origin" });
    if (res.status === 401) {
      showLoginForm();
      return;
    }
    const data = await res.json();
    renderPrivateData(data);
  } catch (e) {
    showLoginForm("Couldn't reach the server — try again.");
  }
}

function showLoginForm(errorMsg) {
  document.getElementById("privateLoggedOut").style.display = "block";
  document.getElementById("privateLoggedIn").style.display = "none";
  document.getElementById("loginError").textContent = errorMsg || "";
}

function renderPrivateData(data) {
  document.getElementById("privateLoggedOut").style.display = "none";
  document.getElementById("privateLoggedIn").style.display = "block";

  const medKey = todayKey("meds");
  const medState = getChecked(medKey);
  const medEl = document.getElementById("medList");
  medEl.innerHTML = "";
  data.medications.forEach((m, i) => {
    const li = document.createElement("li");
    li.innerHTML = `<label><input type="checkbox" id="med-${i}" ${medState[i] ? "checked" : ""}> <strong>${m.time}</strong> — ${m.name} <span class="note">${m.note}</span></label>`;
    medEl.appendChild(li);
    li.querySelector("input").addEventListener("change", (e) => {
      medState[i] = e.target.checked;
      setChecked(medKey, medState);
    });
  });

  const supKey = todayKey("sup");
  const supState = getChecked(supKey);
  const supEl = document.getElementById("supList");
  supEl.innerHTML = "";
  data.supplements.forEach((s, i) => {
    const li = document.createElement("li");
    li.innerHTML = `<label><input type="checkbox" id="sup-${i}" ${supState[i] ? "checked" : ""}> <strong>${s.time}</strong> — ${s.name}</label><div class="note">${s.how} ${s.note}</div>`;
    supEl.appendChild(li);
    li.querySelector("input").addEventListener("change", (e) => {
      supState[i] = e.target.checked;
      setChecked(supKey, supState);
    });
  });
}

function wireLoginForm() {
  const form = document.getElementById("loginForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const password = document.getElementById("passwordInput").value;
    const btn = form.querySelector("button");
    btn.disabled = true;
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        document.getElementById("passwordInput").value = "";
        loadPrivateSection();
      } else {
        const json = await res.json().catch(() => ({}));
        document.getElementById("loginError").textContent = json.error || "Incorrect password.";
      }
    } finally {
      btn.disabled = false;
    }
  });

  document.getElementById("logoutBtn").addEventListener("click", async () => {
    await fetch("/api/logout", { method: "POST", credentials: "same-origin" });
    showLoginForm();
  });
}

function renderWaterTracker() {
  const key = todayKey("water");
  let count = parseInt(localStorage.getItem(key) || "0", 10);
  const label = document.getElementById("waterCount");
  label.textContent = `${count * 250} ml today`;
  document.getElementById("waterAdd").onclick = () => {
    count += 1;
    localStorage.setItem(key, count);
    label.textContent = `${count * 250} ml today`;
  };
  document.getElementById("waterReset").onclick = () => {
    count = 0;
    localStorage.setItem(key, count);
    label.textContent = `${count * 250} ml today`;
  };
}

// ============================================================
// Render: Mom's Kitchen (tomorrow's prep)
// ============================================================
function renderMomsKitchen() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const idx = dietIndexFor(tomorrow);

  const b = BREAKFASTS[idx], l = LUNCHES[idx], d = DINNERS[idx];

  document.getElementById("tomorrowDate").textContent = tomorrow.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  fillMealCard("breakfastCard", b);
  fillMealCard("lunchCard", l);
  fillMealCard("dinnerCard", d);

  const snackEl = document.getElementById("snackList");
  snackEl.innerHTML = "";
  SNACKS.forEach((s) => {
    const li = document.createElement("li");
    li.textContent = s;
    snackEl.appendChild(li);
  });

  const timingEl = document.getElementById("timingList");
  timingEl.innerHTML = "";
  MEAL_TIMING.forEach(([t, m]) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${t}</strong> — ${m}`;
    timingEl.appendChild(li);
  });

  document.getElementById("whatsappShare").onclick = () => {
    const msg = `Tomorrow (${document.getElementById("tomorrowDate").textContent}) meal plan:\n\n` +
      `BREAKFAST: ${b.name}\nIngredients: ${b.ingredients}\nTonight: ${b.prepAhead}\n\n` +
      `LUNCH: ${l.name}\nIngredients: ${l.ingredients}\nTonight: ${l.prepAhead}\n\n` +
      `DINNER: ${d.name}\nIngredients: ${d.ingredients}\nTonight: ${d.prepAhead}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };
}

function fillMealCard(elId, meal) {
  const el = document.getElementById(elId);
  el.querySelector(".meal-name").textContent = `${meal.name} (${meal.type})`;
  el.querySelector(".meal-ingredients").textContent = meal.ingredients;
  el.querySelector(".meal-prep").textContent = meal.prepAhead;
}

// ============================================================
// Tabs
// ============================================================
function setupTabs() {
  const tabs = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".panel");
  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabs.forEach((b) => b.classList.remove("active"));
      panels.forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.target).classList.add("active");
    });
  });
}

// ============================================================
// Chatbot (read-only Q&A, calls /api/chat which holds the Gemini key server-side)
// ============================================================
function wireChat() {
  const toggle = document.getElementById("chatToggle");
  const panel = document.getElementById("chatPanel");
  toggle.addEventListener("click", () => {
    panel.classList.toggle("open");
  });

  const form = document.getElementById("chatForm");
  const log = document.getElementById("chatLog");
  const input = document.getElementById("chatInput");

  function addMsg(text, who) {
    const div = document.createElement("div");
    div.className = `chat-msg chat-${who}`;
    div.textContent = text;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (!message) return;
    addMsg(message, "user");
    input.value = "";
    addMsg("…", "bot");
    const thinkingEl = log.lastChild;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ message }),
      });
      const json = await res.json();
      thinkingEl.textContent = json.reply || json.error || "No reply.";
    } catch (e2) {
      thinkingEl.textContent = "Chat is unavailable right now.";
    }
  });
}

// ============================================================
// Init
// ============================================================
function init() {
  setupTabs();
  renderHeader();
  setInterval(renderHeader, 1000);
  loadWeather();
  wireLoginForm();
  wireChat();
  renderMyDay();
  renderMomsKitchen();
  // Refresh day-dependent content shortly after local midnight
  setInterval(() => {
    renderMyDay();
    renderMomsKitchen();
  }, 60 * 1000);
}

document.addEventListener("DOMContentLoaded", init);
