function startOfDay(d) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

function daysBetween(a, b) {
  return Math.round((startOfDay(b) - startOfDay(a)) / 86400000);
}

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
  if (daysSince < 0) daysSince = daysBetween(start, new Date());
  return ((daysSince % 6) + 6) % 6;
}

function dateKey(prefix, d = new Date()) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return `${prefix}:${date.toISOString().slice(0, 10)}`;
}

function todayKey(prefix) {
  return dateKey(prefix, new Date());
}

function readStorage(key) {
  try { return JSON.parse(localStorage.getItem(key) || "{}"); } catch { return {}; }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function renderHeader() {
  const now = new Date();
  const dateEl = document.getElementById("liveDate");
  const timeEl = document.getElementById("liveTime");
  if (dateEl) dateEl.textContent = now.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  if (timeEl) timeEl.textContent = now.toLocaleTimeString();
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
  if (!el) return;
  if (!("geolocation" in navigator)) {
    el.textContent = "Weather unavailable";
    return;
  }
  navigator.geolocation.getCurrentPosition(async (pos) => {
    try {
      const { latitude, longitude } = pos.coords;
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code`);
      const json = await res.json();
      const c = json.current;
      el.textContent = `${Math.round(c.temperature_2m)}°C · ${weatherCodeToText(c.weather_code)} · ${c.relative_humidity_2m}% humidity`;
      const hint = document.getElementById("hydrationHint");
      if (hint) {
        if (c.temperature_2m >= 30) {
          hint.style.display = "block";
          hint.textContent = `It's ${Math.round(c.temperature_2m)}°C — aim for the top end of 4–4.5L water today and keep electrolytes close on training days.`;
        } else {
          hint.style.display = "none";
        }
      }
    } catch (e) {
      el.textContent = "Weather unavailable";
    }
  }, () => {
    el.textContent = "Enable location to see local weather";
  });
}

