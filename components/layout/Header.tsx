"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";

import { CONDICOES, gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import Logo from "@/components/brand/Logo";
import { BotaoLink } from "@/components/ui/Botao";
import { site, whatsappLink } from "@/lib/site";

const links = [
  { href: "/cardapio", rotulo: "Cardápio" },
  { href: "/avaliacoes", rotulo: "Avaliações" },
  { href: "/reservas", rotulo: "Reservas" },
];

type Modo = "transparente" | "solido" | "vidro";

const fundoPorModo: Record<Modo, string> = {
  transparente: "bg-transparent",
  solido: "bg-noite/90 backdrop-blur-xl",
  vidro: "vidro",
};

/**
 * Header que some ao descer. Três visuais:
 *
 * - **vidro** — só no cardápio: vidro transparente, logo vinho e botão só
 *   com borda e texto vinho;
 * - **transparente** — na home, enquanto o hero está por baixo;
 * - **solido** — vinho, na home depois do hero e nas demais páginas.
 *
 * Usa ScrollTrigger só para LER a posição — quem rola continua sendo o Lenis.
 *
 * O modo tem UM dono: o render do React. Antes, um `data-solido` era escrito
 * pelo React e também, direto no DOM, pelo ScrollTrigger; na troca de rota
 * os dois dessincronizavam e o cardápio ora abria com fundo, ora sem. Agora
 * o ScrollTrigger só informa "passou do hero" num estado — carimbado com a
 * rota em que foi medido, para não valer em outra página.
 *
 * Ao se recolher, ele marca `data-header="oculto"` na raiz do documento. A
 * variável `--altura-header` zera junto, e barras grudadas logo abaixo — as
 * abas do cardápio — sobem para o topo em vez de ficar um vão.
 */
export default function Header() {
  const raiz = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const naHome = pathname === "/";
  const noCardapio = pathname.startsWith("/cardapio");

  const [passouHero, setPassouHero] = useState({ rota: "", valor: false });
  const alemDoHero = passouHero.rota === pathname && passouHero.valor;

  const modo: Modo = noCardapio
    ? "vidro"
    : naHome && !alemDoHero
      ? "transparente"
      : "solido";
  const claro = modo === "vidro";

  // Só a home tem hero de vídeo por baixo para justificar transparência.
  useGSAP(() => {
    if (!naHome) return;
    const gatilho = ScrollTrigger.create({
      start: "top -80%",
      end: "max",
      onToggle: (self) => setPassouHero({ rota: "/", valor: self.isActive }),
    });
    return () => gatilho.kill();
  }, { dependencies: [naHome], revertOnUpdate: true });

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
        if (contexto.conditions?.parado) {
          marcar(false);
          return;
        }

        let oculto = false;
        let ultimo = window.scrollY;
        let acumulado = 0;

        /**
         * Direção pela diferença real de posição, acumulada: só esconde depois
         * de ~48px descendo e só volta depois de ~32px subindo. Reagir a cada
         * 6px fazia o header ir e voltar com qualquer tremida do dedo ou da
         * roda. Perto do topo ele sempre aparece.
         */
        const esconde = ScrollTrigger.create({
          start: 0,
          end: "max",
          onUpdate: (self) => {
            const y = self.scroll();
            const delta = y - ultimo;
            ultimo = y;
            if (!delta) return;

            // Mudou de sentido: recomeça a contar.
            if (Math.sign(delta) !== Math.sign(acumulado)) acumulado = 0;
            acumulado += delta;

            let deveOcultar = oculto;
            if (y < 90) deveOcultar = false;
            else if (acumulado > 48) deveOcultar = true;
            else if (acumulado < -32) deveOcultar = false;
            if (deveOcultar === oculto) return;

            oculto = deveOcultar;
            // O movimento em si é CSS (`.header-fixo`), com a mesma duração e
            // curva das abas do cardápio, que sobem junto pela mesma marca.
            marcar(oculto);
          },
        });

        return () => {
          esconde.kill();
          delete document.documentElement.dataset.header;
        };
      });

      return () => mm.revert();
    },
    { scope: raiz },
  );

  return (
    <header
      ref={raiz}
      data-modo={modo}
      className={`header-fixo pt-safe fixed inset-x-0 z-50 ${fundoPorModo[modo]}`}
    >
      <div className="wrap flex h-16 items-center justify-between gap-4 md:h-24">
        <Link
          href="/"
          aria-label={`${site.nome} — página inicial`}
          className="shrink-0 transition-opacity duration-300 hover:opacity-80"
        >
          <Logo
            variante={claro ? "vinho" : "branca"}
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
                className={`relative text-[0.6875rem] uppercase tracking-[0.2em] transition-colors duration-300 after:absolute after:-bottom-2 after:left-0 after:h-px after:transition-[width] after:duration-500 ${
                  claro
                    ? ativo
                      ? "font-medium text-vinho after:w-full after:bg-vinho"
                      : "text-tinta/70 after:w-0 after:bg-vinho hover:text-vinho hover:after:w-full"
                    : ativo
                      ? "text-ambar after:w-full after:bg-ambar"
                      : "text-creme/75 after:w-0 after:bg-ambar hover:text-creme hover:after:w-full"
                }`}
              >
                {l.rotulo}
              </Link>
            );
          })}
        </nav>

        {/*
          Visível em toda largura, de propósito: reservar é a conversão da
          marca e no celular este é o único acesso no topo (o flutuante só
          entra depois da primeira dobra).

          Aqui havia `className="hidden md:inline-flex"`, que nunca funcionou:
          o `base` do Botao.tsx já traz `inline-flex`, e o Tailwind emite
          `.inline-flex` DEPOIS de `.hidden`, então o `hidden` perdia a
          disputa pela mesma propriedade. A classe foi removida em vez de
          "consertada" porque o que ela pedia contraria o comportamento
          desejado — o botão deve mesmo aparecer no celular.
        */}
        <BotaoLink
          href={whatsappLink(
            `Olá! Gostaria de reservar uma mesa no ${site.nome}.`,
          )}
          variante={claro ? "contorno-vinho" : "contorno"}
        >
          Reservar
        </BotaoLink>
      </div>

      {/* Absoluta: a altura do header tem que ser exatamente a de
          `--altura-header`. Em fluxo, este 1px a mais cobria a borda de cima
          das abas do cardápio. */}
      {claro ? (
        // Divisa do cardápio: fio dourado que some nas pontas, com um
        // losango no centro — o ornamento das peças impressas da casa.
        <div aria-hidden className="divisa-ornada" />
      ) : (
        <div
          aria-hidden
          className={`absolute inset-x-0 bottom-0 h-px transition-colors duration-700 ${modo === "solido" ? "bg-ouro/25" : "bg-transparent"}`}
        />
      )}
    </header>
  );
}
