"use client";

import { MoreHorizontal, type LucideIcon } from "lucide-react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";

import { NumeroAnimado } from "@/components/sistema/movimento";
import { Button, buttonVariants } from "@/components/sistema/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/sistema/ui/dropdown-menu";
import { Card } from "@/components/sistema/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/sistema/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/sistema/ui/sheet";
import { cn } from "@/lib/utils";

import { areaDe } from "./nav";

/** Cabeçalho padrão das páginas do painel, com o ícone da área na cor dela. */
export function Cabecalho({
  titulo,
  descricao,
  acoes,
}: {
  titulo: string;
  descricao?: string;
  acoes?: ReactNode;
}) {
  const pathname = usePathname();
  const area = areaDe(pathname);
  return (
    <header className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
      <div className="flex min-w-0 items-start gap-3.5">
        {area && <SeloIcone icone={area.Icone} className="mt-0.5 size-10 rounded-[14px] max-sm:hidden" />}
        <div className="min-w-0">
          <h1 className="text-2xl leading-8 font-semibold tracking-tight text-balance">{titulo}</h1>
          {descricao && <p className="mt-1.5 max-w-2xl text-sm text-pretty text-muted-foreground">{descricao}</p>}
        </div>
      </div>
      {acoes && <div className="flex flex-wrap items-center gap-2 md:shrink-0 md:justify-end">{acoes}</div>}
    </header>
  );
}

// Classes completas: o Tailwind só gera as que aparecem escritas no código.
const TONS = {
  neutro: "bg-muted text-muted-foreground",
  marca: "bg-marca-suave text-marca-texto",
  positivo: "bg-positivo/12 text-positivo-texto",
  negativo: "bg-negativo/10 text-negativo-texto",
  atencao: "bg-atencao/14 text-atencao-texto",
  info: "bg-info/10 text-info-texto",
  /** Cor da área do painel em que a página está (data-secao no Shell). */
  secao: "bg-secao/12 text-secao-texto",
} as const;

export type Tom = keyof typeof TONS;

/** Selo de situação (reserva confirmada, prato esgotado…): mesmo formato em todo o painel. */
export function Selo({
  tom = "neutro",
  ponto,
  children,
  className,
}: {
  tom?: Tom;
  ponto?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium whitespace-nowrap [&_svg]:size-3",
        TONS[tom],
        className,
      )}
    >
      {ponto && <span className="size-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}

/** Quadrado arredondado com o ícone, à esquerda de títulos de bloco. */
export function SeloIcone({ icone: Icone, tom = "secao", className }: { icone: LucideIcon; tom?: Tom; className?: string }) {
  return (
    <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", TONS[tom], className)}>
      <Icone className="size-[18px]" strokeWidth={1.75} aria-hidden />
    </span>
  );
}

/** Indicador numérico do painel: ícone, número grande que conta ao aparecer e uma linha de contexto. */
export function Kpi({
  rotulo,
  valor,
  sufixo,
  detalhe,
  icone,
  tom = "neutro",
}: {
  rotulo: string;
  valor: number;
  sufixo?: string;
  detalhe?: ReactNode;
  icone: LucideIcon;
  tom?: Tom;
}) {
  return (
    <Card className="h-full gap-3">
      <div className="flex items-center justify-between gap-3 px-(--card-spacing)">
        <p className="text-[13px] font-medium text-muted-foreground">{rotulo}</p>
        <SeloIcone icone={icone} tom={tom} className="size-8 rounded-lg" />
      </div>
      <p className="px-(--card-spacing) text-[2rem] leading-none font-semibold tracking-tight">
        <NumeroAnimado valor={valor} />
        {sufixo && <span className="ml-0.5 text-xl font-medium text-muted-foreground">{sufixo}</span>}
      </p>
      {detalhe && <p className="px-(--card-spacing) text-[13px] leading-snug text-muted-foreground">{detalhe}</p>}
    </Card>
  );
}

/** Bloco de formulário ou ajustes: selo de ícone, título, descrição e o conteúdo. */
export function Secao({
  icone,
  titulo,
  descricao,
  acoes,
  children,
  className,
}: {
  icone?: LucideIcon;
  titulo: string;
  descricao?: string;
  acoes?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("gap-5", className)}>
      <div className="flex items-start gap-3 px-(--card-spacing)">
        {icone && <SeloIcone icone={icone} />}
        <div className="min-w-0 grow">
          <h2 className="text-[15px] leading-[22px] font-semibold">{titulo}</h2>
          {descricao && <p className="mt-0.5 text-sm text-muted-foreground">{descricao}</p>}
        </div>
        {acoes && <div className="shrink-0">{acoes}</div>}
      </div>
      <div className="@container flex flex-col gap-5 px-(--card-spacing)">{children}</div>
    </Card>
  );
}

