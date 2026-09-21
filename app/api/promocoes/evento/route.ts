import { z } from "zod";

import { sql } from "@/lib/db";

const esquema = z.object({ id: z.number().int().positive(), tipo: z.enum(["view", "click"]) });

/** Contadores do pop-up (exibições e cliques) — chamado por sendBeacon. */
export async function POST(req: Request) {
  const corpo = esquema.safeParse(await req.json().catch(() => null));
  if (!corpo.success) return Response.json({ ok: false }, { status: 400 });

  const { id, tipo } = corpo.data;
  if (tipo === "view") await sql`update promocoes set visualizacoes = visualizacoes + 1 where id = ${id}`;
  else await sql`update promocoes set cliques = cliques + 1 where id = ${id}`;

  return Response.json({ ok: true });
}
