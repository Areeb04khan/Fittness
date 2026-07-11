// ============================================================
// EDIT THIS FILE to update your program — no other file needs
// to change for day-to-day content edits.
// ============================================================

// The Monday your training program actually begins.
// Week numbers, block A/B, and deload weeks are all calculated from this.
const PROGRAM_START_DATE = "2026-07-13"; // YYYY-MM-DD, must be a Monday

// NOTE: Medications and supplements are intentionally NOT in this file.
// They are private data, served only via /api/private-data after login —
// see api/_privateData.js. This file only contains data meant to be public.


// ---------------- WEEKLY TRAINING SPLIT ----------------
// Keyed by JS getDay(): 0=Sunday … 6=Saturday
const WEEKLY_SPLIT = {
  0: { focus: "Rest", reps: "—", muscles: "Full recovery" },
  1: { focus: "Upper — Strength", reps: "5–8 reps, heavier", muscles: "Chest, back, shoulders, arms" },
  2: { focus: "Lower — Strength", reps: "5–8 reps, heavier", muscles: "Quads, hamstrings, glutes, calves" },
  3: { focus: "Push — Hypertrophy", reps: "8–12 reps, moderate", muscles: "Chest, shoulders, triceps" },
  4: { focus: "Boxing", reps: "Skill / conditioning", muscles: "Full-body conditioning, core" },
  5: { focus: "Pull — Hypertrophy", reps: "8–12 reps, moderate", muscles: "Back, biceps, rear delts" },
  6: { focus: "Legs — Pump", reps: "12–15 reps, lighter", muscles: "Quads, hamstrings, glutes, calves" },
};

const EXERCISES_BLOCK_A = {
  0: [],
  1: ["Barbell Bench Press — 4×5–6", "Barbell Row — 4×5–6", "Overhead Press — 3×6–8", "Weighted Pull-up / Lat Pulldown — 3×6–8", "Dips or Close-Grip Bench Press — 3×8"],
  2: ["Back Squat — 4×5–6", "Romanian Deadlift — 3×6–8", "Leg Press — 3×8", "Standing Calf Raise — 4×8–10"],
  3: ["Incline Dumbbell Press — 4×8–10", "Seated DB Shoulder Press — 3×10", "Cable Fly — 3×12", "Lateral Raise — 3×15", "Triceps Pushdown — 3×12"],
  4: ["Shadow boxing — 3×3min", "Pad work / heavy bag combos — 5×3min", "Footwork drills — 10min", "Core circuit (plank, rotational throws, hanging leg raises) — 3 rounds"],
  5: ["Pull-up / Lat Pulldown — 4×8–10", "Seated Cable Row — 3×10", "Face Pull — 3×15", "Barbell / DB Curl — 3×10", "Hammer Curl — 3×12"],
  6: ["Leg Extension — 3×15", "Leg Curl — 3×15", "Bulgarian Split Squat — 3×10–12/leg", "Hip Thrust — 3×10–12", "Seated Calf Raise — 4×15"],
};

const EXERCISES_BLOCK_B = {
  0: [],
  1: ["Barbell Bench Press — 4×5–6", "Barbell Row — 4×5–6", "Overhead Press — 3×6–8", "Weighted Pull-up / Lat Pulldown — 3×6–8", "Skull Crushers — 3×8"],
  2: ["Front Squat — 4×5–6", "Romanian Deadlift — 3×6–8", "Walking Lunges — 3×10/leg", "Seated Calf Raise — 4×8–10"],
  3: ["Machine Chest Press — 4×8–10", "Arnold Press — 3×10", "Pec-Deck — 3×12", "Cable Lateral Raise — 3×15", "Overhead Triceps Extension — 3×12"],
  4: ["Shadow boxing — 3×3min", "Pad work / heavy bag combos — 5×3min", "Footwork drills — 10min", "Core circuit (plank, rotational throws, hanging leg raises) — 3 rounds"],
  5: ["Chest-Supported Row — 4×8–10", "Single-Arm DB Row — 3×10", "Rear Delt Fly — 3×15", "Preacher Curl — 3×10", "Cable Curl — 3×12"],
  6: ["Sissy Squat or Goblet Squat — 3×15", "Lying Leg Curl — 3×15", "Walking Lunge — 3×10/leg", "Glute Bridge Machine — 3×10–12", "Standing Calf Raise — 4×15"],
};

