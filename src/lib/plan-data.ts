// Public data — safe to ship to the browser.
// Change PROGRAM_START_DATE to the Monday you actually start training.

export const PROGRAM_START_DATE = "2026-07-13"; // must be a Monday (ISO)

export type Exercise = { name: string; sets: string; notes?: string };
export type DayPlan = { focus: string; exercises: Exercise[] };

// Weekly training split — 7 slots, Monday first
export const WEEKLY_SPLIT: DayPlan[] = [
  {
    focus: "Push — Chest, Shoulders, Triceps",
    exercises: [
      { name: "Barbell bench press", sets: "4 × 6–8" },
      { name: "Overhead press", sets: "3 × 8" },
      { name: "Incline dumbbell press", sets: "3 × 10" },
      { name: "Lateral raises", sets: "3 × 12", notes: "Slow eccentric" },
      { name: "Rope pushdowns", sets: "3 × 12" },
    ],
  },
  {
    focus: "Pull — Back & Biceps",
    exercises: [
      { name: "Deadlift", sets: "4 × 5" },
      { name: "Pull-ups", sets: "4 × AMRAP" },
      { name: "Barbell row", sets: "3 × 8" },
      { name: "Face pulls", sets: "3 × 15" },
      { name: "Hammer curls", sets: "3 × 10" },
    ],
  },
  {
    focus: "Legs — Quad emphasis",
    exercises: [
      { name: "Back squat", sets: "5 × 5" },
      { name: "Bulgarian split squat", sets: "3 × 10 / leg" },
      { name: "Leg press", sets: "3 × 12" },
      { name: "Standing calf raise", sets: "4 × 12" },
    ],
  },
  {
    focus: "Active recovery — Zone 2 + mobility",
    exercises: [
      { name: "Zone 2 cardio", sets: "40 min", notes: "Nasal-only breathing" },
      { name: "Full-body mobility flow", sets: "15 min" },
    ],
  },
  {
    focus: "Push — Hypertrophy",
    exercises: [
      { name: "Incline barbell press", sets: "4 × 8" },
      { name: "Seated DB shoulder press", sets: "3 × 10" },
      { name: "Cable fly", sets: "3 × 12" },
      { name: "Skullcrushers", sets: "3 × 10" },
    ],
  },
  {
    focus: "Pull + Posterior chain",
    exercises: [
      { name: "Romanian deadlift", sets: "4 × 8" },
      { name: "Chest-supported row", sets: "4 × 10" },
      { name: "Lat pulldown", sets: "3 × 12" },
      { name: "Rear delt fly", sets: "3 × 15" },
      { name: "Preacher curl", sets: "3 × 10" },
    ],
  },
  {
    focus: "Rest — walk, stretch, sleep",
    exercises: [
      { name: "Easy walk", sets: "30–45 min" },
      { name: "Foam roll + stretch", sets: "15 min" },
    ],
  },
];

// Rotating dinner menu — one per weekday
export type Meal = {
  name: string;
  ingredients: string[];
  prepTonight: string[];
  recipe: string;
};

