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
  /** Imagem do cabeçalho (vinho com a logo), PNG. */
  urlCabecalho: string;
  endereco: string;
  nomeRestaurante: string;
};

const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const primeiroNome = (n: string) => n.trim().split(/\s+/)[0] || n;

// Cores da marca (iguais às do site).
const VINHO = "#5c0a1c";
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

/**
 * E-mail montado com tabelas e estilos inline (o que os clientes de e-mail
 * aceitam), pensado para sobreviver ao modo escuro:
 * - o cabeçalho vinho é uma imagem (nenhum app inverte imagens);
 * - todo texto é escuro sobre fundo claro: se o app inverter, vira claro
 *   sobre escuro e o contraste continua bom;
 * - o fundo do botão é um degradê (imagem, não é invertido) e o texto branco
 *   leva o truque de mix-blend-mode que impede o Gmail do iPhone de escurecê-lo;
 * - "color-scheme: light only" faz Apple Mail e Outlook não escurecerem nada.
 */
export function emailAcesso(etapa: EtapaAcesso, d: DadosAcesso) {
  const c = conteudo(etapa, d);
  const fonte = "font-family:Arial,Helvetica,sans-serif";
  const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light only">
<title>${esc(c.assunto)}</title>
<style>
:root{color-scheme:light only;supported-color-schemes:light only}
u + .body .gmail-tela{background:#000;mix-blend-mode:screen}
u + .body .gmail-dif{background:#000;mix-blend-mode:difference}
</style></head>
<body class="body" style="margin:0;padding:0;background:${CREME};-webkit-font-smoothing:antialiased">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(c.previa)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${CREME}" style="background:${CREME}">
<tr><td align="center" style="padding:24px 12px 40px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
    <tr><td style="font-size:0;line-height:0"><img src="${esc(d.urlCabecalho)}" width="560" alt="${esc(d.nomeRestaurante)}" style="display:block;width:100%;max-width:560px;height:auto;border:0"></td></tr>
    <tr><td bgcolor="#ffffff" style="background:#ffffff;border-radius:0 0 24px 24px;padding:30px 32px 34px;${fonte};color:#2b2b2b">
      <p style="margin:0;font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:${VINHO};font-weight:bold">${esc(c.sobretitulo)}</p>
      <h1 style="margin:10px 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:27px;line-height:1.25;font-weight:normal;color:#1c1c1c">${esc(c.titulo)}</h1>
      ${c.paragrafos.map((p) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#444444">${esc(p)}</p>`).join("\n      ")}
      ${
        c.destaque
          ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 4px"><tr><td bgcolor="${CREME}" style="background:${CREME};border-radius:16px;border-left:4px solid ${VINHO};padding:16px 20px">
        <p style="margin:0 0 8px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${VINHO};font-weight:bold">${esc(c.destaque.rotulo)}</p>
        ${c.destaque.linhas
          .map((l, i) => {
            const forte = i === 0 && etapa === "convite";
            return `<p style="margin:${i ? "6px" : "0"} 0 ${forte ? "10px" : "0"};font-size:${forte ? "17px" : "14px"};line-height:1.5;color:${forte ? "#1c1c1c" : "#444444"};${forte ? "font-weight:bold" : ""}">${esc(l)}</p>`;
          })
          .join("\n        ")}
      </td></tr></table>`
          : ""
      }
      ${
        c.botao
          ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0 6px"><tr>
        <td bgcolor="${VINHO}" style="border-radius:999px;background-color:${VINHO};background-image:linear-gradient(${VINHO},${VINHO})">
          <a href="${esc(c.botao.link)}" style="display:inline-block;padding:15px 30px;${fonte};font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:999px"><span class="gmail-tela"><span class="gmail-dif">${esc(c.botao.texto)} &rarr;</span></span></a>
        </td></tr></table>`
          : ""
      }
      <p style="margin:18px 0 0;font-size:13px;line-height:1.6;color:#6b6b6b">${esc(c.aviso)}</p>
      ${
        c.botao && etapa !== "senha-alterada"
          ? `<p style="margin:16px 0 0;font-size:12px;line-height:1.6;color:#7a7a7a">Se o botão não abrir, copie este endereço no navegador:<br><a href="${esc(c.botao.link)}" style="color:${VINHO};word-break:break-all">${esc(c.botao.link)}</a></p>`
          : ""
      }
    </td></tr>
    <tr><td align="center" style="padding:22px 20px 0;${fonte};font-size:12px;line-height:1.6;color:#6f655d">
      <strong style="color:${VINHO}">${esc(d.nomeRestaurante)}</strong><br>${esc(d.endereco)}<br>
      <a href="${esc(d.urlSite)}" style="color:#6f655d">${esc(d.urlSite.replace(/^https?:\/\//, ""))}</a>
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
