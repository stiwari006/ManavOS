import { id, now, repo } from "@/lib/server/db";
import { body, json, withKey } from "@/lib/server/http";
import { apiPersona, myPersonas, personaInput } from "@/lib/server/service";

export async function GET(req: Request) { return withKey(req, async (u) => json({ data: (await myPersonas(u.id)).map(apiPersona) })); }
export async function POST(req: Request) {
  return withKey(req, async (u) => {
    const p = { id: id("per"), ownerId: u.id, createdAt: now(), ...personaInput(await body(req)), stock: false };
    await repo.personas.save(p); return json(apiPersona(p), 201);
  });
}
