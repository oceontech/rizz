"use server";

import { after } from "next/server";
import { z } from "zod";

import { paraDataISO } from "@/lib/dados";
import { sql } from "@/lib/db";
import { OCASIOES, RESERVAS_PADRAO, type ReservasConfig } from "@/lib/reservas/regras";
import { lerConfigReservas, livresNoHorario, novoCodigo } from "@/lib/reservas/servidor";
import { FIDELIDADE_ATIVA } from "@/lib/recursos";
import { avisarReserva } from "@/lib/whatsapp/avisos";

import { ErroAmigavel, protegida } from "./comum";
import { normalizarTelefone } from "./formato";

export type StatusReserva = "pendente" | "confirmada" | "concluida" | "cancelada" | "nao_compareceu";

const STATUS = ["pendente", "confirmada", "concluida", "cancelada", "nao_compareceu"] as const;

const esquema = z.object({
  id: z.number().optional(),
  nome: z.string().trim().min(2, "Informe o nome."),
  telefone: z.string().trim().max(30).nullable(),
  pessoas: z.number().int().min(1).max(200),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Escolha a data."),
  hora: z.string().regex(/^\d{2}:\d{2}$/, "Escolha o horário."),
  obs: z.string().trim().max(500).nullable(),
  ocasiao: z.enum(OCASIOES.map((o) => o.id) as [string, ...string[]]).nullable(),
  mesa: z.string().trim().max(40).nullable(),
  status: z.enum(STATUS),
});

/**
 * A equipe pode passar da lotação (ela conhece o salão melhor que a conta);
 * o formulário só avisa. Toda reserva ganha código, para o link do cliente.
 */
export async function salvarReserva(entrada: z.infer<typeof esquema>) {
  return protegida("reservas", async () => {
    const d = esquema.parse(entrada);
    const telefone = d.telefone ? normalizarTelefone(d.telefone) || null : null;
    if (d.id) {
      const id = d.id;
      const [antes] = await sql`select pessoas, data, hora, status from reservas where id = ${id}`;
      await sql`update reservas set nome = ${d.nome}, telefone = ${telefone}, pessoas = ${d.pessoas},
                data = ${d.data}, hora = ${d.hora}, obs = ${d.obs || null}, ocasiao = ${d.ocasiao},
                mesa = ${d.mesa || null}, status = ${d.status}, atualizado_em = now(),
                codigo = coalesce(codigo, ${novoCodigo()})
                where id = ${id}`;
      if (antes) {
        const evento = eventoDaMudanca(String(antes.status), d.status);
        const mudouHorario =
          Number(antes.pessoas) !== d.pessoas || paraDataISO(antes.data) !== d.data || String(antes.hora) !== d.hora;
        if (evento) after(() => avisarReserva(id, evento));
        else if (mudouHorario) after(() => avisarReserva(id, "alterada"));
      }
      return;
    }
    const [nova] = await sql`
      insert into reservas (nome, telefone, pessoas, data, hora, obs, ocasiao, mesa, status, origem, codigo)
      values (${d.nome}, ${telefone}, ${d.pessoas}, ${d.data}, ${d.hora}, ${d.obs || null},
              ${d.ocasiao}, ${d.mesa || null}, ${d.status}, 'painel', ${novoCodigo()})
      returning id`;
    after(() => avisarReserva(Number(nova.id), "nova"));
  });
}

/** Só confirmar e cancelar geram mensagem; "Chegou" e "Não veio", não. */
function eventoDaMudanca(antes: string, depois: StatusReserva) {
  if (antes === depois) return null;
  if (depois === "confirmada") return "confirmada" as const;
  if (depois === "cancelada") return "cancelada" as const;
  return null;
}

export async function mudarStatusReserva(id: number, status: StatusReserva) {
  return protegida("reservas", async () => {
    z.enum(STATUS).parse(status);
    const [antes] = await sql`select status from reservas where id = ${id}`;
    await sql`update reservas set status = ${status}, atualizado_em = now() where id = ${id}`;
    const evento = antes ? eventoDaMudanca(String(antes.status), status) : null;
    if (evento) after(() => avisarReserva(id, evento));
  });
}

export async function definirMesa(id: number, mesa: string) {
  return protegida("reservas", async () => {
    const m = z.string().trim().max(40).parse(mesa);
    await sql`update reservas set mesa = ${m || null}, atualizado_em = now() where id = ${id}`;
  });
}

/** Garante o código da reserva (as antigas não têm) e o devolve para montar o link. */
export async function codigoDaReserva(id: number) {
  return protegida("reservas",
    async () => {
      const [l] = await sql`update reservas set codigo = coalesce(codigo, ${novoCodigo()})
                            where id = ${id} returning codigo`;
      if (!l) throw new ErroAmigavel("Reserva não encontrada.");
      return String(l.codigo);
    },
    { revalidar: false, nivel: "ver" },
  );
}

export async function excluirReserva(id: number) {
  return protegida("reservas", async () => {
    await sql`delete from reservas where id = ${id}`;
  });
}

/** Lugares livres no horário, para o formulário avisar quando passar da lotação. */
export async function lotacaoNoHorario(data: string, hora: string, ignorarId?: number) {
  return protegida("reservas",
    async () => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || !/^\d{2}:\d{2}$/.test(hora)) return null;
      const cfg = await lerConfigReservas();
      return livresNoHorario(cfg, data, hora, ignorarId);
    },
    { revalidar: false, nivel: "ver" },
  );
}

