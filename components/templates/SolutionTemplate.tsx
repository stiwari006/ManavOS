"use client";
import { ArrowRight } from "lucide-react";
import type { Solution } from "@/lib/content/solutions";
import { SiteLink } from "@/lib/site/link";
import { Closing } from "../Closing";
import { Contact } from "../Contact";
import { DitherHuman } from "../DitherHuman";
import { Models } from "../Models";
import { CallStage } from "../page/CallStage";
import { PageHero, RuledList, SectionHead, StatRow } from "../page/Blocks";
import { Reveal, RevealLines } from "../Reveal";
import { Solutions } from "../Solutions";

export function SolutionTemplate({ s }: { s: Solution }) {
  return (
    <>
      <PageHero eyebrow={s.eyebrow} lines={s.headline} accent={s.accent} lead={s.sub}
        ctas={[{ label: "Start building", href: "/signup", primary: true }, { label: `Talk to ${s.personaName}`, href: `/try?persona=${s.slug}` }]}>
        <div className="mt-14 sm:mt-20"><CallStage persona={s.persona} name={s.personaName} script={s.script} label={s.name} /></div>
        <p className="mt-3 text-[0.8rem] text-mute">Real-time render of {s.personaName}. Scripted preview; <SiteLink href={`/try?persona=${s.slug}`} className="underline underline-offset-2">try a live conversation</SiteLink>.</p>
      </PageHero>

      <section className="section">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7 lg:pr-10">
            <p className="t-mono text-mute">The problem</p>
            <RevealLines className="t-h2 mt-5" lines={s.problem.lines} />
            <Reveal delay={0.1}>
              <p className="t-lead mt-8 max-w-[56ch] text-ink/75">{s.problem.body}</p>
              <p className="t-body mt-5 max-w-[56ch] text-ink/65">{s.problem.detail}</p>
            </Reveal>
          </div>
          <Reveal className="lg:col-span-5" delay={0.1}>
            <div className="aspect-[4/5] overflow-hidden rounded-[18px] bg-sand">
              <DitherHuman persona={s.persona} scene="paper" dark="#0f0f10" light="#e7e2d7" cell={3} yaw={-0.3} label={`${s.personaName} listening`} />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="shell pb-[clamp(80px,10vw,140px)]"><StatRow stats={s.stats} note="Product capabilities and design targets for the HumanOS beta." /></section>

      <section className="section border-t border-line">
        <div className="shell">
          <SectionHead eyebrow="What you get" lines={["Built for this", "conversation."]} />
          <div className="mt-12 lg:ml-[25%]"><RuledList items={s.features} /></div>
        </div>
      </section>

      <section className="bg-ink text-paper">
        <div className="shell section">
          <SectionHead dark eyebrow="How it works" lines={["Live in", "three steps."]} />
          <ol className="mt-14 grid gap-3 md:grid-cols-3">
            {s.steps.map((st, i) => (
              <Reveal key={st.t} delay={i * 0.08}>
                <li className="flex h-full min-h-[220px] flex-col justify-between rounded-[16px] border border-white/10 p-6">
                  <span className="serif-i text-[2.4rem] leading-none text-paper/40">{["One", "Two", "Three"][i]}</span>
                  <div><p className="text-[1.35rem] font-medium tracking-[-0.03em]">{st.t}</p><p className="mt-1.5 text-paper/60">{st.b}</p></div>
                </li>
              </Reveal>
            ))}
          </ol>
          <SiteLink href="/docs/quickstart" className="t-mono group mt-10 inline-flex h-12 items-center gap-2 rounded-full bg-paper px-6 text-ink">Read the quickstart <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></SiteLink>
        </div>
      </section>

      <Models />
      <Solutions exclude={s.slug} />
      <Contact />
      <Closing lines={[`Meet ${s.personaName}.`, "Then build", "your own."]} persona={s.persona} topic={s.name} label={`HumanOS · ${s.name}`} />
    </>
  );
}
