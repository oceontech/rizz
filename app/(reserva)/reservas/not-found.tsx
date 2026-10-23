import Link from "next/link";
import { SearchX } from "lucide-react";

/** Link pessoal inválido ou reserva apagada. */
export default function ReservaNaoEncontrada() {
  return (
    <main className="mx-auto flex max-w-md flex-col items-center px-6 pt-20 pb-24 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-superficie">
        <SearchX className="size-7 text-muted-foreground" strokeWidth={1.75} />
      </span>
      <h1 className="mt-6 text-[1.75rem] leading-tight font-semibold tracking-[-0.02em]">Reserva não encontrada</h1>
      <p className="mt-3 text-[17px] leading-relaxed text-muted-foreground">
        O link pode estar incompleto. Confira a mensagem que você recebeu ou faça uma nova reserva.
      </p>
      <Link
        href="/reservas"
        className="mt-8 flex h-[52px] items-center justify-center rounded-full bg-primary px-8 text-[17px] font-semibold text-white transition-colors hover:bg-primary-hover"
      >
        Fazer uma reserva
      </Link>
    </main>
  );
}
