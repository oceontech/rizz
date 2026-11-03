/**
 * Textos e visual das mensagens de acesso ao painel (e-mail e WhatsApp), uma
 * por etapa. Módulo puro, sem dependências do app: dá para gerar uma prévia
 * fora do Next (script de teste).
 */

export type EtapaAcesso = "convite" | "senha-equipe" | "recuperacao" | "senha-alterada";

export type DadosAcesso = {
  nome: string;
  /** Link de uso único (não existe no aviso de senha alterada). */
  link?: string;
  /** "7 dias", "24 horas"… */
  validade?: string;
  /** Primeiro nome de quem convidou ou pediu a senha nova. */
  quem?: string;
  /** Tipo de acesso no convite ("Gerente", "Colaborador"…). */
  papel?: string;
  cargo?: string;
  /** Endereço do site (rodapé e link do painel). */
  urlSite: string;
  /** Endereço da logo branca (PNG). */
  urlLogo: string;
  endereco: string;
  nomeRestaurante: string;
};

const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const primeiroNome = (n: string) => n.trim().split(/\s+/)[0] || n;

// Cores da marca (iguais às do site).
const VINHO = "#5c0a1c";
const VINHO_ESCURO = "#2b0710";
const AMBAR = "#e8890c";
const CREME = "#f6efe6";

type Conteudo = {
  assunto: string;
  /** Texto curto que aparece ao lado do assunto na caixa de entrada. */
  previa: string;
  sobretitulo: string;
  titulo: string;
  paragrafos: string[];
  /** Quadro de destaque (acesso, próximos passos). */
  destaque?: { rotulo: string; linhas: string[] };
  botao?: { texto: string; link: string };
  aviso: string;
};

function conteudo(etapa: EtapaAcesso, d: DadosAcesso): Conteudo {
  const nome = primeiroNome(d.nome);
  const quem = d.quem ? primeiroNome(d.quem) : null;
  switch (etapa) {
    case "convite":
      return {
        assunto: `${nome}, seu acesso ao painel do ${d.nomeRestaurante}`,
        previa: `${quem ?? "A equipe"} convidou você. Crie sua senha em um minuto.`,
        sobretitulo: "Convite para a equipe",
        titulo: `Bem-vindo à equipe, ${nome}!`,
        paragrafos: [
          `${quem ?? "A equipe do restaurante"} convidou você para o painel do ${d.nomeRestaurante}, onde ficam as reservas, o cardápio e o site do restaurante.`,
          "Para entrar, é só criar a sua senha. Leva menos de um minuto.",
        ],
        destaque: {
          rotulo: "Seu acesso",
          linhas: [
            [d.papel, d.cargo].filter(Boolean).join(" · ") || "Equipe",
            "1. Toque em “Criar minha senha”",
            "2. Confirme seu nome e escolha uma senha",
            "3. Pronto: você já entra no painel",
          ],
        },
        botao: d.link ? { texto: "Criar minha senha", link: d.link } : undefined,
        aviso: `O link vale ${d.validade ?? "7 dias"} e só funciona uma vez. Se você não esperava este convite, pode ignorar este e-mail.`,
      };
    case "senha-equipe":
      return {
        assunto: `Sua nova senha do painel do ${d.nomeRestaurante}`,
        previa: `${quem ?? "A equipe"} enviou um link para você criar uma senha nova.`,
        sobretitulo: "Nova senha",
        titulo: `${nome}, vamos criar uma senha nova`,
        paragrafos: [
          `${quem ?? "Um administrador do painel"} enviou este link para você escolher uma senha nova.`,
          "A senha antiga para de funcionar assim que você criar a nova, e os aparelhos conectados vão pedir login de novo.",
        ],
        botao: d.link ? { texto: "Criar senha nova", link: d.link } : undefined,
        aviso: `O link vale ${d.validade ?? "24 horas"} e só funciona uma vez.`,
      };
    case "recuperacao":
      return {
        assunto: `Recuperar a senha do painel do ${d.nomeRestaurante}`,
        previa: "Recebemos seu pedido. Toque no botão para criar uma senha nova.",
        sobretitulo: "Esqueci minha senha",
        titulo: `${nome}, recebemos seu pedido`,
        paragrafos: [
          "Alguém pediu para recuperar a senha do painel com o seu e-mail. Se foi você, toque no botão e escolha uma senha nova.",
          "Se não foi você, ignore esta mensagem: sua senha atual continua valendo e ninguém entra sem ela.",
        ],
        botao: d.link ? { texto: "Criar senha nova", link: d.link } : undefined,
        aviso: `O link vale ${d.validade ?? "24 horas"} e só funciona uma vez.`,
      };
    case "senha-alterada":
      return {
        assunto: `Sua senha do painel do ${d.nomeRestaurante} foi alterada`,
        previa: "Aviso de segurança: a senha do seu acesso acabou de mudar.",
        sobretitulo: "Aviso de segurança",
        titulo: `${nome}, sua senha foi alterada`,
        paragrafos: [
          "A senha do seu acesso ao painel acabou de ser trocada. Os outros aparelhos conectados foram desconectados.",
          "Se foi você, está tudo certo e não precisa fazer nada.",
        ],
        destaque: { rotulo: "Não foi você?", linhas: ["Fale agora com um administrador do painel para bloquear o acesso e criar uma senha nova."] },
        botao: { texto: "Abrir o painel", link: `${d.urlSite}/admin` },
        aviso: "Esta é uma mensagem automática de segurança.",
      };
  }
}

