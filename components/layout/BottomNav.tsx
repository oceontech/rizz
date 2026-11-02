"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const abas = [
  {
    href: "/",
    rotulo: "Início",
    icone: <path d="M3 10.5 12 3l9 7.5M5.5 9.5V20h13V9.5" />,
  },
  {
    href: "/cardapio",
    rotulo: "Cardápio",
    icone: (
      <>
        <path d="M7 3v8a2.5 2.5 0 0 0 5 0V3M9.5 11v10" />
        <path d="M17.5 3c-1.4 1.6-2 3.4-2 5.5 0 1.6.7 2.6 2 3V21" />
      </>
    ),
  },
  {
    // Taça: bojo, haste e base. A carta de vinhos não tinha acesso no
    // celular (o menu do header só aparece a partir de 768px).
    href: "/carta-de-vinhos",
    rotulo: "Vinhos",
    icone: <path d="M7.5 3h9c.4 3.2.2 5.8-1.2 7.4A4.3 4.3 0 0 1 12 12a4.3 4.3 0 0 1-3.3-1.6C7.3 8.8 7.1 6.2 7.5 3ZM7.6 6.5h8.8M12 12v8.5M8.5 21h7" />,
  },
  {
    href: "/avaliacoes",
    rotulo: "Avaliações",
    icone: (
      <path d="m12 3.5 2.6 5.5 5.9.8-4.3 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.5 9.8l5.9-.8z" />
    ),
  },
];

/**
 * Navegação fixa inferior — a principal em mobile.
 * Some a partir de 860px, onde o header assume a navegação.
 */
export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      // Nome distinto do header: dois landmarks com o mesmo rótulo fazem o
      // leitor de tela anunciar "Navegação principal" duas vezes na página.
      aria-label="Navegação rápida"
      data-bottom-nav
      className="pb-safe fixed inset-x-0 bottom-0 z-50 border-t border-creme/12 bg-noite/94 backdrop-blur-xl md:hidden"
    >
      <ul className="grid h-[var(--spacing-nav)] grid-cols-4">
        {abas.map((aba) => {
          const ativo =
            aba.href === "/" ? pathname === "/" : pathname.startsWith(aba.href);

          return (
            <li key={aba.href}>
              <Link
                href={aba.href}
                aria-current={ativo ? "page" : undefined}
                className={`flex h-full flex-col items-center justify-center gap-1.5 transition-colors duration-300 ${
                  ativo ? "text-ambar" : "text-creme/55"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-[1.3125rem]"
                  aria-hidden
                >
                  {aba.icone}
                </svg>
                <span className="text-[0.625rem] uppercase tracking-[0.14em]">
                  {aba.rotulo}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
