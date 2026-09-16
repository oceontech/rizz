import { BADGES, type Badge } from "@/data/menu";

/**
 * Os três símbolos do cardápio, redesenhados como na peça impressa:
 * disco verde com folha, disco dourado com "R", disco preto da trufa.
 */
export function SeloBadge({ badge }: { badge: Badge }) {
  const info = BADGES[badge];

  const estilo: Record<Badge, string> = {
    vegetariano: "bg-verde text-creme",
    rizz: "bg-ouro text-white",
    tartufato: "bg-tinta text-creme",
  };

  return (
    <span
      className={`inline-flex size-[1.0625rem] shrink-0 items-center justify-center rounded-full text-[0.5rem] font-semibold not-italic leading-none ${estilo[badge]}`}
      title={info.descricao}
    >
      {badge === "vegetariano" ? (
        <svg viewBox="0 0 24 24" className="size-2.5" fill="currentColor" aria-hidden>
          <path d="M20 4c-9 0-15 4-15 11 0 2 .6 3.6 1.6 4.8L4 22l1.4 1.4 2.3-2.3C9 22 10.4 22.4 12 22.4 19 22.4 20 12 20 4m-2.4 2.6c-.3 6-1.8 13.4-5.8 13.4-.9 0-1.7-.2-2.4-.6C12.6 15.8 15 12.6 18 10.4c-3.6 1.5-6.6 4.3-9.6 8.2-.5-.7-.8-1.7-.8-2.9 0-5.2 4.5-8.6 11-9.1" />
        </svg>
      ) : (
        <span aria-hidden>{info.sigla}</span>
      )}
      <span className="sr-only">{info.descricao}</span>
    </span>
  );
}

const tons = {
  claro: {
    base: "border-tinta/15 text-tinta/75",
    interativo: "hover:border-vinho/45 hover:text-vinho",
    ativo: "border-vinho bg-vinho/[0.07] text-vinho",
  },
  escuro: {
    base: "border-creme/20 text-creme/75",
    interativo: "hover:border-ambar/60 hover:text-ambar",
    ativo: "border-ambar text-ambar",
  },
} as const;

/**
 * Etiqueta legível: o disco da peça impressa + o nome por extenso. O disco
 * sozinho ("T", "R") não dizia nada a quem não conhece a legenda.
 *
 * Com `onAlternar` vira botão de filtro — tocar na etiqueta de um prato
 * mostra só os pratos com ela.
 */
export function EtiquetaBadge({
  badge,
  tom = "claro",
  ativo = false,
  onAlternar,
}: {
  badge: Badge;
  tom?: keyof typeof tons;
  ativo?: boolean;
  onAlternar?: (b: Badge) => void;
}) {
  const info = BADGES[badge];
  const t = tons[tom];
  const classe = `inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full border pl-[3px] pr-2.5 font-sans text-[0.6875rem] font-normal not-italic leading-none tracking-[0.03em] transition-colors duration-300 ${
    ativo ? t.ativo : t.base
  }`;

  if (!onAlternar) {
    return (
      <span className={classe} title={info.descricao}>
        <SeloBadge badge={badge} />
        {info.rotulo}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onAlternar(badge)}
      aria-pressed={ativo}
      title={ativo ? `Mostrar todos os pratos` : `Ver só pratos: ${info.rotulo}`}
      className={`${classe} ${t.interativo} cursor-pointer`}
    >
      <SeloBadge badge={badge} />
      {info.rotulo}
    </button>
  );
}

export function ListaSelos({
  badges,
  tom = "claro",
  ativos = [],
  onAlternar,
  className = "",
}: {
  badges?: Badge[];
  tom?: keyof typeof tons;
  ativos?: Badge[];
  onAlternar?: (b: Badge) => void;
  className?: string;
}) {
  if (!badges?.length) return null;

  return (
    <span className={`inline-flex flex-wrap items-center gap-1.5 ${className}`}>
      {badges.map((b) => (
        <EtiquetaBadge
          key={b}
          badge={b}
          tom={tom}
          ativo={ativos.includes(b)}
          onAlternar={onAlternar}
        />
      ))}
    </span>
  );
}

/** Carimbo de carne certificada, como na peça. */
export function SeloOrigem({
  tipo = "vpj",
  className = "",
}: {
  tipo?: "vpj" | "duroc";
  className?: string;
}) {
  const rotulo = tipo === "vpj" ? "VPJ" : "DUROC";
  const titulo =
    tipo === "vpj"
      ? "Selo VPJ — carne de origem certificada"
      : "Duroc Pork — suíno de origem certificada";

  return (
    <span
      title={titulo}
      className={`inline-flex h-6 shrink-0 items-center rounded-full border border-vinho/45 px-2.5 font-sans text-[0.625rem] font-semibold not-italic leading-none tracking-[0.12em] text-vinho/85 ${className}`}
    >
      <span aria-hidden>{rotulo}</span>
      <span className="sr-only">{titulo}</span>
    </span>
  );
}

/** Legenda dos símbolos, no pé do cardápio — igual à peça impressa. */
export function Legenda({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-x-8 gap-y-3 text-sm italic ${className}`}>
      {(Object.keys(BADGES) as Badge[]).map((b) => (
        <li key={b} className="flex items-center gap-2.5">
          <SeloBadge badge={b} />
          <span>{BADGES[b].descricao}</span>
        </li>
      ))}
      <li className="flex items-center gap-2.5">
        <SeloOrigem />
        <span>Carne de origem certificada</span>
      </li>
    </ul>
  );
}
