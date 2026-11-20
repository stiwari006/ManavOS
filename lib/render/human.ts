/* ──────────────────────────────────────────────────────────────────────────
   HumanOS dither renderer
   Builds a parametric head-and-shoulders point model, lights it, z-buffers
   it into a low-res luminance buffer, then ordered-dithers (Bayer 8×8) to two
   colours. This is the site's original imagery language — swap any figure
   for real footage later via the `src` prop on <DitherHuman/>.
   ────────────────────────────────────────────────────────────────────────── */

export type HairStyle = "long" | "short" | "bun" | "none" | "curly";

export type Look = {
  hair: HairStyle;
  skin: number; // skin albedo 0..1
  hairTone: number; // hair albedo 0..1
  cloth: number; // top albedo 0..1
  shoulders?: number; // width multiplier
  jaw?: number; // jaw width multiplier
  seed?: number;
};

export type Frame = { top: number; bottom: number; cx: number };

const KIND = { skin: 0, hair: 1, cloth: 2, lip: 3, eye: 4 } as const;

export type Model = {
  n: number;
  px: Float32Array; py: Float32Array; pz: Float32Array;
  nx: Float32Array; ny: Float32Array; nz: Float32Array;
  alb: Float32Array; kind: Uint8Array; head: Uint8Array;
};

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const sstep = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};
type V3 = [number, number, number];

function headSurface(u: number, v: number, jawW: number): V3 {
  const cu = Math.cos(u), su = Math.sin(u), cv = Math.cos(v), sv = Math.sin(v);
  let x = 0.74 * cv * su, y = 1.0 * sv, z = 0.86 * cv * cu;
  if (z < 0) z *= 1.13;
  const jt = sstep(-0.12, -0.95, y);
  x *= 1 - 0.34 * jt * (2 - jawW);
  if (z < 0) z *= 1 - 0.18 * jt;
  const f = Math.max(0, cu) ** 2;
  const g = (a: number, b: number, sx: number, sy: number) =>
    Math.exp(-(((x - a) / sx) ** 2) - ((y - b) / sy) ** 2);
  let d = 0;
  d += 0.19 * g(0, -0.13, 0.08, 0.2) * f; // nose
  d += 0.05 * g(0, 0.25, 0.42, 0.07) * f; // brow
  d -= 0.09 * (g(0.27, 0.1, 0.12, 0.075) + g(-0.27, 0.1, 0.12, 0.075)) * f; // sockets
  d += 0.045 * g(0, -0.44, 0.17, 0.05) * f; // lips
  d += 0.05 * g(0, -0.67, 0.18, 0.08) * f; // chin
  d += 0.04 * (g(0.42, -0.08, 0.12, 0.13) + g(-0.42, -0.08, 0.12, 0.13)) * f; // cheekbones
  d += 0.07 * Math.exp(-(((y - 0.0) / 0.15) ** 2)) * Math.max(0, 1 - Math.abs(cu) * 4); // ears
  const r = Math.hypot(x, y, z) || 1;
  return [x + (x / r) * d, y + (y / r) * d, z + (z / r) * d];
}

function normalOf(fn: (a: number, b: number) => V3, a: number, b: number, e = 0.004): V3 {
  const p0 = fn(a, b), pa = fn(a + e, b), pb = fn(a, b + e);
  const ax = pa[0] - p0[0], ay = pa[1] - p0[1], az = pa[2] - p0[2];
  const bx = pb[0] - p0[0], by = pb[1] - p0[1], bz = pb[2] - p0[2];
  let nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx;
  const l = Math.hypot(nx, ny, nz) || 1;
  nx /= l; ny /= l; nz /= l;
  // orient outward
  const cx = p0[0], cy = p0[1] - (p0[1] < -1.2 ? -2 : 0), cz = p0[2] + 0.1;
  if (nx * cx + ny * cy * 0.2 + nz * cz < 0) { nx = -nx; ny = -ny; nz = -nz; }
  return [nx, ny, nz];
}

