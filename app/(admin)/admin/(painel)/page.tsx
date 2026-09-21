import type { Metadata } from "next";

import Dashboard from "@/components/admin/dashboard/Dashboard";
import { resumoPainel } from "@/lib/admin/consultas";
import { exigirSessao } from "@/lib/auth";

export const metadata: Metadata = { title: "Visão geral" };

export default async function PainelPage() {
  const sessao = await exigirSessao();
  const resumo = await resumoPainel();
  return <Dashboard nome={sessao.nome} resumo={resumo} />;
}
