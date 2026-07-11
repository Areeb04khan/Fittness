import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { chatWithAssistant } from "@/lib/chat.functions";
import { MessageCircle, Send, X, Loader2 } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

export function ChatWidget({ planContext }: { planContext: string }) {
  const send = useServerFn(chatWithAssistant);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi! Ask me anything about today's plan." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, open]);

  const submit = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setLoading(true);
    try {
      const res = await send({ data: { messages: next, planContext } });
      if (res.ok) setMessages([...next, { role: "assistant", content: res.content }]);
      else setMessages([...next, { role: "assistant", content: `⚠️ ${res.error}` }]);
    } catch (e) {
      setMessages([...next, { role: "assistant", content: "Something went wrong. Try again." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-primary-foreground shadow-lg shadow-ember/30 hover:shadow-ember/50 transition-shadow"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="font-medium">Ask</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col w-[min(380px,calc(100vw-2rem))] h-[520px] rounded-2xl border border-border bg-card shadow-2xl">
      <div className="flex items-center justify-between border-b border-border p-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-ember" />
          <span className="font-display text-lg">Assistant</span>
        </div>
        <button onClick={() => setOpen(false)} className="rounded-md p-1 hover:bg-secondary">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
              m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            }`}>{m.content}</div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-secondary px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" /> Thinking…
            </div>
          </div>
        )}
      </div>
      <form
        onSubmit={(e) => { e.preventDefault(); submit(); }}
        className="flex items-center gap-2 border-t border-border p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about the plan…"
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ember"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-md bg-primary p-2 text-primary-foreground disabled:opacity-50 hover:bg-primary/90"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
