import type { Metadata } from "next";

import GestorHome from "@/components/admin/home/GestorHome";
import { HOME_PADRAO } from "@/data/menu";
import { exigirSessao } from "@/lib/auth";
import { lerCardapio, lerConfig } from "@/lib/dados";

export const metadata: Metadata = { title: "Página inicial" };

export default async function HomeAdminPage() {
  await exigirSessao();
  const [categorias, config] = await Promise.all([lerCardapio(), lerConfig("home", HOME_PADRAO)]);
  return <GestorHome categorias={categorias} config={config} />;
}
