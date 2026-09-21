import type { Metadata } from "next";

import GestorFidelidade from "@/components/admin/fidelidade/GestorFidelidade";
import { hojeSP, listarClientes } from "@/lib/admin/consultas";
import { exigirSessao } from "@/lib/auth";
import { FIDELIDADE_PADRAO, lerConfig } from "@/lib/dados";

export const metadata: Metadata = { title: "Fidelidade" };

export default async function FidelidadeAdminPage() {
  await exigirSessao();
  const [clientes, config] = await Promise.all([listarClientes(), lerConfig("fidelidade", FIDELIDADE_PADRAO)]);
  return <GestorFidelidade clientes={clientes} config={config} hoje={hojeSP()} />;
}