/** E-mail montado com tabelas e estilos inline (o que os clientes de e-mail aceitam). */
export function emailAcesso(etapa: EtapaAcesso, d: DadosAcesso) {
  const c = conteudo(etapa, d);
  const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(c.assunto)}</title></head>
<body style="margin:0;padding:0;background:${CREME};-webkit-font-smoothing:antialiased">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(c.previa)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREME}">
<tr><td align="center" style="padding:28px 12px 40px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
    <tr><td style="background:${VINHO_ESCURO};background-image:linear-gradient(160deg,${VINHO} 0%,${VINHO_ESCURO} 100%);border-radius:24px 24px 0 0;padding:34px 36px 30px" align="left">
      <img src="${esc(d.urlLogo)}" width="112" alt="${esc(d.nomeRestaurante)}" style="display:block;width:112px;height:auto;border:0">
      <p style="margin:26px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:${AMBAR};font-weight:bold">${esc(c.sobretitulo)}</p>
      <h1 style="margin:10px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.25;font-weight:normal;color:#ffffff">${esc(c.titulo)}</h1>
    </td></tr>
    <tr><td style="background:#ffffff;border-radius:0 0 24px 24px;padding:32px 36px 34px;font-family:Arial,Helvetica,sans-serif;color:#3a3a3a">
      ${c.paragrafos.map((p) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#4a4a4a">${esc(p)}</p>`).join("\n      ")}
      ${
        c.destaque
          ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0 4px;background:${CREME};border-radius:16px"><tr><td style="padding:18px 20px">
        <p style="margin:0 0 8px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${VINHO};font-weight:bold">${esc(c.destaque.rotulo)}</p>
        ${c.destaque.linhas.map((l, i) => `<p style="margin:${i ? "6px" : "0"} 0 0;font-size:${i === 0 && etapa === "convite" ? "17px" : "14px"};line-height:1.5;color:${i === 0 && etapa === "convite" ? "#1f1f1f" : "#4a4a4a"};${i === 0 && etapa === "convite" ? "font-weight:bold;margin-bottom:10px" : ""}">${esc(l)}</p>`).join("\n        ")}
      </td></tr></table>`
          : ""
      }
      ${
        c.botao
          ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0 6px"><tr><td style="background:${VINHO};border-radius:999px">
        <a href="${esc(c.botao.link)}" style="display:inline-block;padding:15px 30px;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:999px">${esc(c.botao.texto)} &rarr;</a>
      </td></tr></table>`
          : ""
      }
      <p style="margin:18px 0 0;font-size:13px;line-height:1.6;color:#7a7a7a">${esc(c.aviso)}</p>
      ${
        c.botao && etapa !== "senha-alterada"
          ? `<p style="margin:16px 0 0;font-size:12px;line-height:1.6;color:#9a9a9a">Se o botão não abrir, copie este endereço no navegador:<br><a href="${esc(c.botao.link)}" style="color:${VINHO};word-break:break-all">${esc(c.botao.link)}</a></p>`
          : ""
      }
    </td></tr>
    <tr><td align="center" style="padding:22px 20px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#8a7f76">
      <strong style="color:${VINHO}">${esc(d.nomeRestaurante)}</strong><br>${esc(d.endereco)}<br>
      <a href="${esc(d.urlSite)}" style="color:#8a7f76">${esc(d.urlSite.replace(/^https?:\/\//, ""))}</a>
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;

  const texto = [
    c.titulo,
    "",
    ...c.paragrafos,
    ...(c.destaque ? ["", `${c.destaque.rotulo}:`, ...c.destaque.linhas] : []),
    ...(c.botao ? ["", `${c.botao.texto}: ${c.botao.link}`] : []),
    "",
    c.aviso,
    "",
    `${d.nomeRestaurante} · ${d.endereco}`,
  ].join("\n");

  return { assunto: c.assunto, html, texto };
}

/** Mensagem de WhatsApp da etapa (negrito com *asteriscos*, como o WhatsApp formata). */
export function whatsappAcesso(etapa: EtapaAcesso, d: DadosAcesso) {
  const nome = primeiroNome(d.nome);
  const quem = d.quem ? primeiroNome(d.quem) : null;
  switch (etapa) {
    case "convite":
      return [
        `Olá, ${nome}! 👋`,
        `${quem ?? "A equipe"} convidou você para o *painel do ${d.nomeRestaurante}*${d.papel ? ` como *${d.papel}*` : ""}.`,
        "",
        "É por lá que a gente cuida das reservas, do cardápio e do site. Para entrar, crie sua senha neste link:",
        d.link ?? "",
        "",
        `⏳ Vale ${d.validade ?? "7 dias"} e só funciona uma vez.`,
      ].join("\n");
    case "senha-equipe":
      return [
        `Olá, ${nome}!`,
        `${quem ?? "Um administrador"} enviou um link para você criar uma *senha nova* no painel do ${d.nomeRestaurante}:`,
        d.link ?? "",
        "",
        `⏳ Vale ${d.validade ?? "24 horas"} e só funciona uma vez.`,
      ].join("\n");
    case "recuperacao":
      return [
        `Olá, ${nome}!`,
        `Recebemos um pedido para *recuperar sua senha* do painel do ${d.nomeRestaurante}. Para criar uma nova, use este link:`,
        d.link ?? "",
        "",
        `⏳ Vale ${d.validade ?? "24 horas"}. Se não foi você, ignore: sua senha atual continua valendo.`,
      ].join("\n");
    case "senha-alterada":
      return [
        `🔐 ${nome}, a senha do seu acesso ao painel do ${d.nomeRestaurante} acabou de ser alterada.`,
        "Se foi você, está tudo certo. Se não foi, fale agora com um administrador do painel.",
      ].join("\n");
  }
}
