import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { getSessionConfig, type GateSession } from "./session.server";

type ChatMessage = { role: "user" | "assistant"; content: string };

const PUBLIC_SYSTEM = `You are a helpful assistant for a personal daily-plan website.
You know the user's public training split, meals, and hydration targets.
You must NOT discuss medications or supplements — that information is private and requires login.
If asked about meds/supplements, reply: "That information is private — please log in to view it."
Keep answers concise (under 5 sentences unless asked for detail).`;

const PRIVATE_SYSTEM = `You are a helpful assistant for a personal daily-plan website.
The user is authenticated. You may discuss their medications, supplements, training, meals, and hydration.
This is a personal hobby tool — not medical advice. If asked medical questions, remind them to consult their doctor.
Keep answers concise unless detail is requested.`;

export const chatWithAssistant = createServerFn({ method: "POST" })
  .inputValidator((data: { messages: ChatMessage[]; planContext: string }) => data)
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

    const session = await useSession<GateSession>(getSessionConfig());
    const unlocked = !!session.data.unlocked;

    let contextBlock = data.planContext;
    if (unlocked) {
      const { PRIVATE_ITEMS } = await import("./private-data.server");
      contextBlock +=
        `\n\nPRIVATE MEDS & SUPPLEMENTS:\n` +
        PRIVATE_ITEMS.map(
          (i) => `- ${i.name} ${i.dose} (${i.time})${i.notes ? ` — ${i.notes}` : ""}`,
        ).join("\n");
    }

    const systemPrompt =
      (unlocked ? PRIVATE_SYSTEM : PUBLIC_SYSTEM) + `\n\nToday's plan:\n${contextBlock}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, ...data.messages],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      if (res.status === 429)
        return { ok: false as const, error: "Rate limit reached. Try again shortly." };
      if (res.status === 402)
        return {
          ok: false as const,
          error: "AI credits exhausted. Add credits in your workspace settings.",
        };
      return { ok: false as const, error: `AI error (${res.status}): ${text.slice(0, 200)}` };
    }
    const json = await res.json();
    const content = json.choices?.[0]?.message?.content ?? "(no response)";
    return { ok: true as const, content };
  });
