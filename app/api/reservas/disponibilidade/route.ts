import type { NextRequest } from "next/server";

import { bancoConfigurado } from "@/lib/db";
import { diaSemReservas, somarDias } from "@/lib/reservas/regras";
import { agoraSP, horariosDisponiveis, lerBloqueios, lerConfigReservas, reservaPorCodigo } from "@/lib/reservas/servidor";

/**
 * Sem `data`: o que o calendário do site precisa (se as reservas estão
 * ligadas, limites e dias sem reserva). Com `data`: os horários do dia e os
 * lugares livres em cada um. `ignorar` (código) tira a própria reserva da
 * conta quando o cliente está alterando.
 */
export async function GET(req: NextRequest) {
  if (!bancoConfigurado) return Response.json({ ativo: false });

  const params = req.nextUrl.searchParams;
  const data = params.get("data");

  if (!data) {
    const cfg = await lerConfigReservas();
    const { hoje } = agoraSP();
    const ate = somarDias(hoje, cfg.diasAFrente);
    const bloqueios = await lerBloqueios(hoje, ate);
    const fechados: string[] = [];
    for (let d = hoje; d <= ate; d = somarDias(d, 1)) if (diaSemReservas(cfg, bloqueios, d)) fechados.push(d);
    return Response.json(
      { ativo: cfg.ativo, maxPessoas: cfg.maxPessoasOnline, hoje, ate, fechados },
      { headers: { "cache-control": "no-store" } },
    );
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return Response.json({ horarios: [] }, { status: 400 });

  const codigo = params.get("ignorar");
  const propria = codigo ? await reservaPorCodigo(codigo) : null;
  const { horarios } = await horariosDisponiveis(data, propria?.id);

  // O site só precisa saber se cabe e se está acabando — não a lotação real.
  return Response.json(
    { horarios: horarios.map((h) => ({ hora: h.hora, turno: h.turno, livres: h.livres, poucos: h.livres <= h.lotacao * 0.2 })) },
    { headers: { "cache-control": "no-store" } },
  );
}
