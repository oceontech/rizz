import { precoNumero } from "@/lib/format";

/**
 * Preço com leitura de cardápio: "R$" miúdo e o valor em Jost médio, com
 * algarismos alinhados e de largura fixa. A Cormorant ficava fina demais em
 * tamanho pequeno, e os algarismos de estilo antigo dela sobem e descem.
 *
 * O tamanho vem de fora (`className`); o "R$" acompanha em proporção, mas
 * para em 18px — nos preços grandes ele pesava ao lado do valor.
 */
export default function Preco({
  valor,
  className = "",
}: {
  valor: number | null;
  className?: string;
}) {
  const numero = precoNumero(valor);

  if (numero === null) {
    return (
      <span className={`font-sans text-[0.8em] italic opacity-60 ${className}`}>
        sob consulta
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-baseline gap-[0.25em] whitespace-nowrap font-sans font-medium tabular-nums lining-nums tracking-[0.01em] ${className}`}
    >
      <span className="text-[min(0.62em,1.125rem)] font-normal tracking-[0.06em] opacity-60">
        R$
      </span>
      {numero}
    </span>
  );
}
