import "server-only";
import { createHash, createHmac } from "node:crypto";

/* Presigned URLs for any S3-compatible bucket (Cloudflare R2, AWS S3, Backblaze B2).
   Training videos are up to 750 MB, too big to pass through a serverless function,
   so the browser uploads straight to the bucket and Tavus downloads from it.
   Env: S3_ENDPOINT (e.g. https://<account>.r2.cloudflarestorage.com), S3_BUCKET,
        S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_REGION (default "auto"). */
export const uploadsReady = () => !!(process.env.S3_ENDPOINT && process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY);

const sha = (s: string) => createHash("sha256").update(s).digest("hex");
const hmac = (k: Buffer | string, s: string) => createHmac("sha256", k).update(s).digest();
const enc = (s: string) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());

export function presign(method: "GET" | "PUT", key: string, expires = 3600) {
  const endpoint = new URL(process.env.S3_ENDPOINT!);
  const region = process.env.S3_REGION || "auto";
  const t = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const day = t.slice(0, 8);
  const scope = `${day}/${region}/s3/aws4_request`;
  const path = `/${process.env.S3_BUCKET}/${key.split("/").map(enc).join("/")}`;
  const q: Record<string, string> = {
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${process.env.S3_ACCESS_KEY_ID}/${scope}`,
    "X-Amz-Date": t,
    "X-Amz-Expires": String(Math.min(expires, 604800)),
    "X-Amz-SignedHeaders": "host",
  };
  const qs = Object.keys(q).sort().map((k) => `${enc(k)}=${enc(q[k])}`).join("&");
  const canonical = [method, path, qs, `host:${endpoint.host}\n`, "host", "UNSIGNED-PAYLOAD"].join("\n");
  const toSign = ["AWS4-HMAC-SHA256", t, scope, sha(canonical)].join("\n");
  const kDate = hmac(`AWS4${process.env.S3_SECRET_ACCESS_KEY}`, day);
  const sig = hmac(hmac(hmac(hmac(kDate, region), "s3"), "aws4_request"), toSign).toString("hex");
  return `${endpoint.origin}${path}?${qs}&X-Amz-Signature=${sig}`;
}
