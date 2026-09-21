import type { Metadata } from "next";

import GestorReservas from "@/components/admin/reservas/GestorReservas";
import { hojeSP, listarReservas } from "@/lib/admin/consultas";
import { exigirSessao } from "@/lib/auth";

export const metadata: Metadata = { title: "Reservas" };

export default async function ReservasAdminPage({ searchParams }: PageProps<"/admin/reservas">) {
  await exigirSessao();
  const [{ nova }, reservas] = await Promise.all([searchParams, listarReservas()]);
  return <GestorReservas reservas={reservas} hoje={hojeSP()} abrirNova={nova === "1"} />;
}
