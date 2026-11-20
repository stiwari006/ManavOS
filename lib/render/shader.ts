/* HumanOS dither portrait shader.
   A sculpted SDF bust (skull, jaw, nose, lips, eyes, ears, neck, shoulders,
   hair variants) is raymarched, lit with a key + rim light, then ordered-
   dithered (Bayer 8×8) to two colours — our halftone "photograph" look. */

export const VERT = `
attribute vec2 aPos;
void main(){ gl_Position = vec4(aPos,0.,1.); }
`;

export const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uYaw, uPitch, uTalk, uBlink, uBreath, uTime;
uniform float uHair, uSkin, uHairTone, uCloth, uJaw, uShoulder;
uniform vec3 uDark, uLight;
uniform float uBg, uGlow, uExposure, uContrast;
uniform vec2 uGlowAt;
uniform vec3 uFrame; // top, bottom, cx
uniform vec3 uKey, uRim;

vec3 gH; float gMat;

float sdEll(vec3 p, vec3 r){ float k0=length(p/r); float k1=length(p/(r*r)); return k0*(k0-1.0)/k1; }
float smin(float a,float b,float k){ float h=clamp(0.5+0.5*(b-a)/k,0.,1.); return mix(b,a,h)-k*h*(1.-h); }
float smax(float a,float b,float k){ return -smin(-a,-b,k); }
float sdCap(vec3 p, vec3 a, vec3 b, float r){ vec3 pa=p-a, ba=b-a; float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.); return length(pa-ba*h)-r; }
mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }

float map(vec3 p){
  vec3 b = p; b.y -= uBreath*0.012*step(b.y,-1.2);
  b.xz = rot(uYaw*0.3)*b.xz;
  vec3 h = p; h.y += 0.62; h.yz = rot(uPitch)*h.yz; h.xz = rot(uYaw)*h.xz; h.y -= 0.62;
  gH = h;
  vec3 q = vec3(abs(h.x), h.y, h.z);
  float jo = uTalk*0.055;

  // ── head
  float d = sdEll(h-vec3(0.,0.07,-0.06), vec3(0.69,0.84,0.8));
  d = smin(d, sdEll(h-vec3(0.,-0.36-jo*0.5,0.1), vec3(0.46*uJaw,0.5,0.58)), 0.22);
  d = smin(d, sdEll(h-vec3(0.,-0.71-jo,0.33), vec3(0.18,0.15,0.17)), 0.16);
  d = smin(d, sdEll(q-vec3(0.33,-0.1,0.43), vec3(0.19,0.15,0.2)), 0.14);
  d = smin(d, sdEll(q-vec3(0.21,0.215,0.6), vec3(0.2,0.06,0.11)), 0.1);
  d = smax(d, -sdEll(q-vec3(0.245,0.08,0.71), vec3(0.15,0.085,0.12)), 0.06);
  d = smin(d, sdCap(h, vec3(0.,0.15,0.69), vec3(0.,-0.17,0.85), 0.048), 0.07);
  d = smin(d, length(h-vec3(0.,-0.2,0.83))-0.072, 0.05);
  d = smin(d, sdEll(q-vec3(0.085,-0.235,0.755), vec3(0.06,0.048,0.055)), 0.04);
  float lipU = sdEll(h-vec3(0.,-0.405,0.755), vec3(0.16,0.045,0.07));
  float lipL = sdEll(h-vec3(0.,-0.49-jo,0.735), vec3(0.14,0.052,0.07));
  float lips = min(lipU, lipL);
  d = smin(d, lips, 0.035);
  float slit = sdEll(h-vec3(0.,-0.448-jo*0.5,0.82), vec3(0.15, 0.007+jo*0.7, 0.14));
  d = smax(d, -slit, 0.012);
  d = smin(d, sdEll(q-vec3(0.68,0.,-0.03), vec3(0.07,0.19,0.12)), 0.05);
  float mat = 1.;
  if (lips < d + 0.006) mat = 3.;
  float eye = length(q-vec3(0.245,0.075,0.575))-0.112;
  if (eye < d) { d = eye; mat = uBlink > 0.5 ? 1. : 4.; }

  // ── neck + body
  float neck = sdCap(b, vec3(0.,-0.5,-0.08), vec3(0.,-1.5,-0.08), 0.28);
  float sh = sdEll(b-vec3(0.,-1.9,-0.1), vec3(1.1*uShoulder,0.38,0.44));
  float torso = sdEll(b-vec3(0.,-2.65,-0.1), vec3(0.98*uShoulder,1.0,0.46));
  float body = smin(neck, smin(sh, torso, 0.3), 0.4);
  if (body < d) {
    float nl = -1.5 - 0.3*exp(-b.x*b.x/0.08);
    mat = (b.y > nl || b.z < -0.2 && b.y > -1.45) ? 1. : 5.;
  }
  d = smin(d, body, 0.1);

  // ── hair
  if (uHair > 0.5) {
    float grow = uHair > 4.5 ? 0.07 : 0.0;
    float shell = sdEll(h-vec3(0.,0.11,-0.08), vec3(0.75+grow,0.9+grow,0.86+grow));
    if (uHair > 4.5) shell -= 0.03*sin(h.x*28.)*sin(h.y*26.)*sin(h.z*24.);
    float face = sdEll(h-vec3(0.,-0.32,0.62), vec3(0.6,0.84,0.62));
    float hr = smax(shell, -face, 0.06);
    float cutY = uHair < 1.5 ? 0.05 : -0.12;
    hr = smax(hr, -(h.y - cutY), 0.05);
    if (uHair > 1.5 && uHair < 2.5) {
      float drape = sdEll(h-vec3(0.,-0.75,-0.3), vec3(0.82,1.2,0.48));
      drape = smax(drape, h.z - 0.1, 0.1);
      float side = sdEll(q-vec3(0.6,-0.6,0.08), vec3(0.15,0.8,0.28));
      side = smax(side, -(q.x-0.5), 0.05);
      hr = smin(hr, min(drape, side), 0.12);
    }
    if (uHair > 2.5 && uHair < 3.5) hr = smin(hr, length(h-vec3(0.,0.8,-0.52))-0.25, 0.08);
    if (hr < d) { d = hr; mat = 2.; }
  }
  gMat = mat;
  return d;
}

