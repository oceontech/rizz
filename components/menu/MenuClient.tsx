"use client";

import { useMemo, useRef, useState } from "react";

import { CONDICOES, gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { ListaSelos, SeloOrigem } from "@/components/ui/Selos";
import Preco from "@/components/ui/Preco";
import { BADGES, cardapio, type Badge, type MenuItem } from "@/data/menu";
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
function Linha({
  item,
  ativos,
  onAlternar,
}: {
  item: MenuItem;
  ativos: Badge[];
  onAlternar: (b: Badge) => void;
}) {
  return (
    <li
      data-linha
      className="flex items-baseline gap-3 border-b border-tinta/10 py-4 last:border-0"
    >
      <div className="min-w-0 grow">
        <h3 className="text-[1.0625rem] leading-snug text-vinho md:text-lg">
          {item.nome}
        </h3>
        {item.descricao && (
          <p className="mt-1 text-[0.9375rem] italic leading-snug text-tinta/65">
            {item.descricao}
          </p>
        )}
        {(item.badges?.length || item.vpj) && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <ListaSelos badges={item.badges} ativos={ativos} onAlternar={onAlternar} />
            {item.vpj && <SeloOrigem />}
          </div>
        )}
      </div>

      <span
        aria-hidden
        className="mb-1.5 hidden h-px grow border-b border-dotted border-tinta/20 sm:block"
      />

      <Preco
        valor={item.preco}
        className="shrink-0 text-[1.0625rem] text-vinho md:text-lg"
      />
    </li>
  );
}

