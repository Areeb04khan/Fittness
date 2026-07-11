import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { unlockSite } from "@/lib/gate.functions";
import { Lock, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/unlock")({
  head: () => ({
    meta: [
      { title: "Unlock — Daily Plan" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Unlock,
});

function Unlock() {
  const router = useRouter();
  const unlock = useServerFn(unlockSite);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const res = await unlock({ data: { password } });
    setLoading(false);
    if (res.ok) {
      router.invalidate();
      router.navigate({ to: "/" });
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-3 w-3" /> Back
        </Link>
        <div className="rounded-2xl border border-border bg-card p-8">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-ember/20 border border-ember/40 mb-4">
            <Lock className="h-5 w-5 text-ember" />
          </div>
          <h1 className="font-display text-3xl mb-1">Unlock private section</h1>
          <p className="text-sm text-muted-foreground mb-6">Enter your password to view your meds & supplements checklist.</p>
          <form onSubmit={submit} className="space-y-3">
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              className="w-full rounded-md border border-border bg-background px-3 py-2.5 outline-none focus:border-ember"
            />
            {error && <div className="text-sm text-destructive">Incorrect password.</div>}
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full rounded-md bg-primary py-2.5 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Unlocking…" : "Unlock"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
