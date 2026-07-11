import {
  BREAKFAST_ROTATION,
  DINNER_ROTATION,
  LUNCH_ROTATION,
  PROGRAM_START_DATE,
  WEEKLY_SPLIT,
} from "./plan-data";

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function todayLocal(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function addDays(d: Date, n: number): Date {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}

export function getTrainingDay(date: Date) {
  // Monday = 0, Sunday = 6
  const day = (date.getDay() + 6) % 7;
  return { dayIndex: day, plan: WEEKLY_SPLIT[day] };
}

export function getWeekNumber(date: Date): number {
  const start = new Date(PROGRAM_START_DATE + "T00:00:00");
  const diff = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.floor(diff / 7) + 1);
}

export function getMealsForDate(date: Date) {
  const day = (date.getDay() + 6) % 7;
  return {
    breakfast: BREAKFAST_ROTATION[day],
    lunch: LUNCH_ROTATION[day],
    dinner: DINNER_ROTATION[day],
  };
}

export function formatLongDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
