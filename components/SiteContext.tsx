"use client";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { AccountDialog } from "./AccountDialog";
import { go } from "@/lib/site/link";

type Ctx = {
  openAccount: (mode?: "signup" | "login") => void;
  contactAbout: (topic: string) => void;
  topic: string;
  setTopic: (t: string) => void;
};
const SiteCtx = createContext<Ctx | null>(null);

export function useSite() {
  const c = useContext(SiteCtx);
  if (!c) throw new Error("useSite outside provider");
  return c;
}

export function SiteProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<null | "signup" | "login">(null);
  const [topic, setTopic] = useState("AI Interviewer");
  useEffect(() => {
    const t = new URLSearchParams(location.search).get("topic");
    if (t) setTopic(t);
  }, []);
  const contactAbout = useCallback((t: string) => {
    setTopic(t);
    const el = document.getElementById("contact");
    if (!el) { go(`/contact?topic=${encodeURIComponent(t)}`); return; }
    el.scrollIntoView({ behavior: "smooth" });
    window.setTimeout(() => (document.getElementById("contact-name") as HTMLInputElement | null)?.focus({ preventScroll: true }), 700);
  }, []);
  return (
    <MotionConfig reducedMotion="user">
      <SiteCtx.Provider value={{ openAccount: (m = "signup") => setAccount(m), contactAbout, topic, setTopic }}>
        {children}
        <AccountDialog mode={account} onClose={() => setAccount(null)} />
      </SiteCtx.Provider>
    </MotionConfig>
  );
}