/** Link do Next com a aparência de botão. */
export function BotaoLink({
  href,
  variant = "default",
  size = "default",
  className,
  children,
}: {
  href: string;
  variant?: "default" | "secondary" | "ghost" | "marca";
  size?: "default" | "sm" | "lg";
  className?: string;
  children: ReactNode;
}) {
  return (
    <NextLink href={href} className={cn(buttonVariants({ variant, size }), "rounded-full", className)}>
      {children}
    </NextLink>
  );
}

/**
 * Janela central, para formulários curtos (até uns 4 campos). Cabeçalho e
 * rodapé fixos; só o meio rola, então os botões nunca somem em tela baixa.
 */
/**
 * Rodapé fixo abaixo de uma área que rola (o elemento logo antes dele). O
 * esmaecimento acima só aparece quando ainda há conteúdo para baixo: sem
 * rolagem, ele parecia esconder algo que não existe.
 */
function RodapeRolagem({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [mais, setMais] = useState(false);

  useEffect(() => {
    const rolagem = ref.current?.previousElementSibling;
    if (!(rolagem instanceof HTMLElement)) return;
    const medir = () => setMais(rolagem.scrollHeight - rolagem.scrollTop - rolagem.clientHeight > 1);
    // O ResizeObserver já mede na primeira observação e de novo quando o conteúdo muda de tamanho.
    const tamanho = new ResizeObserver(medir);
    tamanho.observe(rolagem);
    for (const filho of rolagem.children) tamanho.observe(filho);
    rolagem.addEventListener("scroll", medir, { passive: true });
    return () => {
      tamanho.disconnect();
      rolagem.removeEventListener("scroll", medir);
    };
  }, []);

  return (
    <div ref={ref} data-mais={mais || undefined} className={cn("rodape-de-painel", className)}>
      {children}
    </div>
  );
}

export function Janela({
  aberta,
  aoFechar,
  icone,
  titulo,
  descricao,
  rodape,
  largura = "sm:max-w-lg",
  children,
}: {
  aberta: boolean;
  aoFechar: () => void;
  icone?: LucideIcon;
  titulo: string;
  descricao?: string;
  rodape?: ReactNode;
  largura?: string;
  children: ReactNode;
}) {
  return (
    <Dialog open={aberta} onOpenChange={(v) => !v && aoFechar()}>
      <DialogContent className={cn("flex max-h-[min(92dvh,52rem)] flex-col gap-0 p-0", largura)}>
        <DialogHeader className="shrink-0 flex-row items-center gap-3 px-6 pt-6 pb-4 pr-14">
          {icone && <SeloIcone icone={icone} />}
          <div className="min-w-0">
            <DialogTitle className="text-[17px] font-semibold">{titulo}</DialogTitle>
            <DialogDescription className={descricao ? "mt-0.5" : "sr-only"}>{descricao ?? titulo}</DialogDescription>
          </div>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-1 pb-6">{children}</div>
        {rodape && (
          <RodapeRolagem className="flex shrink-0 flex-col-reverse gap-2 rounded-b-3xl bg-dialogo px-6 py-4 sm:flex-row sm:justify-end">
            {rodape}
          </RodapeRolagem>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Painel lateral flutuante, para formulários longos e fichas. Cabeçalho e
 * rodapé fixos; só o meio rola.
 */
export function PainelLateral({
  aberto,
  aoFechar,
  icone,
  titulo,
  descricao,
  topo,
  rodape,
  largura = "data-[side=right]:sm:max-w-lg",
  children,
}: {
  aberto: boolean;
  aoFechar: () => void;
  icone?: LucideIcon;
  titulo: string;
  descricao?: string;
  /** Substitui o ícone (ex.: avatar do cliente) */
  topo?: ReactNode;
  rodape?: ReactNode;
  largura?: string;
  children: ReactNode;
}) {
  return (
    <Sheet open={aberto} onOpenChange={(v) => !v && aoFechar()}>
      <SheetContent side="right" className={cn("gap-0 data-[side=right]:w-full", largura)}>
        <SheetHeader className="shrink-0 flex-row items-center gap-3 px-5 pt-5 pb-4 pr-14">
          {topo ?? (icone && <SeloIcone icone={icone} />)}
          <div className="min-w-0">
            <SheetTitle className="truncate text-[17px] font-semibold">{titulo}</SheetTitle>
            <SheetDescription className={descricao ? "truncate" : "sr-only"}>{descricao ?? titulo}</SheetDescription>
          </div>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-5 pt-1 pb-8">{children}</div>
        {rodape && (
          <RodapeRolagem className="flex shrink-0 items-center gap-2 bg-dialogo px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {rodape}
          </RodapeRolagem>
        )}
      </SheetContent>
    </Sheet>
  );
}

export type AcaoMenu = {
  id: string;
  rotulo: string;
  icone: LucideIcon;
  perigo?: boolean;
  desabilitada?: boolean;
  /** Linha divisória antes do item */
  separar?: boolean;
};

/**
 * Botão "…" com o menu de ações de um item.
 *
 * Não modal, e a ação só roda depois que o menu fecha: várias ações abrem um
 * Sheet ou Dialog, e dois modais do Radix trocando de lugar deixavam o
 * `pointer-events: none` preso no body (o painel parava de aceitar cliques).
 */
export function MenuAcoes({
  rotulo,
  acoes,
  aoEscolher,
}: {
  rotulo: string;
  acoes: (AcaoMenu | null | false)[];
  aoEscolher: (id: string) => void;
}) {
  const escolhida = useRef<string | null>(null);
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="rounded-full" aria-label={rotulo}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-60"
        onCloseAutoFocus={(e) => {
          const id = escolhida.current;
          if (id === null) return;
          escolhida.current = null;
          // O foco vai para o que a ação abrir, não de volta ao botão "…".
          e.preventDefault();
          aoEscolher(id);
        }}
      >
        {acoes.filter(Boolean).map((a) => {
          const { id, rotulo: texto, icone: Icone, perigo, desabilitada, separar } = a as AcaoMenu;
          return (
            <Fragment key={id}>
              {separar && <DropdownMenuSeparator />}
              <DropdownMenuItem
                variant={perigo ? "destructive" : "default"}
                disabled={desabilitada}
                onSelect={() => {
                  escolhida.current = id;
                }}
                className="min-h-10 gap-2.5 px-2.5 md:min-h-9"
              >
                <Icone strokeWidth={1.75} />
                {texto}
              </DropdownMenuItem>
            </Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Guarda o último valor não nulo: a janela continua mostrando o conteúdo
 * enquanto fecha (animação de saída), mesmo depois de o estado virar null.
 */
export function useUltimo<T>(valor: T | null): T | null {
  const [ultimo, setUltimo] = useState(valor);
  if (valor !== null && valor !== ultimo) setUltimo(valor);
  return valor ?? ultimo;
}

/** Lista dentro de card, com divisórias finas. */
export function ListaCard({ children, className }: { children: ReactNode; className?: string }) {
  return <ul className={cn("divide-y divide-border", className)}>{children}</ul>;
}
