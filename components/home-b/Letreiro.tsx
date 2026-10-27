/**
 * Título em três camadas, como o cartaz de referência: cursiva por cima,
 * encostando na serifada alta em caixa alta, e uma linha pequena espaçada
 * embaixo. Usado nas seções escuras da versão B, sobre vídeo.
 */
export default function Letreiro({
  cursiva,
  titulo,
  linha,
  id,
  className = "",
}: {
  cursiva: string;
  titulo: string;
  linha?: string;
  id?: string;
  className?: string;
}) {
  return (
    <h2 id={id} className={`flex flex-col items-center text-center not-italic ${className}`}>
      <span className="relative z-10 -mb-[0.1em] font-[family-name:var(--font-pinyon)] text-[clamp(2.9rem,11vw,6rem)] leading-none text-creme">
        {cursiva}
      </span>
      <span className="font-[family-name:var(--font-instrument)] text-[clamp(4.5rem,21vw,11rem)] leading-[0.95] tracking-[0.01em] text-creme uppercase [text-shadow:0_6px_40px_rgb(0_0_0/0.45)]">
        {titulo}
      </span>
      {linha && <span className="mt-4 font-sans text-[0.7rem] font-medium tracking-[0.42em] text-creme/80 uppercase md:text-xs">{linha}</span>}
    </h2>
  );
}
