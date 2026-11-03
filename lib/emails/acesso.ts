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
  /** Selo da marca (logo branca sobre vinho), PNG. */
  urlMarca: string;
  endereco: string;
  nomeRestaurante: string;
};

const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const primeiroNome = (n: string) => n.trim().split(/\s+/)[0] || n;

// Cores da marca (iguais às do site).
const VINHO = "#5c0a1c";

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
          "Para entrar, crie sua senha pelo botão abaixo. Leva menos de um minuto.",
        ],
        destaque: { rotulo: "Seu acesso", linhas: [[d.papel, d.cargo].filter(Boolean).join(" · ") || "Equipe"] },
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
 * E-mail no estilo dos transacionais de empresas de tecnologia: sem fundo
 * nem card (vale o fundo do próprio app), coluna estreita alinhada à
 * esquerda, selo da marca, título, texto curto, um botão e rodapé discreto.
 *
 * Modo escuro: o selo é imagem (nenhum app inverte imagens), os textos são
 * escuros sem fundo próprio (se o app inverter, viram claros), o fundo do
 * botão é um degradê e o texto branco dele leva o truque de mix-blend-mode
 * que impede o Gmail do iPhone de escurecê-lo.
 */
export function emailAcesso(etapa: EtapaAcesso, d: DadosAcesso) {
  const c = conteudo(etapa, d);
  const fonte = "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
  const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark">
<title>${esc(c.assunto)}</title>
<style>
u + .body .gmail-tela{background:#000;mix-blend-mode:screen}
u + .body .gmail-dif{background:#000;mix-blend-mode:difference}
@media (prefers-color-scheme: dark){
  .t-forte{color:#f2f2f2 !important}
  .t-texto{color:#c9c9c9 !important}
  .t-suave{color:#9a9a9a !important}
  .t-link{color:#f0a3b4 !important}
  .linha{border-color:#3a3a3a !important}
}
</style></head>
<body class="body" style="margin:0;padding:0;-webkit-font-smoothing:antialiased">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(c.previa)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:40px 24px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;${fonte}">
    <tr><td style="padding:0 0 32px"><img src="${esc(d.urlMarca)}" width="64" height="32" alt="${esc(d.nomeRestaurante)}" style="display:block;width:64px;height:32px;border:0"></td></tr>
    <tr><td class="t-forte" style="font-size:24px;line-height:1.3;font-weight:600;color:#111111;padding:0 0 16px">${esc(c.titulo)}</td></tr>
    ${c.paragrafos.map((p) => `<tr><td class="t-texto" style="font-size:15px;line-height:1.6;color:#3c3c3c;padding:0 0 14px">${esc(p)}</td></tr>`).join("\n    ")}
    ${
      c.destaque
        ? `<tr><td style="padding:4px 0 10px">
      <span class="t-suave" style="font-size:13px;color:#777777">${esc(c.destaque.rotulo)}</span><br>
      ${c.destaque.linhas.map((l) => `<span class="t-forte" style="font-size:15px;line-height:1.6;font-weight:600;color:#111111">${esc(l)}</span>`).join("<br>")}
    </td></tr>`
        : ""
    }
    ${
      c.botao
        ? `<tr><td style="padding:18px 0 22px">
      <table role="presentation" cellpadding="0" cellspacing="0"><tr>
        <td bgcolor="${VINHO}" style="border-radius:8px;background-color:${VINHO};background-image:linear-gradient(${VINHO},${VINHO})">
          <a href="${esc(c.botao.link)}" style="display:inline-block;padding:12px 22px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px"><span class="gmail-tela"><span class="gmail-dif">${esc(c.botao.texto)}</span></span></a>
        </td></tr></table>
    </td></tr>`
        : ""
    }
    <tr><td class="t-suave" style="font-size:13px;line-height:1.6;color:#777777;padding:0 0 8px">${esc(c.aviso)}</td></tr>
    ${
      c.botao && etapa !== "senha-alterada"
        ? `<tr><td class="t-suave" style="font-size:13px;line-height:1.6;color:#777777;padding:0 0 8px">Se o botão não funcionar, copie e cole este endereço no navegador:<br><a class="t-link" href="${esc(c.botao.link)}" style="color:${VINHO};word-break:break-all">${esc(c.botao.link)}</a></td></tr>`
        : ""
    }
    <tr><td class="linha" style="border-top:1px solid #e6e6e6;padding:24px 0 0;font-size:0;line-height:0">&nbsp;</td></tr>
    <tr><td class="t-suave" style="font-size:12px;line-height:1.6;color:#8a8a8a">
      ${esc(d.nomeRestaurante)} · ${esc(d.endereco)}<br>
      Mensagem automática do painel do restaurante. Não é preciso responder.
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