export const DINNER_ROTATION: Meal[] = [
  {
    name: "Rajma Chawal",
    ingredients: [
      "1 cup rajma (kidney beans)",
      "1 onion",
      "2 tomatoes",
      "Ginger-garlic paste",
      "Basmati rice",
      "Ghee, cumin, garam masala",
    ],
    prepTonight: ["Soak rajma overnight in 4 cups water", "Chop onion & tomatoes, cover in fridge"],
    recipe:
      "Pressure cook soaked rajma 20 min. Sauté onion in ghee till golden, add ginger-garlic, tomatoes, spices; simmer 10 min. Combine with rajma, simmer 15 min. Serve over basmati.",
  },
  {
    name: "Palak Paneer with Roti",
    ingredients: [
      "2 bunches spinach",
      "250g paneer",
      "1 onion",
      "Cream",
      "Green chili",
      "Whole wheat atta",
    ],
    prepTonight: ["Wash and blanch spinach 2 min, ice bath, refrigerate", "Cube paneer"],
    recipe:
      "Blend blanched spinach with green chili. Sauté onion + ginger-garlic, add spinach purée, simmer 10 min, add paneer + cream. Serve with hot roti.",
  },
  {
    name: "Chicken Curry & Jeera Rice",
    ingredients: [
      "500g chicken",
      "2 onions",
      "3 tomatoes",
      "Yogurt",
      "Whole spices",
      "Basmati rice",
    ],
    prepTonight: ["Marinate chicken with yogurt, salt, turmeric, red chili"],
    recipe:
      "Brown onions in oil 15 min. Add ginger-garlic, tomatoes, spices. Add chicken, cook covered 25 min. Finish with garam masala & coriander.",
  },
  {
    name: "Dal Tadka + Rice",
    ingredients: ["1 cup toor dal", "1 tomato", "Garlic", "Cumin, mustard seeds, hing", "Ghee"],
    prepTonight: ["Pick and rinse dal, soak 30 min before bed"],
    recipe:
      "Pressure cook dal with turmeric, salt, chopped tomato — 3 whistles. Tadka: hot ghee + cumin + garlic + red chili + hing. Pour over dal.",
  },
  {
    name: "Aloo Gobi with Paratha",
    ingredients: [
      "2 potatoes",
      "1 cauliflower",
      "1 tomato",
      "Ginger",
      "Cumin, turmeric, coriander powder",
      "Atta",
    ],
    prepTonight: ["Cut cauliflower florets and potato cubes, refrigerate"],
    recipe:
      "Heat oil, cumin, ginger. Add potatoes, cook 8 min. Add cauliflower and spices, cover 15 min. Finish with fresh coriander.",
  },
  {
    name: "Chole Bhature",
    ingredients: [
      "1 cup chickpeas",
      "1 onion",
      "2 tomatoes",
      "Chole masala",
      "Maida (or atta) for bhature",
    ],
    prepTonight: [
      "Soak chickpeas overnight",
      "Make bhature dough with yogurt + baking soda, rest overnight",
    ],
    recipe:
      "Pressure cook chickpeas with tea bag for color. Sauté onion + tomato + chole masala, add chickpeas, simmer 20 min. Roll bhature and deep fry.",
  },
  {
    name: "Vegetable Khichdi + Kadhi",
    ingredients: [
      "1/2 cup rice",
      "1/2 cup moong dal",
      "Mixed veg",
      "Yogurt",
      "Besan",
      "Curry leaves",
    ],
    prepTonight: ["Chop vegetables, refrigerate"],
    recipe:
      "Pressure cook rice, dal, veg with turmeric — 3 whistles. Kadhi: whisk yogurt + besan + water, simmer, temper with curry leaves + mustard.",
  },
];

export const BREAKFAST_ROTATION = [
  "Poha with peanuts & lemon",
  "Vegetable upma",
  "Besan cheela with mint chutney",
  "Aloo paratha with curd",
  "Idli sambar",
  "Masala oats",
  "Sooji uttapam",
];

export const LUNCH_ROTATION = [
  "Chapati + mixed veg sabzi + dal + curd",
  "Vegetable pulao + raita",
  "Rajma + rice + salad",
  "Paneer bhurji + roti + salad",
  "Curd rice + pickle + papad",
  "Sambar rice + poriyal",
  "Dal khichdi + ghee + papad",
];

export const HYDRATION_TARGET_ML = 3000;
export const HOT_DAY_TEMP_C = 30;

// Location for weather (Delhi by default — change as needed)
export const WEATHER_LOCATION = {
  name: "Delhi",
  latitude: 28.6139,
  longitude: 77.209,
};

export const NUTRITION_TARGETS = {
  calories: 2400,
  protein_g: 160,
  carbs_g: 260,
  fat_g: 75,
};

// Shared type for the private checklist (safe to import from client — type only).
export type PrivateItem = {
  id: string;
  name: string;
  dose: string;
  time: "morning" | "afternoon" | "evening" | "bedtime";
  notes?: string;
};
