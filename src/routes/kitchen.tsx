import { createFileRoute, Link } from "@tanstack/react-router";
import { addDays, formatLongDate, getMealsForDate, todayLocal } from "@/lib/plan";
import { ChefHat, MessageCircle, Moon, Sun, Utensils } from "lucide-react";

export const Route = createFileRoute("/kitchen")({
  head: () => ({
    meta: [
      { title: "Mom's Kitchen — Tomorrow's Menu" },
      {
        name: "description",
        content:
          "Tomorrow's breakfast, lunch, and dinner with ingredients and what to prep tonight.",
      },
      { property: "og:title", content: "Mom's Kitchen — Tomorrow's Menu" },
      {
        property: "og:description",
        content:
          "Tomorrow's breakfast, lunch, and dinner with ingredients and what to prep tonight.",
      },
    ],
  }),
  component: Kitchen,
});

function Kitchen() {
  const tomorrow = addDays(todayLocal(), 1);
  const meals = getMealsForDate(tomorrow);
  const dateLabel = formatLongDate(tomorrow);

  const shareText = buildShareText(dateLabel, meals);
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8 space-y-8">
        <section>
          <div className="text-xs uppercase tracking-[0.2em] text-ember mb-1">
            Tomorrow · {dateLabel}
          </div>
          <h1 className="text-5xl md:text-6xl font-display">Mom's Kitchen</h1>
        </section>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-medium text-black hover:brightness-110 transition"
        >
          <MessageCircle className="h-4 w-4" />
          Share on WhatsApp
        </a>

        <MealCard icon={<Sun className="h-5 w-5" />} label="Breakfast" title={meals.breakfast} />
        <MealCard icon={<Utensils className="h-5 w-5" />} label="Lunch" title={meals.lunch} />

        <section className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-3">
            <Moon className="h-5 w-5 text-ember" />
            <h2 className="font-display text-2xl">Dinner · {meals.dinner.name}</h2>
          </div>

          <div className="mb-5">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Ingredients
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-sm">
              {meals.dinner.ingredients.map((i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-ember mt-1">•</span>
                  {i}
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-5">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Prep tonight
            </h3>
            <ul className="space-y-1.5 text-sm">
              {meals.dinner.prepTonight.map((p) => (
                <li key={p} className="flex items-start gap-2">
                  <span className="text-ember mt-1">→</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Recipe</h3>
            <p className="text-sm leading-relaxed text-foreground/90">{meals.dinner.recipe}</p>
          </div>
        </section>
      </main>
    </div>
  );
}

function MealCard({ icon, label, title }: { icon: React.ReactNode; label: string; title: string }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-ember mb-1">
        {icon}
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <div className="font-display text-2xl">{title}</div>
    </section>
  );
}

function buildShareText(dateLabel: string, meals: ReturnType<typeof getMealsForDate>) {
  return `🍳 Tomorrow's menu (${dateLabel})

🌅 Breakfast: ${meals.breakfast}
🍽️ Lunch: ${meals.lunch}
🌙 Dinner: ${meals.dinner.name}

Ingredients for dinner:
${meals.dinner.ingredients.map((i) => `• ${i}`).join("\n")}

Prep tonight:
${meals.dinner.prepTonight.map((p) => `→ ${p}`).join("\n")}`;
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
