"use client";

import { ArrowDown, ArrowUp, Film, ImageIcon, LayoutGrid, Plus, Repeat, Star, X } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

import { fotoDoItem } from "@/components/admin/cardapio/GestorCardapio";
import { avisar, BarraSalvar, CampoTexto } from "@/components/admin/campos";
import { BotaoLink, Cabecalho, Secao, Selo } from "@/components/admin/ui";
import { Button } from "@/components/sistema/ui/button";
import { salvarHome } from "@/lib/admin/home-actions";
import { brl } from "@/lib/admin/formato";
import type { CategoriaCardapio, HomeConfig } from "@/lib/dados";
import { cn } from "@/lib/utils";

import EscolhaPrato, { type Prato } from "./EscolhaPrato";

/** Prato com vídeo próprio de abertura na home (components/home/IntroCamarao). */
const PRATO_DO_VIDEO = "camarao-empanado";
const MAX_DESTAQUES = 12;

function Miniatura({ prato, className }: { prato: Prato; className?: string }) {
  const foto = fotoDoItem(prato);
  return (
    <span className={cn("relative block shrink-0 overflow-hidden rounded-xl bg-muted", className)}>
      {foto ? (
        <Image src={foto} alt="" fill sizes="96px" className="object-cover" />
      ) : (
        <ImageIcon className="absolute inset-0 m-auto size-5 text-texto-terciario" strokeWidth={1.5} />
      )}
    </span>
  );
}

/**
 * Título curto a partir do nome do prato: "Camarão Rosa Empanado com Risoto…"
 * vira "Camarão Rosa Empanado". O nome completo continua no cardápio.
 */
function tituloCurto(nome: string) {
  const [antes] = nome.split(/\s+(?:com|ao|à|na|no|e)\s+/i);
  return antes && antes.length >= 6 ? antes : nome;
}

