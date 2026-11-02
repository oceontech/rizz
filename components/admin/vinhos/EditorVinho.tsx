"use client";

import { Plus, Wine, X } from "lucide-react";
import { useState, type ReactNode } from "react";

import { avisar, BotaoSalvar, CampoMoeda, CampoOpcoes, CampoSelect, CampoSwitch, CampoTexto } from "@/components/admin/campos";
import { PainelLateral, useUltimo } from "@/components/admin/ui";
import { Button } from "@/components/sistema/ui/button";
import { salvarVinho } from "@/lib/admin/vinhos-actions";
import { brl } from "@/lib/admin/formato";
import type { SecaoVinhoAdmin, VinhoAdmin } from "@/lib/dados";
import type { TipoVinho } from "@/data/vinhos";
import { cn } from "@/lib/utils";

/** Tipos com a mesma cor da bolinha do site (components/vinhos/CartaVinhos). */
export const TIPOS_VINHO: { id: TipoVinho; rotulo: string; cor: string }[] = [
  { id: "tinto", rotulo: "Tinto", cor: "#8e1b3a" },
  { id: "branco", rotulo: "Branco", cor: "#e9d58a" },
  { id: "rose", rotulo: "Rosé", cor: "#f0a3a8" },
  { id: "espumante", rotulo: "Espumante", cor: "#efe3bf" },
  { id: "doce", rotulo: "Doce", cor: "#e8890c" },
];
export const corDoTipo = (t: TipoVinho) => TIPOS_VINHO.find((x) => x.id === t)?.cor ?? "#999";

export function BolinhaTipo({ tipo, className }: { tipo: TipoVinho; className?: string }) {
  return <span aria-hidden className={cn("inline-block size-2.5 shrink-0 rounded-full ring-2 ring-black/5", className)} style={{ background: corDoTipo(tipo) }} />;
}

function Bloco({ titulo, descricao, children }: { titulo: string; descricao?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border-t pt-5 first:border-t-0 first:pt-0">
      <div>
        <h3 className="text-[0.7rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase">{titulo}</h3>
        {descricao && <p className="mt-1 text-[13px] text-muted-foreground">{descricao}</p>}
      </div>
      {children}
    </section>
  );
}

/** Como o rótulo aparece na carta do site (fundo escuro, cores de lá). */
function Previa({ nome, tipo, uvas, preco, taca, disponivel, notas }: { nome: string; tipo: TipoVinho; uvas: string[]; preco: number | null; taca: boolean; disponivel: boolean; notas: string[] }) {
  return (
    <div className="overflow-hidden rounded-2xl" style={{ background: "#2b0710", color: "#fdf1e5" }}>
      <p className="px-4 pt-3 text-[0.62rem] font-semibold tracking-[0.14em] uppercase opacity-50">Prévia na carta do site</p>
      <div className={cn("flex items-start gap-3.5 px-4 pt-3 pb-4", !disponivel && "opacity-55")}>
        <span aria-hidden className="mt-[0.45rem] size-2.5 shrink-0 rounded-full ring-2 ring-white/10" style={{ background: corDoTipo(tipo) }} />
        <div className="min-w-0 grow">
          <p className="text-[1.0625rem] leading-snug font-medium">{nome || "Nome do vinho"}</p>
          {uvas.length > 0 && <p className="mt-1 text-[0.8125rem] tracking-wide opacity-60">{uvas.join(" · ")}</p>}
          {notas.length > 0 && <p className="mt-2 text-[0.7rem] font-medium tracking-[0.12em] uppercase" style={{ color: "#e8890c" }}>Notas do rótulo ⌄</p>}
        </div>
        <div className="shrink-0 text-right">
          {disponivel ? (
            <p className="numeros text-lg" style={{ color: "#e9c46a" }}>
              {preco === null ? "—" : brl.format(preco)}
            </p>
          ) : (
            <p className="rounded-full border border-white/25 px-2 py-0.5 text-[0.62rem] font-medium tracking-[0.14em] uppercase opacity-90">Indisponível</p>
          )}
          {taca && disponivel && <span className="block text-[0.6875rem] tracking-[0.12em] uppercase opacity-50">a taça</span>}
        </div>
      </div>
    </div>
  );
}

