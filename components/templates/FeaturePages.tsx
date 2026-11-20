"use client";
import { ArrowRight } from "lucide-react";
import { FEATURES, type Feature } from "@/lib/content/platform";
import { SiteLink } from "@/lib/site/link";
import { Closing } from "../Closing";
import { CodeCard, PageHero, RuledList } from "../page/Blocks";
import { Reveal } from "../Reveal";

export function FeaturesIndex() {
  return (
    <>
      <PageHero eyebrow="Features" lines={["Everything your", "persona needs."]} accent="persona" lead="Memory, knowledge, perception, meetings, languages, guardrails and tools. Turn them on per persona or per conversation." />
      <section className="section">
        <div className="shell grid gap-px overflow-hidden rounded-[18px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <Reveal key={f.slug} delay={(i % 4) * 0.05} className="bg-paper">
              <SiteLink href={`/features/${f.slug}`} className="group flex h-full min-h-[230px] flex-col justify-between p-6 hover:bg-card">
                <span className="t-mono text-mute">{f.name}</span>
                <div><p className="text-[1.4rem] font-medium leading-tight tracking-[-0.035em]">{f.headline}</p><p className="mt-2 text-[0.92rem] text-ink/60">{f.sub}</p>
                  <ArrowRight className="mt-4 h-4 w-4 transition-transform group-hover:translate-x-1" /></div>
              </SiteLink>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}

export function FeatureDetail({ f }: { f: Feature }) {
  const others = FEATURES.filter((x) => x.slug !== f.slug).slice(0, 4);
  return (
    <>
      <PageHero eyebrow={`Features · ${f.name}`} lines={[f.headline]} lead={f.sub} ctas={[{ label: "Start building", href: "/signup", primary: true }, { label: "API reference", href: "/docs/api-reference" }]} />
      <section className="section">
        <div className="shell grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7"><RuledList items={f.points} cols={2} /></div>
          <div className="lg:col-span-5"><CodeCard code={f.code} title={`${f.name} · example`} /></div>
        </div>
      </section>
      <section className="shell pb-[clamp(80px,10vw,140px)]">
        <p className="t-mono text-mute">More features</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {others.map((o) => (
            <SiteLink key={o.slug} href={`/features/${o.slug}`} className="rounded-[14px] border border-line bg-card p-5 hover:border-ink">
              <span className="block text-[1.2rem] font-medium tracking-[-0.03em]">{o.name}</span><span className="text-[0.9rem] text-mute">{o.headline}</span>
            </SiteLink>
          ))}
        </div>
      </section>
      <Closing lines={["Turn it on.", "Ship today."]} label={`ManavOS · ${f.name}`} topic="Developer API" />
    </>
  );
}