export default function GestorHome({ categorias, config }: { categorias: CategoriaCardapio[]; config: HomeConfig }) {
  const pratos = useMemo(
    () => categorias.flatMap((c) => c.itens.map((i) => ({ ...i, categoriaNome: c.nome }))),
    [categorias],
  );
  const porId = useMemo(() => new Map(pratos.map((p) => [p.id, p])), [pratos]);

  // Pratos que saíram do cardápio somem da escolha (o site já os ignora).
  const limpo: HomeConfig = {
    maisPedido: config.maisPedido,
    destaques: config.destaques.filter((id) => porId.has(id)),
  };
  const [c, setC] = useState(limpo);
  const [salvando, setSalvando] = useState(false);
  const [escolhendo, setEscolhendo] = useState<"mais-pedido" | "selecao" | null>(null);
  const alterado = JSON.stringify(c) !== JSON.stringify(limpo);

  const maisPedido = porId.get(c.maisPedido.itemId);
  const mudarMaisPedido = (k: keyof HomeConfig["maisPedido"], v: string) =>
    setC((x) => ({ ...x, maisPedido: { ...x.maisPedido, [k]: v } }));

  /** Trocar o prato traz título e texto dele: a chamada (o "porquê" do destaque) fica. */
  function escolherMaisPedido(id: string) {
    const p = porId.get(id);
    if (!p || id === c.maisPedido.itemId) return;
    setC((x) => ({
      ...x,
      maisPedido: {
        ...x.maisPedido,
        itemId: id,
        titulo: tituloCurto(p.nome),
        texto: `${p.nome}${p.descricao ? `. ${p.descricao}` : ""}.`.replace(/\.\.$/, "."),
      },
    }));
  }

  function alternarDestaque(id: string) {
    setC((x) => ({
      ...x,
      destaques: x.destaques.includes(id) ? x.destaques.filter((d) => d !== id) : [...x.destaques, id],
    }));
  }

  function moverDestaque(i: number, d: -1 | 1) {
    setC((x) => {
      const lista = [...x.destaques];
      [lista[i], lista[i + d]] = [lista[i + d]!, lista[i]!];
      return { ...x, destaques: lista };
    });
  }

  async function salvar() {
    setSalvando(true);
    avisar(await salvarHome(c), "Página inicial atualizada no site");
    setSalvando(false);
  }

  return (
    <>
      <Cabecalho
        titulo="Página inicial"
        descricao="O prato mais pedido e a seleção do cardápio que aparecem na home do site. Os pratos vêm do cardápio: preço, foto e selos acompanham o que estiver lá."
        acoes={
          <BotaoLink href="/" variant="secondary" className="bg-card shadow-suave hover:bg-accent">
            Ver o site
          </BotaoLink>
        }
      />

      <div className="flex flex-col gap-4">
        <Secao icone={Star} titulo="O mais pedido" descricao="A dobra de destaque logo depois do manifesto, com foto grande e chamada.">
          <div className="grid gap-6 @3xl:grid-cols-[1fr_minmax(0,22rem)]">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Prato</span>
                <button
                  type="button"
                  onClick={() => setEscolhendo("mais-pedido")}
                  className="group flex items-center gap-3 rounded-2xl bg-muted/60 p-2 pr-4 text-left transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/40"
                >
                  {maisPedido ? (
                    <>
                      <Miniatura prato={maisPedido} className="size-14" />
                      <span className="min-w-0 grow">
                        <span className="block truncate text-sm font-medium">{maisPedido.nome}</span>
                        <span className="block text-xs text-muted-foreground">
                          {maisPedido.categoriaNome} · {maisPedido.preco === null ? "sob consulta" : brl.format(maisPedido.preco)}
                        </span>
                      </span>
                    </>
                  ) : (
                    <span className="grow px-2 py-3 text-sm text-muted-foreground">Nenhum prato escolhido</span>
                  )}
                  <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-[13px] font-medium shadow-suave">
                    <Repeat className="size-3.5" /> Trocar prato
                  </span>
                </button>
                {maisPedido && maisPedido.id !== PRATO_DO_VIDEO && (
                  <p className="flex items-start gap-1.5 text-[0.8rem] leading-snug text-muted-foreground">
                    <Film className="mt-0.5 size-3.5 shrink-0" />
                    A abertura em vídeo é do camarão. Com outro prato, a dobra entra com a foto, sem o vídeo.
                  </p>
                )}
                {maisPedido && !maisPedido.visivel && (
                  <p className="text-[0.8rem] text-atencao-texto">Este prato está oculto no site: a dobra não aparece.</p>
                )}
              </div>
              <CampoTexto
                label="Chamada"
                value={c.maisPedido.chamada}
                onChange={(v) => mudarMaisPedido("chamada", v)}
                maxLength={60}
                descricao="A linha pequena acima do título."
              />
              <CampoTexto
                label="Título"
                value={c.maisPedido.titulo}
                onChange={(v) => mudarMaisPedido("titulo", v)}
                maxLength={80}
                descricao="Um nome curto; o nome completo do prato fica no cardápio."
              />
              <CampoTexto
                label="Texto"
                value={c.maisPedido.texto}
                onChange={(v) => mudarMaisPedido("texto", v)}
                multilinha
                linhas={3}
                maxLength={300}
              />
            </div>

            {/* Prévia da dobra, nas cores do site */}
            <div className="overflow-hidden rounded-2xl" style={{ background: "#ffffff", color: "#3a1219" }}>
              <div className="relative aspect-[4/3] bg-[#fdf1e5]">
                {maisPedido && fotoDoItem(maisPedido) ? (
                  <Image src={fotoDoItem(maisPedido)!} alt="" fill sizes="22rem" className="object-cover" />
                ) : (
                  <span className="absolute inset-0 grid place-items-center text-xs opacity-50">Prato sem foto</span>
                )}
              </div>
              <div className="flex flex-col gap-2 p-5">
                <p className="text-[0.62rem] font-semibold tracking-[0.18em] uppercase" style={{ color: "#70012a" }}>
                  {c.maisPedido.chamada || "Chamada"}
                </p>
                <p className="font-display text-[1.6rem] leading-tight">{c.maisPedido.titulo || "Título"}</p>
                <span className="h-px w-24" style={{ background: "rgb(201 162 39 / 0.55)" }} />
                <p className="text-[0.8rem] leading-relaxed opacity-75">{c.maisPedido.texto || "Texto sobre o prato."}</p>
                {maisPedido && (
                  <p className="numeros mt-1 font-display text-2xl">
                    {maisPedido.preco === null ? "Sob consulta" : brl.format(maisPedido.preco)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Secao>

        <Secao
          icone={LayoutGrid}
          titulo="Seleção do cardápio"
          descricao="A galeria que corre de lado. Na ordem abaixo; de 3 a 12 pratos. Os que têm foto ficam melhores."
          acoes={
            <Button size="sm" className="rounded-full" onClick={() => setEscolhendo("selecao")}>
              <Plus /> Escolher pratos
            </Button>
          }
        >
          {c.destaques.length === 0 ? (
            <p className="rounded-2xl bg-muted/70 px-4 py-6 text-center text-sm text-muted-foreground">
              Nenhum prato na seleção. Adicione pelo menos 3.
            </p>
          ) : (
            <ol className="grid gap-2 @2xl:grid-cols-2">
              {c.destaques.map((id, i) => {
                const p = porId.get(id)!;
                return (
                  <li key={id} className="flex items-center gap-3 rounded-2xl bg-muted/60 p-2 pr-2.5">
                    <span className="numeros w-6 shrink-0 text-center text-xs font-semibold text-texto-terciario">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <Miniatura prato={p} className="size-14" />
                    <span className="min-w-0 grow">
                      <span className="block truncate text-sm font-medium">{p.nome}</span>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="truncate">{p.categoriaNome}</span>
                        {!fotoDoItem(p) && <Selo tom="atencao" className="h-5 px-2 text-[0.65rem]">Sem foto</Selo>}
                        {!p.visivel && <Selo className="h-5 px-2 text-[0.65rem]">Oculto</Selo>}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center">
                      <Button variant="ghost" size="icon-sm" className="rounded-full" aria-label="Mover para antes" disabled={i === 0} onClick={() => moverDestaque(i, -1)}>
                        <ArrowUp />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="rounded-full"
                        aria-label="Mover para depois"
                        disabled={i === c.destaques.length - 1}
                        onClick={() => moverDestaque(i, 1)}
                      >
                        <ArrowDown />
                      </Button>
                      <Button
                        variant="ghost-destructive"
                        size="icon-sm"
                        className="rounded-full"
                        aria-label={`Tirar ${p.nome} da seleção`}
                        onClick={() => setC((x) => ({ ...x, destaques: x.destaques.filter((d) => d !== id) }))}
                      >
                        <X />
                      </Button>
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </Secao>
      </div>

      <EscolhaPrato
        aberta={escolhendo === "mais-pedido"}
        aoFechar={() => setEscolhendo(null)}
        titulo="Prato mais pedido"
        descricao="Toque no prato. Título e texto se ajustam a ele; dá para editar depois."
        pratos={pratos}
        marcados={[c.maisPedido.itemId]}
        aoAlternar={escolherMaisPedido}
      />
      <EscolhaPrato
        aberta={escolhendo === "selecao"}
        aoFechar={() => setEscolhendo(null)}
        titulo="Seleção do cardápio"
        descricao="Toque para pôr ou tirar da seleção. Os novos entram no fim da lista."
        pratos={pratos}
        marcados={c.destaques}
        aoAlternar={alternarDestaque}
        varios
        limite={MAX_DESTAQUES}
      />

      <BarraSalvar alterado={alterado} salvando={salvando} aoSalvar={salvar} aoDescartar={() => setC(limpo)} rotulo="Publicar na home" />
    </>
  );
}