// ---------------- DIET ROTATION ----------------
const BREAKFASTS = [
  { name: "अंडा व्हाइट + सब्ज़ियों वाला ओमलेट, मल्टीग्रेन टोस्ट", type: "NV", ingredients: "4 अंडे की सफेदी + 1 पूरा अंडा, प्याज, टमाटर, हरी मिर्च, 2 मल्टीग्रेन टोस्ट", prepAhead: "सब्ज़ियों को रात में काट लें और फ्रिज में रखें।" },
  { name: "चिकन कीमा स्क्रैम्बल + टोस्ट", type: "NV", ingredients: "100g हलाल चिकन कीमा, प्याज़, टमाटर, हल्के मसाले, 2 स्लाइस टोस्ट", prepAhead: "कीमा को रात पहले पका लें और सुबह गरम करें।" },
  { name: "उबले अंडे + ओट्स पोहा", type: "NV", ingredients: "4 उबले अंडे, 50g ओट्स, पानी/दूध, दालचीनी", prepAhead: "अंडे रात में उबाल लें और फ्रिज में रखें।" },
  { name: "एग भुर्जी + मल्टीग्रेन पराठा", type: "NV", ingredients: "3 अंडे भुर्जी, प्याज़, टमाटर, मसाले, 1 मल्टीग्रेन पराठा", prepAhead: "पराठे की आटा रात पहले गूंथ लें।" },
  { name: "ग्रीक दही + उबले अंडे + फल", type: "NV", ingredients: "1 कप ग्रीक दही, 2 उबले अंडे, 1 मौसमी फल", prepAhead: "अंडे रात को उबाल लें।" },
  { name: "मूंग स्प्राउट चीला + दही", type: "V", ingredients: "1.5 कप अंकुरित मूंग, 2 टेबल स्पून बेसन, हल्के मसाले, 1 कप दही", prepAhead: "मूंग को 1–2 दिन पहले भिगोकर अंकुरित करें।" },
];

const LUNCHES = [
  { name: "ग्रिल्ड चिकन ब्रेस्ट + ब्राउन राइस + सलाद + दही", type: "NV", ingredients: "175g हलाल चिकन ब्रेस्ट, 1 कप ब्राउन राइस, खीरा-टमाटर सलाद, 1 कप दही", prepAhead: "चिकन को रात में दही, अदरक-लहसुन और हल्के मसालों से मैरीनेट करें।" },
  { name: "हल्का फिश करी + ब्राउन राइस + सॉटेड हरी सब्ज़ी", type: "NV", ingredients: "175g फिश फिले, प्याज-टमाटर या नारियल करी, 1 कप राइस, पालक", prepAhead: "करी बेस रात पहले बना लें और मछली अलग रखें।" },
  { name: "चिकन कीमा सब्ज़ी + रोटी + सलाद", type: "NV", ingredients: "150g हलाल चिकन कीमा, 2 मल्टीग्रेन रोटी, सलाद", prepAhead: "कीमा को रात पहले पका लें और हल्का गर्म करें।" },
  { name: "एग करी + रोटी + सलाद", type: "NV", ingredients: "3 अंडे, हल्की प्याज-टमाटर ग्रेवी, 2 रोटी, सलाद", prepAhead: "ग्रेवी बेस रात में बना लें; अंडे फ़्रेश डालें।" },
  { name: "ग्रिल्ड फिश + क्विनोआ + सलाद", type: "NV", ingredients: "175g फिश फिले, 3/4 कप पकी हुई क्विनोआ, मिश्रित सलाद", prepAhead: "मछली को 20–30 मिनट पहले मैरीनेट करें।" },
  { name: "राजमा या दाल + रोटी + सलाद + दही", type: "V", ingredients: "1.5 कप राजमा/दाल, 2 रोटी, सलाद, 1 कप दही", prepAhead: "राजमा/दाल को रात में भिगोएँ।" },
];

