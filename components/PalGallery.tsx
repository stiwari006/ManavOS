"use client";
import { ArrowUpRight } from "lucide-react";
import { FEATURED_PALS } from "@/lib/content/pals";
import { SiteLink } from "@/lib/site/link";
import { DitherHuman } from "./DitherHuman";
import { SectionHead } from "./page/Blocks";
import { Reveal } from "./Reveal";

/** "Meet the PALs": a few example AI humans you can talk to right now. */
export function PalGallery() {
  return (
    <section className="section shell" aria-labelledby="pals-title">
      <h2 id="pals-title" className="sr-only">Meet the PALs</h2>
      <SectionHead eyebrow="Meet the PALs" lines={["Say hi to a few", "of them."]}
        lead="Example AI humans built on ManavOS. Pick one and start talking. Then build your own, with your face or ours." />
      <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURED_PALS.map((p, i) => (
          <li key={p.slug}><Reveal delay={i * 0.06}>
            <SiteLink href={`/try?persona=${p.slug}`} className="group block overflow-hidden rounded-[18px] bg-ink text-paper">
              <div className="relative aspect-[3/4] overflow-hidden">
                <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.03]">
                  <DitherHuman persona={p.persona} scene="night" dark="#0f0f10" light="#f2efe8" cell={3} yaw={i % 2 ? -0.25 : 0.25} follow label={`${p.personaName}, ${p.name}`} />
                </div>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink via-ink/60 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="t-mono text-paper/55">{p.name}</p>
                  <p className="mt-1 text-[1.6rem] leading-none tracking-[-0.03em]">{p.personaName}</p>
                  <p className="mt-3 line-clamp-2 text-[0.9rem] text-paper/70">&ldquo;{p.greeting}&rdquo;</p>
                </div>
              </div>
              <div className="t-mono flex items-center justify-between border-t border-paper/10 px-5 py-3.5">
                <span className="flex items-center gap-2"><span className="live-dot h-2 w-2 rounded-full bg-accent" />Talk to {p.personaName}</span>
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </div>
            </SiteLink>
          </Reveal></li>
        ))}
      </ul>
    </section>
  );
}
