"use client";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Reveal, RevealLines } from "./Reveal";
import { useSite } from "./SiteContext";

const CODE = {
  TypeScript: `import { ManavOS } from "@manavos/sdk";

const hos = new ManavOS({ apiKey: process.env.HUMANOS_KEY });

const interview = await hos.conversations.create({
  persona: "aarohi",
  brain: { provider: "anthropic", model: "claude" },
  rubric: "rb_data_analyst_v3",
  memory: { candidateId: "cand_0412" },
  webhook: "https://ats.example.com/manavos",
});

// Send the candidate a join link, or embed it
console.log(interview.joinUrl);`,
  Python: `from manavos import ManavOS

hos = ManavOS(api_key=os.environ["HUMANOS_KEY"])

interview = hos.conversations.create(
    persona="aarohi",
    brain={"provider": "anthropic", "model": "claude"},
    rubric="rb_data_analyst_v3",
    memory={"candidate_id": "cand_0412"},
    webhook="https://ats.example.com/manavos",
)

print(interview.join_url)`,
  Webhook: `POST /manavos  conversation.completed
{
  "id": "conv_8f21",
  "persona": "aarohi",
  "duration_s": 401,
  "scores": { "structure": 3.6, "evidence": 3.1,
              "ownership": 3.7, "clarity": 3.2 },
  "recommendation": "advance",
  "transcript_url": "https://api.manavos.ai/t/conv_8f21",
  "perception": { "engagement": 0.82, "integrity": "clear" }
}`,
} as const;

const FEATURES = [
  ["APIs", "REST for setup, WebRTC for the live session, webhooks for results."],
  ["SDKs", "TypeScript, Python and drop-in React components."],
  ["Bring your brain", "Claude by default, or any LLM and tool set you already run."],
  ["Custom personas", "Your face, voice, wardrobe and knowledge, approved by you."],
  ["Integrations", "ATS, LMS, CRM and calendar connectors, plus S3 export."],
  ["Real-time infra", "Edge-routed media with global turn latency targets."],
];

export function Developers() {
  const { openAccount } = useSite();
  const [tab, setTab] = useState<keyof typeof CODE>("TypeScript");
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(CODE[tab]); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { /* clipboard blocked */ }
  };
  return (
    <section id="developers" className="bg-ink text-paper">
      <div className="shell section grid gap-14 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <p className="t-mono text-paper/50">Developers</p>
          <RevealLines className="t-h2 mt-5" lines={["Build experiences", "that feel alive."]} />
          <Reveal delay={0.1}>
            <p className="t-lead mt-6 max-w-[44ch] text-paper/65">One API call gives your product a face, a voice and a memory. You own the logic; we handle rendering, perception and real-time media.</p>
            <dl className="mt-10 grid gap-x-8 gap-y-6 sm:grid-cols-2">
              {FEATURES.map(([k, v]) => (
                <div key={k} className="border-t border-white/10 pt-4">
                  <dt className="font-medium tracking-[-0.02em]">{k}</dt>
                  <dd className="mt-1 text-[0.92rem] leading-snug text-paper/55">{v}</dd>
                </div>
              ))}
            </dl>
            <button onClick={() => openAccount("signup")} className="t-mono mt-10 h-12 rounded-full bg-paper px-6 text-ink hover:bg-white">Get an API key</button>
          </Reveal>
        </div>
        <Reveal className="lg:col-span-7" delay={0.15}>
          <div className="overflow-hidden rounded-[16px] border border-white/10 bg-coal">
            <div className="flex items-center justify-between border-b border-white/10 px-2 py-2">
              <div className="flex gap-1" role="tablist">
                {(Object.keys(CODE) as (keyof typeof CODE)[]).map((t) => (
                  <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
                    className={`t-mono h-9 rounded-full px-3.5 transition ${tab === t ? "bg-white/10 text-paper" : "text-paper/45 hover:text-paper"}`}>{t}</button>
                ))}
              </div>
              <button onClick={copy} className="t-mono inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-paper/60 hover:bg-white/10" aria-label="Copy code">
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="overflow-x-auto p-5 text-[0.82rem] leading-[1.75] sm:p-7 sm:text-[0.88rem]"><code className="font-mono text-paper/85">{CODE[tab].split("\n").map((l, i) => (
              <span key={i} className="block"><span className="mr-5 inline-block w-5 select-none text-right text-paper/20">{i + 1}</span>{highlight(l)}</span>
            ))}</code></pre>
          </div>
          <p className="mt-3 text-[0.8rem] text-paper/40">SDK shown as designed for the public beta.</p>
        </Reveal>
      </div>
    </section>
  );
}

function highlight(line: string) {
  const parts = line.split(/("[^"]*"|\/\/.*|#.*$)/g);
  return parts.map((p, i) =>
    p.startsWith('"') ? <span key={i} className="text-[#f6c9b8]">{p}</span>
    : p.startsWith("//") || p.startsWith("#") ? <span key={i} className="text-paper/35">{p}</span>
    : <span key={i}>{p}</span>);
}
