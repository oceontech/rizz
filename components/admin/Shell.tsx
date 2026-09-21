"use client";

import { ArrowRightFromSquare, ArrowUpRightFromSquare, Bars, Ellipsis } from "@gravity-ui/icons";
import { Avatar, Button, Drawer, Separator, Tooltip } from "@heroui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import Logo from "@/components/brand/Logo";
import { sair } from "@/lib/admin/sessao-actions";

import { NAV, NAV_BARRA, ativo } from "./nav";

type Props = {
  usuario: { nome: string; email: string };
  pendentes: number;
  children: React.ReactNode;
};

function iniciais(nome: string) {
  return nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

function ListaNav({ pendentes, onNavegar }: { pendentes: number; onNavegar?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Seções do painel" className="flex flex-col gap-1">
      {NAV.map(({ href, rotulo, Icone }) => {
        const atual = ativo(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavegar}
            aria-current={atual ? "page" : undefined}
            className={`group flex h-11 items-center gap-3 rounded-xl px-3 text-sm transition-colors ${
              atual
                ? "bg-accent text-accent-foreground shadow-sm"
                : "text-foreground/75 hover:bg-default hover:text-foreground"
            }`}
          >
            <Icone className="size-[18px] shrink-0" />
            <span className="grow">{rotulo}</span>
            {href === "/admin/reservas" && pendentes > 0 && (
              <span
                className={`min-w-6 rounded-full px-1.5 text-center text-xs font-medium leading-6 ${
                  atual ? "bg-accent-foreground/20" : "bg-warning text-warning-foreground"
                }`}
              >
                {pendentes}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function Rodape({ usuario }: { usuario: Props["usuario"] }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar size="sm" color="accent">
        <Avatar.Fallback>{iniciais(usuario.nome)}</Avatar.Fallback>
      </Avatar>
      <div className="min-w-0 grow">
        <p className="truncate text-sm font-medium">{usuario.nome}</p>
        <p className="truncate text-xs text-muted">{usuario.email}</p>
      </div>
      <form action={sair}>
        <Tooltip delay={300}>
          <Button type="submit" isIconOnly size="sm" variant="ghost" aria-label="Sair">
            <ArrowRightFromSquare />
          </Button>
          <Tooltip.Content>Sair</Tooltip.Content>
        </Tooltip>
      </form>
    </div>
  );
}

export default function Shell({ usuario, pendentes, children }: Props) {
  const pathname = usePathname();
  const [menuAberto, setMenuAberto] = useState(false);
  const atualNav = NAV.find((n) => ativo(pathname, n.href));

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[272px_1fr]">
      {/* Sidebar — desktop */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-border bg-surface px-4 py-6 lg:flex">
        <Link href="/admin" className="flex items-center gap-3 px-2">
          <Logo variante="vinho" decorativo className="h-auto w-24" sizes="96px" />
          <span className="rounded-full bg-default px-2 py-0.5 text-[0.625rem] font-medium uppercase tracking-[0.16em] text-muted">
            Painel
          </span>
        </Link>

        <div className="mt-8 grow overflow-y-auto">
          <ListaNav pendentes={pendentes} />
        </div>

        <a
          href="/"
          target="_blank"
          rel="noopener"
          className="mb-4 flex h-10 items-center gap-2 rounded-xl px-3 text-sm text-muted hover:bg-default hover:text-foreground"
        >
          <ArrowUpRightFromSquare className="size-4" />
          Ver o site
        </a>
        <Separator className="mb-4" />
        <Rodape usuario={usuario} />
      </aside>

      <div className="flex min-w-0 flex-col">
        {/* Barra superior — celular e tablet */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-surface/90 px-3 backdrop-blur lg:hidden">
          <Button
            isIconOnly
            variant="ghost"
            aria-label="Abrir menu"
            onPress={() => setMenuAberto(true)}
          >
            <Bars />
          </Button>
          <p className="grow truncate text-center text-sm font-medium">
            {atualNav?.rotulo ?? "Painel"}
          </p>
          <Logo variante="vinho" decorativo className="h-auto w-14" sizes="56px" />
        </header>

        <main className="mx-auto w-full max-w-[1280px] grow px-4 pb-28 pt-5 sm:px-6 lg:px-10 lg:pb-12 lg:pt-8">
          {children}
        </main>
      </div>

      {/* Barra inferior — celular */}
      <nav
        aria-label="Atalhos"
        className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur lg:hidden"
      >
        <ul className="grid grid-cols-5">
          {NAV.filter((n) => NAV_BARRA.includes(n.href)).map(({ href, curto, Icone }) => {
            const atual = ativo(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={atual ? "page" : undefined}
                  className={`relative flex h-16 flex-col items-center justify-center gap-1 text-[0.6875rem] ${
                    atual ? "font-medium text-accent" : "text-muted"
                  }`}
                >
                  <Icone className="size-5" />
                  {curto}
                  {href === "/admin/reservas" && pendentes > 0 && (
                    <span className="absolute right-[22%] top-2 min-w-4 rounded-full bg-warning px-1 text-center text-[0.625rem] leading-4 text-warning-foreground">
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
              onClick={() => setMenuAberto(true)}
              className="flex h-16 w-full flex-col items-center justify-center gap-1 text-[0.6875rem] text-muted"
            >
              <Ellipsis className="size-5" />
              Mais
            </button>
          </li>
        </ul>
      </nav>

      {/* Menu completo — celular */}
      <Drawer>
        <Drawer.Backdrop isOpen={menuAberto} onOpenChange={setMenuAberto}>
          <Drawer.Content placement="left" className="w-[min(320px,88vw)]">
            <Drawer.Dialog aria-label="Menu do painel" className="flex h-full flex-col">
              <Drawer.CloseTrigger />
              <Drawer.Header>
                <Logo variante="vinho" decorativo className="h-auto w-24" sizes="96px" />
              </Drawer.Header>
              <Drawer.Body className="grow">
                <ListaNav pendentes={pendentes} onNavegar={() => setMenuAberto(false)} />
                <a
                  href="/"
                  target="_blank"
                  rel="noopener"
                  className="mt-4 flex h-11 items-center gap-2 rounded-xl px-3 text-sm text-muted hover:bg-default"
                >
                  <ArrowUpRightFromSquare className="size-4" />
                  Ver o site
                </a>
              </Drawer.Body>
              <Drawer.Footer className="block">
                <Rodape usuario={usuario} />
              </Drawer.Footer>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    </div>
  );
}
