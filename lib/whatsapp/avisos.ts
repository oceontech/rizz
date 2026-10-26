import "server-only";

import { lerConfig, paraDataISO } from "@/lib/dados";
import { bancoConfigurado, sql } from "@/lib/db";
import { dataPorExtenso, rotuloOcasiao, somarDias } from "@/lib/reservas/regras";
import { agoraSP } from "@/lib/reservas/servidor";
import { enderecoLinha, site } from "@/lib/site";

import { enviarTexto, ErroEvolution, evolutionConfigurada } from "./evolution";
import { completarConfig, montarMensagem, type TipoMensagem, type Variaveis, type WhatsappConfig } from "./mensagens";

export async function lerConfigWhatsapp() {
  return completarConfig(await lerConfig<Partial<WhatsappConfig> | null>("whatsapp", null));
}

/**
 * Endereço público do site, para os links das mensagens. O domínio de
 * `site.url` ainda não está ligado à Vercel, então vale primeiro o
 * `SITE_URL` e depois o domínio de produção que a Vercel informa.
 */
export function urlDoSite() {
  const env = process.env.SITE_URL?.trim().replace(/\/+$/, "");
  if (env) return env;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return vercel ? `https://${vercel}` : site.url;
}

type ReservaAviso = {
  id: number;
  codigo: string | null;
  nome: string;
  telefone: string | null;
  pessoas: number;
  data: string | null;
  hora: string | null;
  obs: string | null;
  ocasiao: string | null;
  status: string;
  origem: "site" | "painel";
};

function mapReserva(l: Record<string, unknown>): ReservaAviso {
  return {
    id: Number(l.id),
    codigo: l.codigo ? String(l.codigo) : null,
    nome: String(l.nome),
    telefone: l.telefone ? String(l.telefone) : null,
    pessoas: Number(l.pessoas),
    data: paraDataISO(l.data),
    hora: l.hora ? String(l.hora) : null,
    obs: l.obs ? String(l.obs) : null,
    ocasiao: l.ocasiao ? String(l.ocasiao) : null,
    status: String(l.status),
    origem: l.origem === "painel" ? "painel" : "site",
  };
}

function formatarTelefone(t: string | null) {
  const d = (t ?? "").replace(/\D/g, "");
  if (d.length < 10) return t ?? "";
  return `(${d.slice(0, 2)}) ${d.slice(2, -4)}-${d.slice(-4)}`;
}

function variaveis(r: ReservaAviso): Variaveis {
  const url = urlDoSite();
  const { hoje } = agoraSP();
  const data = r.data ? dataPorExtenso(r.data) : "";
  const quando = r.data === hoje ? "hoje" : r.data === somarDias(hoje, 1) ? "amanhã" : data;
  const ocasiao = rotuloOcasiao(r.ocasiao);
  return {
    nome: r.nome.trim().split(/\s+/)[0] ?? r.nome,
    nomeCompleto: r.nome.trim(),
    data,
    quando,
    hora: r.hora ?? "",
    pessoas: `${r.pessoas} ${r.pessoas === 1 ? "pessoa" : "pessoas"}`,
    link: r.codigo ? `${url}/reservas/${r.codigo}` : `${url}/reservas`,
    telefone: formatarTelefone(r.telefone),
    ocasiao: ocasiao ? `Ocasião: ${ocasiao}` : "",
    obs: r.obs ? `Obs.: ${r.obs}` : "",
    status: r.status === "pendente" ? "pendente, confirme no painel" : "confirmada",
    endereco: enderecoLinha,
    site: url,
  };
}

/**
 * Registra e envia uma mensagem. Nunca lança: uma falha no WhatsApp não pode
 * desfazer a reserva, só fica registrada no histórico do painel.
 * `unico` impede dois lembretes para a mesma reserva (rodadas simultâneas).
 */
