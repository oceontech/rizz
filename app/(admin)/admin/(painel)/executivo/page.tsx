import type { Metadata } from "next";

import GestorExecutivo from "@/components/admin/executivo/GestorExecutivo";
import { exigirAcesso } from "@/lib/auth";
import { lerExecutivo, lerSelos } from "@/lib/dados";

export const metadata: Metadata = { title: "Menu executivo" };

export default async function ExecutivoAdminPage() {
  await exigirAcesso("cardapio");
  const [dados, selos] = await Promise.all([lerExecutivo(), lerSelos()]);
  return <GestorExecutivo dados={dados} selos={selos} />;
}