const DINNERS = [
  { name: "ग्रिल्ड चिकन + सॉटेड सब्ज़ियाँ + बाजरा", type: "NV", ingredients: "175g हलाल चिकन ब्रेस्ट, मिश्रित सब्ज़ियाँ, 1/2 कप बाजरा/क्विनोआ", prepAhead: "चिकन को रात में मैरीनेट करें।" },
  { name: "पैन-सीयर्ड फिश + सब्ज़ी स्टिर-फ्राय", type: "NV", ingredients: "175g फिश फिले, मिक्स्ड सब्ज़ियाँ हल्की तेल में", prepAhead: "सब्ज़ियाँ काट लें और मछली को हल्का मरिनेट करें।" },
  { name: "चिकन स्टिर-फ्राय विद वेज", type: "NV", ingredients: "150g चिकन स्ट्रिप्स, शिमला मिर्च, प्याज़, लहसुन, हल्का सोया", prepAhead: "चिकन और सब्ज़ियाँ रात में काट लें।" },
  { name: "एग ड्रॉप सूप + ग्रिल्ड चिकन टिक्का", type: "NV", ingredients: "2 अंडे, सब्ज़ियाँ, 150g चिकन टिक्का", prepAhead: "चिकन को रात में टिक्का मसाले में मैरीनेट करें।" },
  { name: "झींगा या फिश टिक्का + सलाद", type: "NV", ingredients: "175g झींगा/फिश, दही और हल्का मसाला, सलाद", prepAhead: "टिक्का को रात भर मैरिनेट करें।" },
  { name: "पनीर/टोफू + सॉटेड सब्ज़ियाँ + बाजरा", type: "V", ingredients: "150–200g पनीर या टोफू, मिश्रित सब्ज़ियाँ, 1/2 कप बाजरा/क्विनोआ", prepAhead: "सब्ज़ियाँ काट लें।" },
];

const SNACKS = [
  "उबले अंडे (2–3)",
  "भुना हुआ चना या मूँगफली (30g) + 1 फल",
  "ग्रीक दही (1 कप) + कुछ बादाम/काजू",
  "चिकन टिक्का (100g)",
  "पनीर टिक्का (100g)",
  "स्प्राउट्स चाट (1 कप)",
];

const MEAL_TIMING = [
  ["7:00 AM", "जागें, पानी पिएँ + एक चुटकी सेंधा नमक"],
  ["7:30 AM", "नाश्ता (Bupropion के साथ)"],
  ["8:30 AM", "प्रैक्टिस से पहले सप्लीमेंट (training days)"],
  ["9:00–10:30 AM", "जिम / बॉक्सिंग"],
  ["10:35 AM", "पोस्ट-वर्कआउट प्रोटीन शेक"],
  ["11:30 AM", "हल्का फल नाश्ता, यदि भूख लगे"],
  ["1:00 PM", "दोपहर का भोजन (Quetiapine, Fish Oil, Biotin के साथ)"],
  ["4:30 PM", "प्रोटीन समृद्ध शाम का नाश्ता"],
  ["9:00 PM", "रात का खाना"],
  ["Bedtime", "Magnesium, Desvenlafaxine, Quetiapine, Clonazepam (SOS)"],
];

const TARGETS = [
  ["Calories", "~2,400–2,600 kcal/day"],
  ["Protein", "160–180 g/day"],
  ["Fat", "70–80 g/day"],
  ["Carbohydrates", "~230–260 g/day"],
  ["Fiber", "30–35 g/day"],
  ["Water", "4–4.5 L/day (more on boxing days / hot weather)"],
];

// Allow this same file to be require()'d from serverless functions (Node/CommonJS)
// while still working as a plain <script> in the browser (which has no `module`).
if (typeof module !== "undefined") {
  module.exports = {
    PROGRAM_START_DATE, WEEKLY_SPLIT, EXERCISES_BLOCK_A, EXERCISES_BLOCK_B,
    BREAKFASTS, LUNCHES, DINNERS, SNACKS, MEAL_TIMING, TARGETS,
  };
}
