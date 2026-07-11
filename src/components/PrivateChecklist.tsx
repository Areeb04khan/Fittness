import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useRouter } from "@tanstack/react-router";
import { getPrivateItems, lockSite } from "@/lib/gate.functions";
import { Lock, LogOut, Pill } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { isoDate, todayLocal } from "@/lib/plan";
import type { PrivateItem } from "@/lib/plan-data";

export function PrivateChecklist() {
  const router = useRouter();
  const fetchItems = useServerFn(getPrivateItems);
  const doLock = useServerFn(lockSite);
  const [state, setState] = useState<{ loading: boolean; unlocked: boolean; items: PrivateItem[] }>({
    loading: true, unlocked: false, items: [],
  });
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const key = `meds-${isoDate(todayLocal())}`;

  useEffect(() => {
    fetchItems().then(r => setState({ loading: false, unlocked: r.unlocked, items: r.items }));
    const raw = localStorage.getItem(key);
    if (raw) setChecked(JSON.parse(raw));
  }, [fetchItems, key]);

  const toggle = (id: string) => {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    localStorage.setItem(key, JSON.stringify(next));
  };

  if (state.loading) {
    return <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">Loading…</div>;
  }

  if (!state.unlocked) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-display text-xl">Meds & Supplements</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">This section is private. Unlock to view your daily checklist.</p>
        <Link to="/unlock" className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Lock className="h-4 w-4" /> Unlock
        </Link>
      </div>
    );
  }

  const grouped = state.items.reduce<Record<string, PrivateItem[]>>((acc, it) => {
    (acc[it.time] ||= []).push(it); return acc;
  }, {});
  const order: Array<PrivateItem["time"]> = ["morning", "afternoon", "evening", "bedtime"];

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Pill className="h-5 w-5 text-ember" />
          <h3 className="font-display text-xl">Meds & Supplements</h3>
        </div>
        <button
          onClick={async () => { await doLock(); router.invalidate(); location.reload(); }}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <LogOut className="h-3 w-3" /> Lock
        </button>
      </div>
      <div className="space-y-4">
        {order.filter(t => grouped[t]).map(t => (
          <div key={t}>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{t}</div>
            <ul className="space-y-1.5">
              {grouped[t].map(it => (
                <li key={it.id}>
                  <label className="flex items-center gap-3 rounded-md p-2 hover:bg-secondary/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!checked[it.id]}
                      onChange={() => toggle(it.id)}
                      className="h-4 w-4 accent-ember"
                    />
                    <div className={`flex-1 ${checked[it.id] ? "line-through text-muted-foreground" : ""}`}>
                      <div className="text-sm font-medium">{it.name} <span className="text-muted-foreground">· {it.dose}</span></div>
                      {it.notes && <div className="text-xs text-muted-foreground">{it.notes}</div>}
                    </div>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
