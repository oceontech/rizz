import { lerConfigReservas, reservaPorCodigo } from "@/lib/reservas/servidor";
import { enderecoLinha, site } from "@/lib/site";

/** "2026-10-19" + "20:30" → "20261019T203000" (hora local do restaurante). */
const carimbo = (data: string, minutos: number) => {
  const h = String(Math.floor(minutos / 60)).padStart(2, "0");
  const m = String(minutos % 60).padStart(2, "0");
  return `${data.replaceAll("-", "")}T${h}${m}00`;
};

/** Evento para o cliente salvar a reserva na agenda do celular. */
export async function GET(_req: Request, ctx: RouteContext<"/api/reservas/[codigo]/ics">) {
  const { codigo } = await ctx.params;
  const [r, cfg] = await Promise.all([reservaPorCodigo(codigo), lerConfigReservas()]);
  if (!r) return new Response("Reserva não encontrada", { status: 404 });

  const [h, m] = r.hora.split(":").map(Number);
  const inicio = h * 60 + m;
  const agora = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Rizz//Reservas//PT",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${r.codigo}@rizzrestaurante.com.br`,
    `DTSTAMP:${agora}`,
    `DTSTART;TZID=America/Sao_Paulo:${carimbo(r.data, inicio)}`,
    `DTEND;TZID=America/Sao_Paulo:${carimbo(r.data, inicio + cfg.permanencia)}`,
    `SUMMARY:Reserva no ${site.nome}`,
    `DESCRIPTION:${r.pessoas} ${r.pessoas === 1 ? "pessoa" : "pessoas"}. Detalhes: ${site.url}/reservas/${r.codigo}`,
    `LOCATION:${enderecoLinha.replaceAll(",", "\\,")}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    `DESCRIPTION:Reserva no ${site.nomeCurto}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new Response(ics, {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": `attachment; filename="reserva-rizz.ics"`,
    },
  });
}