/** Uvas como etiquetas: digita e Enter (ou vírgula) adiciona; as mais usadas da carta ficam a um toque. */
function CampoUvas({ uvas, aoMudar, sugestoes }: { uvas: string[]; aoMudar: (u: string[]) => void; sugestoes: string[] }) {
  const [texto, setTexto] = useState("");
  const adicionar = (bruto: string) => {
    const novas = bruto.split(",").map((u) => u.trim()).filter(Boolean);
    if (!novas.length) return;
    aoMudar(Array.from(new Set([...uvas, ...novas])).slice(0, 12));
    setTexto("");
  };
  const livres = sugestoes.filter((s) => !uvas.includes(s)).slice(0, 10);
  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-sm font-medium">Uvas</span>
      <div className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-2xl border bg-background px-2.5 py-2 focus-within:ring-3 focus-within:ring-ring/30">
        {uvas.map((u) => (
          <span key={u} className="inline-flex h-7 items-center gap-1 rounded-full bg-muted pr-1 pl-3 text-[13px] font-medium">
            {u}
            <button type="button" aria-label={`Tirar ${u}`} onClick={() => aoMudar(uvas.filter((x) => x !== u))} className="grid size-5 place-items-center rounded-full hover:bg-background">
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          value={texto}
          onChange={(e) => (e.target.value.endsWith(",") ? adicionar(e.target.value) : setTexto(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              adicionar(texto);
            } else if (e.key === "Backspace" && !texto && uvas.length) aoMudar(uvas.slice(0, -1));
          }}
          onBlur={() => adicionar(texto)}
          placeholder={uvas.length ? "Outra uva…" : "Ex.: Syrah, Malbec"}
          aria-label="Adicionar uva"
          className="h-7 min-w-28 grow bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      {livres.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {livres.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => aoMudar([...uvas, s])}
              className="inline-flex h-7 items-center gap-1 rounded-full border border-dashed px-2.5 text-[12px] text-muted-foreground transition-colors hover:border-solid hover:bg-muted hover:text-foreground"
            >
              <Plus className="size-3" /> {s}
            </button>
          ))}
        </div>
      )}
      <p className="text-[0.8rem] text-muted-foreground">Viram filtro na carta do site. Digite e aperte Enter, ou toque numa sugestão.</p>
    </div>
  );
}

type Props = {
  aberto: boolean;
  vinho: VinhoAdmin | null;
  secaoInicial: string | null;
  secoes: SecaoVinhoAdmin[];
  sugestoesUvas: string[];
  onFechar: () => void;
};

