import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variante = "ambar" | "contorno" | "creme" | "vinho" | "contorno-tinta";
type Tamanho = "md" | "lg";

/**
 * ⚠️ `inline-flex` está cravado aqui, então **`hidden` via `className` não
 * esconde nada**: as duas disputam a propriedade `display` com a mesma
 * especificidade, e o Tailwind emite `.inline-flex` depois de `.hidden`.
 * Para esconder um botão por largura, não passe `hidden` — envolva-o num
 * elemento que carregue a classe, ou não o renderize.
 */
const base =
  "group/btn relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-sans text-sm font-medium tracking-[0.08em] uppercase transition-colors duration-500 ease-[var(--ease-rizz)] active:scale-[0.98] whitespace-nowrap";

const variantes: Record<Variante, string> = {
  ambar: "bg-ambar text-noite hover:bg-ouro-claro",
  contorno:
    "border border-creme/30 text-creme hover:border-ambar hover:text-ambar",
  "contorno-tinta":
    "border border-tinta/25 text-tinta hover:border-vinho hover:text-vinho",
  creme: "bg-creme text-tinta hover:bg-white",
  vinho: "bg-vinho text-creme hover:bg-vinho-fundo",
};

const tamanhos: Record<Tamanho, string> = {
  md: "h-11 px-6 text-[0.6875rem]",
  lg: "h-14 px-8 text-xs",
};

type Props = {
  children: ReactNode;
  variante?: Variante;
  tamanho?: Tamanho;
  className?: string;
};

export function Botao({
  children,
  variante = "ambar",
  tamanho = "md",
  className = "",
  ...props
}: Props & ComponentProps<"button">) {
  return (
    <button
      className={`${base} ${variantes[variante]} ${tamanhos[tamanho]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function BotaoLink({
  children,
  variante = "ambar",
  tamanho = "md",
  className = "",
  href,
  ...props
}: Props & ComponentProps<typeof Link>) {
  const classes = `${base} ${variantes[variante]} ${tamanhos[tamanho]} ${className}`;
  const externo =
    typeof href === "string" && /^(https?:|mailto:|tel:)/.test(href);

  if (externo) {
    return (
      <a
        href={href}
        className={classes}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...props}>
      {children}
    </Link>
  );
}
