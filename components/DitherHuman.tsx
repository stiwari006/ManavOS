"use client";
import { useEffect, useRef } from "react";
import { getEngine, hex, PERSONAS, SCENES, type PersonaKey, type Scene } from "@/lib/render/engine";

type Props = {
  persona: PersonaKey;
  scene?: keyof typeof SCENES | Scene;
  dark?: string;
  light?: string;
  /** CSS pixels per dither dot */
  cell?: number;
  yaw?: number;
  /** drive mouth movement */
  speaking?: boolean;
  /** head follows the pointer */
  follow?: boolean;
  className?: string;
  label: string;
};

/**
 * Live dithered AI-human render. Production note: pass real persona footage
 * by replacing this component with <video> — the frame/aspect is identical.
 */
export function DitherHuman({
  persona, scene = "paper", dark = "#0f0f10", light = "#f2efe8", cell = 2,
  yaw = 0.22, speaking = false, follow = false, className = "", label,
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const speakRef = useRef(speaking);
  speakRef.current = speaking;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const engine = getEngine();
    if (!ctx) return;
    const P = PERSONAS[persona];
    const S = typeof scene === "string" ? SCENES[scene] : scene;
    const D = hex(dark), L = hex(light);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, visible = false, raf = 0, last = 0;
    let mx = 0, my = 0, cmx = 0, cmy = 0;
    const seed = persona.length * 1.7;
    let nextBlink = 2 + Math.random() * 3, blinkUntil = 0;
    let talk = 0;

    const size = () => {
      const r = canvas.getBoundingClientRect();
      w = Math.max(40, Math.round(r.width / cell));
      h = Math.max(40, Math.round(r.height / cell));
      canvas.width = w; canvas.height = h;
    };

    const frame = (now: number) => {
      const t = now / 1000;
      if (!engine) {
        ctx.fillStyle = dark; ctx.fillRect(0, 0, w, h);
        return;
      }
      cmx += (mx - cmx) * 0.06; cmy += (my - cmy) * 0.06;
      if (t > nextBlink) { blinkUntil = t + 0.13; nextBlink = t + 2.5 + Math.random() * 3.5; }
      const want = speakRef.current ? Math.max(0, 0.45 + 0.55 * Math.sin(t * 13.5) * Math.sin(t * 3.7 + 1)) : 0;
      talk += (want - talk) * 0.45;
      engine.draw(ctx, w, h, P, S, {
        yaw: yaw + (reduce ? 0 : 0.07 * Math.sin(t * 0.37 + seed)) + cmx * 0.32,
        pitch: (reduce ? 0 : 0.03 * Math.sin(t * 0.53 + seed)) - cmy * 0.12 + (speakRef.current ? 0.015 * Math.sin(t * 2.1) : 0),
        talk, blink: !reduce && t < blinkUntil ? 1 : 0, breath: reduce ? 0 : Math.sin(t * 1.25), time: t,
      }, D, L);
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || now - last < 1000 / 30) return;
      last = now;
      frame(now);
    };

    size();
    frame(performance.now());
    const ro = new ResizeObserver(() => { size(); frame(performance.now()); });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: "100px" });
    io.observe(canvas);
    const onMove = (e: PointerEvent) => {
      mx = (e.clientX / window.innerWidth) * 2 - 1;
      my = (e.clientY / window.innerHeight) * 2 - 1;
    };
    if (follow && !reduce) window.addEventListener("pointermove", onMove, { passive: true });
    if (!reduce) raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [persona, scene, dark, light, cell, yaw, follow]);

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={label}
      className={`block h-full w-full [image-rendering:pixelated] ${className}`}
    />
  );
}