function updateAdherenceSummary() {
  const target = document.getElementById("adherenceSummary");
  const streakEl = document.getElementById("adherenceStreak");
  const daysEl = document.getElementById("adherenceDays");
  if (!target && !streakEl && !daysEl) return;

  const entry = readStorage(todayKey("adherence"));
  const checked = Number(entry.score || 0);
  const label = checked >= 85 ? "Excellent" : checked >= 70 ? "Solid" : "Needs a reset";
  if (target) target.textContent = `${checked}% complete · ${label}`;

  let streak = 0;
  const cursor = new Date();
  while (true) {
    const score = Number(readStorage(dateKey("adherence", cursor)).score || 0);
    if (score >= 75) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  if (streakEl) streakEl.textContent = `${streak} day streak`;
  if (daysEl) daysEl.textContent = `Today: ${checked}% adherence`;
}

function renderPlannerPage() {
  const now = new Date();
  const weekday = now.getDay();
  const info = getProgramInfo(now);

  const bannerEl = document.getElementById("programBanner");
  if (bannerEl) {
    if (!info.started) {
      bannerEl.textContent = `Program starts ${new Date(PROGRAM_START_DATE + "T00:00:00").toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}.`;
    } else {
      bannerEl.textContent = `Week ${info.weekNumber} · Block ${info.block}${info.isDeload ? " · DELOAD WEEK" : ""}`;
    }
  }

  const split = WEEKLY_SPLIT[weekday];
  const focusEl = document.getElementById("todayFocus");
  const repsEl = document.getElementById("todayReps");
  const musclesEl = document.getElementById("todayMuscles");
  if (focusEl) focusEl.textContent = split.focus;
  if (repsEl) repsEl.textContent = split.reps;
  if (musclesEl) musclesEl.textContent = split.muscles;

  const exList = (info.started && info.block === "B" ? EXERCISES_BLOCK_B : EXERCISES_BLOCK_A)[weekday] || [];
  const exEl = document.getElementById("exerciseList");
  if (exEl) {
    exEl.innerHTML = "";
    if (exList.length === 0) {
      exEl.innerHTML = "<li>Full rest day — no lifting.</li>";
    } else {
      exList.forEach((ex) => {
        const li = document.createElement("li");
        li.textContent = info.isDeload ? `${ex} · deload volume` : ex;
        exEl.appendChild(li);
      });
    }
  }

  const targetsEl = document.getElementById("targetsList");
  if (targetsEl) {
    targetsEl.innerHTML = "";
    TARGETS.forEach(([k, v]) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${k}:</strong> ${v}`;
      targetsEl.appendChild(li);
    });
  }

  renderPrivateSection();
  renderWaterTracker();
  updateAdherenceSummary();
  setupReminderControls();
}

async function renderPrivateSection() {
  const loggedOut = document.getElementById("privateLoggedOut");
  const loggedIn = document.getElementById("privateLoggedIn");
  if (!loggedOut || !loggedIn) return;
  try {
    const res = await fetch("/api/private-data", { credentials: "same-origin" });
    if (res.status === 401) {
      loggedOut.style.display = "block";
      loggedIn.style.display = "none";
      document.getElementById("loginError").textContent = "";
      return;
    }
    const data = await res.json();
    loggedOut.style.display = "none";
    loggedIn.style.display = "block";
    renderPrivateData(data);
  } catch (e) {
    loggedOut.style.display = "block";
    loggedIn.style.display = "none";
    document.getElementById("loginError").textContent = "Couldn’t reach the server — try again.";
  }
}

function renderPrivateData(data) {
  const medEl = document.getElementById("medList");
  const supEl = document.getElementById("supList");
  if (!medEl || !supEl) return;

  const medKey = todayKey("meds");
  const medState = readStorage(medKey);
  medEl.innerHTML = "";
  data.medications.forEach((m, i) => {
    const li = document.createElement("li");
    li.innerHTML = `<label><input type="checkbox" ${medState[i] ? "checked" : ""}> <strong>${m.time}</strong> — ${m.name} <span class="note">${m.note}</span></label>`;
    medEl.appendChild(li);
    li.querySelector("input").addEventListener("change", (e) => {
      medState[i] = e.target.checked;
      writeStorage(medKey, medState);
      updateAdherenceSummary();
    });
  });

  const supKey = todayKey("sup");
  const supState = readStorage(supKey);
  supEl.innerHTML = "";
  data.supplements.forEach((s, i) => {
    const li = document.createElement("li");
    li.innerHTML = `<label><input type="checkbox" ${supState[i] ? "checked" : ""}> <strong>${s.time}</strong> — ${s.name}</label><div class="note">${s.how} ${s.note}</div>`;
    supEl.appendChild(li);
    li.querySelector("input").addEventListener("change", (e) => {
      supState[i] = e.target.checked;
      writeStorage(supKey, supState);
      updateAdherenceSummary();
    });
  });
}

function wireLoginForm() {
  const form = document.getElementById("loginForm");
  const logoutBtn = document.getElementById("logoutBtn");
  if (!form || !logoutBtn) return;
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
        renderPrivateSection();
      } else {
        const json = await res.json().catch(() => ({}));
        document.getElementById("loginError").textContent = json.error || "Incorrect password.";
      }
    } finally {
      btn.disabled = false;
    }
  });

  logoutBtn.addEventListener("click", async () => {
    await fetch("/api/logout", { method: "POST", credentials: "same-origin" });
    document.getElementById("privateLoggedOut").style.display = "block";
    document.getElementById("privateLoggedIn").style.display = "none";
  });
}

function renderWaterTracker() {
  const label = document.getElementById("waterCount");
  const addBtn = document.getElementById("waterAdd");
  const resetBtn = document.getElementById("waterReset");
  if (!label || !addBtn || !resetBtn) return;
  const key = todayKey("water");
  let count = parseInt(localStorage.getItem(key) || "0", 10);
  label.textContent = `${count * 250} ml today`;
  addBtn.onclick = () => {
    count += 1;
    localStorage.setItem(key, count);
    label.textContent = `${count * 250} ml today`;
    const entry = readStorage(todayKey("adherence"));
    entry.score = Math.round(Math.min(100, Number(entry.score || 0) + 4));
    writeStorage(todayKey("adherence"), entry);
    updateAdherenceSummary();
  };
  resetBtn.onclick = () => {
    count = 0;
    localStorage.setItem(key, count);
    label.textContent = `${count * 250} ml today`;
  };
}

function setupReminderControls() {
  const btn = document.getElementById("reminderBtn");
  const status = document.getElementById("reminderStatus");
  if (!btn || !status) return;
  btn.onclick = async () => {
    if (!("Notification" in window)) {
      status.textContent = "Browser notifications are unavailable here.";
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      new Notification("Plan reminders enabled", { body: "You’ll get nudges for training, meals, and hydration." });
      status.textContent = "Reminders enabled.";
    } else {
      status.textContent = "Notifications were not enabled.";
    }
  };
}

function renderKitchenPage() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const idx = dietIndexFor(tomorrow);
  const b = BREAKFASTS[idx];
  const l = LUNCHES[idx];
  const d = DINNERS[idx];

  const dateEl = document.getElementById("tomorrowDate");
  if (dateEl) dateEl.textContent = tomorrow.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  fillMealCard("breakfastCard", b);
  fillMealCard("lunchCard", l);
  fillMealCard("dinnerCard", d);

  const snackEl = document.getElementById("snackList");
  if (snackEl) {
    snackEl.innerHTML = "";
    SNACKS.forEach((s) => {
      const li = document.createElement("li");
      li.textContent = s;
      snackEl.appendChild(li);
    });
  }

  const timingEl = document.getElementById("timingList");
  if (timingEl) {
    timingEl.innerHTML = "";
    MEAL_TIMING.forEach(([t, m]) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${t}</strong> — ${m}`;
      timingEl.appendChild(li);
    });
  }

  const shareBtn = document.getElementById("whatsappShare");
  if (shareBtn) {
    shareBtn.onclick = () => {
      const msg = `Tomorrow (${document.getElementById("tomorrowDate").textContent}) meal plan:\n\n` +
        `BREAKFAST: ${b.name}\nIngredients: ${b.ingredients}\nTonight: ${b.prepAhead}\n\n` +
        `LUNCH: ${l.name}\nIngredients: ${l.ingredients}\nTonight: ${l.prepAhead}\n\n` +
        `DINNER: ${d.name}\nIngredients: ${d.ingredients}\nTonight: ${d.prepAhead}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
    };
  }

  const groceryListEl = document.getElementById("groceryList");
  const grocerySummaryEl = document.getElementById("grocerySummary");
  if (groceryListEl) {
    const items = buildGroceryList([b, l, d]);
    groceryListEl.innerHTML = "";
    items.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      groceryListEl.appendChild(li);
    });
    if (grocerySummaryEl) grocerySummaryEl.textContent = `${items.length} items for tomorrow's prep`;
  }
}

function fillMealCard(elId, meal) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.querySelector(".meal-name").textContent = `${meal.name} (${meal.type})`;
  el.querySelector(".meal-ingredients").textContent = meal.ingredients;
  el.querySelector(".meal-prep").textContent = meal.prepAhead;
}

