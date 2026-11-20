import type { ConvEvent, ConversationClient, Signal, StartOptions } from "./types";

export const ROLES = {
  "Data analyst": [
    "Hi, I'm Aarohi, the AI interviewer for this role. I'll ask four questions and score every answer against the same rubric. Ready? To start, tell me about a metric you owned end to end.",
    "Thanks. When that metric moved unexpectedly, how did you work out whether it was a real change or a data problem?",
    "Good. Walk me through how you'd explain that finding to a non-technical executive in two minutes.",
    "Last one: tell me about a time an analysis you shipped turned out to be wrong. What did you do?",
  ],
  "Product manager": [
    "Hi, I'm Aarohi, the AI interviewer for this role. Four questions, one consistent rubric. First: tell me about a product decision you made with incomplete data.",
    "How did you decide what not to build?",
    "Tell me about a time engineering and design disagreed. How did you resolve it?",
    "Finally, how do you know a launch actually worked?",
  ],
  "Software engineer": [
    "Hi, I'm Aarohi, the AI interviewer for this role. Let's keep it conversational. First: describe a system you designed that had to scale.",
    "What failed first under load, and how did you find out?",
    "How do you decide when a piece of code is good enough to ship?",
    "Tell me about feedback in a code review that changed how you work.",
  ],
} as const;
export type Role = keyof typeof ROLES;

export const SAMPLE_ANSWERS = [
  "At my last company I owned weekly active subscribers. I rebuilt the definition with finance so it matched revenue, and cut reporting disputes by about 40%.",
  "First I checked the pipeline: row counts, late-arriving data, a recent schema change. Then I segmented by region and platform. It turned out an iOS release had broken an event, so the drop wasn't real.",
  "I'd lead with the answer: the drop isn't real, revenue is fine. Then one chart, one sentence on the cause, and what we changed so it can't happen again.",
  "I once shipped a churn analysis that double-counted reactivations. I flagged it to the team the same day, corrected the deck, and added a reconciliation test to the model.",
];

const RUBRIC: Omit<Signal, "value">[] = [
  { key: "structure", label: "Structure" },
  { key: "evidence", label: "Evidence & metrics" },
  { key: "ownership", label: "Ownership" },
  { key: "clarity", label: "Clarity" },
];

/** Heuristic demo scoring — the real platform uses a rubric model. */
function score(answer: string, prev: Signal[]): Signal[] {
  const a = answer.toLowerCase();
  const words = a.split(/\s+/).filter(Boolean).length;
  const hits = (re: RegExp) => (a.match(re) || []).length;
  const raw: Record<string, number> = {
    structure: Math.min(1, 0.35 + hits(/\b(first|then|finally|because|so)\b/g) * 0.15 + (words > 25 ? 0.15 : 0)),
    evidence: Math.min(1, 0.3 + hits(/\d|%|percent|revenue|users|latency|rate/g) * 0.14),
    ownership: Math.min(1, 0.3 + hits(/\b(i|my|owned|led|built|decided|flagged)\b/g) * 0.07),
    clarity: Math.min(1, words < 8 ? 0.3 : words > 90 ? 0.55 : 0.82),
  };
  return RUBRIC.map((r) => {
    const p = prev.find((x) => x.key === r.key)?.value ?? 0;
    return { ...r, value: p === 0 ? raw[r.key] : p * 0.5 + raw[r.key] * 0.5 };
  });
}

export class MockInterviewClient implements ConversationClient {
  private listeners = new Set<(e: ConvEvent) => void>();
  private qs: readonly string[] = [];
  private i = 0;
  private timers: number[] = [];
  private signals: Signal[] = RUBRIC.map((r) => ({ ...r, value: 0 }));

  on(fn: (e: ConvEvent) => void) { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; }
  private emit(e: ConvEvent) { this.listeners.forEach((l) => l(e)); }
  private later(fn: () => void, ms: number) { this.timers.push(window.setTimeout(fn, ms)); }

  async start({ role }: StartOptions) {
    this.qs = ROLES[(role as Role) in ROLES ? (role as Role) : "Data analyst"];
    this.i = 0;
    this.signals = RUBRIC.map((r) => ({ ...r, value: 0 }));
    this.emit({ type: "signals", signals: this.signals });
    this.emit({ type: "state", state: "connecting" });
    this.later(() => this.say(this.qs[0]), 1300);
  }

  private say(text: string, after: "listening" | "ended" = "listening") {
    this.emit({ type: "state", state: "speaking" });
    const words = text.split(" ");
    words.forEach((_, k) => this.later(() => this.emit({ type: "partial", text: words.slice(0, k + 1).join(" ") }), k * 70));
    this.later(() => {
      this.emit({ type: "turn", turn: { id: crypto.randomUUID?.() ?? String(Math.random()), speaker: "agent", text } });
      this.emit({ type: "partial", text: "" });
      this.emit({ type: "state", state: after });
    }, words.length * 70 + 350);
  }

  send(text: string) {
    if (!text.trim()) return;
    this.emit({ type: "turn", turn: { id: String(Math.random()), speaker: "candidate", text } });
    this.signals = score(text, this.signals);
    this.emit({ type: "state", state: "thinking" });
    this.later(() => {
      this.emit({ type: "signals", signals: this.signals });
      this.i += 1;
      if (this.i < this.qs.length) this.say(this.qs[this.i]);
      else this.say("That's everything. Thank you. Your transcript and scorecard are on their way to the hiring team.", "ended");
    }, 900);
  }

  end() {
    this.timers.forEach(clearTimeout);
    this.timers = [];
    this.emit({ type: "partial", text: "" });
    this.emit({ type: "state", state: "ended" });
  }
}
