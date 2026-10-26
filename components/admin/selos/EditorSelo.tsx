"use client";

import { Award, Check, RotateCcw } from "lucide-react";
import { useState } from "react";

import { avisar, BotaoSalvar, CampoSwitch, CampoTexto } from "@/components/admin/campos";
import { PainelLateral, useUltimo } from "@/components/admin/ui";
import { InputTexto } from "@/components/sistema/inputs/input-texto";
import { Button } from "@/components/sistema/ui/button";
import SeloSvg from "@/components/ui/SeloSvg";
import { salvarSelo } from "@/lib/admin/selos-actions";
import { CORES_SELO, FORMAS, SIMBOLOS, type FormaSelo, type SeloDef, type SimboloSelo } from "@/lib/selos";
import { cn } from "@/lib/utils";

const NOVO: SeloDef = {
  id: "",
  nome: "",
  descricao: null,
  forma: "circulo",
  simbolo: "estrela",
  letra: null,
  cor: CORES_SELO[2].cor,
  ordem: 0,
  ativo: true,
};

/** Cores do site, para a prévia mostrar o selo onde ele vai morar. */
const SITE = { creme: "#fdf1e5", tinta: "#3a1219", noite: "#2b0710" };

function Rotulo({ children, extra }: { children: React.ReactNode; extra?: React.ReactNode }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-3">
      <p className="text-sm font-medium">{children}</p>
      {extra}
    </div>
  );
}

