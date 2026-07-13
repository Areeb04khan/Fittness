import { createFileRoute, Link } from "@tanstack/react-router";
import { Weather } from "@/components/Weather";
import { WaterTracker } from "@/components/WaterTracker";
import { PrivateChecklist } from "@/components/PrivateChecklist";
import { ChatWidget } from "@/components/ChatWidget";
import {
  getTrainingDay,
  getWeekNumber,
  todayLocal,
  formatLongDate,
  getMealsForDate,
} from "@/lib/plan";
import { NUTRITION_TARGETS } from "@/lib/plan-data";
import { Dumbbell, ChefHat } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "My Day — Daily Plan" },
      { name: "description", content: "Today's training focus, hydration, and daily checklist." },
      { property: "og:title", content: "My Day — Daily Plan" },
      {
        property: "og:description",
        content: "Today's training focus, hydration, and daily checklist.",
      },
    ],
  }),
  component: MyDay,
});

function MyDay() {
  const today = todayLocal();
  const { plan } = getTrainingDay(today);
  const week = getWeekNumber(today);
  const meals = getMealsForDate(today);

  const planContext = `Date: ${formatLongDate(today)} (Week ${week})
Training focus: ${plan.focus}
Exercises: ${plan.exercises.map((e) => `${e.name} ${e.sets}`).join("; ")}
Meals today: breakfast=${meals.breakfast}; lunch=${meals.lunch}; dinner=${meals.dinner.name}
Nutrition targets: ${NUTRITION_TARGETS.calories} kcal, ${NUTRITION_TARGETS.protein_g}g protein.`;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8 space-y-8">
        <section>
          <div className="text-xs uppercase tracking-[0.2em] text-ember mb-1">
            Week {week} · {formatLongDate(today)}
          </div>
          <div className="graphic-hero">
            <h1 className="text-5xl md:text-6xl font-display">My Day</h1>
            <img src="/assets/graphics/sample-exercise.svg" alt="Exercise graphic" />
          </div>
        </section>

        <div className="rounded-xl border border-border bg-card p-5">
          <Weather />
        </div>

        <section className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Dumbbell className="h-5 w-5 text-ember" />
            <h2 className="font-display text-2xl">Today's training</h2>
          </div>
          <div className="text-lg mb-4 text-foreground/90">{plan.focus}</div>
          <ul className="divide-y divide-border">
            {plan.exercises.map((ex) => (
              <li key={ex.name} className="py-3 flex items-baseline justify-between gap-4">
                <div>
                  <div className="font-medium">{ex.name}</div>
                  {ex.notes && <div className="text-xs text-muted-foreground">{ex.notes}</div>}
                </div>
                <div className="font-display text-lg text-ember-glow whitespace-nowrap">
                  {ex.sets}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          <WaterTracker />
          <PrivateChecklist />
        </div>

        <section className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-3">
            <ChefHat className="h-5 w-5 text-ember" />
            <h2 className="font-display text-2xl">Eating today</h2>
          </div>
          <ul className="text-sm space-y-2">
            <li>
              <span className="text-muted-foreground">Breakfast:</span> {meals.breakfast}
            </li>
            <li>
              <span className="text-muted-foreground">Lunch:</span> {meals.lunch}
            </li>
            <li>
              <span className="text-muted-foreground">Dinner:</span> {meals.dinner.name}
            </li>
          </ul>
          <div className="mt-4 text-xs text-muted-foreground">
            Targets: {NUTRITION_TARGETS.calories} kcal · {NUTRITION_TARGETS.protein_g}g P ·{" "}
            {NUTRITION_TARGETS.carbs_g}g C · {NUTRITION_TARGETS.fat_g}g F
          </div>
        </section>
      </main>
      <ChatWidget planContext={planContext} />
    </div>
  );
}

function Header() {
  return (
    <header className="border-b border-border">
      <nav className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
        <Link to="/" className="font-display text-xl tracking-wider">
          DAILY <span className="text-ember">·</span> PLAN
        </Link>
        <div className="flex items-center gap-1 text-sm">
          <Link
            to="/"
            className="px-3 py-1.5 rounded-md hover:bg-secondary"
            activeProps={{ className: "px-3 py-1.5 rounded-md bg-secondary text-ember" }}
            activeOptions={{ exact: true }}
          >
            My Day
          </Link>
          <Link
            to="/kitchen"
            className="px-3 py-1.5 rounded-md hover:bg-secondary"
            activeProps={{ className: "px-3 py-1.5 rounded-md bg-secondary text-ember" }}
          >
            Mom's Kitchen
          </Link>
        </div>
      </nav>
    </header>
  );
}
