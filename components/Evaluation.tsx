"use client";
import { useState } from "react";
import { Reveal, RevealLines } from "./Reveal";

const TABS = {
  Scorecard: [
    ["Candidate", "0412 · Data analyst"],
    ["Overall", "3.4 / 4 · Advance"],
    ["Structure", "3.6 · Clear situation → action → result"],
    ["Evidence", "3.1 · Quantified impact in 3 of 4 answers"],
    ["Ownership", "3.7 · Owned the fix and the follow-up test"],
    ["Clarity", "3.2 · Strong summaries; ran long on Q2"],
    ["Flags", "None"],
  ],
  Transcript: [
    ["00:14", "Aarohi: Tell me about a metric you owned end to end."],
    ["00:19", "Candidate: I owned weekly active subscribers…"],
    ["01:42", "Aarohi: How did you know the drop was real?"],
    ["01:47", "Candidate: First I checked the pipeline, then…"],
    ["03:05", "Aarohi: Explain that to an executive in two minutes."],
  ],
  Perception: [
    ["Engagement", "High throughout; dipped briefly at 02:10"],
    ["Composure", "Steady; recovered quickly after a pause"],
    ["Environment", "Quiet room, single participant"],
    ["Integrity", "No second voice or off-screen prompting detected"],
  ],
} as const;

export function Evaluation() {
  const [tab, setTab] = useState<keyof typeof TABS>("Scorecard");
  return (
    <section id="evaluation" className="section">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-6">
          <p className="t-mono text-mute">For teams that build with AI</p>
          <RevealLines className="t-h2 mt-5" lines={["Your hiring data", "is only as good as", "the interview behind it."]} />
          <Reveal delay={0.1}>
            <p className="t-lead mt-8 max-w-[52ch] text-ink/75">Inconsistent interviews produce noisy data. Aarohi asks every candidate the same core questions, follows up where it matters, and scores against one rubric, so the signal you train and decide on is clean.</p>
            <p className="t-body mt-5 max-w-[52ch] text-ink/65">Each session returns a full transcript, perception notes and a structured scorecard, delivered to your ATS, an S3 bucket or any webhook within seconds of the call ending.</p>
          </Reveal>
        </div>
        <Reveal className="lg:col-span-6" delay={0.1}>
          <div className="overflow-hidden rounded-[16px] border border-line bg-card">
            <div className="flex gap-1 border-b border-line p-2" role="tablist">
              {(Object.keys(TABS) as (keyof typeof TABS)[]).map((t) => (
                <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
                  className={`t-mono h-10 rounded-full px-4 transition ${tab === t ? "bg-ink text-paper" : "hover:bg-sand"}`}>{t}</button>
              ))}
            </div>
            <dl className="divide-y divide-line">
              {TABS[tab].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[110px_minmax(0,1fr)] gap-4 px-5 py-3.5 sm:grid-cols-[140px_minmax(0,1fr)]">
                  <dt className="t-mono pt-0.5 text-mute">{k}</dt>
                  <dd className="text-[0.95rem] tracking-[-0.01em]">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="border-t border-line px-5 py-3 text-[0.8rem] text-mute">Example output for a sample candidate.</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
