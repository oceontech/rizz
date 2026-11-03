import type { Metadata } from "next";

import GestorPromocoes from "@/components/admin/promocoes/GestorPromocoes";
import { hojeSP, listarPromocoes } from "@/lib/admin/consultas";
import { exigirAcesso } from "@/lib/auth";

export const metadata: Metadata = { title: "Promoções e pop-up" };

export default async function PromocoesAdminPage() {
  await exigirAcesso("site");
  const promocoes = await listarPromocoes();
  return <GestorPromocoes promocoes={promocoes} hoje={hojeSP()} />;
}
