import { Reveal } from "./Reveal";

const STATS = [
  { v: "24/7", l: "Interviews in every time zone, with no scheduling back-and-forth." },
  { v: "1", unit: "rubric", l: "Applied identically to every candidate, every time." },
  { v: "<600", unit: "ms", l: "Target response time per turn, so it feels like a conversation." },
  { v: "100%", l: "Of interviews transcribed, scored and searchable." },
];

export function Stats() {
  return (
    <section className="pb-[clamp(80px,10vw,152px)]">
      <div className="shell">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.v} delay={i * 0.07}>
              <div className="relative flex h-full min-h-[230px] flex-col justify-between overflow-hidden rounded-[16px] bg-card p-6">
                <div aria-hidden className="dots absolute -right-6 -top-6 h-40 w-40 rounded-full text-ink/[0.13] [mask-image:radial-gradient(circle,black,transparent_70%)]" />
                <p className="relative text-[clamp(3rem,5vw,4.4rem)] font-medium leading-none tracking-[-0.06em]">
                  {s.v}{s.unit && <span className="serif-i ml-1.5 text-[0.55em] text-mute">{s.unit}</span>}
                </p>
                <p className="relative mt-10 max-w-[28ch] text-[0.95rem] leading-snug text-ink/70">{s.l}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-3 text-[0.8rem] text-mute">Platform design targets for the HumanOS beta.</p>
      </div>
    </section>
  );
}
