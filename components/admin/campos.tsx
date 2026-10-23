"use client";

/**
 * Kit de campos do painel, sobre o sistema de componentes (components/sistema).
 * Nenhum controle nativo à vista: datas, horas, listas e números usam os
 * pickers e smart inputs próprios. Cada wrapper recebe e devolve valores
 * simples (string, number, "AAAA-MM-DD", "HH:MM").
 */

import { addDays, endOfMonth, format, parse, startOfMonth } from "date-fns";
import { CalendarRange, ImagePlus, Loader2, Minus, Plus, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useId, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { Campo } from "@/components/sistema/formulario/campo";
import { BotaoInterno } from "@/components/sistema/inputs/caixa";
import { InputData, InputHora } from "@/components/sistema/inputs/input-data";
import { InputMoeda } from "@/components/sistema/inputs/input-moeda";
import { InputInteiro } from "@/components/sistema/inputs/input-numero";
import { InputTelefone } from "@/components/sistema/inputs/input-telefone";
import { AreaTexto, InputTexto } from "@/components/sistema/inputs/input-texto";
import { InputEmail, InputUrl } from "@/components/sistema/inputs/input-web";
import { ControleSegmentado } from "@/components/sistema/pickers/controle-segmentado";
import { GatilhoCampo } from "@/components/sistema/pickers/gatilho-campo";
import { PainelAdaptavel } from "@/components/sistema/pickers/painel-adaptavel";
import { Seletor } from "@/components/sistema/pickers/seletor";
import { ConteudoIntervalo } from "@/components/sistema/pickers/seletor-intervalo";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/sistema/ui/alert-dialog";
import { Button } from "@/components/sistema/ui/button";
import { Switch } from "@/components/sistema/ui/switch";
import { enviarImagem } from "@/lib/admin/cardapio-actions";
import { cn } from "@/lib/utils";

type Comum = {
  label: string;
  descricao?: string;
  className?: string;
  /** Mostra o rótulo só para leitores de tela (filtros soltos na página) */
  ocultarLabel?: boolean;
};

/** Rótulo + controle + ajuda, ligados por id. */
function Moldura({ label, descricao, className, ocultarLabel, children }: Comum & { children: ReactNode }) {
  const id = useId();
  if (ocultarLabel) return <div className={cn("min-w-0", className)}>{children}</div>;
  return (
    <Campo id={id} rotulo={label} ajuda={descricao} className={className}>
      {children}
    </Campo>
  );
}

// ─── Texto ─────────────────────────────────────────────────────

export function CampoTexto({
  label,
  value,
  onChange,
  placeholder,
  descricao,
  obrigatorio,
  multilinha,
  linhas = 3,
  tipo = "text",
  maxLength,
  className,
  autoFocus,
}: Comum & {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  obrigatorio?: boolean;
  multilinha?: boolean;
  linhas?: number;
  tipo?: "text" | "email" | "url";
  maxLength?: number;
  autoFocus?: boolean;
}) {
  const comuns = { placeholder, required: obrigatorio, autoFocus, maxLength };
  return (
    <Moldura label={label} descricao={descricao} className={className}>
      {multilinha ? (
        <AreaTexto {...comuns} rows={linhas} value={value} onChange={(e) => onChange(e.currentTarget.value)} />
      ) : tipo === "email" ? (
        <InputEmail {...comuns} valor={value} aoMudar={(v) => onChange(v ?? "")} />
      ) : tipo === "url" ? (
        <InputUrl {...comuns} valor={value} aoMudar={(v) => onChange(v ?? "")} />
      ) : (
        <InputTexto {...comuns} value={value} onChange={(e) => onChange(e.currentTarget.value)} />
      )}
    </Moldura>
  );
}

/** WhatsApp com "+55" fixo; devolve só os dígitos (com o 55, que o servidor normaliza). */
export function CampoTelefone({
  label,
  value,
  onChange,
  descricao,
  className,
  autoFocus,
}: Comum & { value: string; onChange: (v: string) => void; autoFocus?: boolean }) {
  return (
    <Moldura label={label} descricao={descricao} className={className}>
      <InputTelefone valor={value} aoMudar={(v) => onChange(v ?? "")} autoFocus={autoFocus} />
    </Moldura>
  );
}

// ─── Números ───────────────────────────────────────────────────

/** Inteiro com botões de − e + (pessoas, lugares, minutos). */
export function CampoNumero({
  label,
  value,
  onChange,
  min,
  max,
  passo = 1,
  unidade,
  descricao,
  desabilitado,
  className,
}: Comum & {
  value: number | null;
  onChange: (v: number | null) => void;
  min?: number;
  max?: number;
  passo?: number;
  /** Texto fixo à direita (ex.: "min", "%") */
  unidade?: string;
  desabilitado?: boolean;
}) {
  const limitar = (n: number) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n));
  const passar = (sinal: 1 | -1) => onChange(limitar((value ?? min ?? 0) + sinal * passo));

  return (
    <Moldura label={label} descricao={descricao} className={className}>
      <InputInteiro
        valor={value}
        aoMudar={(v) => onChange(v === null ? null : v)}
        onBlur={() => value !== null && value !== limitar(value) && onChange(limitar(value))}
        disabled={desabilitado}
        sufixo={unidade}
        acao={
          <span className="flex items-center gap-0.5">
            <BotaoInterno aria-label="Diminuir" disabled={desabilitado || (min !== undefined && (value ?? 0) <= min)} onClick={() => passar(-1)}>
              <Minus />
            </BotaoInterno>
            <BotaoInterno aria-label="Aumentar" disabled={desabilitado || (max !== undefined && (value ?? 0) >= max)} onClick={() => passar(1)}>
              <Plus />
            </BotaoInterno>
          </span>
        }
      />
    </Moldura>
  );
}

