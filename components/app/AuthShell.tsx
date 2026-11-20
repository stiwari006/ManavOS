"use client";
import { DitherHuman } from "../DitherHuman";
import { Logo } from "../Logo";
import { SiteLink } from "@/lib/site/link";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col p-6 sm:p-10">
        <SiteLink href="/" aria-label="HumanOS home"><Logo /></SiteLink>
        <div className="flex flex-1 items-center py-12"><div className="w-full max-w-[420px]">{children}</div></div>
        <p className="text-[0.8rem] text-mute">By continuing you agree to the <SiteLink href="/legal/terms" className="underline">terms</SiteLink> and <SiteLink href="/legal/privacy" className="underline">privacy policy</SiteLink>.</p>
      </div>
      <div className="relative hidden bg-ink lg:block">
        <DitherHuman persona="aarohi" scene="night" dark="#0f0f10" light="#f2efe8" cell={3} yaw={-0.2} follow label="Aarohi, HumanOS persona" />
        <p className="absolute bottom-10 left-10 max-w-[22ch] text-[2rem] font-medium leading-tight tracking-[-0.04em] text-paper">Give your AI a <span className="serif-i">face.</span></p>
      </div>
    </div>
  );
}
