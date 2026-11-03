import "server-only";

import { emailConfigurado, enviarEmail, ErroEmail } from "@/lib/email";
import { emailAcesso, whatsappAcesso, type DadosAcesso, type EtapaAcesso } from "@/lib/emails/acesso";
import { site } from "@/lib/site";
import { urlDoSite } from "@/lib/whatsapp/avisos";
import { enviarTexto, ErroEvolution, evolutionConfigurada, infoInstancia } from "@/lib/whatsapp/evolution";

import { mascaraTelefone, normalizarTelefone } from "./formato";

/** Situação de um canal depois da tentativa de envio. */
export type Envio = { canal: "email" | "whatsapp"; destino: string; ok: boolean; motivo?: string };

export type Canais = { email: boolean; whatsapp: boolean };

/** Quais canais podem enviar agora (o WhatsApp precisa estar conectado). */
export async function canaisDisponiveis(): Promise<Canais> {
  let whatsapp = false;
  if (evolutionConfigurada) {
    try {
      whatsapp = (await infoInstancia()).estado === "open";
    } catch {
      whatsapp = false;
    }
  }
  return { email: emailConfigurado, whatsapp };
}

/**
 * Manda a mensagem da etapa (convite, nova senha, recuperação ou aviso de
 * senha alterada) pelos canais disponíveis. Nunca falha: devolve o resultado
 * de cada canal para a tela mostrar (e, se nada saiu, a tela oferece o link).
 */
export async function enviarAcesso(
  etapa: EtapaAcesso,
  d: { nome: string; email: string; telefone: string | null; link?: string; validade?: string; quem?: string; papel?: string; cargo?: string },
): Promise<Envio[]> {
  const urlSite = urlDoSite();
  const dados: DadosAcesso = {
    ...d,
    urlSite,
    urlCabecalho: `${urlSite}/email/cabecalho.png`,
    endereco: `${site.endereco.rua} · ${site.endereco.cidade}/${site.endereco.uf}`,
    nomeRestaurante: site.nome,
  };
  const resultados: Envio[] = [];
  const canais = await canaisDisponiveis();

  if (d.email) {
    if (!canais.email) {
      resultados.push({ canal: "email", destino: d.email, ok: false, motivo: "E-mail ainda não configurado" });
    } else {
      try {
        const e = emailAcesso(etapa, dados);
        await enviarEmail({ para: d.email, assunto: e.assunto, html: e.html, texto: e.texto });
        resultados.push({ canal: "email", destino: d.email, ok: true });
      } catch (erro) {
        resultados.push({ canal: "email", destino: d.email, ok: false, motivo: erro instanceof ErroEmail ? erro.message : "Falha ao enviar o e-mail" });
      }
    }
  }

  const tel = d.telefone ? normalizarTelefone(d.telefone) : "";
  if (tel) {
    const destino = mascaraTelefone(tel);
    if (!canais.whatsapp) {
      resultados.push({ canal: "whatsapp", destino, ok: false, motivo: "WhatsApp do restaurante desconectado" });
    } else {
      try {
        await enviarTexto(tel, whatsappAcesso(etapa, dados));
        resultados.push({ canal: "whatsapp", destino, ok: true });
      } catch (erro) {
        resultados.push({ canal: "whatsapp", destino, ok: false, motivo: erro instanceof ErroEvolution ? erro.message : "Falha ao enviar pelo WhatsApp" });
      }
    }
  }
  return resultados;
}

/** Aviso de segurança depois de trocar a senha. Não atrapalha quem trocou se falhar. */
export async function avisarSenhaAlterada(u: { nome: string; email: string; telefone: string | null }) {
  try {
    await enviarAcesso("senha-alterada", u);
  } catch (erro) {
    console.error("[acesso] aviso de senha alterada", erro);
  }
}
