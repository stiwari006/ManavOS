"use client";
import NextLink from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

/** Preview builds (static, hosted under an unknown path) navigate with full
 *  page loads to relative index.html files. Production uses Next's router. */
export const PREVIEW = process.env.NEXT_PUBLIC_PREVIEW === "1";
export const DEMO = process.env.NEXT_PUBLIC_DEMO === "1";

function siteRoot() {
  const s = document.querySelector<HTMLScriptElement>('script[src*="static/chunks"]');
  if (s?.src) return s.src.split(/(?:assets|_next)\/static\//)[0];
  return location.origin + "/";
}

export function resolve(path: string) {
  if (!PREVIEW || !path.startsWith("/")) return path;
  const [p, hash = ""] = path.split("#");
  const [pathname, query = ""] = p.split("?");
  const clean = pathname.replace(/^\/|\/$/g, "");
  return siteRoot() + (clean ? clean + "/" : "") + "index.html" + (query ? "?" + query : "") + (hash ? "#" + hash : "");
}

export function go(path: string) {
  if (typeof window === "undefined") return;
  if (PREVIEW) { location.href = resolve(path); return; }
  // soft navigation is handled by callers with useRouter when needed
  location.href = path;
}

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: ReactNode };

export function SiteLink({ href, onClick, children, ...rest }: Props) {
  const internal = href.startsWith("/");
  if (!internal) return <a href={href} onClick={onClick} {...rest}>{children}</a>;
  if (PREVIEW) {
    return (
      <a href={href} {...rest} onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey) return;
        const [p, h] = href.split("#");
        if (h && (p === "" || p.replace(/\/$/, "") === location.pathname.replace(/\/(index\.html)?$/, ""))) return;
        e.preventDefault();
        location.href = resolve(href);
      }}>{children}</a>
    );
  }
  return <NextLink href={href} onClick={onClick} {...rest}>{children}</NextLink>;
}