function Formulario({ aberto, vinho, secaoInicial, secoes, sugestoesUvas, onFechar }: Props) {
  const [nome, setNome] = useState(vinho?.nome ?? "");
  const [secaoId, setSecaoId] = useState(vinho?.secaoId ?? secaoInicial ?? secoes[0]?.id ?? "");
  const [tipo, setTipo] = useState<TipoVinho>(vinho?.tipo ?? "tinto");
  const [uvas, setUvas] = useState<string[]>(vinho?.uvas ?? []);
  const [preco, setPreco] = useState<number | null>(vinho ? vinho.preco : null);
  const [notas, setNotas] = useState((vinho?.notas ?? []).join("\n\n"));
  const [disponivel, setDisponivel] = useState(vinho?.disponivel ?? true);
  const [visivel, setVisivel] = useState(vinho?.visivel ?? true);
  const [salvando, setSalvando] = useState(false);

  const paragrafos = notas.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const taca = secoes.find((s) => s.id === secaoId)?.slug === "taca";

  async function salvar() {
    if (nome.trim().length < 2) return avisar({ ok: false, erro: "Informe o nome do vinho." }, "");
    if (preco === null || preco < 0) return avisar({ ok: false, erro: "Informe o preço." }, "");
    setSalvando(true);
    const r = await salvarVinho({ id: vinho?.id, secaoId, nome, tipo, uvas, preco, notas: paragrafos, disponivel, visivel });
    setSalvando(false);
    if (avisar(r, vinho ? "Vinho atualizado" : "Vinho adicionado à carta")) onFechar();
  }

  return (
    <PainelLateral
      aberto={aberto}
      aoFechar={onFechar}
      icone={Wine}
      titulo={vinho ? "Editar vinho" : "Novo vinho"}
      descricao={vinho?.nome ?? "Aparece na carta do site assim que salvar"}
      largura="data-[side=right]:sm:max-w-2xl"
      rodape={
        <>
          <Button variant="secondary" className="rounded-full" onClick={onFechar} disabled={salvando}>
            Cancelar
          </Button>
          <BotaoSalvar className="flex-1" pendente={salvando} onClick={salvar}>
            {vinho ? "Salvar alterações" : "Adicionar à carta"}
          </BotaoSalvar>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <Previa nome={nome} tipo={tipo} uvas={uvas} preco={preco} taca={taca} disponivel={disponivel} notas={paragrafos} />

        <Bloco titulo="O vinho">
          <CampoTexto label="Nome do vinho" value={nome} onChange={setNome} obrigatorio autoFocus={!vinho} maxLength={160} placeholder="Ex.: Casa Geraldo Arte Chardonnay" />
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Tipo</span>
            <div role="radiogroup" aria-label="Tipo do vinho" className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {TIPOS_VINHO.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={tipo === t.id}
                  onClick={() => setTipo(t.id)}
                  className={cn(
                    "flex h-11 items-center justify-center gap-2 rounded-2xl border text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
                    tipo === t.id ? "border-foreground bg-foreground text-background" : "bg-background hover:bg-muted",
                  )}
                >
                  <span className="size-3 rounded-full ring-2 ring-black/10" style={{ background: t.cor }} aria-hidden />
                  {t.rotulo}
                </button>
              ))}
            </div>
          </div>
          <CampoUvas uvas={uvas} aoMudar={setUvas} sugestoes={sugestoesUvas} />
        </Bloco>

        <Bloco titulo="Onde fica e quanto custa">
          <div className="grid gap-4 sm:grid-cols-2">
            <CampoSelect label="Seção da carta" value={secaoId} onChange={setSecaoId} opcoes={secoes.map((s) => ({ id: s.id, rotulo: s.titulo }))} />
            <CampoMoeda label={taca ? "Preço da taça" : "Preço da garrafa"} value={preco} onChange={setPreco} />
          </div>
        </Bloco>

        <Bloco titulo="Notas do rótulo" descricao="Opcional. Abrem no toque, abaixo do nome. Deixe uma linha em branco entre parágrafos.">
          <CampoTexto label="Notas" value={notas} onChange={setNotas} multilinha linhas={5} maxLength={6000} placeholder="Cor, aromas, paladar, harmonização…" />
        </Bloco>

        <Bloco titulo="Na carta">
          <CampoOpcoes
            label="Situação hoje"
            value={disponivel ? "sim" : "nao"}
            onChange={(v) => setDisponivel(v === "sim")}
            opcoes={[
              { id: "sim", rotulo: "Disponível" },
              { id: "nao", rotulo: "Indisponível" },
            ]}
            descricao="Indisponível, o rótulo continua na carta, apagado, sem preço e com a etiqueta “Indisponível”."
          />
          <div className="rounded-2xl bg-muted/70 p-4">
            <CampoSwitch label="Visível no site" descricao="Oculte rótulos que saíram da carta sem perder o cadastro." value={visivel} onChange={setVisivel} />
          </div>
        </Bloco>
      </div>
    </PainelLateral>
  );
}

/** `sessao` muda a cada abertura: um "novo vinho" sempre começa em branco. */
export default function EditorVinho({
  editando,
  sessao,
  ...resto
}: Omit<Props, "aberto" | "vinho"> & { editando: VinhoAdmin | "novo" | null; sessao: number }) {
  const atual = useUltimo(editando);
  if (!atual) return null;
  const vinho = atual === "novo" ? null : atual;
  return <Formulario key={`${vinho?.id ?? `novo-${resto.secaoInicial}`}-${sessao}`} aberto={editando !== null} vinho={vinho} {...resto} />;
}
