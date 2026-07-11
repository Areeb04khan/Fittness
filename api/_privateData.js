// This file is only ever imported by serverless functions in /api.
// It is never bundled into the public site, so this data never reaches
// a browser unless a request passes auth in _auth.js.
// A leading underscore keeps Vercel from treating this as its own route.

const MEDICATIONS = [
  {
    time: "7:30 AM",
    name: "Bupropion 150mg",
    note: "Morning dose — supports the tobacco quit plan",
  },
  { time: "1:00 PM", name: "Quetiapine 25mg", note: "Take with lunch" },
  { time: "Bedtime", name: "Desvenlafaxine 50mg", note: "Same time each night" },
  { time: "Bedtime", name: "Quetiapine 25mg", note: "With food if possible" },
  {
    time: "As needed (SOS)",
    name: "Clonazepam",
    note: "Not tied to a fixed time. Skip training that day if taken.",
  },
];

const SUPPLEMENTS = [
  {
    time: "8:30 AM · training days",
    name: "Creatine 3g + Citrulline 3g",
    how: "Mix into 400–500ml water. Drink half before training, sip the rest during.",
    note: "Only after a solid breakfast. Skip entirely on boxing/rest days — use electrolytes instead.",
  },
  {
    time: "10:35 AM · post-workout",
    name: "Whey Protein, 1–1.5 scoops",
    how: "Shake in water, not milk.",
    note: "Water digests easier post-training.",
  },
  {
    time: "1:00 PM · with lunch",
    name: "Fish Oil (1 softgel) + Biotin (1 tablet)",
    how: "Swallow with food.",
    note: "Reduces reflux. Mention biotin before any bloodwork.",
  },
  {
    time: "Bedtime",
    name: "Magnesium Glycinate (~200mg)",
    how: "With a small glass of water.",
    note: "Titrate up only if stools stay normal.",
  },
];

function privateContextString() {
  const meds = MEDICATIONS.map((m) => `${m.time}: ${m.name} (${m.note})`).join("; ");
  const sups = SUPPLEMENTS.map((s) => `${s.time}: ${s.name} — ${s.how} ${s.note}`).join("; ");
  return `Medications: ${meds}\nSupplements: ${sups}`;
}

module.exports = { MEDICATIONS, SUPPLEMENTS, privateContextString };
