import type { Metadata } from "next";

import ReservaOnline from "@/components/reservas/ReservaOnline";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Reservas",
  description: `Reserve sua mesa no ${site.nome} em poucos toques: escolha o dia, o horário e receba a confirmação na hora.`,
  alternates: { canonical: "/reservas" },
};

export default function ReservasPage() {
  return (
    <main>
      <ReservaOnline />
    </main>
  );
}
