import type { Metadata } from "next";

import GestorSelos from "@/components/admin/selos/GestorSelos";
import { usoDosSelos } from "@/lib/admin/consultas";
import { exigirAcesso } from "@/lib/auth";
import { lerSelos } from "@/lib/dados";

export const metadata: Metadata = { title: "Selos" };

export default async function SelosAdminPage() {
  await exigirAcesso("configuracoes");
  const [selos, uso] = await Promise.all([lerSelos(), usoDosSelos()]);
  return <GestorSelos selos={selos} uso={uso} />;
}
