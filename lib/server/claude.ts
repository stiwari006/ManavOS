import "server-only";
import type { Scorecard, Turn } from "@/lib/types";

/* Claude via the Anthropic Messages API (plain fetch, streaming SSE). */
const KEY = () => process.env.ANTHROPIC_API_KEY || "";
const BASE = () => process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com";
export const CLAUDE_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";
export const claudeReady = () => !!KEY();

function toMessages(turns: Turn[]) {
  const msgs: { role: "user" | "assistant"; content: string }[] = [];
  for (const t of turns) {
    const role = t.role === "assistant" ? "assistant" : "user";
    const last = msgs[msgs.length - 1];
    if (last && last.role === role) last.content += "\n" + t.content;
    else msgs.push({ role, content: t.content });
  }
  if (msgs[0]?.role === "assistant") msgs.unshift({ role: "user", content: "(The participant has joined the call.)" });
  return msgs;
}

/** Streams Claude's reply as plain text chunks. */
export async function streamReply(system: string, turns: Turn[], onDone: (full: string) => void): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch(`${BASE()}/v1/messages`, {
    method: "POST",
    headers: { "x-api-key": KEY(), "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: CLAUDE_MODEL, max_tokens: 300, stream: true, system, messages: toMessages(turns) }),
  });
  if (!res.ok || !res.body) throw new Error(`Claude ${res.status}: ${await res.text().catch(() => "")}`);
  const reader = res.body.getReader();
  const dec = new TextDecoder(), enc = new TextEncoder();
  let buf = "", full = "";
  return new ReadableStream({
    async pull(ctrl) {
      const { value, done } = await reader.read();
      if (done) { onDone(full); ctrl.close(); return; }
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n"); buf = lines.pop() || "";
      for (const l of lines) {
        if (!l.startsWith("data:")) continue;
        try {
          const ev = JSON.parse(l.slice(5));
          if (ev.type === "content_block_delta" && ev.delta?.type === "text_delta") { full += ev.delta.text; ctrl.enqueue(enc.encode(ev.delta.text)); }
        } catch { /* keep-alive */ }
      }
    },
    cancel() { reader.cancel(); },
  });
}

/** Scores a transcript against a rubric; returns evidence-backed scores. */
export async function scoreTranscript(personaName: string, rubric: string[], turns: Turn[]): Promise<Scorecard> {
  const transcript = turns.map((t) => `${t.role === "assistant" ? personaName : "Participant"}: ${t.content}`).join("\n");
  const prompt = `Score the participant in this conversation against each rubric criterion on a 1–4 scale (1 = no evidence, 4 = strong evidence). Quote short evidence from the transcript for each. Be fair and conservative; if there is little evidence, score low and say so.

Rubric: ${rubric.join("; ")}

Transcript:
${transcript}

Respond with only JSON: {"scores":[{"criterion":string,"score":number,"evidence":string}],"summary":string,"recommendation":"advance"|"hold"|"insufficient evidence"}`;
  const res = await fetch(`${BASE()}/v1/messages`, {
    method: "POST",
    headers: { "x-api-key": KEY(), "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: CLAUDE_MODEL, max_tokens: 1200, messages: [{ role: "user", content: prompt }] }),
  });
  if (!res.ok) throw new Error(`Claude ${res.status}`);
  const data = await res.json();
  const text: string = data.content?.map((c: { text?: string }) => c.text || "").join("") || "{}";
  const parsed = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
  return { scores: parsed.scores || [], summary: parsed.summary || "", recommendation: parsed.recommendation || "hold", model: CLAUDE_MODEL };
}
