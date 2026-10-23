// Aparência dos seletores (Seletor e Combobox).
// - "campo": dentro de formulário, igual aos outros campos (borda, raio de campo).
// - "pilula": controle solto dentro de um card (filtro, troca de visão): pílula sem borda, em cinza, com a seta azul.
// - "pilula-clara": o mesmo controle sobre o fundo da página, onde o cinza sumiria: pílula branca com sombra leve.
export type VarianteSeletor = "campo" | "pilula" | "pilula-clara";

const PILULA =
  "h-10 rounded-full border-0 pr-3 pl-4 text-sm font-medium shadow-none transition-[background-color,box-shadow] duration-150 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 aria-expanded:ring-2 aria-expanded:ring-primary/40 data-[state=open]:ring-2 data-[state=open]:ring-primary/40 md:h-9";

/** Classes da pílula; vazio para a variante de campo (que usa o estilo padrão do componente) */
export const CLASSE_VARIANTE: Record<VarianteSeletor, string> = {
  campo: "",
  // O hover escurece um pouco a própria cor (no tema claro, `accent` é igual a `muted` e não daria diferença)
  pilula: `${PILULA} bg-muted hover:bg-[color-mix(in_oklab,var(--muted),var(--foreground)_9%)] dark:bg-muted dark:hover:bg-[color-mix(in_oklab,var(--muted),var(--foreground)_9%)]`,
  "pilula-clara": `${PILULA} bg-card shadow-suave hover:bg-accent dark:bg-card dark:hover:bg-accent`,
};
