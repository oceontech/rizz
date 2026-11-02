import type { Metadata } from "next";

import GestorFuncionamento from "@/components/admin/funcionamento/GestorFuncionamento";
import { exigirSessao } from "@/lib/auth";
import { carregarConteudo } from "@/lib/conteudo-servidor";

export const metadata: Metadata = { title: "Horários e contato" };

export default async function FuncionamentoAdminPage() {
  await exigirSessao();
  const conteudo = await carregarConteudo();
  return <GestorFuncionamento conteudo={conteudo} />;
}
