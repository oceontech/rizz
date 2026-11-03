"use server";

import { z } from "zod";

import type { Sessao } from "@/lib/auth";
import { sql } from "@/lib/db";
import { AREAS, permissoesDe } from "@/lib/permissoes";

import { ErroAmigavel, protegida } from "./comum";
import { enviarLinkDeAcesso } from "./envio-acesso";
import { novoToken, origemAtual } from "./equipe";
import { normalizarTelefone } from "./formato";

const DIA = 864e5;
const nivel = z.enum(["nenhum", "ver", "editar"]);
const esquemaAcesso = z.object({
  papel: z.enum(["dono", "gerente", "colaborador", "personalizado"]),
  permissoes: z.object(Object.fromEntries(AREAS.map((a) => [a.id, nivel])) as Record<(typeof AREAS)[number]["id"], typeof nivel>),
  cargo: z.string().trim().max(40),
});

/** Matriz que vai para o banco: só o personalizado guarda a escolha. */
const matriz = (d: z.infer<typeof esquemaAcesso>) => (d.papel === "personalizado" ? JSON.stringify(permissoesDe("personalizado", d.permissoes)) : null);

/** Só administradores dão ou mexem em acesso de administrador. */
function conferirDono(sessao: Sessao, papelEnvolvido: string) {
  if (papelEnvolvido === "dono" && sessao.papel !== "dono") {
    throw new ErroAmigavel("Só um administrador pode dar ou alterar acesso de administrador.");
  }
}

async function alvo(sessao: Sessao, id: number) {
  if (id === sessao.id) throw new ErroAmigavel("Para mudar o seu próprio acesso, peça a outro administrador.");
  const [u] = await sql`select id, nome, email, telefone, papel, ativo from admin_usuarios where id = ${id}`;
  if (!u) throw new ErroAmigavel("Pessoa não encontrada.");
  conferirDono(sessao, String(u.papel));
  return u;
}

/** O painel nunca fica sem administrador ativo. */
async function garantirOutroDono(id: number) {
  const [{ n }] = await sql`select count(*)::int as n from admin_usuarios where papel = 'dono' and ativo and id <> ${id}`;
  if (Number(n) === 0) throw new ErroAmigavel("É preciso ter pelo menos um administrador ativo.");
}

const telefone = z
  .string()
  .transform(normalizarTelefone)
  .refine((t) => t === "" || /^\d{10,11}$/.test(t), "WhatsApp com DDD, ex.: (19) 99999-9999.");

const esquemaConvite = esquemaAcesso.extend({
  nome: z.string().trim().min(2, "Informe o nome da pessoa.").max(60),
  email: z.string().trim().toLowerCase().email("Informe um e-mail válido."),
  telefone,
  validadeDias: z.number().int().min(1).max(30),
});

const prazo = (dias: number) => (dias === 1 ? "1 dia" : `${dias} dias`);

/**
 * Cria o convite e já envia o link por e-mail e WhatsApp (os canais que
 * estiverem ligados). Devolve o link também, para copiar se nada sair.
 */
export async function convidar(entrada: z.infer<typeof esquemaConvite>) {
  return protegida("equipe", async (sessao) => {
    const d = esquemaConvite.parse(entrada);
    conferirDono(sessao, d.papel);
    const [existe] = await sql`select id from admin_usuarios where email = ${d.email}`;
    if (existe) throw new ErroAmigavel("Já existe alguém na equipe com esse e-mail.");
    // Convite novo para o mesmo e-mail substitui o anterior.
    await sql`update admin_convites set revogado_em = now()
              where tipo = 'convite' and lower(email) = ${d.email} and usado_em is null and revogado_em is null`;
    const { token, hash } = novoToken();
    await sql`insert into admin_convites (token_hash, tipo, nome, email, telefone, cargo, papel, permissoes, criado_por, expira_em)
              values (${hash}, 'convite', ${d.nome}, ${d.email}, ${d.telefone || null}, ${d.cargo || null}, ${d.papel}, ${matriz(d)}::jsonb,
                      ${sessao.id}, ${new Date(Date.now() + d.validadeDias * DIA).toISOString()})`;
    const link = `${await origemAtual()}/admin/convite/${token}`;
    const envios = await enviarLinkDeAcesso({
      tipo: "convite",
      nome: d.nome,
      email: d.email,
      telefone: d.telefone,
      link,
      validade: prazo(d.validadeDias),
      quemConvidou: sessao.nome.split(" ")[0],
    });
    return { link, envios };
  });
}

