import type { Metadata } from "next";
import { notFound } from "next/navigation";

import GerenciarReserva from "@/components/reservas/GerenciarReserva";
import { rotuloOcasiao } from "@/lib/reservas/regras";
import { podeMexer, reservaPorCodigo } from "@/lib/reservas/servidor";

export const metadata: Metadata = {
  title: "Sua reserva",
  robots: { index: false, follow: false },
};

/** Link pessoal da reserva: confirmação logo depois de reservar e, depois, onde o cliente altera ou cancela. */
export default async function MinhaReservaPage({ params, searchParams }: PageProps<"/reservas/[codigo]">) {
  const [{ codigo }, { nova }] = await Promise.all([params, searchParams]);
  const r = await reservaPorCodigo(codigo);
  if (!r) notFound();

  return (
    <main>
      <GerenciarReserva
        reserva={{
          codigo: r.codigo,
          status: r.status,
          nome: r.nome,
          pessoas: r.pessoas,
          data: r.data,
          hora: r.hora,
          ocasiao: r.ocasiao,
          obs: r.obs,
        }}
        editavel={podeMexer(r)}
        nova={nova === "1"}
        ocasiao={rotuloOcasiao(r.ocasiao)}
      />
    </main>
  );
}
