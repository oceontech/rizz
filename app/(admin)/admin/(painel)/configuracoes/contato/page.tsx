import type { Metadata } from "next";

import { PaginaContato } from "@/components/admin/funcionamento/GestorFuncionamento";
import { exigirAcesso } from "@/lib/auth";
import { carregarConteudo } from "@/lib/conteudo-servidor";

export const metadata: Metadata = { title: "Contato e endereço" };

export default async function ContatoPage() {
  await exigirAcesso("horarios");
  const conteudo = await carregarConteudo();
  return <PaginaContato conteudo={conteudo} />;
}
