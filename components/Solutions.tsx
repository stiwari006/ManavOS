"use client";
import { ArrowRight } from "lucide-react";
import { SOLUTIONS } from "@/lib/content/solutions";
import { SiteLink } from "@/lib/site/link";
import { DitherHuman } from "./DitherHuman";
import { Reveal, RevealLines } from "./Reveal";

const YAW = [0.3, -0.3, 0.25, -0.25, 0.3, -0.2, 0.2];

export function Solutions({ exclude, title = ["Explore other", "HumanOS solutions."] }: { exclude?: string; title?: string[] }) {
  const list = SOLUTIONS.filter((s) => s.slug !== exclude).slice(0, 6);
  return (
    <section id="solutions" className="section bg-sand/60">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <RevealLines className="t-h2" lines={title} />
          <p className="t-body max-w-[38ch] text-ink/65">The same models, tuned for different conversations. Each starts from a ready persona you can make your own.</p>
        </div>
        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s, i) => {
            const night = i % 2 === 1;
            return (
              <Reveal key={s.slug} delay={(i % 3) * 0.08} className="h-full">
                <SiteLink href={`/solutions/${s.slug}`} className="group flex h-full w-full flex-col overflow-hidden rounded-[16px] bg-card text-left">
                  <div className={`aspect-[5/4] overflow-hidden ${night ? "bg-ink" : "bg-paper"}`}>
                    <div className="h-full transition-transform duration-700 ease-out group-hover:scale-[1.03]">
                      <DitherHuman persona={s.persona} scene={night ? "night" : "paper"} dark="#0f0f10" light={night ? "#f2efe8" : "#faf8f4"} cell={2} yaw={YAW[i]} label={`${s.personaName}, ${s.name} persona`} />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-[1.45rem] font-medium tracking-[-0.035em]">{s.name}</h3>
                    <p className="t-body mt-2 flex-1 text-ink/65">{s.short}</p>
                    <span className="t-mono mt-6 inline-flex items-center gap-2">Learn more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                  </div>
                </SiteLink>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