export function buildModel(look: Look): Model {
  const R = rng(look.seed ?? 7);
  const pts: number[] = [];
  const jawW = look.jaw ?? 1;
  const sh = look.shoulders ?? 1;
  const push = (p: V3, n: V3, alb: number, kind: number, head: number) => {
    pts.push(p[0], p[1], p[2], n[0], n[1], n[2], alb, kind, head);
  };

  // Head + face
  const head = (u: number, v: number) => headSurface(u, v, jawW);
  for (let i = 0; i < 11000; i++) {
    const u = R() * Math.PI * 2 - Math.PI;
    const v = Math.asin(R() * 2 - 1);
    const p = head(u, v);
    const n = normalOf(head, u, v);
    const front = Math.cos(u) > 0.35;
    const ex = Math.min(((Math.abs(p[0]) - 0.27) / 0.085) ** 2 + ((p[1] - 0.095) / 0.042) ** 2, 9);
    let kind: number = KIND.skin, alb = look.skin * (0.96 + R() * 0.08);
    if (front && ex < 1) { kind = KIND.eye; alb = 0.08; }
    else if (front && Math.abs(p[0]) < 0.17 && Math.abs(p[1] + 0.44) < 0.045) { kind = KIND.lip; alb = look.skin * 0.62; }
    else if (front && ex < 2.2 && p[1] > 0.12) { alb *= 0.7; } // lash line / lid crease
    // eyebrows
    if (front && Math.abs(p[1] - 0.24) < 0.03 && Math.abs(p[0]) > 0.12 && Math.abs(p[0]) < 0.42) alb = look.hairTone + 0.08;
    push(p, n, alb, kind, 1);
  }

  // Neck
  const neck = (u: number, t: number): V3 => [0.31 * Math.sin(u), t, 0.29 * Math.cos(u) - 0.1];
  for (let i = 0; i < 1600; i++) {
    const u = R() * Math.PI * 2, t = -1.5 + R() * 0.95;
    push(neck(u, t), normalOf(neck, u, t), look.skin * 0.9, KIND.skin, 0);
  }

  // Torso / shoulders
  const torso = (u: number, t: number): V3 => {
    const w = (0.34 + 1.2 * sstep(-1.3, -1.9, t)) * sh;
    const d = 0.3 + 0.26 * sstep(-1.3, -1.95, t);
    const lift = 0.12 * Math.exp(-((Math.sin(u) * 1.0) ** 2) * 2) * sstep(-1.25, -1.6, t);
    return [w * Math.sin(u), t + lift * 0, d * Math.cos(u) - 0.12];
  };
  for (let i = 0; i < 8000; i++) {
    const u = R() * Math.PI * 2, t = -1.3 - R() * 1.8;
    const p = torso(u, t);
    const n = normalOf(torso, u, t);
    const neckline = -1.5 - 0.28 * Math.exp(-((p[0] / 0.32) ** 2));
    const isSkin = p[2] > -0.05 && p[1] > neckline;
    const fold = 0.06 * Math.sin(p[0] * 9 + p[1] * 3);
    push(p, n, isSkin ? look.skin * 0.92 : look.cloth + fold, isSkin ? KIND.skin : KIND.cloth, 0);
  }

  // Hair
  const hairTone = look.hairTone;
  if (look.hair !== "none") {
    const shell = (u: number, v: number): V3 => {
      const p = head(u, v);
      const k = look.hair === "curly" ? 1.14 : 1.06;
      return [p[0] * k, p[1] * k + 0.03, p[2] * k - 0.02];
    };
    for (let i = 0; i < 9000; i++) {
      const u = R() * Math.PI * 2 - Math.PI;
      const v = Math.asin(R() * 2 - 1);
      const p = shell(u, v);
      const cu = Math.cos(u);
      const front = cu > 0.3;
      const hairline = front ? 0.5 - 0.18 * Math.abs(p[0]) - (look.hair === "short" ? -0.02 : 0.04) : look.hair === "short" ? -0.25 : -0.05;
      if (p[1] < hairline) continue;
      // part line + strand texture
      const strand = 0.08 * Math.sin(Math.atan2(p[0], p[2]) * 40 + p[1] * 6);
      const curl = look.hair === "curly" ? 0.12 * Math.sin(p[0] * 30) * Math.sin(p[1] * 30) : 0;
      push(p, normalOf(shell, u, v), hairTone + strand + curl, KIND.hair, 1);
    }
    if (look.hair === "long") {
      // drape behind and over the shoulders
      const drape = (u: number, t: number): V3 => {
        const flare = 0.86 + 0.32 * sstep(0.1, -1.6, t);
        return [flare * Math.sin(u) * 0.95, t, flare * Math.cos(u) * 0.95 - 0.12];
      };
      for (let i = 0; i < 6000; i++) {
        const u = Math.PI / 2 + 0.25 + R() * (Math.PI - 0.5);
        const t = 0.15 - R() * 1.95;
        const p = drape(u, t);
        const strand = 0.1 * Math.sin(u * 60 + t * 2);
        push(p, normalOf(drape, u, t), hairTone + strand, KIND.hair, 0);
      }
      // side curtains framing the face
      for (let i = 0; i < 2600; i++) {
        const side = R() < 0.5 ? -1 : 1;
        const t = 0.25 - R() * 1.55;
        const a = R();
        const x = side * (0.74 + 0.1 * sstep(0, -1.2, t) + a * 0.12);
        const z = -0.3 + a * 0.55 - 0.35 * sstep(-0.5, -1.4, t);
        const p: V3 = [x, t, z];
        const n: V3 = [side * 0.9, 0.1, 0.35];
        push(p, n, hairTone + 0.1 * Math.sin(a * 30 + t * 4), KIND.hair, 0);
      }
    }
    if (look.hair === "bun") {
      const bun = (u: number, v: number): V3 => [0.27 * Math.cos(v) * Math.sin(u), 0.92 + 0.25 * Math.sin(v), -0.5 + 0.27 * Math.cos(v) * Math.cos(u)];
      for (let i = 0; i < 1600; i++) {
        const u = R() * Math.PI * 2, v = Math.asin(R() * 2 - 1);
        push(bun(u, v), normalOf(bun, u, v), hairTone + 0.08 * Math.sin(u * 20), KIND.hair, 1);
      }
    }
  }

  const n = pts.length / 9;
  const m: Model = {
    n,
    px: new Float32Array(n), py: new Float32Array(n), pz: new Float32Array(n),
    nx: new Float32Array(n), ny: new Float32Array(n), nz: new Float32Array(n),
    alb: new Float32Array(n), kind: new Uint8Array(n), head: new Uint8Array(n),
  };
  for (let i = 0; i < n; i++) {
    const o = i * 9;
    m.px[i] = pts[o]; m.py[i] = pts[o + 1]; m.pz[i] = pts[o + 2];
    m.nx[i] = pts[o + 3]; m.ny[i] = pts[o + 4]; m.nz[i] = pts[o + 5];
    m.alb[i] = pts[o + 6]; m.kind[i] = pts[o + 7]; m.head[i] = pts[o + 8];
  }
  return m;
}