/**
 * Quem liga já pode ter reservado antes: o nome vem preenchido. `ignorarId`
 * é a reserva aberta no painel, que não conta como reserva "anterior" (a
 * primeira reserva de alguém aparecia como "já reservou antes").
 */
export async function clientePorTelefone(telefone: string, ignorarId?: number) {
  return protegida("reservas",
    async () => {
      const t = normalizarTelefone(telefone);
      if (t.length < 10) return null;
      // A base de clientes é a da fidelidade, que ainda não existe (lib/recursos.ts).
      const [c] = FIDELIDADE_ATIVA ? await sql`select nome, total_visitas from clientes where telefone = ${t}` : [];
      const [ultima] = await sql`
        select nome, count(*) over ()::int as total,
               count(*) filter (where status = 'nao_compareceu') over ()::int as faltas
        from reservas where regexp_replace(coalesce(telefone, ''), '\\D', '', 'g') = ${t}
          and id <> ${ignorarId ?? 0} and status <> 'cancelada'
        order by data desc nulls last limit 1`;
      if (!c && !ultima) return null;
      return {
        nome: String(c?.nome ?? ultima.nome),
        visitas: c ? Number(c.total_visitas) : null,
        reservas: ultima ? Number(ultima.total) : 0,
        faltas: ultima ? Number(ultima.faltas) : 0,
      };
    },
    { revalidar: false, nivel: "ver" },
  );
}

// ─── Ajustes ───────────────────────────────────────────────────

const esquemaConfig = z.object({
  ativo: z.boolean(),
  confirmacaoAutomatica: z.boolean(),
  lotacaoAlmoco: z.number().int().min(0).max(1000),
  lotacaoJantar: z.number().int().min(0).max(1000),
  intervalo: z.number().int().refine((n) => [15, 20, 30, 60].includes(n), "Intervalo inválido."),
  permanencia: z.number().int().min(30).max(360),
  ultimoAntesDoFim: z.number().int().min(0).max(240),
  aprovarGrupos: z.boolean(),
  maxPessoasOnline: z.number().int().min(1).max(60),
  antecedenciaMinima: z.number().int().min(0).max(24 * 60),
  diasAFrente: z.number().int().min(1).max(180),
}) satisfies z.ZodType<ReservasConfig>;

export async function salvarConfigReservas(entrada: ReservasConfig) {
  return protegida("reservas", async () => {
    const d = esquemaConfig.parse({ ...RESERVAS_PADRAO, ...entrada });
    await sql`insert into configuracoes (chave, valor, atualizado_em) values ('reservas', ${JSON.stringify(d)}::jsonb, now())
              on conflict (chave) do update set valor = excluded.valor, atualizado_em = now()`;
  });
}

const esquemaBloqueio = z.object({
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Escolha a data."),
  turno: z.enum(["almoco", "jantar"]).nullable(),
  lotacao: z.number().int().min(0).max(1000).nullable(),
  motivo: z.string().trim().max(120).nullable(),
});

export async function criarBloqueio(entrada: z.infer<typeof esquemaBloqueio>) {
  return protegida("reservas", async () => {
    const d = esquemaBloqueio.parse(entrada);
    await sql`insert into reserva_bloqueios (data, turno, lotacao, motivo)
              values (${d.data}, ${d.turno}, ${d.lotacao}, ${d.motivo || null})`;
  });
}

export async function excluirBloqueio(id: number) {
  return protegida("reservas", async () => {
    await sql`delete from reserva_bloqueios where id = ${id}`;
  });
}

// ─── Ao vivo ───────────────────────────────────────────────────

export type NovaReserva = { id: number; nome: string; pessoas: number; data: string | null; hora: string | null; status: string };

/**
 * O painel pergunta de tempos em tempos se algo mudou nas reservas (não há
 * conexão aberta na Vercel). `versao` muda a cada reserva criada, alterada ou
 * excluída; `novas` traz as reservas do site com id acima de `desde`, para o
 * aviso com som. Só leitura: não revalida nada.
 */
export async function novidadesReservas(desde: number) {
  return protegida(
    "reservas",
    async () => {
      const [v] = await sql`
        select coalesce(max(id), 0)::int as ultimo, count(*)::int as total,
               coalesce(max(atualizado_em), max(criado_em))::text as mudou,
               count(*) filter (where status = 'pendente')::int as pendentes
        from reservas`;
      const novas =
        desde > 0
          ? await sql`select id, nome, pessoas, data::text as data, hora, status from reservas
                      where id > ${desde} and origem = 'site' order by id limit 5`
          : [];
      return {
        versao: `${v.total}-${v.ultimo}-${v.mudou ?? ""}-${v.pendentes}`,
        ultimo: Number(v.ultimo),
        novas: novas.map(
          (l): NovaReserva => ({
            id: Number(l.id),
            nome: String(l.nome),
            pessoas: Number(l.pessoas),
            data: l.data ? String(l.data) : null,
            hora: l.hora ? String(l.hora) : null,
            status: String(l.status),
          }),
        ),
      };
    },
    { revalidar: false, nivel: "ver" },
  );
}
