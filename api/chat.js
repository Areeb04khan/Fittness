const { isAuthed } = require("./_auth");
const { privateContextString } = require("./_privateData");
const path = require("path");
const {
  WEEKLY_SPLIT, BREAKFASTS, LUNCHES, DINNERS, SNACKS, MEAL_TIMING, TARGETS,
} = require(path.join(process.cwd(), "data.js"));

function buildPublicContext() {
  const today = new Date();
  const weekday = today.getDay();
  const split = WEEKLY_SPLIT[weekday];
  const idx = ((today.getDate() + today.getMonth() * 31) % 6 + 6) % 6; // rough fallback index
  const targets = TARGETS.map(([k, v]) => `${k}: ${v}`).join(", ");
  const timing = MEAL_TIMING.map(([t, m]) => `${t} ${m}`).join("; ");
  return [
    `Today's training focus: ${split.focus} (${split.reps}) targeting ${split.muscles}.`,
    `Daily nutrition targets: ${targets}.`,
    `Meal timing: ${timing}.`,
    `Diet rotates through 6 breakfast/lunch/dinner options weekly (mix of non-veg and veg), plus snack options: ${SNACKS.join(", ")}.`,
  ].join("\n");
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Server is not configured (GEMINI_API_KEY missing)." });
    return;
  }

  const { message } = req.body || {};
  if (typeof message !== "string" || !message.trim()) {
    res.status(400).json({ error: "Missing message." });
    return;
  }

  const authed = isAuthed(req);
  let context = buildPublicContext();
  if (authed) context += "\n" + privateContextString();

  const systemPrompt =
    "You are a helpful assistant answering questions about this person's personal fitness, diet, and " +
    (authed ? "medication/supplement schedule." : "diet and training schedule. Medication and supplement details are only visible when logged in — if asked about them, say the person needs to log in.") +
    " Only answer using the context provided below. Be concise. Do not give new medical advice or change dosages — only report what is in the context.\n\nCONTEXT:\n" + context;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
        }),
      }
    );
    const json = await geminiRes.json();
    const reply = json?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a reply.";
    res.status(200).json({ reply });
  } catch (e) {
    res.status(500).json({ error: "Chat request failed." });
  }
};