const BAYER = (() => {
  const b = [
    0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26,
    12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22,
    3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25,
    15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
  ];
  return Float32Array.from(b, (v) => (v + 0.5) / 64);
})();

export type Pose = {
  yaw: number; pitch: number; talk: number; blink: number; breathe: number;
};

export type Scene = {
  frame: Frame;
  light: V3; // key light direction (toward light)
  rim: V3;
  bg: number; // background luminance 0..1
  glow: number; // background glow strength
  glowAt: [number, number]; // glow centre in 0..1 screen coords
  exposure: number;
};

export type Buffers = { w: number; h: number; lum: Float32Array; z: Float32Array; img: ImageData };

export function makeBuffers(ctx: CanvasRenderingContext2D, w: number, h: number): Buffers {
  return { w, h, lum: new Float32Array(w * h), z: new Float32Array(w * h), img: ctx.createImageData(w, h) };
}

function norm(v: V3): V3 {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}

export function render(
  m: Model, b: Buffers, pose: Pose, scene: Scene,
  dark: [number, number, number], light: [number, number, number],
) {
  const { w, h, lum, z } = b;
  const L = norm(scene.light), Rm = norm(scene.rim);
  // background
  const [gx, gy] = scene.glowAt;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x / w - gx, dy = (y / h - gy) * (h / w);
      lum[y * w + x] = scene.bg + scene.glow * Math.exp(-(dx * dx + dy * dy) * 5);
      z[y * w + x] = -1e9;
    }
  }
  const s = h / (scene.frame.top - scene.frame.bottom);
  const cx = w * scene.frame.cx;
  const mid = (scene.frame.top + scene.frame.bottom) / 2;
  const cyw = Math.cos(pose.yaw), syw = Math.sin(pose.yaw);
  const cp = Math.cos(pose.pitch), sp = Math.sin(pose.pitch);
  const rad = Math.max(1, Math.round(s * 0.017));
  const talk = pose.talk;
  for (let i = 0; i < m.n; i++) {
    let x = m.px[i], y = m.py[i], zz = m.pz[i];
    let nx = m.nx[i], ny = m.ny[i], nz = m.nz[i];
    let alb = m.alb[i];
    const k = m.kind[i];
    const isHead = m.head[i] === 1;
    if (isHead) {
      // jaw / mouth
      if (talk > 0 && zz > 0.2 && y < -0.43) y -= talk * 0.075 * Math.min(1, (-0.43 - y) / 0.08);
      if (k === 3 && talk > 0.15 && Math.abs(y + 0.44) < 0.02 + talk * 0.03 && Math.abs(x) < 0.12) alb = 0.04;
      if (k === 4 && pose.blink > 0.5) alb = m.alb[i] > 0.1 ? alb : 0.5;
      // head pitch (nod) around neck pivot
      const yy = y + 0.6;
      const y2 = yy * cp - zz * sp, z2 = yy * sp + zz * cp;
      y = y2 - 0.6; zz = z2;
      const ny2 = ny * cp - nz * sp, nz2 = ny * sp + nz * cp; ny = ny2; nz = nz2;
    } else if (y < -1.3) {
      y += pose.breathe * 0.012;
    }
    if (k === 4 && pose.blink > 0.5) alb = 0.45;
    // yaw (body turns less than head)
    const yawK = isHead ? 1 : y < -1.3 ? 0.45 : 0.75;
    const c = isHead ? cyw : Math.cos(pose.yaw * yawK), sn = isHead ? syw : Math.sin(pose.yaw * yawK);
    const rx = x * c + zz * sn, rz = -x * sn + zz * c;
    const rnx = nx * c + nz * sn, rnz = -nx * sn + nz * c;
    if (rnz < -0.35) continue;
    const persp = 7 / (7 - rz);
    const sx = Math.round(cx + rx * s * persp);
    const sy = Math.round(h / 2 + (mid - y) * s * persp);
    if (sx < -rad || sy < -rad || sx >= w + rad || sy >= h + rad) continue;
    // lighting
    const dl = Math.max(0, rnx * L[0] + ny * L[1] + rnz * L[2]);
    const dr = Math.max(0, rnx * Rm[0] + ny * Rm[1] + rnz * Rm[2]);
    const spec = k === 1 || k === 4 ? Math.pow(dl, 18) * 0.5 : Math.pow(dl, 30) * 0.18;
    let v = alb * (0.12 + 0.95 * dl) + 0.55 * dr * dr * dr + spec;
    v *= scene.exposure;
    for (let oy = -rad + 1; oy < rad; oy++) {
      const py = sy + oy;
      if (py < 0 || py >= h) continue;
      for (let ox = -rad + 1; ox < rad; ox++) {
        const px = sx + ox;
        if (px < 0 || px >= w) continue;
        const idx = py * w + px;
        if (rz > z[idx]) { z[idx] = rz; lum[idx] = v; }
      }
    }
  }
  // ordered dither to two colours
  const d = b.img.data;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const on = lum[i] > BAYER[(y & 7) * 8 + (x & 7)];
      const col = on ? light : dark;
      const o = i * 4;
      d[o] = col[0]; d[o + 1] = col[1]; d[o + 2] = col[2]; d[o + 3] = 255;
    }
  }
}

export const LOOKS: Record<string, Look> = {
  aarohi: { hair: "long", skin: 0.66, hairTone: 0.1, cloth: 0.32, shoulders: 0.92, jaw: 0.95, seed: 11 },
  dev: { hair: "short", skin: 0.7, hairTone: 0.14, cloth: 0.2, shoulders: 1.08, jaw: 1.1, seed: 23 },
  mira: { hair: "bun", skin: 0.74, hairTone: 0.22, cloth: 0.82, shoulders: 0.92, seed: 37 },
  omar: { hair: "curly", skin: 0.5, hairTone: 0.08, cloth: 0.62, shoulders: 1.05, jaw: 1.05, seed: 41 },
  ines: { hair: "long", skin: 0.8, hairTone: 0.45, cloth: 0.15, shoulders: 0.9, jaw: 0.92, seed: 53 },
  henry: { hair: "none", skin: 0.72, hairTone: 0.3, cloth: 0.4, shoulders: 1.1, jaw: 1.12, seed: 67 },
};
