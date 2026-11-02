/** Cinco estrelas, preenchidas até a nota arredondada. Decorativas: a nota vai em texto ao lado. */
export function Estrelas({
  nota,
  className = "",
}: {
  nota: number;
  className?: string;
}) {
  return (
    <span className={`inline-flex gap-1 ${className}`} aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className={`size-3.5 ${i <= Math.round(nota) ? "text-ouro" : "text-creme/15"}`}
          fill="currentColor"
        >
          <path d="m12 3.5 2.6 5.5 5.9.8-4.3 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.5 9.8l5.9-.8z" />
        </svg>
      ))}
    </span>
  );
}
