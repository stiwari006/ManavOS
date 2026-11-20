"use client";
import { ArrowRight } from "lucide-react";
import { MODELS, type Model } from "@/lib/content/platform";
import { SiteLink } from "@/lib/site/link";
import { Closing } from "../Closing";
import { DitherHuman } from "../DitherHuman";
import { PageHero, RuledList, SectionHead } from "../page/Blocks";
import { Reveal } from "../Reveal";

export function ModelsIndex() {
  return (
    <>
      <PageHero eyebrow="Models" lines={["Four models.", "One presence."]} accent="presence." lead="Perception, rendering, conversation and memory, built in-house and tuned to work as one. Claude is the default reasoning layer." />
      <section className="section">
        <div className="shell grid gap-3 md:grid-cols-2">
          {MODELS.map((m, i) => (
            <Reveal key={m.slug} delay={(i % 2) * 0.08}>
              <SiteLink href={`/models/${m.slug}`} className="group grid h-full overflow-hidden rounded-[18px] bg-ink text-paper sm:grid-cols-2">
                <div className="aspect-[4/5] sm:aspect-auto sm:min-h-[340px]"><DitherHuman persona={m.persona} scene="close" dark="#0f0f10" light="#f2efe8" cell={2} yaw={i % 2 ? -0.3 : 0.3} label={`${m.name} model render`} /></div>
                <div className="flex flex-col justify-between p-7">
                  <span className="t-mono text-paper/50">{m.tag} · {m.version}</span>
                  <div>
                    <p className="text-[2.6rem] font-medium leading-none tracking-[-0.05em]">{m.name}</p>
                    <p className="mt-3 text-paper/65">{m.headline.join(" ")}</p>
                    <span className="t-mono mt-6 inline-flex items-center gap-2">Explore <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                  </div>
                </div>
              </SiteLink>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}

export function ModelDetail({ m }: { m: Model }) {
  const others = MODELS.filter((x) => x.slug !== m.slug);
  return (
    <>
      <PageHero eyebrow={`${m.tag} · ${m.version}`} lines={[m.name + ".", ...m.headline]} accent={m.name + "."} lead={m.sub}
        ctas={[{ label: "Start building", href: "/signup", primary: true }, { label: "Read the docs", href: "/docs/quickstart" }]}>
        <div className="mt-14 grid gap-3 sm:mt-20 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="aspect-[4/3] overflow-hidden rounded-[18px] bg-ink"><DitherHuman persona={m.persona} scene="night" dark="#0f0f10" light="#f2efe8" cell={3} yaw={0.2} follow label={`${m.name} render`} /></div>
          <dl className="flex flex-col justify-between rounded-[18px] border border-line bg-card p-6">
            {m.specs.map(([k, v]) => (
              <div key={k} className="border-b border-line py-4 last:border-0"><dt className="t-mono text-mute">{k}</dt><dd className="mt-1 text-[1.05rem] tracking-[-0.02em]">{v}</dd></div>
            ))}
          </dl>
        </div>
      </PageHero>
      <section className="section">
        <div className="shell">
          <SectionHead eyebrow="Inside the model" lines={["What it does", "for a conversation."]} />
          <div className="mt-12 lg:ml-[25%]"><RuledList items={m.sections} cols={3} /></div>
        </div>
      </section>
      <section className="shell pb-[clamp(80px,10vw,140px)]">
        <p className="t-mono text-mute">Other models</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {others.map((o) => (
            <SiteLink key={o.slug} href={`/models/${o.slug}`} className="group flex items-center justify-between rounded-[14px] border border-line bg-card p-5 hover:border-ink">
              <span><span className="block text-[1.4rem] font-medium tracking-[-0.04em]">{o.name}</span><span className="t-mono text-mute">{o.tag}</span></span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </SiteLink>
          ))}
        </div>
      </section>
      <Closing lines={["See it in a", "real conversation."]} persona={m.persona} label={`ManavOS · ${m.name}`} topic="Developer API" />
    </>
  );
}
