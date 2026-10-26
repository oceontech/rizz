"use client";

import { ExternalLink, Lock, LogOut, MoreHorizontal, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import garfo from "@/assets/marca/garfo-branco.png";
import Logo from "@/components/brand/Logo";
import { MOLA, TransicaoPagina } from "@/components/sistema/movimento";
import { BotaoTema } from "@/components/sistema/tema/botao-tema";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/sistema/ui/drawer";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/sistema/ui/tooltip";
import { sair } from "@/lib/admin/sessao-actions";
import { cn } from "@/lib/utils";

import { COOKIE_SIDEBAR, NAV, NAV_BARRA, areaDe, ativo, type Secao } from "./nav";

type Props = {
  usuario: { nome: string; email: string };
  pendentes: number;
  recolhidaInicial: boolean;
  children: React.ReactNode;
};

const LARGURA = { aberta: 280, recolhida: 84 };

const GRUPOS = [
  ["restaurante", "Restaurante"],
  ["site", "Site"],
] as const;

function iniciais(nome: string) {
  return nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

/** Dica ao lado do item quando a sidebar está recolhida. */
function ComDica({ ativa, texto, children }: { ativa: boolean; texto: string; children: React.ReactElement }) {
  if (!ativa) return children;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={12}>
        {texto}
      </TooltipContent>
    </Tooltip>
  );
}

function ItemNav({
  href,
  rotulo,
  Icone,
  secao,
  emBreve,
  atual,
  recolhida,
  contexto,
  contador,
  aoNavegar,
}: {
  href: string;
  rotulo: string;
  Icone: (typeof NAV)[number]["Icone"];
  secao: Secao;
  emBreve?: boolean;
  atual: boolean;
  recolhida: boolean;
  contexto: string;
  contador?: number;
  aoNavegar?: () => void;
}) {
  if (emBreve) {
    return (
      <li data-secao={secao}>
        <ComDica ativa={recolhida} texto={`${rotulo} · em breve`}>
          <span
            aria-disabled
            className={cn(
              "flex h-11 cursor-not-allowed items-center rounded-full text-[0.9rem] font-medium text-sidebar-foreground/45 select-none",
              recolhida ? "-mx-1 w-11 justify-center" : "gap-3 px-3",
            )}
          >
            <Icone className="size-5 shrink-0" strokeWidth={1.75} aria-hidden />
            <span className={recolhida ? "sr-only" : "flex-1 truncate"}>
              {rotulo}
              {recolhida && " (em breve)"}
            </span>
            {!recolhida && (
              <span className="flex h-5 items-center gap-1 rounded-full bg-white/8 px-2 text-[0.65rem] font-semibold tracking-wide text-sidebar-muted uppercase">
                <Lock className="size-2.5" strokeWidth={2.5} aria-hidden />
                Em breve
              </span>
            )}
          </span>
        </ComDica>
      </li>
    );
  }

  return (
    <li data-secao={secao}>
      <ComDica ativa={recolhida} texto={contador ? `${rotulo} · ${contador} a confirmar` : rotulo}>
        <Link
          href={href}
          onClick={aoNavegar}
          aria-current={atual ? "page" : undefined}
          className={cn(
            "group/item relative flex h-11 items-center rounded-full text-[0.9rem] font-medium outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-sidebar-ring",
            recolhida ? "-mx-1 w-11 justify-center" : "gap-3 px-3",
            atual
              ? "text-sidebar-primary-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          )}
        >
          {atual && (
            <motion.span
              layoutId={`item-ativo-${contexto}`}
              className="absolute inset-0 rounded-full bg-sidebar-primary ring-1 ring-white/6 ring-inset"
              transition={MOLA}
            />
          )}
          {/* O ícone leva a cor da área: aceso no item atual, discreto no hover */}
          <Icone
            className={cn(
              "relative size-5 shrink-0 transition-colors",
              atual ? "text-secao-sidebar" : "group-hover/item:text-secao-sidebar",
            )}
            strokeWidth={1.75}
            aria-hidden
          />
          {Boolean(contador) && recolhida && (
            <span className="absolute top-2 right-2 size-2.5 rounded-full border-2 border-sidebar bg-ambar" aria-hidden />
          )}
          <span className={recolhida ? "sr-only" : "relative flex-1 truncate"}>{rotulo}</span>
          {Boolean(contador) && !recolhida && (
            <span className="numeros relative grid h-5 min-w-5 place-items-center rounded-full bg-ambar px-1.5 text-[0.7rem] font-bold text-[#2b0710]">
              {contador}
              <span className="sr-only"> a confirmar</span>
            </span>
          )}
        </Link>
      </ComDica>
    </li>
  );
}

function ConteudoSidebar({
  usuario,
  pendentes,
  recolhida,
  contexto,
  aoNavegar,
}: {
  usuario: Props["usuario"];
  pendentes: number;
  recolhida: boolean;
  contexto: string;
  aoNavegar?: () => void;
}) {
  const pathname = usePathname();
  const item = (n: (typeof NAV)[number]) => (
    <ItemNav
      key={n.href}
      href={n.href}
      rotulo={n.rotulo}
      Icone={n.Icone}
      secao={n.secao}
      emBreve={n.emBreve}
      atual={ativo(pathname, n.href)}
      recolhida={recolhida}
      contexto={contexto}
      contador={n.href === "/admin/reservas" ? pendentes : undefined}
      aoNavegar={aoNavegar}
    />
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <nav aria-label="Seções do painel" className="-mx-3 min-h-0 flex-1 overflow-y-auto px-3 [scrollbar-width:none]">
        {GRUPOS.map(([grupo, titulo], i) => (
          <div key={grupo} className={cn(i > 0 && "mt-5 baixa:mt-3")}>
            <p
              className={cn(
                "mb-2 h-4 px-3 text-[0.68rem] font-semibold tracking-[0.08em] text-sidebar-muted uppercase transition-opacity",
                recolhida && "opacity-0",
              )}
              aria-hidden
            >
              {titulo}
            </p>
            <ul className="flex flex-col gap-1">{NAV.filter((n) => n.grupo === grupo).map(item)}</ul>
          </div>
        ))}
      </nav>

      <div className="mt-2 flex shrink-0 flex-col gap-3 border-t border-sidebar-border pt-4 baixa:gap-2 baixa:pt-3">
        <ul className="flex flex-col gap-1">
          {NAV.filter((n) => n.grupo === "rodape").map(item)}
          <li>
            <ComDica ativa={recolhida} texto="Ver o site">
              {/* <a> de propósito: o site é outro root layout */}
              <a
                href="/"
                target="_blank"
                rel="noopener"
                className={cn(
                  "flex h-11 items-center rounded-full text-[0.9rem] font-medium text-sidebar-foreground outline-none transition-colors hover:bg-sidebar-accent hover:text-white focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                  recolhida ? "-mx-1 w-11 justify-center" : "gap-3 px-3",
                )}
              >
                <ExternalLink className="size-5 shrink-0" strokeWidth={1.75} aria-hidden />
                <span className={recolhida ? "sr-only" : "flex-1"}>Ver o site</span>
              </a>
            </ComDica>
          </li>
        </ul>

        <div
          className={cn(
            "flex items-center gap-2 rounded-2xl bg-white/5 p-2",
            recolhida && "flex-col gap-3 bg-transparent p-0",
          )}
        >
          <ComDica ativa={recolhida} texto={usuario.nome}>
            <Link
              href="/admin/configuracoes"
              onClick={aoNavegar}
              className={cn(
                "flex min-w-0 items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                !recolhida && "flex-1 p-0.5",
              )}
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-marca text-xs font-semibold text-white">
                {iniciais(usuario.nome)}
              </span>
              {!recolhida && (
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-white">{usuario.nome}</span>
                  <span className="block truncate text-xs text-sidebar-muted">{usuario.email}</span>
                </span>
              )}
            </Link>
          </ComDica>
          <form action={sair} className="flex">
            <ComDica ativa texto="Sair">
              <button
                type="submit"
                aria-label="Sair"
                className="grid size-9 shrink-0 place-items-center rounded-full text-sidebar-muted outline-none transition-colors hover:bg-sidebar-accent hover:text-white focus-visible:ring-2 focus-visible:ring-sidebar-ring"
              >
                <LogOut className="size-[18px]" strokeWidth={1.75} />
              </button>
            </ComDica>
          </form>
        </div>
      </div>
    </div>
  );
}

function BotaoRecolher({ recolhida, aoClicar }: { recolhida: boolean; aoClicar: () => void }) {
  const Icone = recolhida ? PanelLeftOpen : PanelLeftClose;
  const rotulo = recolhida ? "Expandir menu" : "Recolher menu";
  return (
    <ComDica ativa texto={rotulo}>
      <button
        type="button"
        onClick={aoClicar}
        aria-label={rotulo}
        className="grid size-9 place-items-center rounded-full text-sidebar-muted outline-none transition-colors hover:bg-sidebar-accent hover:text-white focus-visible:ring-2 focus-visible:ring-sidebar-ring"
      >
        <Icone className="size-[18px]" strokeWidth={1.75} />
      </button>
    </ComDica>
  );
}

/** Barra inferior em pílula (celular), com o restante das seções no "Mais". */
function BarraCelular({ usuario, pendentes }: { usuario: Props["usuario"]; pendentes: number }) {
  const pathname = usePathname();
  const [mais, setMais] = useState(false);
  const foraDaBarra = !NAV_BARRA.some((h) => ativo(pathname, h));

  return (
    <>
      <nav
        aria-label="Atalhos"
        className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 lg:hidden"
      >
        <ul className="mx-auto grid max-w-md grid-cols-5 rounded-full bg-sidebar p-1.5 shadow-modal">
          {NAV.filter((n) => NAV_BARRA.includes(n.href)).map(({ href, curto, Icone, secao }) => {
            const atual = ativo(pathname, href);
            return (
              <li key={href} data-secao={secao}>
                <Link
                  href={href}
                  aria-current={atual ? "page" : undefined}
                  className={cn(
                    "relative flex h-14 flex-col items-center justify-center gap-0.5 rounded-full text-[0.68rem] font-medium transition-colors",
                    atual ? "text-white" : "text-sidebar-muted",
                  )}
                >
                  {atual && (
                    <motion.span layoutId="barra-ativa" className="absolute inset-0 rounded-full bg-sidebar-primary" transition={MOLA} />
                  )}
                  <Icone className={cn("relative size-5", atual && "text-secao-sidebar")} strokeWidth={1.75} aria-hidden />
                  <span className="relative">{curto}</span>
                  {href === "/admin/reservas" && pendentes > 0 && (
                    <span className="numeros absolute top-1.5 right-[18%] grid h-4 min-w-4 place-items-center rounded-full bg-ambar px-1 text-[0.6rem] font-bold text-[#2b0710]">
                      {pendentes}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setMais(true)}
              className={cn(
                "relative flex h-14 w-full flex-col items-center justify-center gap-0.5 rounded-full text-[0.68rem] font-medium",
                foraDaBarra ? "bg-sidebar-primary text-white ring-1 ring-white/6 ring-inset" : "text-sidebar-muted",
              )}
            >
              <MoreHorizontal className="size-5" strokeWidth={1.75} aria-hidden />
              Mais
            </button>
          </li>
        </ul>
      </nav>

      <Drawer open={mais} onOpenChange={setMais}>
        <DrawerContent className="bg-sidebar text-sidebar-foreground">
          <DrawerTitle className="sr-only">Menu do painel</DrawerTitle>
          <DrawerDescription className="sr-only">Todas as seções do painel</DrawerDescription>
          <div className="flex max-h-[75dvh] flex-col px-4 pt-4 pb-6">
            <ConteudoSidebar
              usuario={usuario}
              pendentes={pendentes}
              recolhida={false}
              contexto="gaveta"
              aoNavegar={() => setMais(false)}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default function Shell({ usuario, pendentes, recolhidaInicial, children }: Props) {
  const pathname = usePathname();
  const area = areaDe(pathname);
  const [recolhida, setRecolhida] = useState(recolhidaInicial);

  function alternar() {
    const nova = !recolhida;
    setRecolhida(nova);
    document.cookie = `${COOKIE_SIDEBAR}=${nova ? "recolhida" : "aberta"}; path=/admin; max-age=31536000; samesite=lax`;
  }

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      {/* Sidebar escura e flutuante — desktop */}
      <motion.aside
        initial={false}
        animate={{ width: LARGURA[recolhida ? "recolhida" : "aberta"] }}
        transition={MOLA}
        className="sticky top-0 hidden h-dvh shrink-0 p-3 lg:block"
      >
        <div className="flex h-full flex-col overflow-hidden rounded-[28px] bg-sidebar px-3 py-5 text-sidebar-foreground baixa:py-4 dark:border dark:border-sidebar-border">
          <div
            className={cn(
              "mb-7 flex h-10 shrink-0 items-center baixa:mb-4",
              recolhida ? "flex-col gap-3" : "justify-between pr-1 pl-3",
            )}
          >
            <Link
              href="/admin"
              aria-label="Rizz, visão geral"
              className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
            >
              {recolhida ? (
                <Image src={garfo} alt="" className="h-7 w-auto" sizes="40px" />
              ) : (
                <Logo variante="branca" decorativo className="h-auto w-[84px]" sizes="84px" />
              )}
            </Link>
            {!recolhida && <BotaoRecolher recolhida={recolhida} aoClicar={alternar} />}
          </div>
          {recolhida && (
            <div className="-mt-2 mb-5 flex justify-center">
              <BotaoRecolher recolhida={recolhida} aoClicar={alternar} />
            </div>
          )}
          <ConteudoSidebar usuario={usuario} pendentes={pendentes} recolhida={recolhida} contexto="desktop" />
        </div>
      </motion.aside>

      {/* Topo — celular */}
      <header className="sticky top-0 z-30 flex items-center justify-between bg-background/80 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 backdrop-blur-xl lg:hidden">
        <Link href="/admin" aria-label="Rizz, visão geral" className="grid h-11 place-items-center">
          <Logo variante="vinho" decorativo className="h-auto w-16 dark:hidden" sizes="64px" />
          <Logo variante="branca" decorativo className="hidden h-auto w-16 dark:block" sizes="64px" />
        </Link>
        <BotaoTema />
      </header>

      <div className="relative flex min-w-0 flex-1 flex-col px-4 pb-32 lg:px-8 lg:pt-6 lg:pb-12">
        {/* Tema no canto, fora do fluxo; o primeiro cabeçalho da página deixa o espaço dele */}
        <div className="absolute top-6 right-8 z-10 hidden lg:block">
          <BotaoTema className="bg-card shadow-suave hover:bg-accent" />
        </div>
        <main
          data-secao={area?.secao}
          className="mx-auto mt-2 w-full max-w-[1240px] flex-1 lg:mt-1 lg:[&_header:first-of-type]:pr-14"
        >
          <TransicaoPagina key={pathname}>{children}</TransicaoPagina>
        </main>
      </div>

      <BarraCelular usuario={usuario} pendentes={pendentes} />
    </div>
  );
}
