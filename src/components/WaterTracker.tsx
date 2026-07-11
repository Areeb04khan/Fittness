import { useEffect, useState } from "react";
import { HYDRATION_TARGET_ML } from "@/lib/plan-data";
import { Droplet, Plus, Minus, RotateCcw } from "lucide-react";
import { isoDate, todayLocal } from "@/lib/plan";

const CUP_ML = 250;

export function WaterTracker() {
  const [ml, setMl] = useState(0);
  const key = `water-${isoDate(todayLocal())}`;

  useEffect(() => {
    const v = localStorage.getItem(key);
    setMl(v ? parseInt(v, 10) : 0);
  }, [key]);

  const save = (n: number) => {
    const clamped = Math.max(0, n);
    setMl(clamped);
    localStorage.setItem(key, String(clamped));
  };

  const pct = Math.min(100, (ml / HYDRATION_TARGET_ML) * 100);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Droplet className="h-5 w-5 text-ember-glow" />
          <h3 className="font-display text-xl">Water</h3>
        </div>
        <button onClick={() => save(0)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>
      <div className="text-3xl font-display mb-1">{ml} <span className="text-base text-muted-foreground">/ {HYDRATION_TARGET_ML} ml</span></div>
      <div className="h-2 rounded-full bg-muted overflow-hidden mb-4">
        <div className="h-full bg-gradient-to-r from-ember to-ember-glow transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex gap-2">
        <button onClick={() => save(ml - CUP_ML)} className="flex-1 rounded-md border border-border bg-secondary py-2 flex items-center justify-center gap-1 hover:bg-accent">
          <Minus className="h-4 w-4" /> Cup
        </button>
        <button onClick={() => save(ml + CUP_ML)} className="flex-1 rounded-md bg-primary text-primary-foreground py-2 flex items-center justify-center gap-1 hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Cup (250ml)
        </button>
      </div>
    </div>
  );
}
