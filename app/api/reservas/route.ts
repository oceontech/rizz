import { after } from "next/server";
import { z } from "zod";

import { normalizarTelefone } from "@/lib/admin/formato";
import { sql } from "@/lib/db";
import { OCASIOES } from "@/lib/reservas/regras";
import { horariosDisponiveis, livresNoHorario, novoCodigo } from "@/lib/reservas/servidor";
import { avisarReserva } from "@/lib/whatsapp/avisos";

const esquema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome.").max(120),
  telefone: z
    .string()
    .transform(normalizarTelefone)
    .refine((t) => /^\d{10,11}$/.test(t), "Informe um WhatsApp com DDD."),
  pessoas: z.coerce.number().int().min(1).max(200),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hora: z.string().regex(/^\d{2}:\d{2}$/),
  ocasiao: z
    .enum(OCASIOES.map((o) => o.id) as [string, ...string[]])
    .nullable()
    .optional(),
  obs: z.string().trim().max(500).optional().default(""),
  /** Armadilha para robôs: humanos não veem este campo. */
  site: z.string().max(0).optional(),
});

const erro = (mensagem: string, status = 400) => Response.json({ ok: false, erro: mensagem }, { status });

/**
 * Reserva feita pelo cliente no site. Confere a lotação antes e depois de
 * gravar: se duas pessoas pegarem o último lugar ao mesmo tempo, a segunda
 * gravação é desfeita e o cliente escolhe outro horário.
 */
export async function POST(req: Request) {
  const corpo = esquema.safeParse(await req.json().catch(() => null));
  if (!corpo.success) return erro(corpo.error.issues[0]?.message ?? "Dados inválidos.");
  const d = corpo.data;

  const { cfg, horarios } = await horariosDisponiveis(d.data);
  if (!cfg.ativo) return erro("As reservas pelo site estão pausadas. Fale com a gente pelo WhatsApp.", 409);
  const horario = horarios.find((h) => h.hora === d.hora);
  if (!horario || horario.livres < d.pessoas) {
    return erro("Esse horário acabou de lotar. Escolha outro, por favor.", 409);
  }

  const [repetida] = await sql`
    select 1 from reservas
    where data = ${d.data} and status in ('pendente','confirmada')
      and regexp_replace(coalesce(telefone, ''), '\\D', '', 'g') = ${d.telefone}`;
  if (repetida) {
    return erro("Já existe uma reserva neste WhatsApp para esse dia. Para mudar, use o link que você recebeu.", 409);
  }

  const codigo = novoCodigo();
  // Grupos grandes entram pendentes: a equipe confirma e monta o espaço.
  const status = cfg.confirmacaoAutomatica && d.pessoas <= cfg.maxPessoasOnline ? "confirmada" : "pendente";
  const [nova] = await sql`
    insert into reservas (nome, telefone, pessoas, data, hora, obs, ocasiao, status, origem, codigo)
    values (${d.nome}, ${d.telefone}, ${d.pessoas}, ${d.data}, ${d.hora}, ${d.obs || null},
            ${d.ocasiao ?? null}, ${status}, 'site', ${codigo})
    returning id`;

  const depois = await livresNoHorario(cfg, d.data, d.hora, Number(nova.id));
  if (depois.livres < d.pessoas) {
    await sql`delete from reservas where id = ${nova.id}`;
    return erro("Esse horário acabou de lotar. Escolha outro, por favor.", 409);
  }

  after(() => avisarReserva(Number(nova.id), "nova"));
  return Response.json({ ok: true, codigo, status });
}
