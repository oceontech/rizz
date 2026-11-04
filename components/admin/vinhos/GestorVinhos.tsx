"use client";

import { ArrowDown, ArrowUp, CircleCheck, CircleSlash, ExternalLink, Eye, EyeOff, FolderPlus, Pencil, Plus, Trash2, Wine } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

import { avisar, Confirmar } from "@/components/admin/campos";
import { Cabecalho, MenuAcoes, Selo, useUltimo } from "@/components/admin/ui";
import { EstadoVazio } from "@/components/sistema/estados/estado-vazio";
import { InputBusca } from "@/components/sistema/inputs/input-texto";
import { ItemEscalonado, ListaEscalonada } from "@/components/sistema/movimento";
import { ControleSegmentado } from "@/components/sistema/pickers/controle-segmentado";
import { Button } from "@/components/sistema/ui/button";
import { Switch } from "@/components/sistema/ui/switch";
import { Card } from "@/components/sistema/ui/card";
import type { TipoVinho } from "@/data/vinhos";
import { alternarDisponivelVinho, alternarVisivelVinho, excluirSecaoVinho, excluirVinho, moverSecaoVinho, moverVinho } from "@/lib/admin/vinhos-actions";
import { brl } from "@/lib/admin/formato";
import type { SecaoVinhoAdmin, VinhoAdmin } from "@/lib/dados";
import { cn } from "@/lib/utils";

import EditorSecaoVinho from "./EditorSecaoVinho";
import EditorVinho, { BolinhaTipo, TIPOS_VINHO } from "./EditorVinho";

type Filtro = "todos" | "falta" | "ocultos";
const ancora = (id: string) => `secao-${id}`;
const sem = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/**
 * Situação de hoje como interruptor com o texto ao lado: é o controle que
 * qualquer pessoa reconhece. (Antes era uma pílula colorida que parecia um
 * selo, e não dava para saber que era clicável.) Também está no menu "⋯".
 */
function BotaoSituacao({ disponivel, nome, aoMudar }: { disponivel: boolean; nome: string; aoMudar: (v: boolean) => void }) {
  return (
    <label className="flex w-[8.5rem] shrink-0 cursor-pointer items-center gap-2.5">
      <Switch
        checked={disponivel}
        onCheckedChange={aoMudar}
        aria-label={`${nome}: ${disponivel ? "disponível. Desligar para marcar como indisponível" : "indisponível. Ligar para voltar à carta"}`}
      />
      <span className={cn("text-[13px] font-semibold", disponivel ? "text-positivo-texto" : "text-negativo-texto")}>{disponivel ? "Disponível" : "Indisponível"}</span>
    </label>
  );
}

