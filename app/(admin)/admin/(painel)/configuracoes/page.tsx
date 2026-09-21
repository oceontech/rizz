import type { Metadata } from "next";

import Configuracoes from "@/components/admin/config/Configuracoes";
import { exigirSessao } from "@/lib/auth";
import { AVISO_PADRAO, lerConfig } from "@/lib/dados";

export const metadata: Metadata = { title: "Configurações" };

export default async function ConfiguracoesPage() {
  const sessao = await exigirSessao();
  const aviso = await lerConfig("aviso", AVISO_PADRAO);
  return <Configuracoes aviso={aviso} usuario={{ nome: sessao.nome, email: sessao.email }} />;
}
