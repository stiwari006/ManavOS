import { VERT, FRAG } from "./shader";

export type Persona = { hair: number; skin: number; hairTone: number; cloth: number; jaw: number; shoulder: number };

/** hair: 0 none · 1 short · 2 long · 3 bun · 5 curly */
export const PERSONAS = {
  aarohi: { hair: 2, skin: 0.66, hairTone: 0.17, cloth: 0.26, jaw: 0.93, shoulder: 0.9 },
  dev: { hair: 1, skin: 0.62, hairTone: 0.16, cloth: 0.18, jaw: 1.08, shoulder: 1.06 },
  mira: { hair: 3, skin: 0.78, hairTone: 0.2, cloth: 0.8, jaw: 0.92, shoulder: 0.9 },
  omar: { hair: 5, skin: 0.5, hairTone: 0.14, cloth: 0.62, jaw: 1.04, shoulder: 1.04 },
  ines: { hair: 2, skin: 0.82, hairTone: 0.42, cloth: 0.12, jaw: 0.9, shoulder: 0.88 },
  henry: { hair: 1, skin: 0.72, hairTone: 0.62, cloth: 0.42, jaw: 1.1, shoulder: 1.08 },
} satisfies Record<string, Persona>;
export type PersonaKey = keyof typeof PERSONAS;

export type Scene = {
  frame: [number, number, number]; // top, bottom, centre-x (0..1)
  key: [number, number, number];
  rim: [number, number, number];
  bg: number; glow: number; glowAt: [number, number];
  exposure: number; contrast: number;
};

export const SCENES = {
  paper: { frame: [1.3, -2.55, 0.5], key: [-0.65, 0.5, 0.75], rim: [0.85, 0.3, -0.45], bg: 0.86, glow: 0.12, glowAt: [0.25, 0.2], exposure: 1.12, contrast: 1.15 },
  night: { frame: [1.3, -2.55, 0.5], key: [-0.55, 0.45, 0.8], rim: [0.9, 0.35, -0.3], bg: 0.03, glow: 0.22, glowAt: [0.72, 0.25], exposure: 1.0, contrast: 1.2 },
  close: { frame: [1.15, -1.55, 0.5], key: [-0.6, 0.5, 0.8], rim: [0.85, 0.3, -0.4], bg: 0.07, glow: 0.2, glowAt: [0.7, 0.2], exposure: 1.05, contrast: 1.2 },
} satisfies Record<string, Scene>;

export type Pose = { yaw: number; pitch: number; talk: number; blink: number; breath: number; time: number };

export function hex(c: string): [number, number, number] {
  const n = parseInt(c.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

class Engine {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  prog: WebGLProgram;
  loc: Record<string, WebGLUniformLocation | null> = {};

  constructor() {
    this.canvas = document.createElement("canvas");
    const gl = this.canvas.getContext("webgl", { preserveDrawingBuffer: true, antialias: false, premultipliedAlpha: false });
    if (!gl) throw new Error("no webgl");
    this.gl = gl;
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || "shader");
      return s;
    };
    const p = gl.createProgram()!;
    gl.attachShader(p, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(p, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || "link");
    this.prog = p;
    gl.useProgram(p);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const a = gl.getAttribLocation(p, "aPos");
    gl.enableVertexAttribArray(a);
    gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
    for (const n of ["uRes", "uYaw", "uPitch", "uTalk", "uBlink", "uBreath", "uTime", "uHair", "uSkin", "uHairTone", "uCloth", "uJaw", "uShoulder", "uDark", "uLight", "uBg", "uGlow", "uExposure", "uContrast", "uGlowAt", "uFrame", "uKey", "uRim"])
      this.loc[n] = gl.getUniformLocation(p, n);
  }

  draw(target: CanvasRenderingContext2D, w: number, h: number, persona: Persona, scene: Scene, pose: Pose, dark: [number, number, number], light: [number, number, number]) {
    const { gl, loc } = this;
    if (this.canvas.width !== w || this.canvas.height !== h) { this.canvas.width = w; this.canvas.height = h; }
    gl.viewport(0, 0, w, h);
    gl.uniform2f(loc.uRes, w, h);
    gl.uniform1f(loc.uYaw, pose.yaw); gl.uniform1f(loc.uPitch, pose.pitch);
    gl.uniform1f(loc.uTalk, pose.talk); gl.uniform1f(loc.uBlink, pose.blink);
    gl.uniform1f(loc.uBreath, pose.breath); gl.uniform1f(loc.uTime, pose.time);
    gl.uniform1f(loc.uHair, persona.hair); gl.uniform1f(loc.uSkin, persona.skin);
    gl.uniform1f(loc.uHairTone, persona.hairTone); gl.uniform1f(loc.uCloth, persona.cloth);
    gl.uniform1f(loc.uJaw, persona.jaw); gl.uniform1f(loc.uShoulder, persona.shoulder);
    gl.uniform3fv(loc.uDark, dark); gl.uniform3fv(loc.uLight, light);
    gl.uniform1f(loc.uBg, scene.bg); gl.uniform1f(loc.uGlow, scene.glow);
    gl.uniform1f(loc.uExposure, scene.exposure); gl.uniform1f(loc.uContrast, scene.contrast);
    gl.uniform2fv(loc.uGlowAt, scene.glowAt); gl.uniform3fv(loc.uFrame, scene.frame);
    gl.uniform3fv(loc.uKey, scene.key); gl.uniform3fv(loc.uRim, scene.rim);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    target.drawImage(this.canvas, 0, 0, w, h, 0, 0, w, h);
  }
}

let engine: Engine | null | undefined;
export function getEngine(): Engine | null {
  if (engine === undefined) {
    try { engine = new Engine(); } catch { engine = null; }
  }
  return engine;
}
