import { BRAND } from "@/lib/brand";
export function LogoMark({ className = "" }: { className?: string }) {
  // A ring (the interface) holding an offset point (a presence looking back at you).
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" strokeWidth="2.4" />
      <circle cx="19.5" cy="13.5" r="4.2" fill="currentColor" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className="h-[22px] w-[22px]" />
      <span className="text-[1.15rem] font-semibold tracking-[-0.04em]">
        {BRAND.wordmark[0]}<span className="font-medium opacity-60">{BRAND.wordmark[1]}</span>
      </span>
    </span>
  );
}
