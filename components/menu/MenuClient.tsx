"use client";

import { useMemo, useRef, useState } from "react";

import { CONDICOES, gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { ListaSelos, SeloOrigem } from "@/components/ui/Selos";
import { BADGES, cardapio, type Badge, type MenuItem } from "@/data/menu";
import { preco } from "@/lib/format";
import { scrollToTarget } from "@/lib/scroll";

type FaixaPreco = "todas" | "ate60" | "de60a90" | "acima90";

const faixas: {
  id: FaixaPreco;
  rotulo: string;
  testa: (v: number) => boolean;
}[] = [
  { id: "ate60", rotulo: "até 60", testa: (v) => v <= 60 },
  { id: "de60a90", rotulo: "60 – 90", testa: (v) => v > 60 && v <= 90 },
  { id: "acima90", rotulo: "acima de 90", testa: (v) => v > 90 },
];

/** Linha do cardápio, no desenho da peça impressa: preço sem "R$". */
function Linha({ item }: { item: MenuItem }) {
  return (
    <li
      data-linha
      className="flex items-baseline gap-3 border-b border-tinta/10 py-4 last:border-0"
    >
      <div className="min-w-0 grow">
        <h3 className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[1.0625rem] leading-snug text-vinho">
          {item.nome}
          <ListaSelos badges={item.badges} />
          {item.vpj && <SeloOrigem />}
        </h3>
        {item.descricao && (
          <p className="mt-1 text-sm italic leading-snug text-tinta/55">
            {item.descricao}
          </p>
        )}
      </div>

      <span
        aria-hidden
        className="mb-1.5 hidden h-px grow border-b border-dotted border-tinta/20 sm:block"
      />

      <p className="shrink-0 whitespace-nowrap font-display text-lg text-vinho">
        {item.preco === null ? (
          <span className="text-sm italic text-tinta/45">sob consulta</span>
        ) : (
          preco(item.preco)
        )}
      </p>
    </li>
  );
}

export default function MenuClient() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [faixa, setFaixa] = useState<FaixaPreco>("todas");
  const [busca, setBusca] = useState("");
  const [ativa, setAtiva] = useState(cardapio[0].slug);
  const raiz = useRef<HTMLDivElement>(null);

  function alternarBadge(b: Badge) {
    setBadges((atual) =>
      atual.includes(b) ? atual.filter((x) => x !== b) : [...atual, b],
    );
  }

  const filtrado = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const regra = faixas.find((f) => f.id === faixa);

    return cardapio
      .map((cat) => ({
        ...cat,
        itens: cat.itens.filter((item) => {
          if (badges.length && !badges.every((b) => item.badges?.includes(b)))
            return false;
          if (regra && (item.preco === null || !regra.testa(item.preco)))
            return false;
          if (
            termo &&
            !`${item.nome} ${item.descricao ?? ""}`.toLowerCase().includes(termo)
          )
            return false;
          return true;
        }),
      }))
      .filter((cat) => cat.itens.length > 0);
  }, [badges, faixa, busca]);

  const total = filtrado.reduce((soma, c) => soma + c.itens.length, 0);
  const filtrando =
    badges.length > 0 || faixa !== "todas" || busca.trim() !== "";

  // Scroll-spy: a aba acompanha a categoria em cena.
  useGSAP(
    () => {
      const no = raiz.current;
      if (!no) return;

      const mm = gsap.matchMedia();

      mm.add(CONDICOES, () => {
        const gatilhos = filtrado.map((cat) =>
          ScrollTrigger.create({
            trigger: `#${cat.slug}`,
            start: "top 30%",
            end: "bottom 30%",
            onToggle: (self) => {
              if (self.isActive) setAtiva(cat.slug);
            },
          }),
        );

        // As linhas entram em cascata quando a categoria aparece.
        const lote = ScrollTrigger.batch("[data-linha]", {
          start: "top 94%",
          once: true,
          onEnter: (linhas) =>
            gsap.fromTo(
              linhas,
              { opacity: 0, y: 18, x: 0 },
              {
                opacity: 1,
                y: 0,
                x: 0,
                duration: 0.65,
                stagger: 0.035,
                ease: "power2.out",
                overwrite: true,
              },
            ),
        });

        return () => {
          gatilhos.forEach((g) => g.kill());
          lote.forEach((b) => b.kill());
        };
      });

      return () => mm.revert();
    },
    { scope: raiz, dependencies: [filtrado.length, busca, faixa, badges.length] },
  );

  return (
    <div ref={raiz}>
      {/* Abas grudadas abaixo do header, com indicador que segue a cena. */}
      {/* O `top` acompanha a altura que o header está realmente ocupando:
          quando ele se recolhe a variável vai a zero e as abas sobem junto,
          em vez de deixar um vão do tamanho do header. */}
      <div className="sticky top-[var(--altura-header)] z-30 -mx-[1.375rem] border-y border-tinta/12 bg-creme/95 backdrop-blur-md transition-[top] duration-500 ease-[var(--ease-rizz)] md:-mx-12">
        <div className="no-scrollbar flex gap-1 overflow-x-auto px-[1.375rem] py-3 md:px-12">
          {cardapio.map((cat) => {
            const atual = ativa === cat.slug;
            return (
              <a
                key={cat.id}
                href={`#${cat.slug}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToTarget(`#${cat.slug}`, 56);
                  window.history.replaceState(null, "", `#${cat.slug}`);
                }}
                aria-current={atual ? "true" : undefined}
                className={`shrink-0 rounded-full px-4 py-2 text-[0.6875rem] uppercase tracking-[0.14em] transition-colors duration-300 ${
                  atual
                    ? "bg-vinho text-creme"
                    : "text-tinta/60 hover:bg-tinta/6 hover:text-vinho"
                }`}
              >
                {cat.nome}
              </a>
            );
          })}
        </div>
      </div>

      {/* Filtros */}
      <div className="mt-10 flex flex-col gap-5">
        <label className="relative block max-w-xl">
          <span className="sr-only">Buscar no cardápio</span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="pointer-events-none absolute left-0 top-1/2 size-4 -translate-y-1/2 text-tinta/40"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar prato ou ingrediente"
            className="h-12 w-full border-b border-tinta/20 bg-transparent pl-7 text-[0.9375rem] text-vinho placeholder:text-tinta/35 focus:border-vinho focus:outline-none"
          />
        </label>

        <div className="flex flex-wrap items-center gap-2">
          {(Object.keys(BADGES) as Badge[]).map((b) => {
            const on = badges.includes(b);
            return (
              <button
                key={b}
                type="button"
                onClick={() => alternarBadge(b)}
                aria-pressed={on}
                className={`h-9 rounded-full border px-4 text-[0.6875rem] uppercase tracking-[0.12em] transition-colors duration-300 ${
                  on
                    ? "border-vinho bg-vinho text-creme"
                    : "border-tinta/20 text-tinta/65 hover:border-vinho/50 hover:text-vinho"
                }`}
              >
                {BADGES[b].rotulo}
              </button>
            );
          })}

          <span className="mx-1 hidden h-5 w-px bg-tinta/15 sm:block" />

          {faixas.map((f) => {
            const on = faixa === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFaixa(on ? "todas" : f.id)}
                aria-pressed={on}
                className={`h-9 rounded-full border px-4 text-[0.6875rem] uppercase tracking-[0.12em] transition-colors duration-300 ${
                  on
                    ? "border-vinho bg-vinho text-creme"
                    : "border-tinta/20 text-tinta/65 hover:border-vinho/50 hover:text-vinho"
                }`}
              >
                {f.rotulo}
              </button>
            );
          })}

          {filtrando && (
            <button
              type="button"
              onClick={() => {
                setBadges([]);
                setFaixa("todas");
                setBusca("");
              }}
              className="h-9 px-3 text-[0.6875rem] uppercase tracking-[0.12em] text-tinta/50 underline underline-offset-4 transition-colors hover:text-vinho"
            >
              Limpar
            </button>
          )}
        </div>

        <p
          className="text-[0.6875rem] uppercase tracking-[0.14em] text-tinta/45"
          role="status"
          aria-live="polite"
        >
          {filtrando
            ? `${total} ${total === 1 ? "prato encontrado" : "pratos encontrados"}`
            : `${total} pratos no cardápio`}
        </p>
      </div>

      {/* Listagem */}
      {filtrado.length === 0 ? (
        <p className="mt-20 text-center font-display text-2xl italic text-tinta/45">
          Nenhum prato com esses filtros. Tente afrouxar um deles.
        </p>
      ) : (
        <div className="mt-14">
          {filtrado.map((cat, i) => {
            const grupos = [...new Set(cat.itens.map((it) => it.grupo))];
            const temGrupos = grupos.length > 1 || grupos[0] !== undefined;

            return (
              <section key={cat.id} id={cat.slug} className="scroll-mt-36">
                {i > 0 && (
                  <div className="flex justify-center py-12">
                    <span className="h-px w-16 bg-ouro/50" />
                  </div>
                )}

                <header>
                  <h2 className="font-display text-[2.25rem] text-vinho md:text-[3rem]">
                    {cat.nome}
                  </h2>
                  {cat.descricao && (
                    <p className="mt-2 max-w-prose text-sm italic text-tinta/55">
                      {cat.descricao}
                    </p>
                  )}
                  <div className="mt-4 h-px bg-ouro/60" />
                </header>

                {temGrupos ? (
                  <div className="space-y-8">
                    {grupos.map((g) => (
                      <div key={g ?? "geral"}>
                        {g && (
                          <h3 className="mt-8 text-center text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-vinho/70">
                            {g}
                          </h3>
                        )}
                        <ul className="mt-2">
                          {cat.itens
                            .filter((it) => it.grupo === g)
                            .map((item) => (
                              <Linha key={item.id} item={item} />
                            ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <ul className="mt-2">
                    {cat.itens.map((item) => (
                      <Linha key={item.id} item={item} />
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
