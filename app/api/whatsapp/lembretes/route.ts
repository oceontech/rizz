import { timingSafeEqual } from "node:crypto";

import { enviarLembretes } from "@/lib/whatsapp/avisos";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function autorizado(req: Request) {
  const segredo = process.env.CRON_SECRET;
  if (!segredo) return false;
  const recebido = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const a = Buffer.from(recebido);
  const b = Buffer.from(segredo);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Rodada de lembretes de reserva. Chamada por um agendador a cada 10–15 min:
 * a Vercel Cron manda o `CRON_SECRET` sozinha; num cron externo (VPS,
 * cron-job.org), envie `Authorization: Bearer <CRON_SECRET>`.
 */
export async function GET(req: Request) {
  if (!autorizado(req)) return Response.json({ ok: false, erro: "Não autorizado." }, { status: 401 });
  const resultado = await enviarLembretes();
  return Response.json({ ok: true, ...resultado });
}
