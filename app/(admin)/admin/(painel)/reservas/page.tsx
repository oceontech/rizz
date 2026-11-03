import { carregarConteudo } from "@/lib/conteudo-servidor";
import type { Metadata } from "next";

import GestorReservas, { type Aba, type Visao } from "@/components/admin/reservas/GestorReservas";
import { hojeSP, listarReservas } from "@/lib/admin/consultas";
import { exigirAcesso } from "@/lib/auth";
import { somarDias } from "@/lib/reservas/regras";
import { lerBloqueios, lerConfigReservas } from "@/lib/reservas/servidor";
import { lerConfigWhatsapp } from "@/lib/whatsapp/avisos";
import { evolutionConfigurada } from "@/lib/whatsapp/evolution";

export const metadata: Metadata = { title: "Reservas" };

const ABAS: Aba[] = ["dia", "lista", "ajustes"];
const VISOES: Visao[] = ["proximas", "hoje", "pendentes", "anteriores"];
const escolher = <T extends string>(lista: T[], v: unknown, padrao: T) =>
  lista.includes(v as T) ? (v as T) : padrao;

export default async function ReservasAdminPage({ searchParams }: PageProps<"/admin/reservas">) {
  // Layout e página rodam em paralelo: garante horários e contato do painel aqui também.
  await carregarConteudo();
  await exigirAcesso("reservas");
  const hoje = hojeSP();
  const [{ nova, aba, visao }, reservas, config, bloqueios, whats] = await Promise.all([
    searchParams,
    listarReservas(),
    lerConfigReservas(),
    lerBloqueios(somarDias(hoje, -7), somarDias(hoje, 365)),
    lerConfigWhatsapp().catch(() => null),
  ]);
  return (
    <GestorReservas
      reservas={reservas}
      config={config}
      bloqueios={bloqueios}
      hoje={hoje}
      abrirNova={nova === "1"}
      abaInicial={escolher(ABAS, aba, "dia")}
      visaoInicial={escolher(VISOES, visao, "proximas")}
      whatsAutomatico={evolutionConfigurada && Boolean(whats?.ativo)}
    />
  );
}