function LinhaVinho({ vinho, primeiro, ultimo, onEditar, onExcluir }: { vinho: VinhoAdmin; primeiro: boolean; ultimo: boolean; onEditar: () => void; onExcluir: () => void }) {
  const [disponivel, setDisponivel] = useState(vinho.disponivel);
  const [, iniciar] = useTransition();

  function alternar(v: boolean) {
    setDisponivel(v);
    iniciar(async () => {
      const r = await alternarDisponivelVinho(vinho.id, v);
      if (!avisar(r, v ? `${vinho.nome} voltou à carta` : `${vinho.nome} marcado como indisponível`)) setDisponivel(!v);
    });
  }

  function acao(chave: string) {
    if (chave === "editar") return onEditar();
    if (chave === "excluir") return onExcluir();
    if (chave === "situacao") return alternar(!disponivel);
    iniciar(async () => {
      if (chave === "cima" || chave === "baixo") {
        const r = await moverVinho(vinho.id, chave);
        if (!r.ok) avisar(r, "");
        return;
      }
      if (chave === "visivel") {
        const r = await alternarVisivelVinho(vinho.id, !vinho.visivel);
        avisar(r, vinho.visivel ? "Vinho oculto no site" : "Vinho visível no site");
      }
    });
  }

  return (
    <li className={cn("group/linha flex gap-3.5 px-3 py-3 transition-colors hover:bg-muted/40 sm:items-center sm:px-5", !vinho.visivel && "bg-muted/50")}>
      <BolinhaTipo tipo={vinho.tipo} className="mt-1.5 sm:mt-0" />
      <div className="min-w-0 grow">
        <button type="button" onClick={onEditar} className="block max-w-full min-w-0 text-left outline-none">
          <p className={cn("text-[15px] leading-snug font-medium group-hover/linha:underline group-hover/linha:decoration-border group-hover/linha:underline-offset-4", !disponivel && "text-muted-foreground")}>
            {vinho.nome}
          </p>
          {vinho.uvas.length > 0 && <p className="mt-0.5 truncate text-[13px] text-muted-foreground">{vinho.uvas.join(" · ")}</p>}
        </button>
        {(!vinho.visivel || vinho.notas.length > 0) && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {!vinho.visivel && (
              <Selo>
                <EyeOff /> Oculto no site
              </Selo>
            )}
            {vinho.notas.length > 0 && <Selo tom="info">Com notas do rótulo</Selo>}
          </div>
        )}
        <div className="mt-2.5 flex items-center justify-between gap-3 sm:hidden">
          <p className="numeros text-sm font-semibold">{brl.format(vinho.preco)}</p>
          <BotaoSituacao disponivel={disponivel} nome={vinho.nome} aoMudar={alternar} />
        </div>
      </div>
      <p className="numeros hidden w-24 shrink-0 text-right text-[15px] font-semibold sm:block">{brl.format(vinho.preco)}</p>
      <div className="hidden sm:block">
        <BotaoSituacao disponivel={disponivel} nome={vinho.nome} aoMudar={alternar} />
      </div>
      <div className="shrink-0 self-start sm:self-center">
        <MenuAcoes
          rotulo={`Ações de ${vinho.nome}`}
          aoEscolher={acao}
          acoes={[
            { id: "editar", rotulo: "Editar", icone: Pencil },
            { id: "situacao", rotulo: disponivel ? "Marcar como indisponível" : "Marcar como disponível", icone: disponivel ? CircleSlash : CircleCheck },
            { id: "visivel", rotulo: vinho.visivel ? "Ocultar do site" : "Mostrar no site", icone: vinho.visivel ? EyeOff : Eye },
            { id: "cima", rotulo: "Mover para cima", icone: ArrowUp, desabilitada: primeiro, separar: true },
            { id: "baixo", rotulo: "Mover para baixo", icone: ArrowDown, desabilitada: ultimo },
            { id: "excluir", rotulo: "Excluir", icone: Trash2, perigo: true, separar: true },
          ]}
        />
      </div>
    </li>
  );
}