export default function MenuClient() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [faixa, setFaixa] = useState<FaixaPreco>("todas");
  const [busca, setBusca] = useState("");
  const [ativa, setAtiva] = useState(cardapio[0].slug);
  const raiz = useRef<HTMLDivElement>(null);
  const trilho = useRef<HTMLDivElement>(null);
  const indicador = useRef<HTMLSpanElement>(null);
  // Aba clicada: vale no fim da página, onde a rolagem acaba antes de a
  // categoria chegar à linha de leitura.
  const preferida = useRef<{ slug: string; noFim: boolean } | null>(null);
  function alternarBadge(b: Badge) {
    setBadges((atual) =>
      atual.includes(b) ? atual.filter((x) => x !== b) : [...atual, b],
    );
  }

  // Filtro pela etiqueta de um prato: a lista muda embaixo do dedo, então
  // leva até os filtros, onde se vê o que está ativo e quantos pratos sobraram.
  function alternarPelaLinha(b: Badge) {
    alternarBadge(b);
    requestAnimationFrame(() => scrollToTarget("#filtros", 72));
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

  /**
   * Abas que acompanham a rolagem. A categoria ativa troca de uma vez — ou
   * está marcada, ou não está —, e a troca é animada: a pílula vinho
   * desliza até a nova aba e o trilho rola para mantê-la no centro. Antes a
   * aba só mudava de cor, e no celular, a partir de "Carne bovina", a ativa
   * já estava fora da tela.
   */
  useGSAP(
    () => {
      const no = raiz.current;
      const t = trilho.current;
      const pilula = indicador.current;
      if (!no || !t || !pilula) return;

      let inicios: number[] = [];
      let atual = "";
      const faixa = gsap.utils.clamp(0, 1);

      const medir = () => {
        inicios = filtrado.map((cat) => {
          const el = document.getElementById(cat.slug);
          return el ? el.getBoundingClientRect().top + window.scrollY : 0;
        });
      };

      const posicionar = (slug: string, animar: boolean) => {
        const aba = t.querySelector<HTMLElement>(`[data-aba="${slug}"]`);
        if (!aba) return;
        const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const duracao = animar && !reduzido ? 0.45 : 0;

        gsap.to(pilula, {
          x: aba.offsetLeft,
          y: aba.offsetTop,
          width: aba.offsetWidth,
          height: aba.offsetHeight,
          autoAlpha: 1,
          duration: duracao,
          ease: "power3.out",
          overwrite: true,
        });
        gsap.to(t, {
          scrollTo: {
            x: Math.max(0, aba.offsetLeft - (t.clientWidth - aba.offsetWidth) / 2),
            autoKill: true,
          },
          duration: duracao ? 0.55 : 0,
          ease: "power3.out",
          overwrite: true,
        });
      };

      const atualizar = (animar = true) => {
        if (!inicios.length) return;

        // A "linha de leitura" fica a 30% da altura da tela e, na última
        // tela de rolagem, desce até o pé — senão as últimas categorias,
        // que nunca sobem até os 30%, jamais ficariam ativas.
        const y = window.scrollY;
        const vh = window.innerHeight;
        const max = ScrollTrigger.maxScroll(window);
        const fim = faixa((y - (max - vh)) / vh);
        const linha = y + vh * (0.3 + 0.65 * fim);
        let i = 0;
        while (i < inicios.length - 1 && linha >= inicios[i + 1]) i++;

        const pref = preferida.current;
        if (pref) {
          const iPref = filtrado.findIndex((c) => c.slug === pref.slug);
          if (y >= max - 2 && iPref >= 0) {
            pref.noFim = true;
            i = iPref;
          } else if (pref.noFim || (iPref === i && fim === 0)) {
            // Saiu da base depois de chegar nela, ou alcançou a aba clicada
            // longe do fim: a escolha já cumpriu seu papel.
            preferida.current = null;
          }
        }

        const slug = filtrado[i]?.slug;
        if (!slug || slug === atual) return;
        atual = slug;
        setAtiva(slug);
        posicionar(slug, animar);
      };

      medir();
      atualizar(false);

      const gatilho = ScrollTrigger.create({
        trigger: no,
        start: "top bottom",
        end: "bottom top",
        onUpdate: () => atualizar(),
        onRefresh: () => {
          medir();
          if (atual) posicionar(atual, false);
          atualizar(false);
        },
      });

      return () => gatilho.kill();
    },
    { scope: raiz, dependencies: [filtrado], revertOnUpdate: true },
  );

  // As linhas entram em cascata quando a categoria aparece.
  useGSAP(
    () => {
      const no = raiz.current;
      if (!no) return;

      const mm = gsap.matchMedia();

      mm.add(CONDICOES, () => {
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

        return () => lote.forEach((b) => b.kill());
      });

      return () => mm.revert();
    },
    { scope: raiz, dependencies: [filtrado.length, busca, faixa, badges.length] },
  );

  return (
    <div ref={raiz}>
      {/* Abas grudadas abaixo do header, no mesmo vidro dele (`.vidro`): as
          duas barras leem como um painel só. */}
      {/* O `top` acompanha a altura que o header está realmente ocupando:
          quando ele se recolhe a variável vai a zero e as abas sobem junto,
          em vez de deixar um vão do tamanho do header. */}
      <div className="vidro sticky top-[var(--altura-header)] z-30 -mx-[1.375rem] border-b border-tinta/12 transition-[top] duration-[550ms] ease-[var(--ease-rizz)] md:-mx-12">
        <div
          ref={trilho}
          className="no-scrollbar relative flex gap-1 overflow-x-auto px-[1.375rem] py-3 [mask-image:linear-gradient(to_right,transparent,#000_1.5rem,#000_calc(100%-1.5rem),transparent)] md:px-12"
        >
          {/* Pílula única que desliza entre as abas (posicionada pelo GSAP). */}
          <span
            ref={indicador}
            aria-hidden
            className="invisible pointer-events-none absolute left-0 top-0 rounded-full bg-vinho opacity-0"
          />
          {cardapio.map((cat) => {
            const atual = ativa === cat.slug;
            return (
              <a
                key={cat.id}
                data-aba={cat.slug}
                href={`#${cat.slug}`}
                onClick={(e) => {
                  e.preventDefault();
                  preferida.current = { slug: cat.slug, noFim: false };
                  scrollToTarget(`#${cat.slug}`, 56);
                  window.history.replaceState(null, "", `#${cat.slug}`);
                }}
                aria-current={atual ? "true" : undefined}
                className={`relative shrink-0 rounded-full px-4 py-2 text-[0.6875rem] uppercase tracking-[0.14em] transition-colors duration-300 ${
                  atual
                    ? "text-creme"
                    : "text-tinta/60 hover:text-vinho"
                }`}
              >
                {cat.nome}
              </a>
            );
          })}
        </div>
      </div>

      {/* Filtros */}
      <div id="filtros" className="mt-10 flex flex-col gap-5">
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
                              <Linha key={item.id} item={item} ativos={badges} onAlternar={alternarPelaLinha} />
                            ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <ul className="mt-2">
                    {cat.itens.map((item) => (
                      <Linha key={item.id} item={item} ativos={badges} onAlternar={alternarPelaLinha} />
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
