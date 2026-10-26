"use client";

import { ArrowRight, BookOpen, CalendarDays, CalendarPlus, Clock, Megaphone, Plus, Zap, type LucideIcon } from "lucide-react";
import Link from "next/link";

import { NAV, type Secao } from "@/components/admin/nav";
import { STATUS } from "@/components/admin/reservas/compartilhado";
import { BotaoLink, Kpi, Selo, SeloIcone } from "@/components/admin/ui";
import { EstadoVazio } from "@/components/sistema/estados/estado-vazio";
import { ItemEscalonado, ListaEscalonada } from "@/components/sistema/movimento";
import { Card } from "@/components/sistema/ui/card";
import type { ResumoPainel } from "@/lib/admin/consultas";
import { formatarData } from "@/lib/admin/formato";

function saudacao() {
  const h = Number(
    new Intl.DateTimeFormat("pt-BR", { hour: "numeric", hour12: false, timeZone: "America/Sao_Paulo" }).format(new Date()),
  );
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}

/** Área do painel de um link, para o bloco usar a cor dela. */
const secaoDe = (href: string) => NAV.find((n) => href.startsWith(n.href) && n.href !== "/admin")?.secao;

/** Título de bloco: selo de ícone (na cor da área do link), título, descrição e um link à direita. */
function TituloBloco({
  icone,
  titulo,
  descricao,
  href,
  rotuloLink,
}: {
  icone: LucideIcon;
  titulo: string;
  descricao?: string;
  href?: string;
  rotuloLink?: string;
}) {
  return (
    <div className="flex items-start gap-3 px-(--card-spacing)" data-secao={href ? secaoDe(href) : undefined}>
      <SeloIcone icone={icone} />
      <div className="min-w-0 grow">
        <h2 className="text-[15px] leading-[22px] font-semibold">{titulo}</h2>
        {descricao && <p className="text-[13px] text-muted-foreground">{descricao}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[13px] font-medium text-secao-texto transition-colors hover:bg-secao/10"
        >
          {rotuloLink} <ArrowRight className="size-3.5" />
        </Link>
      )}
    </div>
  );
}

const ATALHOS: { href: string; rotulo: string; detalhe: string; secao: Secao; icone?: LucideIcon }[] = [
  { href: "/admin/reservas?nova=1", rotulo: "Nova reserva", detalhe: "Telefone ou balcão", secao: "reservas", icone: CalendarPlus },
  { href: "/admin/cardapio?novo=1", rotulo: "Novo prato", detalhe: "Entra no cardápio do site", secao: "cardapio", icone: Plus },
  { href: "/admin/home", rotulo: "Página inicial", detalhe: "Mais pedido e seleção", secao: "home" },
  { href: "/admin/selos", rotulo: "Selos", detalhe: "Vegetariano, Criação Rizz…", secao: "selos" },
  { href: "/admin/promocoes", rotulo: "Promoções", detalhe: "Pop-up e avisos do site", secao: "promocoes" },
  { href: "/admin/whatsapp", rotulo: "WhatsApp", detalhe: "Mensagens automáticas", secao: "whatsapp" },
];

