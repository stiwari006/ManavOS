"use client";
import { ArrowRight } from "lucide-react";
import { DitherHuman } from "./DitherHuman";
import { Reveal, RevealLines } from "./Reveal";
import { useSite } from "./SiteContext";

export function Problem() {
  const { contactAbout } = useSite();
  return (
    <section className="section">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7 lg:pr-10">
          <p className="t-mono text-mute">The first round is broken</p>
          <RevealLines className="t-h2 mt-5" lines={["Résumés filter.", "Phone screens drift.", "Panels disagree."]} />
          <Reveal delay={0.15}>
            <p className="t-lead mt-8 max-w-[56ch] text-ink/75">
              Most candidates are judged on keywords before anyone speaks to them. The ones who get a call meet a tired recruiter on their eleventh screen of the day. Aarohi gives every applicant the same thoughtful conversation, at 3pm or 3am.
            </p>
            <p className="t-body mt-5 max-w-[56ch] text-ink/65">
              <b className="font-medium text-ink">Iris</b> reads engagement and composure, <b className="font-medium text-ink">Cadence</b> keeps turn-taking natural and asks real follow-ups, and every answer is scored against your rubric, then delivered as structured data through one webhook.
            </p>
            <button onClick={() => contactAbout("AI Interviewer")} className="t-mono group mt-9 inline-flex h-12 items-center gap-2 rounded-full border border-ink/20 px-6 hover:border-ink">
              Learn more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </Reveal>
        </div>
        <Reveal className="lg:col-span-5" delay={0.1}>
          <figure className="relative overflow-hidden rounded-[18px] bg-sand">
            <div className="aspect-[4/5]">
              <DitherHuman persona="mira" scene="paper" dark="#0f0f10" light="#e7e2d7" cell={3} yaw={-0.3} label="An AI interviewer persona listening to a candidate" />
            </div>
            <div className="absolute left-4 top-4 rounded-full bg-paper px-3.5 py-2 t-mono">Question 3 of 6</div>
            <figcaption className="absolute inset-x-4 bottom-4 rounded-[12px] bg-paper/95 p-4 backdrop-blur">
              <p className="t-mono text-mute">Follow-up generated</p>
              <p className="mt-1.5 text-[1.02rem] leading-snug tracking-[-0.02em]">&ldquo;You mentioned the launch slipped. What would you change if you ran it again?&rdquo;</p>
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
