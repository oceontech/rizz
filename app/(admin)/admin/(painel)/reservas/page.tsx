import type { Metadata } from "next";

import GestorReservas from "@/components/admin/reservas/GestorReservas";
import { hojeSP, listarReservas } from "@/lib/admin/consultas";
import { exigirSessao } from "@/lib/auth";
import { somarDias } from "@/lib/reservas/regras";
import { lerBloqueios, lerConfigReservas } from "@/lib/reservas/servidor";

export const metadata: Metadata = { title: "Reservas" };

export default async function ReservasAdminPage({ searchParams }: PageProps<"/admin/reservas">) {
  await exigirSessao();
  const hoje = hojeSP();
  const [{ nova }, reservas, config, bloqueios] = await Promise.all([
    searchParams,
    listarReservas(),
    lerConfigReservas(),
    lerBloqueios(somarDias(hoje, -7), somarDias(hoje, 365)),
  ]);
  return (
    <GestorReservas
      reservas={reservas}
      config={config}
      bloqueios={bloqueios}
      hoje={hoje}
      abrirNova={nova === "1"}
    />
  );
}