function Formulario({ selo, aberto, onFechar }: { selo: SeloDef | null; aberto: boolean; onFechar: () => void }) {
  const inicial = selo ?? NOVO;
  const [nome, setNome] = useState(inicial.nome);
  const [descricao, setDescricao] = useState(inicial.descricao ?? "");
  const [forma, setForma] = useState<FormaSelo>(inicial.forma);
  const [simbolo, setSimbolo] = useState<SimboloSelo>(inicial.simbolo);
  const [letra, setLetra] = useState(inicial.letra ?? "");
  const [cor, setCor] = useState(inicial.cor);
  const [corDigitada, setCorDigitada] = useState(inicial.cor);
  const [ativo, setAtivo] = useState(inicial.ativo);
  const [salvando, setSalvando] = useState(false);
  // Muda a chave quando o desenho muda: a prévia grande refaz a entrada.
  const [replay, setReplay] = useState(0);

  const atual = { nome: nome || "Novo selo", descricao: descricao || null, forma, simbolo, letra, cor };

  function desenho<T>(set: (v: T) => void) {
    return (v: T) => {
      set(v);
      setReplay((n) => n + 1);
    };
  }

  function mudarCor(v: string) {
    setCorDigitada(v);
    const hex = v.startsWith("#") ? v : `#${v}`;
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) desenho(setCor)(hex.toLowerCase());
  }

  async function salvar() {
    setSalvando(true);
    const r = await salvarSelo({
      id: selo?.id,
      nome,
      descricao: descricao || null,
      forma,
      simbolo,
      letra: simbolo === "letra" ? letra : null,
      cor,
      ativo,
    });
    setSalvando(false);
    if (avisar(r, selo ? "Selo atualizado no site" : "Selo criado")) onFechar();
  }

  return (
    <PainelLateral
      aberto={aberto}
      aoFechar={onFechar}
      icone={Award}
      titulo={selo ? "Editar selo" : "Novo selo"}
      descricao={selo ? selo.nome : "Formato, símbolo e cor são livres"}
      largura="data-[side=right]:sm:max-w-2xl"
      rodape={
        <>
          <Button variant="secondary" className="rounded-full" onClick={onFechar} disabled={salvando}>
            Cancelar
          </Button>
          <BotaoSalvar className="flex-1" pendente={salvando} onClick={salvar}>
            {selo ? "Salvar selo" : "Criar selo"}
          </BotaoSalvar>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Prévia: o selo grande e as etiquetas nos dois fundos do site */}
        <div className="overflow-hidden rounded-3xl bg-muted/70">
          <div
            className="relative grid place-items-center py-8"
            style={{ background: `radial-gradient(circle at 50% 45%, color-mix(in oklab, ${cor} 16%, transparent), transparent 65%)` }}
          >
            <SeloSvg selo={atual} tamanho={112} animar chave={replay} />
            <button
              type="button"
              onClick={() => setReplay((n) => n + 1)}
              className="absolute top-3 right-3 flex h-8 items-center gap-1.5 rounded-full bg-card/80 px-3 text-xs font-medium text-muted-foreground shadow-suave backdrop-blur transition-colors hover:text-foreground"
            >
              <RotateCcw className="size-3.5" /> Ver entrada
            </button>
          </div>
          <div className="grid grid-cols-2">
            {(
              [
                ["Cardápio", SITE.creme, SITE.tinta, "rgb(58 18 25 / 0.15)"],
                ["Página inicial", SITE.noite, SITE.creme, "rgb(253 241 229 / 0.2)"],
              ] as const
            ).map(([onde, fundo, texto, borda]) => (
              <div key={onde} className="flex flex-col items-start gap-2 px-4 py-3.5" style={{ background: fundo }}>
                <span className="text-[0.65rem] font-semibold tracking-[0.12em] uppercase" style={{ color: texto, opacity: 0.55 }}>
                  {onde}
                </span>
                <span
                  className="inline-flex h-6 items-center gap-1.5 rounded-full border pr-2.5 pl-[3px] text-[0.6875rem] tracking-[0.03em]"
                  style={{ color: texto, borderColor: borda }}
                >
                  <SeloSvg selo={atual} tamanho={18} titulo={false} />
                  {atual.nome}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <CampoTexto
            label="Nome"
            value={nome}
            onChange={setNome}
            obrigatorio
            autoFocus={!selo}
            maxLength={40}
            placeholder="Ex.: Sem glúten"
            descricao="Escrito ao lado do selo nos pratos."
          />
          <CampoTexto
            label="Legenda"
            value={descricao}
            onChange={setDescricao}
            maxLength={120}
            placeholder="Ex.: Preparado sem glúten"
            descricao="Aparece na legenda do cardápio."
          />
        </div>

        <div>
          <Rotulo>Formato</Rotulo>
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(FORMAS) as FormaSelo[]).map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={forma === f}
                onClick={() => desenho(setForma)(f)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-2xl py-3 text-xs font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
                  forma === f ? "bg-foreground text-background" : "bg-muted/70 text-muted-foreground hover:bg-muted-hover",
                )}
              >
                <SeloSvg selo={{ ...atual, forma: f }} tamanho={34} titulo={false} />
                {FORMAS[f]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Rotulo>Símbolo</Rotulo>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
            {(Object.keys(SIMBOLOS) as SimboloSelo[]).map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={simbolo === s}
                title={SIMBOLOS[s]}
                onClick={() => desenho(setSimbolo)(s)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[0.68rem] font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
                  simbolo === s ? "bg-foreground text-background" : "bg-muted/70 text-muted-foreground hover:bg-muted-hover",
                )}
              >
                <SeloSvg
                  selo={{ ...atual, forma: "circulo", simbolo: s, letra: s === "letra" ? letra || "Aa" : null }}
                  tamanho={28}
                  titulo={false}
                />
                <span className="w-full truncate text-center">{SIMBOLOS[s]}</span>
              </button>
            ))}
          </div>
          {simbolo === "letra" && (
            <div className="mt-3 max-w-56">
              <CampoTexto
                label="Letras do selo"
                value={letra}
                onChange={(v) => desenho(setLetra)(v.toUpperCase().slice(0, 3))}
                maxLength={3}
                placeholder="Ex.: R ou VPJ"
                descricao="Até 3 letras ou números."
              />
            </div>
          )}
        </div>

        <div>
          <Rotulo
            extra={
              <span className="flex items-center gap-2">
                <span className="size-5 rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.1)]" style={{ background: cor }} />
                <InputTexto
                  aria-label="Cor em hexadecimal"
                  value={corDigitada}
                  onChange={(e) => mudarCor(e.currentTarget.value.trim().slice(0, 7))}
                  classeCaixa="h-8 w-28"
                  className="font-mono text-xs uppercase"
                />
              </span>
            }
          >
            Cor
          </Rotulo>
          <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
            {CORES_SELO.map((c) => (
              <button
                key={c.cor}
                type="button"
                title={c.nome}
                aria-label={c.nome}
                aria-pressed={cor === c.cor}
                onClick={() => mudarCor(c.cor)}
                className="grid aspect-square place-items-center rounded-full transition-transform outline-none hover:scale-110 focus-visible:ring-3 focus-visible:ring-ring/40"
                style={{ background: c.cor }}
              >
                {cor === c.cor && <Check className="size-4 text-white drop-shadow" strokeWidth={3} />}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-muted/70 p-4">
          <CampoSwitch
            label="Ativo no site"
            descricao="Desativado, o selo some do site e dos filtros, mas continua marcado nos pratos para quando voltar."
            value={ativo}
            onChange={setAtivo}
          />
        </div>
      </div>
    </PainelLateral>
  );
}

/** `sessao` muda a cada abertura: um "novo selo" sempre começa em branco. */
export default function EditorSelo({
  editando,
  sessao,
  onFechar,
}: {
  editando: SeloDef | "novo" | null;
  sessao: number;
  onFechar: () => void;
}) {
  const atual = useUltimo(editando);
  if (!atual) return null;
  const selo = atual === "novo" ? null : atual;
  return <Formulario key={`${selo?.id ?? "novo"}-${sessao}`} selo={selo} aberto={editando !== null} onFechar={onFechar} />;
}
