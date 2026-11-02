import type { Metadata } from "next";

import GestorVinhos from "@/components/admin/vinhos/GestorVinhos";
import { exigirSessao } from "@/lib/auth";
import { lerCartaVinhos } from "@/lib/dados";

export const metadata: Metadata = { title: "Carta de vinhos" };

export default async function VinhosAdminPage() {
  await exigirSessao();
  const secoes = await lerCartaVinhos();
  return <GestorVinhos secoes={secoes} />;
}