async function enviarRegistrando(
  reservaId: number | null,
  tipo: TipoMensagem | "teste",
  telefone: string,
  texto: string,
  { unico = false } = {},
) {
  const [registro] = unico
    ? await sql`insert into whatsapp_envios (reserva_id, tipo, telefone, texto)
                values (${reservaId}, ${tipo}, ${telefone}, ${texto})
                on conflict (reserva_id) where tipo = 'lembrete' and status <> 'erro' do nothing
                returning id`
    : await sql`insert into whatsapp_envios (reserva_id, tipo, telefone, texto)
                values (${reservaId}, ${tipo}, ${telefone}, ${texto}) returning id`;
  if (!registro) return { ok: true as const, repetido: true };
  try {
    await enviarTexto(telefone, texto);
    await sql`update whatsapp_envios set status = 'enviado', enviado_em = now() where id = ${registro.id}`;
    return { ok: true as const };
  } catch (erro) {
    const mensagem = erro instanceof ErroEvolution ? erro.message : "Falha inesperada ao enviar.";
    if (!(erro instanceof ErroEvolution)) console.error("[whatsapp]", erro);
    await sql`update whatsapp_envios set status = 'erro', erro = ${mensagem} where id = ${registro.id}`;
    return { ok: false as const, erro: mensagem };
  }
}

/** Mensagem de teste do painel; devolve o erro para a tela. */
export async function enviarTeste(telefone: string) {
  const texto = `Teste do painel do ${site.nome}: as mensagens automáticas de reserva estão funcionando ✅`;
  return enviarRegistrando(null, "teste", telefone, texto);
}

export type EventoReserva = "nova" | "confirmada" | "alterada" | "cancelada";

/**
 * Avisa o cliente (e, em reserva nova do site, a equipe) conforme o evento e
 * a configuração. Chamado dentro de `after()`, depois da resposta: nada
 * daqui atrasa a tela de quem reservou.
 */
export async function avisarReserva(reservaId: number, evento: EventoReserva) {
  if (!bancoConfigurado || !evolutionConfigurada) return;
  try {
    const cfg = await lerConfigWhatsapp();
    if (!cfg.ativo) return;
    const [linha] = await sql`select * from reservas where id = ${reservaId}`;
    if (!linha) return;
    const r = mapReserva(linha);
    const v = variaveis(r);

    if (evento === "alterada") {
      // O lembrete já enviado era do horário antigo: o novo pode sair de novo.
      await sql`delete from whatsapp_envios where reserva_id = ${r.id} and tipo = 'lembrete'`;
    }

    const tipo = tipoParaCliente(cfg, r, evento);
    if (tipo && r.telefone) {
      const jaConfirmada =
        tipo === "confirmacao" &&
        (await sql`select 1 from whatsapp_envios where reserva_id = ${r.id} and tipo = 'confirmacao' and status = 'enviado'`).length > 0;
      if (!jaConfirmada) await enviarRegistrando(r.id, tipo, r.telefone, montarMensagem(cfg.modelos[tipo], v));
    }

    if (evento === "nova" && r.origem === "site" && cfg.avisoEquipe) {
      const texto = montarMensagem(cfg.modelos.equipe, v);
      for (const tel of cfg.telefonesEquipe) await enviarRegistrando(r.id, "equipe", tel, texto);
    }
  } catch (erro) {
    console.error("[whatsapp] aviso da reserva", reservaId, erro);
  }
}

function tipoParaCliente(cfg: WhatsappConfig, r: ReservaAviso, evento: EventoReserva): TipoMensagem | null {
  if (evento === "nova") {
    if (!cfg.confirmacao || (r.origem === "painel" && !cfg.confirmacaoPainel)) return null;
    if (r.status === "pendente") return "recebida";
    if (r.status === "confirmada") return "confirmacao";
    return null;
  }
  if (evento === "confirmada") return cfg.confirmacao && r.status === "confirmada" ? "confirmacao" : null;
  if (evento === "alterada") return cfg.alteracao && (r.status === "pendente" || r.status === "confirmada") ? "alteracao" : null;
  return cfg.cancelamento && r.status === "cancelada" ? "cancelamento" : null;
}

