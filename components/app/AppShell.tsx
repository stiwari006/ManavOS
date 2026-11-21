"use client";
import { BarChart3, BookOpen, FileText, Home, KeyRound, LogOut, Menu, MessagesSquare, Settings, Users, X, ScanFace } from "lucide-react";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { api } from "@/lib/client/api";
import { DEMO, SiteLink, go } from "@/lib/site/link";
import type { Capabilities, PublicUser } from "@/lib/types";
import { Logo } from "../Logo";

type Ctx = { user: PublicUser; caps: Capabilities; setUser: (u: PublicUser) => void };
const AppCtx = createContext<Ctx | null>(null);
export const useApp = () => useContext(AppCtx)!;

const NAV = [
  { href: "/app", label: "Overview", icon: Home },
  { href: "/app/personas", label: "Personas", icon: Users },
  { href: "/app/faces", label: "Faces", icon: ScanFace },
  { href: "/app/conversations", label: "Conversations", icon: MessagesSquare },
  { href: "/app/knowledge", label: "Knowledge", icon: FileText },
  { href: "/app/keys", label: "API keys", icon: KeyRound },
  { href: "/app/usage", label: "Usage", icon: BarChart3 },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function useParam(name: string) {
  const [v, setV] = useState<string | null>(null);
  useEffect(() => { setV(new URLSearchParams(location.search).get(name)); }, [name]);
  return v;
}

export function AppShell({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [caps, setCaps] = useState<Capabilities | null>(null);
  const [path, setPath] = useState("");
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setPath(location.pathname.replace(/\/index\.html$/, "").replace(/\/$/, ""));
    api.me().then((u) => { if (!u) go(`/login?next=${encodeURIComponent(location.pathname + location.search)}`); else setUser(u); });
    api.capabilities().then(setCaps).catch(() => setCaps({ video: false, claude: false, demo: DEMO }));
  }, []);
  if (!user || !caps) return <div className="grid min-h-svh place-items-center bg-paper"><p className="t-mono text-mute">Loading workspace…</p></div>;
  const active = (h: string) => h === "/app" ? /\/app$/.test(path) : path.includes(h);

  const nav = (
    <nav className="flex flex-1 flex-col gap-0.5" aria-label="Dashboard">
      {NAV.map(({ href, label, icon: I }) => (
        <SiteLink key={href} href={href} onClick={() => setOpen(false)} aria-current={active(href) ? "page" : undefined}
          className={`flex h-10 items-center gap-3 rounded-[10px] px-3 text-[0.94rem] transition ${active(href) ? "bg-ink text-paper" : "text-ink/75 hover:bg-sand"}`}>
          <I className="h-4 w-4" strokeWidth={1.75} />{label}
        </SiteLink>
      ))}
      <div className="mt-auto pt-6">
        <SiteLink href="/docs/quickstart" className="flex h-10 items-center gap-3 rounded-[10px] px-3 text-[0.94rem] text-ink/75 hover:bg-sand"><BookOpen className="h-4 w-4" strokeWidth={1.75} />Docs</SiteLink>
        <button onClick={async () => { await api.logout(); go("/login"); }} className="flex h-10 w-full items-center gap-3 rounded-[10px] px-3 text-[0.94rem] text-ink/75 hover:bg-sand"><LogOut className="h-4 w-4" strokeWidth={1.75} />Log out</button>
        <div className="mt-3 rounded-[12px] border border-line p-3">
          <p className="truncate text-[0.9rem] font-medium">{user.name}</p>
          <p className="truncate text-[0.8rem] text-mute">{user.email}</p>
          <p className="t-mono mt-2 text-mute">{user.plan} plan</p>
        </div>
      </div>
    </nav>
  );

  return (
    <MotionConfig reducedMotion="user">
      <AppCtx.Provider value={{ user, caps, setUser }}>
        <div className="min-h-svh bg-paper lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
          <aside className="sticky top-0 hidden h-svh flex-col border-r border-line p-4 lg:flex">
            <SiteLink href="/" className="mb-6 px-2 pt-2"><Logo /></SiteLink>{nav}
          </aside>
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-paper/90 px-4 backdrop-blur lg:hidden">
            <SiteLink href="/app"><Logo /></SiteLink>
            <button onClick={() => setOpen(true)} className="grid h-11 w-11 place-items-center rounded-full hover:bg-sand" aria-label="Open menu"><Menu className="h-5 w-5" /></button>
          </header>
          {open && (
            <div className="fixed inset-0 z-50 flex flex-col bg-paper p-4 lg:hidden">
              <div className="mb-4 flex items-center justify-between"><Logo /><button onClick={() => setOpen(false)} className="grid h-11 w-11 place-items-center rounded-full hover:bg-sand" aria-label="Close menu"><X className="h-5 w-5" /></button></div>
              {nav}
            </div>
          )}
          <main className="min-w-0">
            {caps.demo && <div className="border-b border-line bg-accent-soft px-6 py-2 text-[0.85rem]">Preview mode: data stays in this browser and conversations are scripted. Deploy with Tavus and Anthropic keys for live video.</div>}
            <div className="mx-auto max-w-[1180px] p-5 sm:p-8 lg:p-10">{children}</div>
          </main>
        </div>
      </AppCtx.Provider>
    </MotionConfig>
  );
}

export function PageTitle({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="text-[clamp(1.9rem,3.2vw,2.6rem)] font-medium leading-none tracking-[-0.045em]">{title}</h1>{sub && <p className="mt-2 max-w-[60ch] text-ink/65">{sub}</p>}</div>
      {action}
    </div>
  );
}

export const btn = "t-mono inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 transition disabled:opacity-40";
export const btnDark = `${btn} bg-ink text-paper hover:bg-graphite`;
export const btnLine = `${btn} border border-line hover:border-ink`;
export const field = "h-11 w-full rounded-[10px] border border-line bg-card px-3.5 outline-none transition focus:border-ink";
export const card = "rounded-[16px] border border-line bg-card";
export function ago(iso: string) {
  const s = (Date.now() - Date.parse(iso)) / 1000;
  if (s < 60) return "just now"; if (s < 3600) return `${Math.round(s / 60)} min ago`; if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
export const dur = (s?: number) => s == null ? "–" : s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