/** Atalhos para as tarefas mais comuns, cada um na cor da sua área. */
function Atalhos() {
  return (
    <ul className="grid grid-cols-2 gap-2 px-(--card-spacing)">
      {ATALHOS.map((a) => {
        const Icone = a.icone ?? NAV.find((n) => n.secao === a.secao)!.Icone;
        return (
          <li key={a.href} data-secao={a.secao}>
            <Link
              href={a.href}
              className="group flex h-full flex-col gap-2.5 rounded-2xl bg-muted/70 p-3 transition-colors hover:bg-secao/10 focus-visible:outline-2 focus-visible:outline-ring"
            >
              <SeloIcone icone={Icone} className="size-8 rounded-lg" />
              <span>
                <span className="block text-sm font-medium">{a.rotulo}</span>
                <span className="block text-xs text-muted-foreground">{a.detalhe}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default function Dashboard({ nome, resumo }: { nome: string; resumo: ResumoPainel }) {
  const { reservas, promocoes, cardapio } = resumo;
  const ctr = promocoes.views ? Math.round((promocoes.cliques / promocoes.views) * 100) : 0;
  const primeiroNome = nome.split(" ")[0];
  const hojeExtenso = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "America/Sao_Paulo",
  });

  return (
    <div className="flex flex-col gap-4">
      <header className="mb-2 flex flex-col gap-4 md:mb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground first-letter:uppercase">{hojeExtenso}</p>
          <h1 className="mt-1 text-2xl leading-8 font-semibold tracking-tight md:text-[1.75rem] md:leading-9">
            {saudacao()}, <span className="text-marca-texto">{primeiroNome}</span>
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <BotaoLink href="/admin/reservas?nova=1" variant="marca">
            <CalendarPlus /> Nova reserva
          </BotaoLink>
        </div>
      </header>

      <ListaEscalonada className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        <ItemEscalonado>
          <Kpi
            rotulo="Reservas hoje"
            valor={reservas.hoje}
            detalhe={`${reservas.pessoas_hoje} pessoas · ${reservas.semana} nos próximos 7 dias`}
            icone={CalendarDays}
            tom="info"
          />
        </ItemEscalonado>
        <ItemEscalonado>
          <Kpi
            rotulo="A confirmar"
            valor={reservas.pendentes}
            detalhe={reservas.pendentes ? "Pedidos aguardando retorno" : "Nada pendente"}
            icone={Clock}
            tom={reservas.pendentes ? "atencao" : "neutro"}
          />
        </ItemEscalonado>
        <ItemEscalonado>
          <Kpi
            rotulo="Pratos esgotados"
            valor={cardapio.esgotados}
            detalhe={`${cardapio.total} pratos · ${cardapio.ocultos} ocultos no site`}
            icone={BookOpen}
            tom={cardapio.esgotados ? "negativo" : "positivo"}
          />
        </ItemEscalonado>
        <ItemEscalonado>
          <Kpi
            rotulo="Conversão do pop-up"
            valor={ctr}
            sufixo="%"
            detalhe={`${promocoes.cliques} cliques em ${promocoes.views} exibições`}
            icone={Megaphone}
          />
        </ItemEscalonado>
      </ListaEscalonada>

      <div className="grid items-start gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <TituloBloco
            icone={CalendarDays}
            titulo="Próximas reservas"
            descricao="Pendentes e confirmadas a partir de hoje"
            href="/admin/reservas"
            rotuloLink="Ver todas"
          />
          {resumo.proximas.length === 0 ? (
            <EstadoVazio
              icone={CalendarDays}
              titulo="Nenhuma reserva nos próximos dias"
              descricao="As reservas feitas pelo site aparecem aqui sozinhas."
              className="py-8"
            />
          ) : (
            <ul className="flex flex-col px-2">
              {resumo.proximas.map((r) => (
                <li key={r.id}>
                  <Link
                    href="/admin/reservas"
                    className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-muted"
                  >
                    <span className="grid w-12 shrink-0 place-items-center rounded-xl bg-info/10 py-1.5 text-center text-info-texto">
                      <span className="text-[0.62rem] font-medium uppercase">
                        {formatarData(r.data, { month: "short" }).replace(".", "")}
                      </span>
                      <span className="numeros text-lg leading-none font-semibold">{r.data?.slice(8, 10)}</span>
                    </span>
                    <span className="min-w-0 grow">
                      <span className="block truncate text-sm font-medium">{r.nome}</span>
                      <span className="numeros block text-[13px] text-muted-foreground">
                        {r.hora ?? "sem horário"} · {r.pessoas} {r.pessoas === 1 ? "pessoa" : "pessoas"}
                      </span>
                    </span>
                    <Selo tom={STATUS[r.status].tom} ponto>
                      {STATUS[r.status].rotulo}
                    </Selo>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <TituloBloco icone={Zap} titulo="Atalhos" descricao="O que mais se faz no dia a dia" />
          <Atalhos />
        </Card>
      </div>
    </div>
  );
}
