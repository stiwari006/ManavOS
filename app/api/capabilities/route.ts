import { json } from "@/lib/server/http";
import { capabilities } from "@/lib/server/service";
export async function GET() { return json(capabilities()); }
