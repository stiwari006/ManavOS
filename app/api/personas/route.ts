import { id, now, repo } from "@/lib/server/db";
import { body, json, withUser } from "@/lib/server/http";
import { myPersonas, personaInput } from "@/lib/server/service";

export async function GET() { return withUser(async (u) => json({ personas: await myPersonas(u.id) })); }
export async function POST(req: Request) {
  return withUser(async (u) => {
    const p = { id: id("per"), ownerId: u.id, createdAt: now(), ...personaInput(await body(req)), stock: false };
    await repo.personas.save(p);
    return json({ persona: p }, 201);
  });
}
