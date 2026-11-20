"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { useSite } from "./SiteContext";
import { SiteLink } from "@/lib/site/link";

type Item = { label: string; desc?: string; href: string; topic?: string };
type Group = { label: string; items?: Item[]; href?: string; topic?: string; feature?: { title: string; body: string; href: string } };

export const NAV: Group[] = [
  {
    label: "Product",
    items: [
      { label: "Persona Studio", desc: "Design, voice and launch an AI human without code", href: "/studio" },
      { label: "Conversational Video API", desc: "Real-time, face-to-face AI inside your product", href: "/developers" },
      { label: "Pricing", desc: "Start free, scale by the minute", href: "/pricing" },
      { label: "Enterprise", desc: "Security, scale and private deployment", href: "/enterprise" },
    ],
    feature: { title: "Aarohi-1 preview", body: "Our first full-body persona: gesture, posture and presence, not just a face.", href: "/research/full-body-presence" },
  },
  {
    label: "Solutions",
    items: [
      { label: "AI Interviewer", desc: "Structured first-round interviews at any volume", href: "/solutions/ai-interviewer" },
      { label: "AI Tutor", desc: "Patient, one-to-one teaching", href: "/solutions/ai-tutor" },
      { label: "AI Coach", desc: "Practice that talks back", href: "/solutions/ai-coach" },
      { label: "Healthcare intake", desc: "Warm, consistent patient check-ins", href: "/solutions/healthcare" },
      { label: "AI SDR", desc: "Face-to-face qualification, 24/7", href: "/solutions/ai-sdr" },
      { label: "Customer experience", desc: "Support with a face and a memory", href: "/solutions/customer-experience" },
      { label: "Dream your own", desc: "Custom agents for any conversation", href: "/solutions/custom" },
    ],
  },
  {
    label: "Platform",
    items: [
      { label: "Iris", desc: "Perception: sees expression and context", href: "/models/iris" },
      { label: "Lumen", desc: "Rendering: photoreal faces and bodies", href: "/models/lumen" },
      { label: "Cadence", desc: "Conversation: turn-taking and voice", href: "/models/cadence" },
      { label: "Recall", desc: "Memory across sessions", href: "/models/recall" },
      { label: "All features", desc: "Memory, knowledge, perception, meetings…", href: "/features" },
    ],
  },
  {
    label: "Developers",
    items: [
      { label: "Developer platform", desc: "APIs, SDKs and real-time infrastructure", href: "/developers" },
      { label: "Quickstart", desc: "First conversation in five minutes", href: "/docs/quickstart" },
      { label: "API reference", desc: "Personas, conversations, webhooks", href: "/docs/api-reference" },
      { label: "Dashboard", desc: "Keys, personas and usage", href: "/app" },
    ],
  },
  { label: "Research", href: "/research" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
];

export function Nav() {
  const { openAccount, contactAbout } = useSite();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const [mobileGroup, setMobileGroup] = useState<string | null>(null);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => { document.body.style.overflow = mobile ? "hidden" : ""; }, [mobile]);

  const go = (e: React.MouseEvent, it: { href: string; topic?: string }) => {
    setOpen(null); setMobile(false);
    if (it.topic) { e.preventDefault(); contactAbout(it.topic); }
  };

  return (
    <header className="sticky top-0 z-50">
      <div
        className={`transition-[background,border-color,backdrop-filter] duration-500 border-b ${
          scrolled || open ? "bg-paper/88 backdrop-blur-md border-line" : "bg-paper/0 border-transparent"
        }`}
        onMouseLeave={() => setOpen(null)}
      >
        <nav className="shell flex h-[68px] items-center gap-6" aria-label="Main">
          <SiteLink href="/" className="shrink-0" aria-label="HumanOS home"><Logo /></SiteLink>
          <ul className="ml-4 hidden items-center lg:flex">
            {NAV.map((g) => (
              <li key={g.label} className="relative" onMouseEnter={() => setOpen(g.items ? g.label : null)}>
                {g.items ? (
                  <button
                    className="flex h-11 items-center gap-1 rounded-full px-3.5 text-[0.92rem] tracking-[-0.01em] text-ink/80 hover:text-ink"
                    aria-expanded={open === g.label}
                    onClick={() => setOpen(open === g.label ? null : g.label)}
                    onFocus={() => setOpen(g.label)}
                  >
                    {g.label}
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open === g.label ? "rotate-180" : ""}`} />
                  </button>
                ) : (
                  <SiteLink href={g.href!} onClick={(e) => go(e, { href: g.href!, topic: g.topic })}
                    className="flex h-11 items-center rounded-full px-3.5 text-[0.92rem] tracking-[-0.01em] text-ink/80 hover:text-ink">
                    {g.label}
                  </SiteLink>
                )}
              </li>
            ))}
          </ul>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => openAccount("login")} className="t-mono hidden h-10 rounded-full px-4 hover:bg-sand sm:block">Log in</button>
            <button onClick={() => openAccount("signup")} className="t-mono h-10 rounded-full bg-ink px-5 text-paper transition hover:bg-graphite">Get started</button>
            <button onClick={() => setMobile(true)} className="grid h-11 w-11 place-items-center rounded-full hover:bg-sand lg:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </nav>

        {/* Mega panel */}
        <AnimatePresence>
          {open && (
            <motion.div
              key={open}
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="hidden border-t border-line lg:block"
            >
              {NAV.filter((g) => g.label === open).map((g) => (
                <div key={g.label} className="shell grid grid-cols-12 gap-8 py-8">
                  <p className="t-mono col-span-2 pt-2 text-mute">{g.label}</p>
                  <ul className={`grid gap-x-8 gap-y-1 ${g.feature ? "col-span-6" : "col-span-10"} ${g.items!.length > 4 ? "grid-cols-2 xl:grid-cols-3" : "grid-cols-2"}`}>
                    {g.items!.map((it) => (
                      <li key={it.label}>
                        <SiteLink href={it.href} onClick={(e) => go(e, it)} className="group block rounded-[10px] p-3 -m-0 hover:bg-sand/70">
                          <span className="flex items-center gap-1.5 text-[1rem] font-medium tracking-[-0.02em]">
                            {it.label}
                            <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-60" />
                          </span>
                          {it.desc && <span className="mt-0.5 block text-[0.88rem] leading-snug text-mute">{it.desc}</span>}
                        </SiteLink>
                      </li>
                    ))}
                  </ul>
                  {g.feature && (
                    <SiteLink href={g.feature.href} onClick={() => setOpen(null)} className="col-span-4 flex flex-col justify-end rounded-[14px] bg-ink p-6 text-paper hover:bg-coal">
                      <span className="t-mono text-accent">New</span>
                      <span className="mt-2 text-[1.25rem] font-medium tracking-[-0.03em]">{g.feature.title}</span>
                      <span className="mt-1 text-sm text-paper/60">{g.feature.body}</span>
                    </SiteLink>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile sheet */}
      <AnimatePresence>
        {mobile && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col bg-paper lg:hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div className="shell flex h-[68px] shrink-0 items-center justify-between border-b border-line">
              <Logo />
              <button onClick={() => setMobile(false)} className="grid h-11 w-11 place-items-center rounded-full hover:bg-sand" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="shell flex-1 overflow-y-auto py-4">
              {NAV.map((g) => (
                <div key={g.label} className="border-b border-line">
                  {g.items ? (
                    <>
                      <button className="flex h-14 w-full items-center justify-between text-[1.4rem] font-medium tracking-[-0.03em]"
                        aria-expanded={mobileGroup === g.label}
                        onClick={() => setMobileGroup(mobileGroup === g.label ? null : g.label)}>
                        {g.label}
                        <ChevronDown className={`h-5 w-5 transition-transform ${mobileGroup === g.label ? "rotate-180" : ""}`} />
                      </button>
                      <AnimatePresence initial={false}>
                        {mobileGroup === g.label && (
                          <motion.ul initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                            {g.items.map((it) => (
                              <li key={it.label}>
                                <SiteLink href={it.href} onClick={(e) => go(e, it)} className="block py-2.5 pl-1">
                                  <span className="block font-medium">{it.label}</span>
                                  <span className="block text-sm text-mute">{it.desc}</span>
                                </SiteLink>
                              </li>
                            ))}
                            <li className="h-3" />
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <SiteLink href={g.href!} onClick={(e) => go(e, { href: g.href!, topic: g.topic })} className="flex h-14 items-center text-[1.4rem] font-medium tracking-[-0.03em]">{g.label}</SiteLink>
                  )}
                </div>
              ))}
            </div>
            <div className="shell grid shrink-0 grid-cols-2 gap-2 border-t border-line py-4">
              <button onClick={() => { setMobile(false); openAccount("login"); }} className="t-mono h-12 rounded-full border border-line">Log in</button>
              <button onClick={() => { setMobile(false); openAccount("signup"); }} className="t-mono h-12 rounded-full bg-ink text-paper">Get started</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
