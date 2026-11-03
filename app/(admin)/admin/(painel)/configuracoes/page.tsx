import type { Metadata } from "next";

import Configuracoes from "@/components/admin/config/Configuracoes";
import { resumoConfiguracoes } from "@/lib/admin/consultas";
import { exigirAcesso } from "@/lib/auth";
import { AVISO_PADRAO, lerConfig } from "@/lib/dados";

export const metadata: Metadata = { title: "Configurações" };

export default async function ConfiguracoesPage() {
  const sessao = await exigirAcesso("configuracoes");
  const [aviso, resumo] = await Promise.all([lerConfig("aviso", AVISO_PADRAO), resumoConfiguracoes()]);
  return <Configuracoes aviso={aviso} resumo={resumo} permissoes={sessao.permissoes} />;
}
