import type { Metadata } from "next";

import MinhaConta from "@/components/admin/config/MinhaConta";
import { exigirSessao } from "@/lib/auth";

export const metadata: Metadata = { title: "Minha conta" };

export default async function ContaPage() {
  const sessao = await exigirSessao();
  return <MinhaConta usuario={{ nome: sessao.nome, email: sessao.email, cargo: sessao.cargo, telefone: sessao.telefone, papel: sessao.papel, permissoes: sessao.permissoes }} />;
}
