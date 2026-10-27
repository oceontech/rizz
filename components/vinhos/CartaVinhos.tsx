"use client";

import { ChevronDown, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import Preco from "@/components/ui/Preco";
import type { SecaoCarta, TipoVinho, Vinho } from "@/data/vinhos";
import { scrollToTarget } from "@/lib/scroll";

const TIPOS: { id: TipoVinho; rotulo: string; cor: string }[] = [
  { id: "tinto", rotulo: "Tinto", cor: "bg-[#8e1b3a]" },
  { id: "branco", rotulo: "Branco", cor: "bg-[#e9d58a]" },
  { id: "rose", rotulo: "Rosé", cor: "bg-[#f0a3a8]" },
  { id: "espumante", rotulo: "Espumante", cor: "bg-[#f4ecd2]" },
  { id: "doce", rotulo: "Doce", cor: "bg-ambar" },
];
const corDo = (t: TipoVinho) => TIPOS.find((x) => x.id === t)!.cor;

/** Uvas oferecidas como filtro: as que aparecem em mais rótulos. */
const UVAS_EM_DESTAQUE = 7;

const sem = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** `claro`: rótulo sobre fundo creme (a seção Gran Reserva). */
function Rotulo({ vinho, taca, claro = false }: { vinho: Vinho; taca: boolean; claro?: boolean }) {
  const temNotas = vinho.notas.length > 0;

  const cabeca = (
    <div className="flex items-start gap-3.5">
      <span aria-hidden className={`mt-[0.45rem] size-2.5 shrink-0 rounded-full ring-2 ${claro ? "ring-tinta/10" : "ring-white/10"} ${corDo(vinho.tipo)}`} />
      <div className="min-w-0 grow">
        <p className={`text-[1.0625rem] leading-snug font-medium ${claro ? "text-tinta" : "text-creme"}`}>{vinho.nome}</p>
        {vinho.uvas.length > 0 && (
          <p className={`mt-1 text-[0.8125rem] tracking-wide ${claro ? "text-tinta/65" : "text-creme/60"}`}>{vinho.uvas.join(" · ")}</p>
        )}
      </div>
      <div className="shrink-0 text-right">
        <Preco valor={vinho.preco} className={`text-lg ${claro ? "text-vinho" : "text-ouro-claro"} [&>span]:opacity-80`} />
        {taca && <span className="block text-[0.6875rem] tracking-[0.12em] text-creme/50 uppercase">a taça</span>}
      </div>
    </div>
  );

  if (!temNotas) return <li className={`border-b py-4 last:border-0 ${claro ? "border-tinta/12" : "border-creme/10"}`}>{cabeca}</li>;

  return (
    <li className={`border-b last:border-0 ${claro ? "border-tinta/12" : "border-creme/10"}`}>
      <details className="group py-4">
        <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
          {cabeca}
          <span className={`mt-2 ml-6 inline-flex items-center gap-1.5 text-xs font-medium tracking-[0.12em] uppercase ${claro ? "text-vinho" : "text-ambar"}`}>
            <span className="group-open:hidden">Notas do rótulo</span>
            <span className="hidden group-open:inline">Fechar</span>
            <ChevronDown className="size-3.5 transition-transform group-open:rotate-180" />
          </span>
        </summary>
        <div className={`mt-3 ml-6 space-y-2.5 border-l pl-4 text-[0.9375rem] leading-relaxed ${claro ? "border-vinho/30 text-tinta/80" : "border-ambar/40 text-creme/75"}`}>
          {vinho.notas.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </details>
    </li>
  );
}

/**
 * Carta de vinhos: abas por seção (grudadas no topo), busca, filtros por
 * tipo e por uva, e cada rótulo com as notas abrindo no toque. Pensada
 * primeiro para o celular, que é onde a carta é lida à mesa.
 */
export default function CartaVinhos({ secoes }: { secoes: SecaoCarta[] }) {
  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState<TipoVinho | null>(null);
  const [uva, setUva] = useState<string | null>(null);
  const [ativa, setAtiva] = useState(secoes[0]?.slug ?? "");
  const trilho = useRef<HTMLDivElement>(null);

  const uvas = useMemo(() => {
    const conta = new Map<string, number>();
    for (const s of secoes) for (const v of s.itens) for (const u of v.uvas) conta.set(u, (conta.get(u) ?? 0) + 1);
    return [...conta.entries()].sort((a, b) => b[1] - a[1]).slice(0, UVAS_EM_DESTAQUE).map(([u]) => u);
  }, [secoes]);

  const filtradas = useMemo(() => {
    const termo = sem(busca.trim());
    return secoes
      .map((s) => ({
        ...s,
        itens: s.itens.filter(
          (v) =>
            (!tipo || v.tipo === tipo) &&
            (!uva || v.uvas.includes(uva)) &&
            (!termo || sem(`${v.nome} ${v.uvas.join(" ")} ${v.notas.join(" ")}`).includes(termo)),
        ),
      }))
      .filter((s) => s.itens.length > 0);
  }, [secoes, busca, tipo, uva]);

  const total = filtradas.reduce((n, s) => n + s.itens.length, 0);
  const filtrando = Boolean(busca.trim() || tipo || uva);

  // Aba ativa: a seção que cruza a faixa logo abaixo das abas.
  useEffect(() => {
    const els = filtradas.map((s) => document.getElementById(`vinhos-${s.slug}`)).filter((e): e is HTMLElement => Boolean(e));
    const obs = new IntersectionObserver(
      (entradas) => {
        const visivel = entradas.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visivel) setAtiva(visivel.target.id.replace("vinhos-", ""));
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    els.forEach((e) => obs.observe(e));
    return () => obs.disconnect();
  }, [filtradas]);

  // Mantém a aba ativa à vista no trilho (no celular ele rola de lado).
  useEffect(() => {
    const t = trilho.current;
    const aba = t?.querySelector<HTMLElement>(`[data-aba="${ativa}"]`);
    if (t && aba) t.scrollTo({ left: aba.offsetLeft - (t.clientWidth - aba.offsetWidth) / 2, behavior: "smooth" });
  }, [ativa]);

  function limpar() {
    setBusca("");
    setTipo(null);
    setUva(null);
  }

  const chip = (ativo: boolean) =>
    `flex h-9 shrink-0 items-center gap-2 rounded-full border px-3.5 text-[0.8125rem] transition-colors ${
      ativo ? "border-ambar bg-ambar text-noite" : "border-creme/20 text-creme/85 hover:border-creme/45"
    }`;

  return (
    <div>
      <div className="sticky top-[var(--altura-header)] z-30 -mx-[1.375rem] border-b border-creme/10 bg-noite/85 backdrop-blur-md transition-[top] duration-[550ms] ease-[var(--ease-rizz)] min-[860px]:-mx-12">
        <div ref={trilho} className="no-scrollbar flex gap-1.5 overflow-x-auto px-[1.375rem] py-3 min-[860px]:px-12">
          {filtradas.map((s) => (
            <a
              key={s.slug}
              data-aba={s.slug}
              href={`#vinhos-${s.slug}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToTarget(`#vinhos-${s.slug}`, 60);
              }}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium tracking-[0.1em] whitespace-nowrap uppercase transition-colors ${
                ativa === s.slug ? "bg-creme text-noite" : "text-creme/75 hover:text-creme"
              }`}
            >
              {s.titulo}
            </a>
          ))}
        </div>
      </div>

      {/* Busca e filtros */}
      <div className="mt-8 flex flex-col gap-4">
        <label className="relative block max-w-xl">
          <span className="sr-only">Buscar na carta de vinhos</span>
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-creme/50" />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar vinho, uva ou vinícola"
            className="h-12 w-full rounded-full border border-creme/20 bg-creme/5 pr-4 pl-11 text-base text-creme placeholder:text-creme/45 focus:border-ambar focus:outline-none"
          />
        </label>

        <div className="no-scrollbar -mx-[1.375rem] flex gap-2 overflow-x-auto px-[1.375rem] min-[860px]:mx-0 min-[860px]:flex-wrap min-[860px]:px-0">
          {TIPOS.map((t) => (
            <button key={t.id} type="button" aria-pressed={tipo === t.id} onClick={() => setTipo(tipo === t.id ? null : t.id)} className={chip(tipo === t.id)}>
              <span aria-hidden className={`size-2.5 rounded-full ${t.cor}`} />
              {t.rotulo}
            </button>
          ))}
          <span className="mx-1 w-px shrink-0 self-stretch bg-creme/15" aria-hidden />
          {uvas.map((u) => (
            <button key={u} type="button" aria-pressed={uva === u} onClick={() => setUva(uva === u ? null : u)} className={chip(uva === u)}>
              {u}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 text-sm text-creme/60">
          <span>
            {total} {total === 1 ? "rótulo" : "rótulos"}
            {filtrando ? " encontrados" : " na carta"}
          </span>
          {filtrando && (
            <button type="button" onClick={limpar} className="inline-flex items-center gap-1 text-ambar underline-offset-4 hover:underline">
              <X className="size-3.5" /> Limpar filtros
            </button>
          )}
        </div>
      </div>

      {filtradas.length === 0 ? (
        <p className="mt-16 text-center text-lg text-creme/60">Nenhum vinho encontrado. Tente outro termo ou limpe os filtros.</p>
      ) : (
        <div className="mt-10 flex flex-col gap-14 md:gap-20">
          {filtradas.map((s) => {
            const destaque = s.slug === "gran-reserva";
            return (
              <section
                key={s.slug}
                id={`vinhos-${s.slug}`}
                className={`scroll-mt-40 ${destaque ? "-mx-[1.375rem] bg-creme text-tinta px-[1.375rem] py-10 md:mx-0 md:rounded-3xl md:px-10 md:py-12" : ""}`}
              >
                <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
                  <h2 className="flex flex-col items-start not-italic">
                    {destaque && (
                      <span className="relative z-10 -mb-[0.1em] font-[family-name:var(--font-pinyon)] text-[2.4rem] leading-none text-ambar md:text-5xl">
                        de guarda
                      </span>
                    )}
                    <span className={`font-[family-name:var(--font-instrument)] text-[2.75rem] leading-[0.95] tracking-[0.01em] uppercase md:text-[4rem] ${destaque ? "text-vinho" : "text-creme"}`}>
                      {s.titulo}
                    </span>
                  </h2>
                  <p className={`pb-1 text-sm ${destaque ? "text-tinta/60" : "text-creme/60"}`}>
                    {s.itens.length} {s.itens.length === 1 ? "rótulo" : "rótulos"}
                  </p>
                </header>
                {s.nota && <p className="mt-3 text-base text-creme/75">{s.nota}</p>}
                <div className={`mt-5 h-px ${destaque ? "bg-ouro/70" : "bg-ouro/40"}`} />

                {/* Duas colunas a partir do desktop largo; no celular, lista. */}
                <ul className="mt-1 lg:columns-2 lg:gap-14 [&>li]:break-inside-avoid">
                  {s.itens.map((v) => (
                    <Rotulo key={v.id} vinho={v} taca={s.slug === "taca"} claro={destaque} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