function buildGroceryList(meals) {
  const combined = meals.map((meal) => meal.ingredients).join(",");
  const items = combined
    .split(/,|\+| and |\/|;|\s{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
  const seen = new Set();
  return items.filter((item) => {
    const key = item.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function renderProgressPage() {
  const form = document.getElementById("progressForm");
  const listEl = document.getElementById("progressList");
  const summaryEl = document.getElementById("progressSummary");
  if (!form || !listEl || !summaryEl) return;

  const entries = JSON.parse(localStorage.getItem("progressEntries") || "[]");
  renderProgressEntries(entries, listEl, summaryEl);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const entry = {
      date: new Date().toISOString(),
      weight: document.getElementById("weightInput").value,
      waist: document.getElementById("waistInput").value,
      notes: document.getElementById("notesInput").value.trim(),
    };
    entries.unshift(entry);
    localStorage.setItem("progressEntries", JSON.stringify(entries.slice(0, 12)));
    form.reset();
    renderProgressEntries(entries.slice(0, 12), listEl, summaryEl);
  });
}

function renderProgressEntries(entries, listEl, summaryEl) {
  listEl.innerHTML = "";
  if (!entries.length) {
    listEl.innerHTML = "<li>No entries yet. Add the first check-in.</li>";
    summaryEl.textContent = "Start a simple log to track trends.";
    return;
  }

  const latest = entries[0];
  const prev = entries[1];
  const weightDelta = prev && latest.weight ? (Number(latest.weight) - Number(prev.weight)).toFixed(1) : "—";
  const waistDelta = prev && latest.waist ? (Number(latest.waist) - Number(prev.waist)).toFixed(1) : "—";
  summaryEl.textContent = `Latest check-in: ${latest.weight || "n/a"} kg · ${latest.waist || "n/a"} cm · ${latest.notes || "No notes"}`;

  entries.forEach((entry) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${new Date(entry.date).toLocaleDateString()}</strong> — ${entry.weight || "—"} kg · ${entry.waist || "—"} cm${entry.notes ? ` · ${entry.notes}` : ""}`;
    listEl.appendChild(li);
  });

  const trendEl = document.getElementById("trendSummary");
  if (trendEl) trendEl.textContent = `Weight change vs last entry: ${weightDelta} kg · Waist change: ${waistDelta} cm`;
}

function wireChat() {
  const toggle = document.getElementById("chatToggle");
  const panel = document.getElementById("chatPanel");
  if (!toggle || !panel) return;
  toggle.addEventListener("click", () => panel.classList.toggle("open"));

  const form = document.getElementById("chatForm");
  const log = document.getElementById("chatLog");
  const input = document.getElementById("chatInput");
  if (!form || !log || !input) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (!message) return;
    const userMsg = document.createElement("div");
    userMsg.className = "chat-msg chat-user";
    userMsg.textContent = message;
    log.appendChild(userMsg);
    input.value = "";

    const botMsg = document.createElement("div");
    botMsg.className = "chat-msg chat-bot";
    botMsg.textContent = "…";
    log.appendChild(botMsg);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ message }),
      });
      const json = await res.json();
      botMsg.textContent = json.reply || json.error || "No reply.";
    } catch (e2) {
      botMsg.textContent = "Chat is unavailable right now.";
    }
    log.scrollTop = log.scrollHeight;
  });
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("/service-worker.js"));
  }
}

function init() {
  renderHeader();
  loadWeather();
  wireLoginForm();
  wireChat();
  registerServiceWorker();

  const page = document.body.dataset.page;
  if (page === "planner") {
    renderPlannerPage();
  } else if (page === "kitchen") {
    renderKitchenPage();
  } else if (page === "progress") {
    renderProgressPage();
  }

  setInterval(() => {
    renderHeader();
    if (page === "planner") renderPlannerPage();
    if (page === "kitchen") renderKitchenPage();
  }, 60 * 1000);
}

document.addEventListener("DOMContentLoaded", init);
