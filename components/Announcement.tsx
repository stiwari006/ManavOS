import { SiteLink } from "@/lib/site/link";
export function Announcement() {
  return (
    <SiteLink href="/research/full-body-presence" className="group block bg-ink text-paper">
      <div className="shell flex h-10 items-center justify-center gap-3 text-[0.85rem]">
        <span className="t-mono text-accent">New</span>
        <span className="truncate text-paper/80">Aarohi-1 full-body preview: gesture, posture and presence.</span>
        <span className="t-mono shrink-0 underline-offset-4 group-hover:underline">Learn more →</span>
      </div>
    </SiteLink>
  );
}
