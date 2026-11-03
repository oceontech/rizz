import type { Metadata } from "next";

import { PaginaHorarios } from "@/components/admin/funcionamento/GestorFuncionamento";
import { exigirAcesso } from "@/lib/auth";
import { carregarConteudo } from "@/lib/conteudo-servidor";

export const metadata: Metadata = { title: "Horários" };

export default async function HorariosPage() {
  const sessao = await exigirAcesso("horarios");
  const conteudo = await carregarConteudo();
  return <PaginaHorarios conteudo={conteudo} podeEditar={sessao.permissoes.horarios === "editar"} />;
}
