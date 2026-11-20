"use client";
import { useEffect, useState } from "react";
import local from "./media.json";
import { DEMO, PREVIEW } from "@/lib/site/link";

/* Photoreal footage per look. Two sources, in order:
   1. Files you own in public/media/personas (listed in media.json — run
      `node scripts/fetch-faces.mjs` or add your own licensed clips).
   2. Tavus stock faces, served live from /api/faces when TAVUS_API_KEY is set.
   With neither, components fall back to the rendered (dithered) human. */
export type Media = { video: string; poster?: string };
const LOCAL = local as Record<string, Media>;
// In the static preview, site-root paths must become relative to the page.
const asset = (p?: string) => {
  if (!p || !PREVIEW || !p.startsWith("/") || typeof window === "undefined") return p;
  const chunks = (window as unknown as { TURBOPACK_CHUNK_BASE_PATH?: string }).TURBOPACK_CHUNK_BASE_PATH || "./assets/";
  return chunks.replace(/assets\/?$/, "") + p.slice(1);
};
const fix = (m?: Media | null) => (m ? { video: asset(m.video)!, poster: asset(m.poster) } : null);
let remote: Promise<Record<string, Media>> | null = null;

function loadRemote() {
  if (DEMO) return Promise.resolve({});
  return (remote ??= fetch("/api/faces").then((r) => (r.ok ? r.json() : { faces: {} })).then((d) => d.faces || {}).catch(() => ({})));
}

export function usePersonaMedia(look: string): Media | null {
  const [m, setM] = useState<Media | null>(() => fix(LOCAL[look]));
  useEffect(() => {
    if (LOCAL[look]) return;
    let live = true;
    loadRemote().then((map) => { if (live && map[look]) setM(map[look]); });
    return () => { live = false; };
  }, [look]);
  return m;
}
