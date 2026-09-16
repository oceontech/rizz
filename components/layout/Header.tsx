"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";

import { CONDICOES, gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import Logo from "@/components/brand/Logo";
import { BotaoLink } from "@/components/ui/Botao";
import { site, whatsappLink } from "@/lib/site";

const links = [
  { href: "/cardapio", rotulo: "Cardápio" },
  { href: "/avaliacoes", rotulo: "Avaliações" },
  { href: "/reservas", rotulo: "Reservas" },
];

/**
 * Header que some ao descer e troca de tom ao sair do hero.
 * Usa ScrollTrigger só para LER a posição — quem rola continua sendo o Lenis.
 *
 * O fundo transparente existe **só** para a home, onde há o vídeo do hero por
 * baixo. Nas demais páginas ele é sempre sólido: o cardápio tem fundo creme, e
 * um header transparente ali deixava o logo branco invisível sobre o papel.
 *
 * Ao se recolher, ele marca `data-header="oculto"` na raiz do documento. A
 * variável `--altura-header` zera junto, e barras grudadas logo abaixo — as
 * abas do cardápio — sobem para o topo em vez de ficar um vão.
 */
export default function Header() {
  const raiz = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const naHome = pathname === "/";

  useGSAP(
    () => {
      const no = raiz.current;
      if (!no) return;

      const marcar = (oculto: boolean) => {
        document.documentElement.dataset.header = oculto
          ? "oculto"
          : "visivel";
      };

      const mm = gsap.matchMedia();

      mm.add(CONDICOES, (contexto) => {
        const parado = contexto.conditions?.parado;

        // Só a home tem hero de vídeo por baixo para justificar transparência.
        const trocaTom = naHome
          ? ScrollTrigger.create({
              start: "top -80%",
              end: "max",
              onToggle: (self) => {
                no.dataset.solido = self.isActive ? "1" : "0";
              },
            })
          : null;

        if (!naHome) no.dataset.solido = "1";

        if (parado) {
          marcar(false);
          return () => trocaTom?.kill();
        }

        let oculto = false;

        const esconde = ScrollTrigger.create({
          start: "top -200",
          end: "max",
          onUpdate: (self) => {
            const deveOcultar = self.direction === 1 && self.scroll() > 320;
            if (deveOcultar === oculto) return;

            oculto = deveOcultar;
            marcar(oculto);

            gsap.to(no, {
              yPercent: oculto ? -120 : 0,
              duration: 0.5,
              ease: "power3.out",
              overwrite: true,
            });
          },
        });

        return () => {
          trocaTom?.kill();
          esconde.kill();
          delete document.documentElement.dataset.header;
        };
      });

      return () => mm.revert();
    },
    { scope: raiz, dependencies: [naHome] },
  );

  return (
    <header
      ref={raiz}
      data-solido={naHome ? "0" : "1"}
      className="group/header pt-safe fixed inset-x-0 top-0 z-50 transition-colors duration-700 data-[solido=1]:bg-noite/90 data-[solido=1]:backdrop-blur-xl"
    >
      <div className="wrap flex h-16 items-center justify-between gap-4 md:h-24">
        <Link
          href="/"
          aria-label={`${site.nome} — página inicial`}
          className="shrink-0 transition-opacity duration-300 hover:opacity-80"
        >
          <Logo
            variante="branca"
            decorativo
            sizes="140px"
            className="h-auto w-[4.75rem] md:w-[6.5rem]"
          />
        </Link>

        <nav
          aria-label="Navegação principal"
          className="hidden items-center gap-10 md:flex"
        >
          {links.map((l) => {
            const ativo = pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={ativo ? "page" : undefined}
                className={`relative text-[0.6875rem] uppercase tracking-[0.2em] transition-colors duration-300 after:absolute after:-bottom-2 after:left-0 after:h-px after:bg-ambar after:transition-[width] after:duration-500 ${
                  ativo
                    ? "text-ambar after:w-full"
                    : "text-creme/75 after:w-0 hover:text-creme hover:after:w-full"
                }`}
              >
                {l.rotulo}
              </Link>
            );
          })}
        </nav>

        <BotaoLink
          href={whatsappLink(
            `Olá! Gostaria de reservar uma mesa no ${site.nome}.`,
          )}
          variante="contorno"
          className="hidden md:inline-flex"
        >
          Reservar
        </BotaoLink>
      </div>

      <div className="h-px bg-ouro/0 transition-colors duration-700 group-data-[solido=1]/header:bg-ouro/25" />
    </header>
  );
}
