import "server-only";

/**
 * Envio de e-mail pelo Resend (API HTTP, sem SDK). Fica desligado enquanto
 * `RESEND_API_KEY` não existir: quem chama confere `emailConfigurado`.
 * O remetente precisa ser de um domínio verificado no Resend.
 */
const CHAVE = process.env.RESEND_API_KEY?.trim();
const REMETENTE = process.env.EMAIL_REMETENTE?.trim() || "Rizz Cucina & Vino <nao-responda@mail.oceontech.com.br>";

export const emailConfigurado = Boolean(CHAVE);

export class ErroEmail extends Error {}

export async function enviarEmail({ para, assunto, html, texto }: { para: string; assunto: string; html: string; texto: string }) {
  if (!CHAVE) throw new ErroEmail("O envio de e-mail ainda não está configurado.");
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${CHAVE}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: REMETENTE, to: [para], subject: assunto, html, text: texto }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!r.ok) {
    const corpo = (await r.json().catch(() => null)) as { message?: string } | null;
    console.error("[email]", r.status, corpo?.message);
    throw new ErroEmail(r.status === 403 ? "O domínio de envio ainda não foi verificado no Resend." : "O Resend recusou o envio.");
  }
  return ((await r.json()) as { id?: string }).id ?? null;
}

const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** Molde simples (tabelas e estilos inline, como os clientes de e-mail exigem). */
export function emailComBotao({ titulo, paragrafos, botao, link, rodape }: { titulo: string; paragrafos: string[]; botao: string; link: string; rodape: string }) {
  return `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#f4f1ee;font-family:Arial,Helvetica,sans-serif;color:#2b2b2b">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:20px;padding:36px 32px">
<tr><td style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#7a1f2b;font-weight:bold">Rizz Cucina &amp; Vino</td></tr>
<tr><td style="padding-top:18px;font-size:22px;font-weight:bold;line-height:1.3">${esc(titulo)}</td></tr>
${paragrafos.map((p) => `<tr><td style="padding-top:12px;font-size:15px;line-height:1.6;color:#4a4a4a">${esc(p)}</td></tr>`).join("")}
<tr><td style="padding-top:26px"><a href="${esc(link)}" style="display:inline-block;background:#5c0a1c;color:#ffffff;text-decoration:none;font-weight:bold;font-size:15px;padding:14px 26px;border-radius:999px">${esc(botao)}</a></td></tr>
<tr><td style="padding-top:22px;font-size:12px;line-height:1.5;color:#8a8a8a">Se o botão não abrir, copie este endereço no navegador:<br><span style="word-break:break-all;color:#5c0a1c">${esc(link)}</span></td></tr>
<tr><td style="padding-top:22px;border-top:1px solid #eee;margin-top:22px;font-size:12px;color:#8a8a8a">${esc(rodape)}</td></tr>
</table></td></tr></table></body></html>`;
}
