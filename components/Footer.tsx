"use client";
import { LogoMark } from "./Logo";
import { SiteLink } from "@/lib/site/link";

const COLS: { h: string; links: [string, string][] }[] = [
  { h: "Company", links: [["About", "/about"], ["Careers", "/about#careers"], ["Research", "/research"], ["Contact", "/contact"]] },
  { h: "Platform", links: [["Persona Studio", "/studio"], ["Models", "/models"], ["Features", "/features"], ["Pricing", "/pricing"], ["Enterprise", "/enterprise"]] },
  { h: "Developers", links: [["Developer platform", "/developers"], ["Quickstart", "/docs/quickstart"], ["API reference", "/docs/api-reference"], ["Webhooks", "/docs/webhooks"], ["Dashboard", "/app"]] },
  { h: "Solutions", links: [["AI Interviewer", "/solutions/ai-interviewer"], ["AI Tutor", "/solutions/ai-tutor"], ["AI Coach", "/solutions/ai-coach"], ["Healthcare", "/solutions/healthcare"], ["AI SDR", "/solutions/ai-sdr"], ["Customer experience", "/solutions/customer-experience"]] },
  { h: "Models", links: [["Iris", "/models/iris"], ["Lumen", "/models/lumen"], ["Cadence", "/models/cadence"], ["Recall", "/models/recall"]] },
  { h: "Legal", links: [["Privacy", "/legal/privacy"], ["Terms", "/legal/terms"], ["Acceptable use", "/legal/acceptable-use"], ["Trust center", "/enterprise#trust"]] },
];

const AI = [
  ["Claude", "https://claude.ai/new?q="],
  ["ChatGPT", "https://chatgpt.com/?q="],
  ["Perplexity", "https://www.perplexity.ai/search?q="],
];

export function Footer() {
  const q = encodeURIComponent("What is HumanOS and how do its AI human interviewers work?");
  return (
    <footer className="bg-ink text-paper">
      <div className="shell pt-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <LogoMark className="h-9 w-9" />
            <p className="mt-6 max-w-[30ch] text-[1.4rem] leading-tight tracking-[-0.035em]">The human interface for <span className="serif-i">everything</span> you build.</p>
            <p className="mt-6 text-[0.9rem] text-paper/50">hello@humanos.ai · Toronto</p>
            <button onClick={() => window.dispatchEvent(new Event("hos:cookies"))} className="mt-3 text-[0.85rem] text-paper/50 underline-offset-4 hover:text-paper hover:underline">Cookie preferences</button>
          </div>
          <nav className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:col-span-8" aria-label="Footer">
            {COLS.map((c) => (
              <div key={c.h}>
                <p className="t-mono text-paper/40">{c.h}</p>
                <ul className="mt-4 space-y-2.5">
                  {c.links.map(([l, href]) => (
                    <li key={l}>
                      <SiteLink href={href} className="text-[0.95rem] text-paper/75 hover:text-paper">{l}</SiteLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-16 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 pt-6">
          <p className="t-mono text-paper/40">Ask an AI about us</p>
          {AI.map(([n, u]) => <a key={n} href={u + q} target="_blank" rel="noreferrer" className="text-[0.95rem] text-paper/75 underline-offset-4 hover:text-paper hover:underline">{n}</a>)}
          <span className="ml-auto flex gap-5">
            {[["LinkedIn", "https://www.linkedin.com"], ["X", "https://x.com"], ["YouTube", "https://www.youtube.com"], ["GitHub", "https://github.com"]].map(([n, u]) => (
              <a key={n} href={u} target="_blank" rel="noreferrer" className="text-[0.95rem] text-paper/75 hover:text-paper">{n}</a>
            ))}
          </span>
        </div>

        <p aria-hidden className="select-none pt-10 text-[clamp(4.5rem,19.5vw,19.5rem)] font-semibold leading-[0.78] tracking-[-0.075em] text-paper">
          human<span className="text-paper/25">OS</span>
        </p>
        <div className="flex flex-wrap justify-between gap-3 border-t border-white/10 py-6 text-[0.8rem] text-paper/40">
          <span>© 2026 HumanOS · The human interface company</span>
          <span>All rights reserved</span>
        </div>
      </div>
    </footer>
  );
}
