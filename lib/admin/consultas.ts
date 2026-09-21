import "server-only";

import { mapPromocao, paraDataISO, type Promocao } from "@/lib/dados";
import { sql } from "@/lib/db";

import type { StatusReserva } from "./reservas-actions";

export type Reserva = {
  id: number;
  nome: string;
  telefone: string | null;
  pessoas: number;
  data: string | null;
  hora: string | null;
  obs: string | null;
  status: StatusReserva;
  origem: "site" | "painel";
  criadoEm: string;
};

export type Cliente = {
  id: number;
  nome: string;
  telefone: string;
  email: string | null;
  aniversario: string | null;
  selos: number;
  totalVisitas: number;
  resgates: number;
  aceitaContato: boolean;
  obs: string | null;
  origem: "site" | "painel";
  ultimaVisita: string | null;
  criadoEm: string;
};

type Linha = Record<string, unknown>;
const iso = (v: unknown) => (v ? new Date(v as string).toISOString() : null);

export function mapReserva(l: Linha): Reserva {
  return {
    id: Number(l.id),
    nome: String(l.nome),
    telefone: l.telefone ? String(l.telefone) : null,
    pessoas: Number(l.pessoas),
    data: paraDataISO(l.data),
    hora: l.hora ? String(l.hora) : null,
    obs: l.obs ? String(l.obs) : null,
    status: l.status as StatusReserva,
    origem: l.origem as Reserva["origem"],
    criadoEm: iso(l.criado_em)!,
  };
}

export function mapCliente(l: Linha): Cliente {
  return {
    id: Number(l.id),
    nome: String(l.nome),
    telefone: String(l.telefone),
    email: l.email ? String(l.email) : null,
    aniversario: paraDataISO(l.aniversario),
    selos: Number(l.selos),
    totalVisitas: Number(l.total_visitas),
    resgates: Number(l.resgates),
    aceitaContato: Boolean(l.aceita_contato),
    obs: l.obs ? String(l.obs) : null,
    origem: l.origem as Cliente["origem"],
    ultimaVisita: iso(l.ultima_visita),
    criadoEm: iso(l.criado_em)!,
  };
}

/** Data de hoje no fuso do restaurante, "AAAA-MM-DD". */
export function hojeSP() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

export async function listarReservas(): Promise<Reserva[]> {
  const linhas = await sql`
    select * from reservas
    where data is null or data >= (now() at time zone 'America/Sao_Paulo')::date - 60
    order by data nulls last, hora nulls last, criado_em desc
    limit 1000`;
  return linhas.map(mapReserva);
}

export async function listarPromocoes(): Promise<Promocao[]> {
  const linhas = await sql`select * from promocoes order by ativo desc, criado_em desc`;
  return linhas.map(mapPromocao);
}

export async function listarClientes(): Promise<Cliente[]> {
  const linhas = await sql`select * from clientes order by ultima_visita desc nulls last, criado_em desc limit 2000`;
  return linhas.map(mapCliente);
}

export async function resumoPainel() {
  const hoje = hojeSP();
  const [reservas, clientes, promocoes, cardapio, proximas, aniversariantes, visitasSemana, eventos] =
    await Promise.all([
      sql`select
            count(*) filter (where data = ${hoje} and status in ('pendente','confirmada'))::int as hoje,
            coalesce(sum(pessoas) filter (where data = ${hoje} and status in ('pendente','confirmada')), 0)::int as pessoas_hoje,
            count(*) filter (where status = 'pendente')::int as pendentes,
            count(*) filter (where data >= ${hoje} and data < ${hoje}::date + 7 and status in ('pendente','confirmada'))::int as semana
          from reservas`,
      sql`select count(*)::int as total,
                 count(*) filter (where criado_em >= now() - interval '30 days')::int as novos,
                 count(*) filter (where selos >= coalesce((select (valor->>'meta')::int from configuracoes where chave = 'fidelidade'), 10))::int as prontos
          from clientes`,
      sql`select count(*) filter (where ativo)::int as ativas,
                 coalesce(sum(visualizacoes), 0)::int as views,
                 coalesce(sum(cliques), 0)::int as cliques
          from promocoes`,
      sql`select count(*)::int as total,
                 count(*) filter (where not disponivel)::int as esgotados,
                 count(*) filter (where not visivel)::int as ocultos
          from itens`,
      sql`select * from reservas
          where data >= ${hoje} and status in ('pendente','confirmada')
          order by data, hora limit 6`,
      sql`select * from clientes
          where aniversario is not null
            and extract(month from aniversario) = extract(month from (now() at time zone 'America/Sao_Paulo'))
          order by extract(day from aniversario) limit 8`,
      sql`select to_char((criado_em at time zone 'America/Sao_Paulo')::date, 'YYYY-MM-DD') as dia,
                 sum(quantidade)::int as n
          from fidelidade_eventos
          where tipo = 'visita' and criado_em >= now() - interval '14 days'
          group by 1 order by 1`,
      sql`select e.tipo, e.quantidade, e.criado_em, c.nome
          from fidelidade_eventos e join clientes c on c.id = e.cliente_id
          order by e.criado_em desc limit 6`,
    ]);

  return {
    hoje,
    reservas: reservas[0] as { hoje: number; pessoas_hoje: number; pendentes: number; semana: number },
    clientes: clientes[0] as { total: number; novos: number; prontos: number },
    promocoes: promocoes[0] as { ativas: number; views: number; cliques: number },
    cardapio: cardapio[0] as { total: number; esgotados: number; ocultos: number },
    proximas: proximas.map(mapReserva),
    aniversariantes: aniversariantes.map(mapCliente),
    visitasSemana: visitasSemana.map((l) => ({ dia: String(l.dia), n: Number(l.n) })),
    eventos: eventos.map((l) => ({
      tipo: String(l.tipo) as "visita" | "resgate" | "ajuste",
      quantidade: Number(l.quantidade),
      nome: String(l.nome),
      criadoEm: iso(l.criado_em)!,
    })),
  };
}

export type ResumoPainel = Awaited<ReturnType<typeof resumoPainel>>;
