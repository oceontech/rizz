import { z } from "zod";

import { sql } from "@/lib/db";

const esquema = z.object({
  nome: z.string().trim().min(2).max(120),
  telefone: z.string().trim().max(30).optional().default(""),
  pessoas: z.coerce.number().int().min(1).max(200).catch(2),
  data: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .or(z.literal("")),
  hora: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional()
    .or(z.literal("")),
  obs: z.string().trim().max(500).optional().default(""),
  /** Armadilha para robôs: humanos não veem este campo. */
  site: z.string().max(0).optional(),
});

/**
 * Pedido de reserva vindo do site. Entra como "pendente" no painel; o
 * cliente segue para o WhatsApp como antes, então nada muda para ele.
 */
export async function POST(req: Request) {
  const corpo = esquema.safeParse(await req.json().catch(() => null));
  if (!corpo.success) return Response.json({ ok: false, erro: "Dados inválidos" }, { status: 400 });

  const d = corpo.data;
  await sql`
    insert into reservas (nome, telefone, pessoas, data, hora, obs, status, origem)
    values (${d.nome}, ${d.telefone || null}, ${d.pessoas}, ${d.data || null}, ${d.hora || null},
            ${d.obs || null}, 'pendente', 'site')`;

  return Response.json({ ok: true });
}
