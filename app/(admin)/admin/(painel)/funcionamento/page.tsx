import { redirect } from "next/navigation";

/** Endereço antigo: Horários e contato agora são abas de Configurações. */
export default function FuncionamentoAntigo() {
  redirect("/admin/configuracoes/horarios");
}
