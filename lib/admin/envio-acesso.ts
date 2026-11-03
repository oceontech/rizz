import "server-only";

import { emailComBotao, emailConfigurado, enviarEmail, ErroEmail } from "@/lib/email";
import { site } from "@/lib/site";
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
 * Manda o link de convite ou de nova senha pelos canais disponíveis. Nunca
 * falha: devolve o resultado de cada canal para a tela mostrar (e, se nada
 * saiu, a tela oferece o link para copiar).
 */
export async function enviarLinkDeAcesso(d: {
  tipo: "convite" | "senha";
  nome: string;
  email: string;
  telefone: string | null;
  link: string;
  validade: string;
  quemConvidou?: string;
}): Promise<Envio[]> {
  const primeiro = d.nome.split(" ")[0] || d.nome;
  const convite = d.tipo === "convite";
  const resultados: Envio[] = [];
  const canais = await canaisDisponiveis();

  if (d.email) {
    if (!canais.email) {
      resultados.push({ canal: "email", destino: d.email, ok: false, motivo: "E-mail ainda não configurado" });
    } else {
      try {
        await enviarEmail({
          para: d.email,
          assunto: convite ? `Seu acesso ao painel do ${site.nome}` : `Nova senha do painel do ${site.nome}`,
          texto: convite
            ? `Olá, ${primeiro}! ${d.quemConvidou ?? "A equipe"} convidou você para o painel do ${site.nome}. Crie sua senha por este link (vale ${d.validade}): ${d.link}`
            : `Olá, ${primeiro}! Crie uma senha nova para o painel do ${site.nome} por este link (vale ${d.validade}): ${d.link}`,
          html: emailComBotao({
            titulo: convite ? `Olá, ${primeiro}! Você foi convidado para o painel.` : `Olá, ${primeiro}! Vamos criar uma senha nova.`,
            paragrafos: convite
              ? [
                  `${d.quemConvidou ?? "A equipe"} convidou você para o painel do ${site.nome}, onde ficam reservas, cardápio e o site do restaurante.`,
                  `Toque no botão para criar sua senha. O link vale ${d.validade} e só pode ser usado uma vez.`,
                ]
              : [`Toque no botão para escolher a senha nova. O link vale ${d.validade} e só pode ser usado uma vez.`],
            botao: convite ? "Criar minha senha" : "Criar senha nova",
            link: d.link,
            rodape: "Se você não esperava esta mensagem, pode ignorar: sem usar o link, nada muda.",
          }),
        });
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
        await enviarTexto(
          tel,
          convite
            ? `Olá, ${primeiro}! 👋\n${d.quemConvidou ?? "A equipe"} convidou você para o painel do *${site.nome}*.\n\nCrie sua senha por este link (vale ${d.validade}, uso único):\n${d.link}`
            : `Olá, ${primeiro}!\nPara criar uma senha nova no painel do *${site.nome}*, use este link (vale ${d.validade}, uso único):\n${d.link}`,
        );
        resultados.push({ canal: "whatsapp", destino, ok: true });
      } catch (erro) {
        resultados.push({ canal: "whatsapp", destino, ok: false, motivo: erro instanceof ErroEvolution ? erro.message : "Falha ao enviar pelo WhatsApp" });
      }
    }
  }
  return resultados;
}
