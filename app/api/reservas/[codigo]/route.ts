import { z } from "zod";

import { sql } from "@/lib/db";
import { horariosDisponiveis, livresNoHorario, podeMexer, reservaPorCodigo } from "@/lib/reservas/servidor";

const esquema = z.discriminatedUnion("acao", [
  z.object({ acao: z.literal("cancelar") }),
  z.object({
    acao: z.literal("alterar"),
    pessoas: z.coerce.number().int().min(1).max(200),
    data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    hora: z.string().regex(/^\d{2}:\d{2}$/),
  }),
]);

const erro = (mensagem: string, status = 400) => Response.json({ ok: false, erro: mensagem }, { status });

/** O próprio cliente cancela ou muda a reserva pelo link pessoal. */
export async function PATCH(req: Request, ctx: RouteContext<"/api/reservas/[codigo]">) {
  const { codigo } = await ctx.params;
  const reserva = await reservaPorCodigo(codigo);
  if (!reserva) return erro("Reserva não encontrada.", 404);
  if (!podeMexer(reserva)) return erro("Esta reserva não pode mais ser alterada pelo site.", 409);

  const corpo = esquema.safeParse(await req.json().catch(() => null));
  if (!corpo.success) return erro("Dados inválidos.");
  const d = corpo.data;

  if (d.acao === "cancelar") {
    await sql`update reservas set status = 'cancelada', atualizado_em = now() where id = ${reserva.id}`;
    return Response.json({ ok: true });
  }

  const { cfg, horarios } = await horariosDisponiveis(d.data, reserva.id);
  if (!cfg.ativo) return erro("As alterações pelo site estão pausadas. Fale com a gente pelo WhatsApp.", 409);
  if (d.pessoas > cfg.maxPessoasOnline) {
    return erro(`Para mais de ${cfg.maxPessoasOnline} pessoas, fale com a equipe pelo WhatsApp.`, 409);
  }
  const horario = horarios.find((h) => h.hora === d.hora);
  if (!horario || horario.livres < d.pessoas) return erro("Esse horário não tem mais lugar. Escolha outro.", 409);

  const antes = { pessoas: reserva.pessoas, data: reserva.data, hora: reserva.hora };
  await sql`update reservas set pessoas = ${d.pessoas}, data = ${d.data}, hora = ${d.hora}, atualizado_em = now()
            where id = ${reserva.id}`;

  const depois = await livresNoHorario(cfg, d.data, d.hora, reserva.id);
  if (depois.livres < d.pessoas) {
    await sql`update reservas set pessoas = ${antes.pessoas}, data = ${antes.data}, hora = ${antes.hora}
              where id = ${reserva.id}`;
    return erro("Esse horário acabou de lotar. Escolha outro, por favor.", 409);
  }
  return Response.json({ ok: true });
}
