import { ImageResponse } from "next/og";
export const dynamic = "force-static";
export const alt = "ManavOS — AI you can look in the eye";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OG() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#0f0f10", color: "#f2efe8", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 34 }}>
          <div style={{ width: 18, height: 18, borderRadius: 9, background: "#ff4f1f" }} /> manavOS
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 92, letterSpacing: -4, lineHeight: 1 }}>AI you can</div>
          <div style={{ fontSize: 92, letterSpacing: -4, lineHeight: 1, color: "#ff4f1f" }}>look in the eye.</div>
          <div style={{ fontSize: 30, marginTop: 28, opacity: 0.6 }}>Real-time AI humans that see, listen, remember and act.</div>
        </div>
      </div>
    ),
    size,
  );
}
