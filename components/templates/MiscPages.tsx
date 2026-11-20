"use client";
import { ArrowRight, Check, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { DOCS, type DocPage } from "@/lib/content/docs";
import { FAQ, PLANS } from "@/lib/content/platform";
import { POSTS, type Post } from "@/lib/content/research";
import { SiteLink } from "@/lib/site/link";
import { LEGAL } from "@/lib/content/legal";
import { Closing } from "../Closing";
import { Contact } from "../Contact";
import { Developers } from "../Developers";
import { DitherHuman } from "../DitherHuman";
import { Enterprise } from "../Enterprise";
import { Evaluation } from "../Evaluation";
import { PageHero, RuledList, SectionHead } from "../page/Blocks";
import { Reveal } from "../Reveal";

/* ───────── Pricing ───────── */
export function PricingPage() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <>
      <PageHero eyebrow="Pricing" lines={["Start free.", "Pay by the minute."]} accent="minute." lead="Every plan includes all four models, Claude as the reasoning layer and the full API. You pay for live conversation minutes." />
      <section className="section">
        <div className="shell grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {PLANS.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.06} className="h-full">
              <div className={`flex h-full flex-col rounded-[18px] p-7 ${p.featured ? "bg-ink text-paper" : "border border-line bg-card"}`}>
                <div className="flex items-center justify-between"><p className="text-[1.4rem] font-medium tracking-[-0.035em]">{p.name}</p>{p.featured && <span className="t-mono rounded-full bg-accent px-2.5 py-1 text-ink">Popular</span>}</div>
                <p className={`mt-1 text-[0.92rem] ${p.featured ? "text-paper/60" : "text-mute"}`}>{p.blurb}</p>
                <p className="mt-8 text-[3rem] font-medium leading-none tracking-[-0.055em]">{p.price}<span className={`ml-2 text-[0.9rem] font-normal tracking-normal ${p.featured ? "text-paper/50" : "text-mute"}`}>{p.per}</span></p>
                <p className={`mt-3 text-[0.9rem] ${p.featured ? "text-paper/70" : "text-ink/70"}`}>{p.minutes}</p>
                <ul className="mt-7 flex-1 space-y-2.5">
                  {p.features.map((f) => <li key={f} className="flex gap-2.5 text-[0.94rem]"><Check className="mt-0.5 h-4 w-4 shrink-0" />{f}</li>)}
                </ul>
                <SiteLink href={p.name === "Enterprise" ? "/contact?topic=Pricing" : `/signup?plan=${p.name.toLowerCase()}`}
                  className={`t-mono mt-8 inline-flex h-12 items-center justify-center rounded-full ${p.featured ? "bg-paper text-ink" : "bg-ink text-paper"}`}>{p.cta}</SiteLink>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="shell mt-3 text-[0.8rem] text-mute">Prices in USD. Taxes may apply.</p>
      </section>
      <section className="section border-t border-line">
        <div className="shell grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4"><SectionHead eyebrow="" lines={["Questions,", "answered."]} /></div>
          <div className="lg:col-span-8">
            {FAQ.map(([q, a], i) => (
              <div key={q} className="border-t border-line">
                <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} className="flex w-full items-center justify-between gap-6 py-6 text-left text-[1.2rem] font-medium tracking-[-0.025em]">
                  {q}{open === i ? <Minus className="h-5 w-5 shrink-0" /> : <Plus className="h-5 w-5 shrink-0" />}
                </button>
                {open === i && <p className="t-body -mt-2 max-w-[62ch] pb-6 text-ink/70">{a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>
      <Closing lines={["Your first", "25 minutes", "are on us."]} label="ManavOS · Starter" topic="Pricing" />
    </>
  );
}

/* ───────── Developers ───────── */
export function DevelopersPage() {
  return (
    <>
      <PageHero eyebrow="Developer platform" lines={["A face for", "your AI in", "one API call."]} accent="face" lead="Rendering, perception, turn-taking, memory and real-time media, as building blocks. You own the logic."
        ctas={[{ label: "Get an API key", href: "/signup?type=developer", primary: true }, { label: "Quickstart", href: "/docs/quickstart" }]} />
      <div className="mt-20"><Developers /></div>
      <Evaluation />
      <section className="section border-t border-line">
        <div className="shell">
          <SectionHead eyebrow="Documentation" lines={["Start with", "the docs."]} />
          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:ml-[25%] lg:grid-cols-3">
            {DOCS.map((d) => (
              <SiteLink key={d.slug} href={`/docs/${d.slug}`} className="group rounded-[14px] border border-line bg-card p-5 hover:border-ink">
                <span className="t-mono text-mute">{d.group}</span>
                <span className="mt-6 block text-[1.25rem] font-medium tracking-[-0.03em]">{d.title}</span>
                <span className="mt-1 block text-[0.9rem] text-ink/60">{d.lead}</span>
              </SiteLink>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

/* ───────── Docs ───────── */
export function DocsPage({ d }: { d: DocPage }) {
  const groups = Array.from(new Set(DOCS.map((x) => x.group)));
  const idx = DOCS.findIndex((x) => x.slug === d.slug);
  const next = DOCS[idx + 1];
  return (
    <div className="shell grid gap-10 py-12 lg:grid-cols-[220px_minmax(0,1fr)] lg:py-16">
      <nav aria-label="Docs" className="lg:sticky lg:top-24 lg:self-start">
        <div className="flex gap-2 overflow-x-auto lg:block">
          {groups.map((g) => (
            <div key={g} className="shrink-0 lg:mb-6">
              <p className="t-mono hidden text-mute lg:block">{g}</p>
              <ul className="mt-2 flex gap-1 lg:block">
                {DOCS.filter((x) => x.group === g).map((x) => (
                  <li key={x.slug}><SiteLink href={`/docs/${x.slug}`} className={`block whitespace-nowrap rounded-[8px] px-3 py-2 text-[0.94rem] ${x.slug === d.slug ? "bg-ink text-paper" : "hover:bg-sand"}`}>{x.title}</SiteLink></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>
      <article className="max-w-[760px]">
        <p className="t-mono text-mute">{d.group}</p>
        <h1 className="t-h2 mt-4">{d.title}</h1>
        <p className="t-lead mt-5 text-ink/70">{d.lead}</p>
        <div className="mt-10 space-y-6">
          {d.blocks.map((b, i) => (
            <div key={i}>
              {b.h && <h2 className="mb-3 text-[1.4rem] font-medium tracking-[-0.03em]">{b.h}</h2>}
              {b.p && <p className="t-body text-ink/75">{b.p}</p>}
              {b.code && <CopyCode code={b.code} lang={b.lang} />}
              {b.table && (
                <div className="mt-2 overflow-x-auto rounded-[12px] border border-line">
                  <table className="w-full text-left text-[0.9rem]">
                    <thead className="bg-sand/60"><tr>{b.table[0].map((c) => <th key={c} className="t-mono px-4 py-3 font-normal text-mute">{c}</th>)}</tr></thead>
                    <tbody>{b.table.slice(1).map((r, k) => <tr key={k} className="border-t border-line">{r.map((c, j) => <td key={j} className={`px-4 py-3 align-top ${j === 0 ? "font-mono text-[0.84rem]" : ""}`}>{c}</td>)}</tr>)}</tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
        {next && (
          <SiteLink href={`/docs/${next.slug}`} className="group mt-14 flex items-center justify-between rounded-[14px] border border-line bg-card p-5 hover:border-ink">
            <span><span className="t-mono text-mute">Next</span><span className="block text-[1.2rem] font-medium tracking-[-0.03em]">{next.title}</span></span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </SiteLink>
        )}
      </article>
    </div>
  );
}

function CopyCode({ code, lang }: { code: string; lang?: string }) {
  const [c, setC] = useState(false);
  return (
    <div className="relative mt-2 overflow-hidden rounded-[12px] bg-ink text-paper">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <span className="t-mono text-paper/40">{lang ?? "code"}</span>
        <button onClick={async () => { try { await navigator.clipboard.writeText(code); setC(true); setTimeout(() => setC(false), 1500); } catch {} }} className="t-mono h-8 rounded-full px-3 text-paper/60 hover:bg-white/10">{c ? "Copied" : "Copy"}</button>
      </div>
      <pre className="overflow-x-auto p-4 text-[0.84rem] leading-[1.7]"><code className="font-mono">{code}</code></pre>
    </div>
  );
}

/* ───────── Research ───────── */
export function ResearchIndex() {
  return (
    <>
      <PageHero eyebrow="Research" lines={["Teaching machines", "to be present."]} accent="present." lead="Notes from our work on perception, rendering, conversation and responsible deployment." />
      <section className="section">
        <div className="shell">
          {POSTS.map((p, i) => (
            <Reveal key={p.slug} delay={0.04 * i}>
              <SiteLink href={`/research/${p.slug}`} className="group grid gap-4 border-t border-line py-8 md:grid-cols-12">
                <span className="t-mono text-mute md:col-span-2">{p.date}</span>
                <span className="t-mono text-mute md:col-span-2">{p.kind}</span>
                <span className="md:col-span-8">
                  <span className="block text-[clamp(1.4rem,2.4vw,2rem)] font-medium leading-tight tracking-[-0.035em] group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">{p.title}</span>
                  <span className="t-body mt-2 block max-w-[62ch] text-ink/60">{p.summary}</span>
                </span>
              </SiteLink>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}

export function ResearchPost({ p }: { p: Post }) {
  return (
    <article className="shell py-14 sm:py-20">
      <SiteLink href="/research" className="t-mono text-mute hover:text-ink">← Research</SiteLink>
      <div className="mx-auto mt-10 max-w-[760px]">
        <p className="t-mono text-mute">{p.kind} · {p.date}</p>
        <h1 className="t-h2 mt-5">{p.title}</h1>
        <p className="t-lead mt-6 text-ink/70">{p.summary}</p>
        <div className="my-12 aspect-[16/9] overflow-hidden rounded-[18px] bg-ink">
          <DitherHuman persona={p.slug.includes("body") ? "aarohi" : p.slug.includes("pause") ? "dev" : p.slug.includes("fair") ? "mira" : "ines"} scene="night" dark="#0f0f10" light="#f2efe8" cell={3} yaw={0.25} label="Research illustration: a ManavOS persona render" />
        </div>
        <div className="space-y-5">{p.body.map((para, i) => <p key={i} className="text-[1.08rem] leading-[1.7] text-ink/80">{para}</p>)}</div>
      </div>
    </article>
  );
}

/* ───────── Enterprise / About / Contact / Legal / Studio ───────── */
export function EnterprisePage() {
  return (
    <>
      <PageHero eyebrow="Enterprise" lines={["Human-grade AI,", "enterprise-grade", "controls."]} accent="controls." lead="Security reviews, data residency, SSO and dedicated capacity for teams running thousands of conversations."
        ctas={[{ label: "Talk to sales", href: "/contact?topic=Pricing", primary: true }, { label: "See pricing", href: "/pricing" }]} />
      <div className="mt-10"><Enterprise /></div>
      <section id="trust" className="bg-ink text-paper">
        <div className="shell section">
          <SectionHead dark eyebrow="Trust center" lines={["Our commitments,", "in writing."]} />
          <div className="mt-12 lg:ml-[25%]">
            <RuledList dark items={[
              { t: "AI disclosure", b: "Every persona identifies itself as an AI. Customers cannot turn this off." },
              { t: "Consent for likeness", b: "Custom faces and voices require verified consent from the person depicted." },
              { t: "No training on your data", b: "Customer conversations are never used to train shared models." },
              { t: "Human decisions", b: "Evaluations support people's decisions; we prohibit fully automated consequential decisions." },
              { t: "Security program", b: "Encryption, access reviews, penetration testing, and a SOC 2 Type II program in progress." },
              { t: "Responsible disclosure", b: "Report vulnerabilities to security@manavos.ai. We respond within two business days." },
            ]} />
          </div>
        </div>
      </section>
      <Contact />
    </>
  );
}

export function AboutPage() {
  return (
    <>
      <PageHero eyebrow="About" lines={["We're building", "the human", "interface."]} accent="human" lead="Computers learned to speak our language. Next, they learn to meet us the way people do: face to face, with attention and memory." />
      <section className="section">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <div className="aspect-[4/5] overflow-hidden rounded-[18px] bg-sand"><DitherHuman persona="aarohi" scene="paper" dark="#0f0f10" light="#e7e2d7" cell={3} yaw={-0.25} follow label="Aarohi, ManavOS's first persona" /></div>
          </div>
          <div className="space-y-6 lg:col-span-6 lg:pt-10">
            <p className="t-h3">ManavOS started with a simple observation: people open up to faces. We trust, remember and enjoy conversations with someone more than with something.</p>
            <p className="t-body text-ink/70">So we're building the stack that lets any product meet people face to face: perception that notices, rendering that feels present, conversation that waits for meaning, and memory that makes the second conversation better than the first.</p>
            <p className="t-body text-ink/70">Our first persona, Aarohi, speaks English, Hindi and Hinglish, and always tells you she's an AI. She'll be the first of many.</p>
            <p className="t-body text-ink/70">We're based in Toronto, and we build with Claude as the reasoning layer at the heart of every persona.</p>
          </div>
        </div>
      </section>
      <section id="careers" className="section border-t border-line">
        <div className="shell">
          <SectionHead eyebrow="Careers" lines={["Help build", "what's next."]} lead="We're a small team hiring for a few founding roles. If you don't see your role, write to us anyway." />
          <div className="mt-12 lg:ml-[25%]">
            {[["Founding graphics engineer", "Rendering · Toronto or remote"], ["Real-time ML engineer", "Conversation · Toronto or remote"], ["Founding designer", "Product & brand · Toronto"], ["Solutions engineer", "Enterprise · Remote, North America"]].map(([r, m]) => (
              <SiteLink key={r} href={`/contact?topic=${encodeURIComponent("Something else")}`} className="group flex items-center justify-between gap-6 border-t border-line py-6">
                <span><span className="block text-[1.35rem] font-medium tracking-[-0.03em]">{r}</span><span className="text-[0.92rem] text-mute">{m}</span></span>
                <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
              </SiteLink>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export function ContactPage() {
  return (
    <>
      <div className="pt-6" />
      <Contact />
      <section className="shell grid gap-3 pb-[clamp(80px,10vw,140px)] sm:grid-cols-3">
        {[["Sales", "sales@manavos.ai"], ["Support", "support@manavos.ai"], ["Security", "security@manavos.ai"]].map(([k, v]) => (
          <div key={k} className="rounded-[14px] border border-line bg-card p-5"><p className="t-mono text-mute">{k}</p><p className="mt-2 text-[1.1rem]">{v}</p></div>
        ))}
      </section>
    </>
  );
}

export function LegalPage({ slug }: { slug: string }) {
  const l = LEGAL[slug];
  return (
    <article className="shell py-14 sm:py-20">
      <div className="mx-auto max-w-[760px]">
        <p className="t-mono text-mute">Legal · Template, review with counsel before launch</p>
        <h1 className="t-h2 mt-5">{l.title}</h1>
        <div className="mt-12 space-y-8">{l.body.map(([h, b]) => <section key={h}><h2 className="text-[1.3rem] font-medium tracking-[-0.03em]">{h}</h2><p className="t-body mt-2 text-ink/75">{b}</p></section>)}</div>
      </div>
    </article>
  );
}

export function StudioPage() {
  return (
    <>
      <PageHero eyebrow="Persona Studio" lines={["Design an AI human", "in an afternoon."]} accent="afternoon." lead="Pick a face, give it a voice and a personality, add knowledge and memory, and talk to it immediately. No code required."
        ctas={[{ label: "Open Studio", href: "/app/personas/new", primary: true }, { label: "Talk to a persona", href: "/try" }]}>
        <div className="mt-14 grid gap-3 sm:mt-20 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <div className="rounded-[18px] border border-line bg-card p-6">
            {[["Face", "Aarohi · stock"], ["Voice", "Warm, measured · en-IN"], ["Personality", "Precise, kind, curious"], ["Knowledge", "3 documents"], ["Memory", "On · per participant"], ["Perception", "Iris-2 · emotion + screen"]].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between border-b border-line py-3.5 last:border-0"><span className="t-mono text-mute">{k}</span><span className="text-[0.98rem]">{v}</span></div>
            ))}
          </div>
          <div className="aspect-[4/3] overflow-hidden rounded-[18px] bg-ink"><DitherHuman persona="aarohi" scene="night" dark="#0f0f10" light="#f2efe8" cell={3} yaw={0.2} follow label="Persona preview in Studio" /></div>
        </div>
      </PageHero>
      <section className="section">
        <div className="shell">
          <SectionHead eyebrow="In Studio" lines={["Everything in", "one editor."]} />
          <div className="mt-12 lg:ml-[25%]"><RuledList cols={3} items={[
            { t: "Faces", b: "Six stock faces, or create your own from two minutes of consented video." },
            { t: "Voices", b: "Stock voices, consented clones or your TTS provider." },
            { t: "Personality", b: "Write it in plain language; we turn it into a system prompt." },
            { t: "Knowledge", b: "Drop in documents and links." },
            { t: "Evaluations", b: "Add a rubric and every conversation gets scored." },
            { t: "Share", b: "A link, an embed, or the API." },
          ]} /></div>
        </div>
      </section>
      <Closing lines={["Your persona", "is a few clicks", "away."]} label="ManavOS · Studio" topic="Something else" />
    </>
  );
}
