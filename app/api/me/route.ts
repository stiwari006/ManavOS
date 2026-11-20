import { publicUser } from "@/lib/server/auth";
import { json, withUser } from "@/lib/server/http";
export async function GET() { return withUser((u) => json({ user: publicUser(u) })); }