/**
 * Rodada de lembretes, chamada de tempos em tempos por um agendador (Vercel
 * Cron ou um cron na VPS). Pega as reservas confirmadas que começam dentro
 * das próximas `lembreteHoras` e ainda não receberam lembrete. Reservas
 * feitas há menos de 2 horas ficam de fora: acabaram de receber a
 * confirmação.
 */
export async function enviarLembretes() {
  const resultado = { enviados: 0, falhas: 0, ignorado: null as string | null };
  if (!bancoConfigurado) return { ...resultado, ignorado: "Banco não configurado." };
  if (!evolutionConfigurada) return { ...resultado, ignorado: "Evolution API não configurada." };

  const cfg = await lerConfigWhatsapp();
  if (!cfg.ativo || !cfg.lembrete) {
    await registrarRodada(resultado);
    return { ...resultado, ignorado: "Lembretes desligados no painel." };
  }

  const { hoje } = agoraSP();
  const linhas = await sql`
    select r.* from reservas r
    where r.status = 'confirmada' and r.telefone is not null and r.hora ~ '^\\d{2}:\\d{2}$'
      and r.data between ${hoje} and ${somarDias(hoje, 2)}
      and ((r.data + r.hora::time) at time zone 'America/Sao_Paulo')
          between now() and now() + make_interval(hours => ${cfg.lembreteHoras}::int)
      and r.criado_em < now() - interval '2 hours'
      and not exists (
        select 1 from whatsapp_envios e
        where e.reserva_id = r.id and e.tipo = 'lembrete' and e.status <> 'erro')
      and (select count(*) from whatsapp_envios e
           where e.reserva_id = r.id and e.tipo = 'lembrete' and e.status = 'erro') < 3
    order by r.data, r.hora
    limit 50`;

  for (const linha of linhas) {
    const r = mapReserva(linha);
    const envio = await enviarRegistrando(r.id, "lembrete", r.telefone!, montarMensagem(cfg.modelos.lembrete, variaveis(r)), {
      unico: true,
    });
    if (!envio.ok) resultado.falhas++;
    else if (!("repetido" in envio)) resultado.enviados++;
  }
  await registrarRodada(resultado);
  return resultado;
}

/** O painel mostra quando o agendador rodou pela última vez. */
async function registrarRodada(r: { enviados: number; falhas: number }) {
  const valor = JSON.stringify({ em: new Date().toISOString(), enviados: r.enviados, falhas: r.falhas });
  await sql`insert into configuracoes (chave, valor, atualizado_em) values ('whatsapp_lembretes', ${valor}::jsonb, now())
            on conflict (chave) do update set valor = excluded.valor, atualizado_em = now()`;
}

export type Envio = {
  id: number;
  tipo: string;
  telefone: string;
  status: "enviando" | "enviado" | "erro";
  erro: string | null;
  nome: string | null;
  criadoEm: string;
};

export async function ultimosEnvios(limite = 30): Promise<Envio[]> {
  const linhas = await sql`
    select e.id, e.tipo, e.telefone, e.status, e.erro, e.criado_em, r.nome
    from whatsapp_envios e left join reservas r on r.id = e.reserva_id
    order by e.criado_em desc limit ${limite}`;
  return linhas.map((l) => ({
    id: Number(l.id),
    tipo: String(l.tipo),
    telefone: String(l.telefone),
    status: l.status as Envio["status"],
    erro: l.erro ? String(l.erro) : null,
    nome: l.nome ? String(l.nome) : null,
    criadoEm: new Date(l.criado_em as string).toISOString(),
  }));
}

export async function ultimaRodadaLembretes() {
  return lerConfig<{ em: string | null; enviados: number; falhas: number }>("whatsapp_lembretes", {
    em: null,
    enviados: 0,
    falhas: 0,
  });
}
