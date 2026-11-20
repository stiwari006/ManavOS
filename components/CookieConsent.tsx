"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const CATS = [
  { k: "essential", n: "Essential", d: "Sign-in, security and load balancing. Always on.", locked: true },
  { k: "analytics", n: "Analytics", d: "Anonymous usage to improve the site." },
  { k: "marketing", n: "Marketing", d: "Measure campaigns across sites." },
  { k: "personal", n: "Personalization", d: "Remember choices like language." },
] as const;
type Prefs = Record<(typeof CATS)[number]["k"], boolean>;
const KEY = "hos-cookie-prefs";

export function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>({ essential: true, analytics: false, marketing: false, personal: false });

  useEffect(() => {
    try { const s = localStorage.getItem(KEY); if (s) setPrefs(JSON.parse(s)); else setOpen(true); } catch { setOpen(true); }
    const reopen = () => { setDetail(true); setOpen(true); };
    window.addEventListener("hos:cookies", reopen);
    return () => window.removeEventListener("hos:cookies", reopen);
  }, []);
  const save = (p: Prefs) => { setPrefs(p); try { localStorage.setItem(KEY, JSON.stringify(p)); } catch {} setOpen(false); setDetail(false); };

  return (
    <AnimatePresence>
      {open && (
        <motion.div role="dialog" aria-label="Cookie preferences"
          className="fixed bottom-3 left-3 right-3 z-[90] max-w-[440px] rounded-[16px] border border-line bg-paper p-5 text-ink shadow-2xl sm:bottom-5 sm:left-5"
          initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}>
          <p className="t-mono text-mute">Cookies</p>
          <p className="mt-2 text-[0.95rem] leading-snug">We use essential cookies to run ManavOS, and optional ones only with your permission.</p>
          {detail && (
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {CATS.map((c) => (
                <li key={c.k} className="flex items-start justify-between gap-4 py-3">
                  <div><p className="text-[0.92rem] font-medium">{c.n}</p><p className="text-[0.82rem] text-mute">{c.d}</p></div>
                  <button role="switch" aria-checked={prefs[c.k]} aria-label={c.n} disabled={"locked" in c}
                    onClick={() => setPrefs({ ...prefs, [c.k]: !prefs[c.k] })}
                    className={`relative mt-1 h-6 w-11 shrink-0 rounded-full transition ${prefs[c.k] ? "bg-ink" : "bg-line"} disabled:opacity-50`}>
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-paper transition-all ${prefs[c.k] ? "left-[22px]" : "left-0.5"}`} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {detail
              ? <button onClick={() => save(prefs)} className="t-mono h-10 flex-1 rounded-full bg-ink px-4 text-paper">Save choices</button>
              : <button onClick={() => setDetail(true)} className="t-mono h-10 rounded-full border border-line px-4 hover:border-ink">Preferences</button>}
            <button onClick={() => save({ essential: true, analytics: false, marketing: false, personal: false })} className="t-mono h-10 rounded-full border border-line px-4 hover:border-ink">Reject all</button>
            <button onClick={() => save({ essential: true, analytics: true, marketing: true, personal: true })} className="t-mono h-10 rounded-full bg-ink px-4 text-paper">Accept all</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