/** Valor em R$, com digitação da direita para a esquerda. */
export function CampoMoeda({
  label,
  value,
  onChange,
  descricao,
  desabilitado,
  className,
}: Comum & { value: number | null; onChange: (v: number | null) => void; desabilitado?: boolean }) {
  return (
    <Moldura label={label} descricao={descricao} className={className}>
      <InputMoeda valor={value} aoMudar={onChange} disabled={desabilitado} />
    </Moldura>
  );
}

// ─── Seleção ───────────────────────────────────────────────────

export type Opcao = { id: string; rotulo: string; descricao?: string };

export function CampoSelect({
  label,
  value,
  onChange,
  opcoes,
  placeholder = "Selecione",
  descricao,
  className,
  ocultarLabel,
  variante = "campo",
}: Comum & {
  value: string | null;
  onChange: (v: string) => void;
  opcoes: Opcao[];
  placeholder?: string;
  variante?: "campo" | "pilula" | "pilula-clara";
}) {
  return (
    <Moldura label={label} descricao={descricao} className={className} ocultarLabel={ocultarLabel}>
      <Seletor
        aria-label={ocultarLabel ? label : undefined}
        valor={value ?? undefined}
        aoMudar={onChange}
        placeholder={placeholder}
        variante={variante}
        opcoes={opcoes.map((o) => ({ valor: o.id, rotulo: o.rotulo, descricao: o.descricao }))}
      />
    </Moldura>
  );
}

/** Poucas opções lado a lado (turno, tipo de bloqueio): controle segmentado na largura do campo. */
export function CampoOpcoes<T extends string>({
  label,
  value,
  onChange,
  opcoes,
  descricao,
  className,
}: Comum & { value: T; onChange: (v: T) => void; opcoes: { id: T; rotulo: string }[] }) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <span className="text-sm font-medium">{label}</span>
      <ControleSegmentado
        rotulo={label}
        valor={value}
        aoMudar={onChange}
        opcoes={opcoes.map((o) => ({ valor: o.id, rotulo: o.rotulo }))}
        className="flex w-full [&>button]:flex-1"
      />
      {descricao && <p className="text-[0.8rem] leading-snug text-muted-foreground">{descricao}</p>}
    </div>
  );
}

/** Liga/desliga com o texto clicável ao lado. */
export function CampoSwitch({
  label,
  descricao,
  value,
  onChange,
  className,
}: {
  label: string;
  descricao?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <label htmlFor={id} className="flex min-w-0 cursor-pointer flex-col gap-0.5">
        <span className="text-sm font-medium">{label}</span>
        {descricao && <span className="text-[0.8rem] leading-snug text-muted-foreground">{descricao}</span>}
      </label>
      <Switch id={id} checked={value} onCheckedChange={onChange} className="mt-0.5" />
    </div>
  );
}

// ─── Data, período e hora ──────────────────────────────────────