/** Índice das seções (desktop): leva até a seção e marca a que está na tela. */
function IndiceSecoes({ secoes }: { secoes: SecaoVinhoAdmin[] }) {
  const [atual, setAtual] = useState(secoes[0]?.id ?? "");
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entradas) => {
        const v = entradas.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (v) setAtual(v.target.id.replace("secao-", ""));
      },
      { rootMargin: "-15% 0px -70% 0px" },
    );
    for (const s of secoes) {
      const el = document.getElementById(ancora(s.id));
      if (el) obs.observe(el);
    }
    return () => obs.disconnect();
  }, [secoes]);

  return (
    <nav aria-label="Seções da carta" className="sticky top-6 hidden max-h-[calc(100dvh-3rem)] w-56 shrink-0 overflow-y-auto pb-6 xl:block">
      <p className="mb-2 px-3 text-[0.68rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase">Seções</p>
      <ul className="flex flex-col gap-0.5">
        {secoes.map((s) => {
          const falta = s.itens.filter((v) => !v.disponivel).length;
          return (
            <li key={s.id}>
              <a
                href={`#${ancora(s.id)}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(ancora(s.id))?.scrollIntoView({ behavior: "smooth", block: "start" });
                  setAtual(s.id);
                }}
                className={cn("flex h-9 items-center gap-2 rounded-full px-3 text-sm transition-colors", atual === s.id ? "bg-card font-medium text-foreground shadow-suave" : "text-muted-foreground hover:text-foreground")}
              >
                <span className={cn("min-w-0 grow truncate", !s.visivel && "line-through decoration-muted-foreground/50")}>{s.titulo}</span>
                {falta > 0 && <span className="size-1.5 shrink-0 rounded-full bg-negativo" title={`${falta} indisponível(is)`} aria-hidden />}
                <span className="numeros text-xs text-texto-terciario">{s.itens.length}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/**
 * Carta de vinhos no painel. Segue o desenho do cardápio: resumo por tipo
 * (que também filtra), busca, situação de cada rótulo num toque, seções
 * reordenáveis e o editor lateral com prévia de como fica no site.
 */
export default function GestorVinhos({ secoes }: { secoes: SecaoVinhoAdmin[] }) {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [tipo, setTipo] = useState<TipoVinho | null>(null);
  const [editando, setEditando] = useState<VinhoAdmin | "novo" | null>(null);
  const [sessao, setSessao] = useState(0);
  const [novoNaSecao, setNovoNaSecao] = useState<string | null>(null);
  const [secaoEditada, setSecaoEditada] = useState<SecaoVinhoAdmin | "nova" | null>(null);
  const [excluindo, setExcluindo] = useState<{ tipo: "vinho"; vinho: VinhoAdmin } | { tipo: "secao"; secao: SecaoVinhoAdmin } | null>(null);
  const excluido = useUltimo(excluindo);
  const [, iniciar] = useTransition();

  const todos = secoes.flatMap((s) => s.itens);
  const contagem = { todos: todos.length, falta: todos.filter((v) => !v.disponivel).length, ocultos: todos.filter((v) => !v.visivel).length };
  const porTipo = TIPOS_VINHO.map((t) => ({ ...t, n: todos.filter((v) => v.tipo === t.id).length }));

  // Uvas mais usadas na carta, como sugestão no editor. (O React Compiler
  // memoriza; useMemo manual aqui conflita com ele.)
  const contaUvas = new Map<string, number>();
  for (const v of todos) for (const u of v.uvas) contaUvas.set(u, (contaUvas.get(u) ?? 0) + 1);
  const sugestoesUvas = [...contaUvas.entries()].sort((a, b) => b[1] - a[1]).map(([u]) => u);

  const termo = sem(busca.trim());
  const visiveis = secoes.map((s) => ({
      ...s,
      itens: s.itens.filter((v) => {
        if (filtro === "falta" && v.disponivel) return false;
        if (filtro === "ocultos" && v.visivel) return false;
        if (tipo && v.tipo !== tipo) return false;
        if (termo && !sem(`${v.nome} ${v.uvas.join(" ")}`).includes(termo)) return false;
        return true;
      }),
    }));

  const filtrando = busca.trim() !== "" || filtro !== "todos" || tipo !== null;
  const exibidas = filtrando ? visiveis.filter((s) => s.itens.length > 0) : visiveis;

  function novoVinho(secaoId: string | null) {
    setNovoNaSecao(secaoId);
    setSessao((n) => n + 1);
    setEditando("novo");
  }

  function acaoSecao(s: SecaoVinhoAdmin, chave: string) {
    if (chave === "editar") return setSecaoEditada(s);
    if (chave === "novo") return novoVinho(s.id);
    if (chave === "excluir") return setExcluindo({ tipo: "secao", secao: s });
    if (chave === "cima" || chave === "baixo") {
      iniciar(async () => {
        const r = await moverSecaoVinho(s.id, chave);
        if (!r.ok) avisar(r, "");
      });
    }
  }

  return (
    <>
      <Cabecalho
        titulo="Carta de vinhos"
        descricao="Rótulos, preços, o que está indisponível e o que aparece no site. As alterações publicam na hora."
        acoes={
          <>
            <Button variant="secondary" className="rounded-full bg-card shadow-suave hover:bg-accent" asChild>
              <a href="/carta-de-vinhos" target="_blank" rel="noopener noreferrer">
                <ExternalLink /> Ver no site
              </a>
            </Button>
            <Button variant="secondary" className="rounded-full bg-card shadow-suave hover:bg-accent" onClick={() => setSecaoEditada("nova")}>
              <FolderPlus /> Seção
            </Button>
            <Button className="rounded-full" onClick={() => novoVinho(null)}>
              <Plus /> Novo vinho
            </Button>
          </>
        }
      />

      {/* Resumo por tipo: cada cartão também é um filtro. */}
      <div className="mb-5 grid grid-cols-3 gap-2.5 sm:grid-cols-5">
        {porTipo.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={tipo === t.id}
            onClick={() => setTipo(tipo === t.id ? null : t.id)}
            className={cn(
              "flex flex-col items-start gap-2 rounded-2xl bg-card p-3.5 text-left shadow-suave transition-[box-shadow,transform] outline-none hover:-translate-y-0.5 focus-visible:ring-3 focus-visible:ring-ring/40 sm:p-4",
              tipo === t.id && "ring-2 ring-foreground",
            )}
          >
            <span className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground">
              <span className="size-3 rounded-full ring-2 ring-black/10" style={{ background: t.cor }} aria-hidden />
              {t.rotulo}
            </span>
            <span className="numeros text-2xl font-semibold">{t.n}</span>
          </button>
        ))}
      </div>

      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <InputBusca valor={busca} aoMudar={setBusca} placeholder="Buscar vinho ou uva…" aria-label="Buscar vinho ou uva" classeCaixa="rounded-full border-0 bg-card shadow-suave md:max-w-xs" />
        <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:px-0">
          <ControleSegmentado
            rotulo="Filtrar vinhos"
            sobrePagina
            valor={filtro}
            aoMudar={setFiltro}
            opcoes={[
              { valor: "todos", rotulo: "Todos", contagem: contagem.todos },
              { valor: "falta", rotulo: "Indisponíveis", contagem: contagem.falta },
              { valor: "ocultos", rotulo: "Ocultos", contagem: contagem.ocultos },
            ]}
          />
        </div>
      </div>

      <div className="flex items-start gap-6">
        {!filtrando && <IndiceSecoes secoes={secoes} />}
        <div className="min-w-0 grow">
          {exibidas.length === 0 ? (
            <Card>
              <EstadoVazio icone={Wine} titulo="Nenhum vinho encontrado" descricao={secoes.length ? "Ajuste a busca ou o filtro." : "Crie a primeira seção da carta."} />
            </Card>
          ) : (
            <ListaEscalonada className="flex flex-col gap-4">
              {exibidas.map((s, si) => (
                <ItemEscalonado key={s.id}>
                  <Card id={ancora(s.id)} className="scroll-mt-6 gap-0 py-0">
                    <div className="flex items-center gap-3 px-4 py-4 sm:px-5">
                      <div className="min-w-0 grow">
                        <h2 className="flex items-center gap-2 text-base font-semibold">
                          {s.titulo}
                          <span className="numeros grid h-5 min-w-5 place-items-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground">{s.itens.length}</span>
                          {!s.visivel && (
                            <Selo>
                              <EyeOff /> Oculta no site
                            </Selo>
                          )}
                        </h2>
                        {s.nota && <p className="truncate text-[13px] text-muted-foreground">{s.nota}</p>}
                      </div>
                      <Button size="sm" variant="ghost" className="hidden rounded-full sm:inline-flex" onClick={() => novoVinho(s.id)}>
                        <Plus /> Vinho
                      </Button>
                      <MenuAcoes
                        rotulo={`Ações da seção ${s.titulo}`}
                        aoEscolher={(k) => acaoSecao(s, k)}
                        acoes={[
                          { id: "novo", rotulo: "Adicionar vinho", icone: Plus },
                          { id: "editar", rotulo: "Editar seção", icone: Pencil },
                          { id: "cima", rotulo: "Subir seção", icone: ArrowUp, desabilitada: si === 0 || filtrando, separar: true },
                          { id: "baixo", rotulo: "Descer seção", icone: ArrowDown, desabilitada: si === exibidas.length - 1 || filtrando },
                          { id: "excluir", rotulo: "Excluir seção", icone: Trash2, perigo: true, separar: true },
                        ]}
                      />
                    </div>
                    {s.itens.length === 0 ? (
                      <button type="button" onClick={() => novoVinho(s.id)} className="flex w-full items-center gap-2 border-t px-5 py-5 text-sm text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground">
                        <Plus className="size-4" /> Nenhum vinho ainda. Adicionar o primeiro
                      </button>
                    ) : (
                      <ul className="divide-y border-t">
                        {s.itens.map((v, i) => (
                          <LinhaVinho
                            key={`${v.id}-${v.disponivel}-${v.visivel}`}
                            vinho={v}
                            primeiro={i === 0 || filtrando}
                            ultimo={i === s.itens.length - 1 || filtrando}
                            onEditar={() => {
                              setSessao((n) => n + 1);
                              setEditando(v);
                            }}
                            onExcluir={() => setExcluindo({ tipo: "vinho", vinho: v })}
                          />
                        ))}
                      </ul>
                    )}
                  </Card>
                </ItemEscalonado>
              ))}
            </ListaEscalonada>
          )}
        </div>
      </div>

      <EditorVinho editando={editando} sessao={sessao} secaoInicial={novoNaSecao} secoes={secoes} sugestoesUvas={sugestoesUvas} onFechar={() => setEditando(null)} />
      <EditorSecaoVinho editando={secaoEditada} onFechar={() => setSecaoEditada(null)} />

      <Confirmar
        aberto={excluindo !== null}
        onFechar={() => setExcluindo(null)}
        titulo={excluido?.tipo === "secao" ? "Excluir seção?" : "Excluir vinho?"}
        texto={
          excluido?.tipo === "secao" ? (
            <>
              A seção <strong className="text-foreground">{excluido.secao.titulo}</strong> será removida. Ela precisa estar vazia.
            </>
          ) : excluido ? (
            <>
              <strong className="text-foreground">{excluido.vinho.nome}</strong> será removido da carta de vez. Se for temporário, prefira marcar como indisponível ou ocultar.
            </>
          ) : null
        }
        onConfirmar={async () => {
          if (!excluindo) return;
          const r = excluindo.tipo === "secao" ? await excluirSecaoVinho(excluindo.secao.id) : await excluirVinho(excluindo.vinho.id);
          avisar(r, "Excluído");
        }}
      />
    </>
  );
}