/** Reenvia um convite pendente com link novo (o anterior deixa de valer) e mais 7 dias. */
export async function renovarConvite(id: number) {
  return protegida("equipe", async (sessao) => {
    const [c] = await sql`select * from admin_convites where id = ${id} and tipo = 'convite' and usado_em is null and revogado_em is null`;
    if (!c) throw new ErroAmigavel("Convite não encontrado ou já usado.");
    conferirDono(sessao, String(c.papel));
    const { token, hash } = novoToken();
    await sql`update admin_convites set token_hash = ${hash}, criado_por = ${sessao.id}, criado_em = now(),
              expira_em = ${new Date(Date.now() + 7 * DIA).toISOString()} where id = ${id}`;
    const link = `${await origemAtual()}/admin/convite/${token}`;
    const envios = await enviarLinkDeAcesso({
      tipo: "convite",
      nome: String(c.nome ?? ""),
      email: String(c.email ?? ""),
      telefone: c.telefone ? String(c.telefone) : null,
      link,
      validade: prazo(7),
      quemConvidou: sessao.nome.split(" ")[0],
    });
    return { link, envios };
  });
}

export async function cancelarConvite(id: number) {
  return protegida("equipe", async () => {
    await sql`update admin_convites set revogado_em = now() where id = ${id} and usado_em is null`;
  });
}

export async function mudarAcesso(id: number, entrada: z.infer<typeof esquemaAcesso> & { telefone: string }) {
  return protegida("equipe", async (sessao) => {
    const d = esquemaAcesso.extend({ telefone }).parse(entrada);
    const u = await alvo(sessao, id);
    conferirDono(sessao, d.papel);
    if (u.papel === "dono" && d.papel !== "dono") await garantirOutroDono(id);
    await sql`update admin_usuarios set papel = ${d.papel}, permissoes = ${matriz(d)}::jsonb, cargo = ${d.cargo || null},
              telefone = ${d.telefone || null} where id = ${id}`;
  });
}

/** Desativar corta o acesso na hora (as sessões abertas caem), sem apagar a pessoa. */
export async function definirAtivo(id: number, ativo: boolean) {
  return protegida("equipe", async (sessao) => {
    const u = await alvo(sessao, id);
    if (!ativo && u.papel === "dono") await garantirOutroDono(id);
    await sql`update admin_usuarios set ativo = ${ativo}, sessao_versao = sessao_versao + ${ativo ? 0 : 1} where id = ${id}`;
  });
}

export async function removerMembro(id: number) {
  return protegida("equipe", async (sessao) => {
    const u = await alvo(sessao, id);
    if (u.papel === "dono") await garantirOutroDono(id);
    await sql`delete from admin_usuarios where id = ${id}`;
  });
}

export async function encerrarSessoesDe(id: number) {
  return protegida("equipe", async (sessao) => {
    await alvo(sessao, id);
    await sql`update admin_usuarios set sessao_versao = sessao_versao + 1 where id = ${id}`;
  });
}

/** Envia à pessoa um link para criar uma senha nova (vale 24 h e uma vez só). */
export async function linkNovaSenha(id: number) {
  return protegida("equipe", async (sessao) => {
    const u = await alvo(sessao, id);
    await sql`update admin_convites set revogado_em = now() where tipo = 'senha' and usuario_id = ${id} and usado_em is null and revogado_em is null`;
    const { token, hash } = novoToken();
    await sql`insert into admin_convites (token_hash, tipo, usuario_id, criado_por, expira_em)
              values (${hash}, 'senha', ${id}, ${sessao.id}, ${new Date(Date.now() + DIA).toISOString()})`;
    const link = `${await origemAtual()}/admin/convite/${token}`;
    const envios = await enviarLinkDeAcesso({
      tipo: "senha",
      nome: String(u.nome),
      email: String(u.email),
      telefone: u.telefone ? String(u.telefone) : null,
      link,
      validade: "24 horas",
    });
    return { link, envios };
  });
}
