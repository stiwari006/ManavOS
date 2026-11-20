"use client";
import { Mic, PhoneOff, Video } from "lucide-react";
import { useEffect, useState } from "react";
import type { PersonaKey } from "@/lib/render/engine";
import { DitherHuman } from "../DitherHuman";

type Line = { who: "agent" | "you"; text: string };

/** Looping, captioned call preview used on solution pages and the home page. */
export function CallStage({ persona, name, script, label, aspect = "aspect-[4/5] sm:aspect-[16/9]", compact = false }: {
  persona: PersonaKey; name: string; script: Line[]; label: string; aspect?: string; compact?: boolean;
}) {
  const [i, setI] = useState(0);
  const [chars, setChars] = useState(0);
  useEffect(() => {
    if (!script.length) return;
    const line = script[i].text;
    const t = chars < line.length ? setTimeout(() => setChars((c) => c + 2), 34) : setTimeout(() => { setI((i + 1) % script.length); setChars(0); }, 2200);
    return () => clearTimeout(t);
  }, [i, chars, script]);
  const line = script[i] ?? { who: "agent", text: "" };
  const typing = chars < line.text.length;
  return (
    <div className="relative overflow-hidden rounded-[18px] bg-ink text-paper">
      {!compact && (
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-5">
          <span className="t-mono flex items-center gap-2"><span className="live-dot h-2 w-2 rounded-full bg-accent" /> Live · {label}</span>
          <span className="t-mono text-paper/50">{name} · AI</span>
        </div>
      )}
      <div className={`relative ${aspect}`}>
        <DitherHuman persona={persona} scene="night" dark="#0f0f10" light="#f2efe8" cell={3} yaw={0.15} speaking={line.who === "agent" && typing} label={`${name}, an AI persona, on a video call`} />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-ink via-ink/75 to-transparent" />
        <div className={`absolute inset-x-4 ${compact ? "bottom-5" : "bottom-20 sm:bottom-24"} sm:left-1/2 sm:right-auto sm:w-[min(720px,82%)] sm:-translate-x-1/2`}>
          <p className="t-mono mb-2 text-center text-paper/50">{line.who === "agent" ? name : "You"}</p>
          <p className={`text-balance text-center leading-snug tracking-[-0.02em] ${compact ? "text-[1rem]" : "text-[1.05rem] sm:text-[1.45rem]"} ${line.who === "agent" ? "text-paper" : "text-paper/60"} ${typing ? "caret" : ""}`}>{line.text.slice(0, chars)}</p>
        </div>
        {!compact && (
          <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-2 sm:bottom-6" aria-hidden="true">
            {[Mic, Video].map((I, k) => <span key={k} className="grid h-11 w-11 place-items-center rounded-full bg-white/10"><I className="h-[18px] w-[18px]" /></span>)}
            <span className="grid h-11 w-14 place-items-center rounded-full bg-accent"><PhoneOff className="h-[18px] w-[18px]" /></span>
          </div>
        )}
      </div>
    </div>
  );
}