vec3 calcN(vec3 p){
  const vec2 e = vec2(0.0015,-0.0015);
  return normalize(e.xyy*map(p+e.xyy) + e.yyx*map(p+e.yyx) + e.yxy*map(p+e.yxy) + e.xxx*map(p+e.xxx));
}

float b2(vec2 a){ a = floor(a); return fract(dot(a, vec2(0.5, a.y*0.75))); }
float b4(vec2 a){ return b2(0.5*a)*0.25 + b2(a); }
float b8(vec2 a){ return b4(0.5*a)*0.25 + b2(a); }

void main(){
  vec2 fc = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  float span = uFrame.x - uFrame.y;
  vec3 target = vec3((fc.x - uFrame.z*uRes.x)/uRes.y*span, uFrame.x - fc.y/uRes.y*span, 0.);
  vec3 ro = vec3(0., (uFrame.x+uFrame.y)*0.5, 9.);
  vec3 rd = normalize(target - ro);

  vec2 g = fc/uRes - uGlowAt; g.y *= uRes.y/uRes.x;
  float lum = uBg + uGlow*exp(-dot(g,g)*5.);

  float t = 6.;
  float hit = 0.;
  for (int i = 0; i < 90; i++) {
    vec3 p = ro + rd*t;
    float d = map(p);
    if (d < 0.0015) { hit = 1.; break; }
    t += d*0.9;
    if (t > 12.5) break;
  }
  if (hit > 0.5) {
    vec3 p = ro + rd*t;
    vec3 n = calcN(p);
    map(p);
    float mat = gMat;
    vec3 K = normalize(uKey), R = normalize(uRim);
    float nk = dot(n,K);
    float wrap = clamp((nk+0.25)/1.25, 0., 1.);
    float rim = pow(max(dot(n,R),0.), 2.);
    float ao = clamp(map(p+n*0.06)/0.06, 0., 1.)*0.5 + clamp(map(p+n*0.18)/0.18,0.,1.)*0.5;
    map(p);
    vec3 h = gH;
    float alb = uSkin;
    float spec = pow(max(dot(reflect(-K,n), -rd),0.), 24.)*0.12;
    if (mat > 1.5 && mat < 2.5) {
      float strand = 0.5+0.5*sin(atan(h.x,h.z)*70. + h.y*8.);
      alb = uHairTone*(0.75 + 0.5*strand);
      spec = pow(max(dot(reflect(-K,n), -rd),0.), 10.)*0.35*strand;
    } else if (mat > 2.5 && mat < 3.5) { alb = uSkin*0.72; spec *= 2.; }
    else if (mat > 3.5 && mat < 4.5) {
      vec3 e = vec3(abs(h.x)-0.245, h.y-0.075, h.z-0.575);
      float r = length(e.xy);
      alb = r < 0.06 ? (r < 0.028 ? 0.02 : 0.16) : 0.7;
      spec = pow(max(dot(reflect(-K,n), -rd),0.), 60.)*1.2;
    } else if (mat > 4.5) {
      alb = uCloth*(0.9 + 0.1*sin(p.x*8. + p.y*5.));
      spec = 0.;
    }
    lum = alb*(0.08 + 0.95*wrap)*(0.55+0.45*ao) + rim*(mat > 1.5 && mat < 2.5 ? 0.8 : 0.55) + spec;
    lum *= uExposure;
  }
  lum = (lum - 0.5)*uContrast + 0.5;
  float on = step(b8(fc), lum);
  gl_FragColor = vec4(mix(uDark, uLight, on), 1.);
}
`;
