import type { Metadata } from "next";

import GestorCardapio from "@/components/admin/cardapio/GestorCardapio";
import { exigirSessao } from "@/lib/auth";
import { lerCardapio, lerSelos } from "@/lib/dados";

export const metadata: Metadata = { title: "Cardápio" };

export default async function CardapioAdminPage({ searchParams }: PageProps<"/admin/cardapio">) {
  await exigirSessao();
  const [{ novo }, categorias, selos] = await Promise.all([searchParams, lerCardapio(), lerSelos()]);
  return <GestorCardapio categorias={categorias} selos={selos} abrirNovo={novo === "1"} />;
}
