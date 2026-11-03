import "server-only";

/**
 * Envio de e-mail pelo Resend (API HTTP, sem SDK). Fica desligado enquanto
 * `RESEND_API_KEY` não existir: quem chama confere `emailConfigurado`.
 * O remetente precisa ser de um domínio verificado no Resend.
 */
const CHAVE = process.env.RESEND_API_KEY?.trim();
const REMETENTE = process.env.EMAIL_REMETENTE?.trim() || "Rizz Cucina & Vino <nao-responda@rizzcucinaevino.com.br>";

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
