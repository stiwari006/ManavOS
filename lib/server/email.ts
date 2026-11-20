import "server-only";
import { BRAND } from "@/lib/brand";

/* Transactional email via Resend (https://resend.com). Without RESEND_API_KEY
   the message is logged instead, so flows still work in development. */
export const emailReady = () => !!process.env.RESEND_API_KEY;

export async function sendEmail(to: string, subject: string, text: string) {
  if (!emailReady()) { console.log(`[email:dev] to=${to} subject="${subject}"\n${text}`); return; }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ from: process.env.EMAIL_FROM || `${BRAND.name} <no-reply@${BRAND.domain}>`, to, subject, text }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Email failed (${res.status})`);
}