const ISO_DATA = /^\d{4}-\d{2}-\d{2}$/;
const ISO_HORA = /^\d{2}:\d{2}$/;

/**
 * Guarda o que está sendo digitado e só avisa quem está fora quando o valor
 * fica completo (ou vazio). Mudança vinda de fora (ex.: reset) vale na hora.
 */
function useBruto(value: string | null, completo: RegExp, onChange: (v: string | null) => void) {
  const [bruto, setBruto] = useState<string | null>(value);
  const atual = bruto === null || completo.test(bruto) ? value : bruto;
  return [
    atual,
    (v: string | null) => {
      setBruto(v);
      if (v === null || completo.test(v)) onChange(v);
    },
  ] as const;
}

export function CampoData({
  label,
  value,
  onChange,
  descricao,
  minimo,
  className,
}: Comum & {
  value: string | null;
  onChange: (v: string | null) => void;
  minimo?: string;
}) {
  const [atual, mudar] = useBruto(value, ISO_DATA, onChange);
  return (
    <Moldura label={label} descricao={descricao} className={className}>
      <InputData valor={atual} aoMudar={mudar} minimo={minimo} />
    </Moldura>
  );
}

export function CampoHora({
  label,
  value,
  onChange,
  descricao,
  passoMinutos = 15,
  className,
}: Comum & {
  value: string | null;
  onChange: (v: string | null) => void;
  passoMinutos?: number;
}) {
  const [atual, mudar] = useBruto(value, ISO_HORA, onChange);
  return (
    <Moldura label={label} descricao={descricao} className={className}>
      <InputHora valor={atual} aoMudar={mudar} passoMinutos={passoMinutos} />
    </Moldura>
  );
}

const ISO = "yyyy-MM-dd";
const lerData = (iso: string) => parse(iso, ISO, new Date());

