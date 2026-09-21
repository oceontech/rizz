import type { Metadata } from "next";

import GestorCardapio from "@/components/admin/cardapio/GestorCardapio";
import { exigirSessao } from "@/lib/auth";
import { lerCardapio } from "@/lib/dados";

export const metadata: Metadata = { title: "Cardápio" };

export default async function CardapioAdminPage() {
  await exigirSessao();
  const categorias = await lerCardapio();
  return <GestorCardapio categorias={categorias} />;
}
