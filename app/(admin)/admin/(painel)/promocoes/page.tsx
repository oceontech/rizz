import type { Metadata } from "next";

import GestorPromocoes from "@/components/admin/promocoes/GestorPromocoes";
import { hojeSP, listarPromocoes } from "@/lib/admin/consultas";
import { exigirSessao } from "@/lib/auth";

export const metadata: Metadata = { title: "Promoções e pop-up" };

export default async function PromocoesAdminPage() {
  await exigirSessao();
  const promocoes = await listarPromocoes();
  return <GestorPromocoes promocoes={promocoes} hoje={hojeSP()} />;
}