/** Período de exibição (promoções): atalhos para frente e calendário duplo. */
export function CampoPeriodo({
  label,
  inicio,
  fim,
  onChange,
  descricao,
  className,
}: Comum & {
  inicio: string | null;
  fim: string | null;
  onChange: (inicio: string | null, fim: string | null) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const id = useId();
  const hoje = new Date();
  const valor = inicio && fim ? { de: lerData(inicio), ate: lerData(fim) } : undefined;
  const texto = valor
    ? `${format(valor.de, "dd/MM/yyyy")} → ${format(valor.ate, "dd/MM/yyyy")}`
    : null;

  return (
    <Campo
      id={id}
      rotulo={label}
      ajuda={descricao}
      className={className}
      extra={
        valor ? (
          <button
            type="button"
            onClick={() => onChange(null, null)}
            className="text-[0.8rem] font-medium text-primary-texto hover:underline"
          >
            Sem período
          </button>
        ) : null
      }
    >
      <PainelAdaptavel
        aberto={aberto}
        aoMudar={setAberto}
        titulo={label}
        gatilho={<GatilhoCampo id={id} icone={CalendarRange} valor={texto} placeholder="Sempre (sem período)" />}
      >
        <ConteudoIntervalo
          valor={valor}
          atalhos={[
            { atalho: "hoje", rotulo: "Só hoje", intervalo: { de: hoje, ate: hoje } },
            { atalho: "7d", rotulo: "Próximos 7 dias", intervalo: { de: hoje, ate: addDays(hoje, 6) } },
            { atalho: "15d", rotulo: "Próximos 15 dias", intervalo: { de: hoje, ate: addDays(hoje, 14) } },
            { atalho: "mes", rotulo: "Até o fim do mês", intervalo: { de: hoje, ate: endOfMonth(hoje) } },
            {
              atalho: "proximo",
              rotulo: "Mês que vem",
              intervalo: { de: startOfMonth(addDays(endOfMonth(hoje), 1)), ate: endOfMonth(addDays(endOfMonth(hoje), 1)) },
            },
          ]}
          aoEscolher={(r) => {
            onChange(format(r.de, ISO), format(r.ate, ISO));
            setAberto(false);
          }}
        />
      </PainelAdaptavel>
    </Campo>
  );
}

// ─── Upload de imagem (Vercel Blob) ────────────────────────────

export function UploadImagem({
  label,
  value,
  onChange,
  pasta,
  descricao,
  proporcao = "aspect-[4/3]",
}: {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  pasta: "pratos" | "promocoes";
  descricao?: string;
  proporcao?: string;
}) {
  const entrada = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);
  const [arrastando, setArrastando] = useState(false);

  async function enviar(arquivo: File | undefined) {
    if (!arquivo) return;
    setEnviando(true);
    const form = new FormData();
    form.set("arquivo", arquivo);
    form.set("pasta", pasta);
    const r = await enviarImagem(form);
    setEnviando(false);
    if (r.ok && r.dados) {
      onChange(r.dados);
      toast.success("Imagem enviada");
    } else if (!r.ok) {
      toast.error(r.erro);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      <button
        type="button"
        onClick={() => entrada.current?.click()}
        disabled={enviando}
        onDragOver={(e) => {
          e.preventDefault();
          setArrastando(true);
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastando(false);
          void enviar(e.dataTransfer.files[0]);
        }}
        aria-label={value ? "Trocar foto" : "Enviar foto"}
        className={cn(
          "group relative overflow-hidden rounded-2xl outline-none transition-[background-color,box-shadow] duration-150 focus-visible:ring-3 focus-visible:ring-primary-suave",
          proporcao,
          arrastando ? "bg-primary-suave ring-2 ring-primary/40" : "bg-muted hover:bg-muted-hover",
        )}
      >
        {value ? (
          <>
            <Image src={value} alt="" fill sizes="480px" className="object-cover" />
            <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-linear-to-t from-black/60 to-transparent pt-8 pb-3 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
              <Upload className="size-3.5" /> Trocar foto
            </span>
          </>
        ) : (
          <span className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-muted-foreground">
            <span className="grid size-11 place-items-center rounded-xl bg-card shadow-suave">
              <ImagePlus className="size-5 text-primary-texto" strokeWidth={1.75} />
            </span>
            <span className="text-xs">Arraste uma foto ou toque para enviar</span>
          </span>
        )}
        {enviando && (
          <span className="absolute inset-0 grid place-items-center bg-card/70 backdrop-blur-xs">
            <Loader2 className="size-5 animate-spin text-primary-texto" />
          </span>
        )}
      </button>
      {value && (
        <Button
          type="button"
          size="sm"
          variant="ghost-destructive"
          onClick={() => onChange(null)}
          disabled={enviando}
          className="self-start rounded-full"
        >
          <Trash2 /> Remover foto
        </Button>
      )}
      {descricao && <p className="text-[0.8rem] text-muted-foreground">{descricao}</p>}
      <input
        ref={entrada}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          void enviar(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ─── Confirmação destrutiva ────────────────────────────────────

export function Confirmar({
  aberto,
  onFechar,
  titulo,
  texto,
  rotuloAcao = "Excluir",
  onConfirmar,
}: {
  aberto: boolean;
  onFechar: () => void;
  titulo: string;
  texto: ReactNode;
  rotuloAcao?: string;
  onConfirmar: () => Promise<void> | void;
}) {
  const [pendente, setPendente] = useState(false);
  return (
    <AlertDialog open={aberto} onOpenChange={(v) => !v && !pendente && onFechar()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="rounded-xl bg-negativo/10 text-negativo-texto">
            <Trash2 />
          </AlertDialogMedia>
          <AlertDialogTitle className="text-[17px] font-semibold">{titulo}</AlertDialogTitle>
          <AlertDialogDescription>{texto}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-full" disabled={pendente}>
            Cancelar
          </AlertDialogCancel>
          <Button
            variant="destructive"
            className="rounded-full"
            disabled={pendente}
            onClick={async () => {
              setPendente(true);
              await onConfirmar();
              setPendente(false);
              onFechar();
            }}
          >
            {pendente && <Loader2 className="animate-spin" />}
            {rotuloAcao}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** Botão com estado de "salvando" (rodapés de janela e painel). */
export function BotaoSalvar({
  pendente,
  children,
  className,
  ...props
}: React.ComponentProps<typeof Button> & { pendente?: boolean }) {
  return (
    <Button {...props} disabled={pendente || props.disabled} className={cn("rounded-full", className)}>
      {pendente && <Loader2 className="animate-spin" />}
      {children}
    </Button>
  );
}

/** Mostra o resultado de uma action num aviso; devolve se deu certo. */
export function avisar(r: { ok: boolean; erro?: string }, sucesso: string) {
  if (r.ok) toast.success(sucesso);
  else toast.error(r.erro ?? "Algo deu errado.");
  return r.ok;
}
