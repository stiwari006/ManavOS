"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { go } from "@/lib/site/link";
import { useEffect, useRef } from "react";

const TYPES = [
  {
    id: "developer",
    name: "Developer",
    body: "API keys, SDKs and a sandbox persona. Put a real-time AI human inside your own product.",
    who: "For engineers and product teams building with AI.",
    cta: "Create developer account",
  },
  {
    id: "teams",
    name: "Teams",
    body: "Launch Aarohi as your interviewer with no code: rubrics, scheduling, scorecards and ATS sync.",
    who: "For recruiting, talent and people teams.",
    cta: "Start a team workspace",
  },
] as const;

export function AccountDialog({ mode, onClose }: { mode: null | "signup" | "login"; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mode) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [mode, onClose]);

  const type = undefined as (typeof TYPES)[number] | undefined;
  const done = false;

  return (
    <AnimatePresence>
      {mode && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/55 p-3 backdrop-blur-[2px] sm:items-center sm:p-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="acct-title"
            className="relative w-full max-w-[860px] overflow-hidden rounded-[18px] bg-paper text-ink shadow-2xl outline-none"
            initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <button onClick={onClose} aria-label="Close" className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full hover:bg-sand">
              <X className="h-5 w-5" />
            </button>
            <div className="p-6 sm:p-10">
              <p className="t-mono text-mute">{mode === "login" ? "Log in" : "Get started"}</p>
              <h2 id="acct-title" className="t-h3 mt-3 max-w-[22ch]">
                {done ? "You're on the list." : type ? type.cta : mode === "login" ? "Which workspace are you signing in to?" : "Select an account type"}
              </h2>
              {!type && !done && (
                <p className="t-body mt-3 max-w-[52ch] text-mute">Both run on the same HumanOS models. Pick the one that matches how you'll use it. You can add the other later.</p>
              )}

              {!type && !done && (
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {TYPES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => go(`/${mode === "login" ? "login" : "signup"}?type=${t.id}`)}
                      className="group flex flex-col rounded-[14px] border border-line bg-card p-6 text-left transition hover:border-ink"
                    >
                      <span className="text-[1.35rem] font-medium tracking-[-0.03em]">{t.name}</span>
                      <span className="t-body mt-2 text-ink/80">{t.body}</span>
                      <span className="mt-4 text-sm text-mute">{t.who}</span>
                      <span className="t-mono mt-7 flex h-11 items-center justify-between rounded-full bg-ink px-5 text-paper">
                        {mode === "login" ? `Log in to ${t.name}` : t.cta}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </button>
                  ))}
                </div>
              )}

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
