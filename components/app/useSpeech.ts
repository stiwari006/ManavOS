"use client";
import { useCallback, useEffect, useRef, useState } from "react";

type SR = { start(): void; stop(): void; abort(): void; continuous: boolean; interimResults: boolean; lang: string;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null; onend: (() => void) | null; onerror: ((e: { error: string }) => void) | null };

/** Browser speech in/out. Recognition is Chrome/Edge/Safari; synthesis is everywhere. */
export function useSpeech(lang = "en-US") {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const rec = useRef<SR | null>(null);
  const finalCb = useRef<(t: string) => void>(() => {});
  const supported = typeof window !== "undefined" && !!((window as unknown as Record<string, unknown>).SpeechRecognition || (window as unknown as Record<string, unknown>).webkitSpeechRecognition);

  const listen = useCallback((onFinal: (t: string) => void) => {
    const W = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
    const C = W.SpeechRecognition || W.webkitSpeechRecognition;
    if (!C) return false;
    finalCb.current = onFinal;
    const r = new C();
    r.lang = lang; r.interimResults = true; r.continuous = false;
    let finalText = "";
    r.onresult = (e) => {
      let t = "";
      for (let i = 0; i < e.results.length; i++) { t += e.results[i][0].transcript; if (e.results[i].isFinal) finalText = t; }
      setInterim(t);
    };
    r.onend = () => { setListening(false); setInterim(""); if (finalText.trim()) finalCb.current(finalText.trim()); };
    r.onerror = () => setListening(false);
    try { r.start(); rec.current = r; setListening(true); return true; } catch { return false; }
  }, [lang]);

  const stop = useCallback(() => { rec.current?.stop(); }, []);

  const say = useCallback((text: string, voiceHint?: "female" | "male") => new Promise<void>((resolve) => {
    if (!("speechSynthesis" in window) || !text) return resolve();
    const u = new SpeechSynthesisUtterance(text);
    const voices = speechSynthesis.getVoices().filter((v) => v.lang.startsWith(lang.slice(0, 2)));
    const pick = voices.find((v) => voiceHint === "male" ? /male|daniel|alex|fred|david|google uk english male/i.test(v.name) && !/female/i.test(v.name) : /female|samantha|victoria|karen|zira|google us english/i.test(v.name)) || voices[0];
    if (pick) u.voice = pick;
    u.rate = 1.02; u.lang = lang;
    u.onstart = () => setSpeaking(true);
    u.onend = u.onerror = () => { setSpeaking(false); resolve(); };
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  }), [lang]);

  const hush = useCallback(() => { if ("speechSynthesis" in window) speechSynthesis.cancel(); setSpeaking(false); }, []);
  useEffect(() => () => { rec.current?.abort(); if (typeof window !== "undefined" && "speechSynthesis" in window) speechSynthesis.cancel(); }, []);

  return { supported, listening, interim, speaking, listen, stop, say, hush };
}
