"use client";

import Link from "next/link";
import { useRef } from "react";

import { CONDICOES, gsap, useGSAP } from "@/lib/gsap";
import Logo from "@/components/brand/Logo";
import { enderecoLinha, site } from "@/lib/site";

const redes = [
  {
    nome: "Instagram",
    href: site.redes.instagram,
    icone: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="3.6" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    nome: "Facebook",
    href: site.redes.facebook,
    icone: (
      <path d="M14.5 8.5h2.2V5.6h-2.6c-2.2 0-3.6 1.4-3.6 3.7v1.9H8.2v2.9h2.3V21h3v-6.9h2.3l.4-2.9h-2.7V9.7c0-.8.4-1.2 1-1.2z" />
    ),
  },
];

/**
 * Rodapé sóbrio. A assinatura fecha a página centralizada e em escala
 * discreta — antes ela sangrava na largura toda e dominava tudo.
 */
export default function Footer() {
  const raiz = useRef<HTMLElement>(null);
  const ano = new Date().getFullYear();

  useGSAP(
    () => {
      const no = raiz.current;
      const marca = no?.querySelector("[data-marca-rodape]");
      if (!no || !marca) return;

      const mm = gsap.matchMedia();

      mm.add(CONDICOES, (contexto) => {
        if (contexto.conditions?.parado) {
          gsap.set(marca, { opacity: 1, y: 0 });
          return;
        }

        gsap.fromTo(
          marca,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: no,
              start: "top 90%",
              end: "bottom bottom",
              scrub: 0.8,
            },
          },
        );
      });

      return () => mm.revert();
    },
    { scope: raiz },
  );

  return (
    <footer ref={raiz} className="border-t border-creme/10 bg-noite-2">
      <div className="wrap pt-16 md:pt-24">
        <div className="grid gap-12 md:grid-cols-[1.1fr_1fr_1fr]">
          <div>
            <p className="max-w-xs font-display text-xl italic leading-snug text-creme/85">
              Criações e releituras da cozinha italiana.
            </p>
            <p className="mt-6 flex items-start gap-3 text-xs leading-relaxed text-creme/50">
              <span className="mt-px inline-flex h-4 shrink-0 items-center rounded-full border border-ouro/50 px-1.5 text-[0.5rem] font-semibold tracking-[0.12em] text-ouro">
                VPJ
              </span>
              {site.selo.descricao}
            </p>

            <ul className="mt-8 flex items-center gap-3">
              {redes.map((r) => (
                <li key={r.nome}>
                  <a
                    href={r.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${site.nome} no ${r.nome}`}
                    className="flex size-10 items-center justify-center rounded-full border border-creme/20 text-creme/70 transition-colors duration-300 hover:border-ambar hover:text-ambar"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-[1.125rem]"
                      aria-hidden
                    >
                      {r.icone}
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label="Rodapé">
            <h2 className="eyebrow text-ambar">Navegue</h2>
            <ul className="mt-5 space-y-3 text-sm text-creme/70">
              {[
                ["/", "Home"],
                ["/cardapio", "Cardápio"],
                ["/avaliacoes", "Avaliações"],
                ["/reservas", "Reservas"],
                ["/carta-de-vinhos", "Carta de vinhos"],
              ].map(([href, rotulo]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="transition-colors hover:text-ambar"
                  >
                    {rotulo}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="eyebrow text-ambar">Contato</h2>
            <ul className="mt-5 space-y-3 text-sm text-creme/70">
              <li>
                <a
                  href={site.mapaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-ambar"
                >
                  {enderecoLinha}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${site.telefoneLink}`}
                  className="transition-colors hover:text-ambar"
                >
                  {site.telefone}
                </a>
              </li>
              <li>
                <a
                  href={site.redes.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-ambar"
                >
                  @rizzcucinaevino
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Assinatura de fechamento, em escala de rodapé. */}
        <div className="mt-16 flex justify-center">
          <Logo
            data-marca-rodape
            variante="branca"
            decorativo
            sizes="240px"
            className="h-auto w-[min(44vw,11rem)] opacity-70"
          />
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-creme/10 pt-6 text-[0.6875rem] uppercase tracking-[0.14em] text-creme/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {ano} {site.nome}
          </p>
          <Link
            href="/privacidade"
            className="transition-colors hover:text-creme/70"
          >
            Privacidade e cookies
          </Link>
        </div>
      </div>
    </footer>
  );
}
