"use client";

import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CalendarPlus,
  CircleCheck,
  Clock,
  Gift,
  Heart,
  Megaphone,
  Settings2,
  Users,
} from "lucide-react";
import Link from "next/link";

import { STATUS } from "@/components/admin/reservas/compartilhado";
import { BotaoLink, Kpi, Selo, SeloIcone } from "@/components/admin/ui";
import { EstadoVazio } from "@/components/sistema/estados/estado-vazio";
import { ItemEscalonado, ListaEscalonada } from "@/components/sistema/movimento";
import { Card } from "@/components/sistema/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/sistema/ui/tooltip";
import type { ResumoPainel } from "@/lib/admin/consultas";
import { formatarData, telefoneWhats } from "@/lib/admin/formato";
import { cn } from "@/lib/utils";

function saudacao() {
  const h = Number(
    new Intl.DateTimeFormat("pt-BR", { hour: "numeric", hour12: false, timeZone: "America/Sao_Paulo" }).format(new Date()),
  );
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}

/** Título de bloco: selo de ícone, título, descrição e um link à direita. */
function TituloBloco({
  icone,
  titulo,
  descricao,
  href,
  rotuloLink,
}: {
  icone: Parameters<typeof SeloIcone>[0]["icone"];
  titulo: string;
  descricao?: string;
  href?: string;
  rotuloLink?: string;
}) {
  return (
    <div className="flex items-start gap-3 px-(--card-spacing)">
      <SeloIcone icone={icone} />
      <div className="min-w-0 grow">
        <h2 className="text-[15px] leading-[22px] font-semibold">{titulo}</h2>
        {descricao && <p className="text-[13px] text-muted-foreground">{descricao}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[13px] font-medium text-primary-texto transition-colors hover:bg-primary-suave"
        >
          {rotuloLink} <ArrowRight className="size-3.5" />
        </Link>
      )}
    </div>
  );
}

/** Visitas carimbadas por dia — série única, colunas finas, dica por coluna. */
function GraficoVisitas({ dados, hoje }: { dados: ResumoPainel["visitasSemana"]; hoje: string }) {
  const [a, m, d] = hoje.split("-").map(Number);
  const dias = Array.from({ length: 14 }, (_, i) => {
    const dt = new Date(a, m - 1, d - 13 + i);
    const chave = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    return { chave, dt, n: dados.find((x) => x.dia === chave)?.n ?? 0 };
  });
  const max = Math.max(4, ...dias.map((x) => x.n));
  const total = dias.reduce((s, x) => s + x.n, 0);

  return (
    <div className="px-(--card-spacing)">
      <div className="flex items-baseline gap-2">
        <p className="numeros text-[2rem] leading-none font-semibold tracking-tight">{total}</p>
        <p className="text-[13px] text-muted-foreground">visitas em 14 dias</p>
      </div>
      <div className="relative mt-5 h-36">
        <div className="absolute inset-x-0 top-0 border-t border-border" />
        <div className="absolute inset-x-0 top-1/2 border-t border-border" />
        <div className="absolute inset-x-0 bottom-0 border-t border-border" />
        <span className="numeros absolute -top-2 right-0 bg-card pl-1 text-[0.65rem] text-texto-terciario">{max}</span>
        <div className="relative flex h-full items-end gap-1">
          {dias.map((x, i) => (
            <Tooltip key={x.chave}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={`${x.dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}: ${x.n} visitas`}
                  className="group flex h-full grow cursor-default items-end justify-center outline-none"
                >
                  <span
                    className={cn(
                      "block w-full max-w-6 origin-bottom rounded-t-md transition-[opacity,background-color] duration-150",
                      x.n ? "bg-chart-1 group-hover:opacity-80" : "bg-muted",
                    )}
                    style={{
                      height: `${Math.max(x.n ? 6 : 3, (x.n / max) * 100)}%`,
                      animation: `barra-subir 0.5s ${i * 0.025}s cubic-bezier(0.22,1,0.36,1) both`,
                    }}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {x.dt.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" })}
                <span className="numeros ml-2 font-semibold">{x.n} visitas</span>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
      <div className="mt-2 flex justify-between text-[0.68rem] text-texto-terciario">
        <span>{dias[0]!.dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>
        <span>hoje</span>
      </div>
      <style>{`@keyframes barra-subir { from { transform: scaleY(0) } to { transform: scaleY(1) } }`}</style>
    </div>
  );
}

export default function Dashboard({ nome, resumo }: { nome: string; resumo: ResumoPainel }) {
  const { reservas, clientes, promocoes, cardapio } = resumo;
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
            {saudacao()}, {primeiroNome}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <BotaoLink href="/admin/reservas?nova=1" variant="secondary">
            <CalendarPlus /> Nova reserva
          </BotaoLink>
          <BotaoLink href="/admin/fidelidade">
            <Heart /> Registrar visita
          </BotaoLink>
        </div>
      </header>

      <ListaEscalonada className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <ItemEscalonado>
          <Kpi
            rotulo="Reservas hoje"
            valor={reservas.hoje}
            detalhe={`${reservas.pessoas_hoje} pessoas · ${reservas.semana} nos próximos 7 dias`}
            icone={CalendarDays}
            tom="marca"
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
            rotulo="Clientes fidelidade"
            valor={clientes.total}
            detalhe={`+${clientes.novos} em 30 dias · ${clientes.prontos} com prêmio`}
            icone={Users}
            tom="positivo"
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

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
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
                    <span className="grid w-12 shrink-0 place-items-center rounded-xl bg-muted py-1.5 text-center">
                      <span className="text-[0.62rem] font-medium text-muted-foreground uppercase">
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
          <TituloBloco icone={Heart} titulo="Movimento da fidelidade" descricao="Visitas carimbadas por dia" />
          <GraficoVisitas dados={resumo.visitasSemana} hoje={resumo.hoje} />
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <TituloBloco icone={Gift} titulo="Aniversariantes do mês" descricao="Uma mensagem com um mimo traz o cliente de volta" />
          {resumo.aniversariantes.length === 0 ? (
            <p className="px-(--card-spacing) py-4 text-sm text-muted-foreground">
              Nenhum aniversariante cadastrado neste mês.
            </p>
          ) : (
            <ul className="flex flex-col px-2">
              {resumo.aniversariantes.map((c) => {
                const whats = telefoneWhats(c.telefone);
                return (
                  <li key={c.id} className="flex items-center justify-between gap-2 rounded-xl px-2 py-2 text-sm">
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="numeros grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-xs font-semibold">
                        {c.aniversario?.slice(8, 10)}
                      </span>
                      <span className="truncate">{c.nome}</span>
                    </span>
                    {whats && c.aceitaContato && (
                      <a
                        href={`https://wa.me/${whats}?text=${encodeURIComponent(`Olá, ${c.nome.split(" ")[0]}! O Rizz deseja um feliz aniversário 🎉 Venha comemorar com a gente: sua sobremesa é por nossa conta este mês.`)}`}
                        target="_blank"
                        rel="noopener"
                        className="shrink-0 rounded-full px-2.5 py-1 text-[13px] font-medium text-primary-texto transition-colors hover:bg-primary-suave"
                      >
                        Parabenizar
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card>
          <TituloBloco
            icone={BookOpen}
            titulo="Cardápio"
            descricao={`${cardapio.total} pratos cadastrados`}
            href="/admin/cardapio"
            rotuloLink="Gerenciar"
          />
          <div className="flex flex-col gap-2 px-(--card-spacing)">
            <div className="flex items-center justify-between rounded-xl bg-muted px-3.5 py-3 text-sm">
              <span>Marcados como esgotados</span>
              <span className="numeros font-semibold">{cardapio.esgotados}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-muted px-3.5 py-3 text-sm">
              <span>Ocultos no site</span>
              <span className="numeros font-semibold">{cardapio.ocultos}</span>
            </div>
          </div>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
          <TituloBloco icone={CircleCheck} titulo="Atividade recente" descricao="Fidelidade" />
          {resumo.eventos.length === 0 ? (
            <p className="px-(--card-spacing) py-4 text-sm text-muted-foreground">Sem movimentação ainda.</p>
          ) : (
            <ul className="flex flex-col gap-3 px-(--card-spacing)">
              {resumo.eventos.map((e, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span
                    className={cn(
                      "mt-0.5 grid size-7 shrink-0 place-items-center rounded-full",
                      e.tipo === "resgate"
                        ? "bg-atencao/14 text-atencao-texto"
                        : e.tipo === "visita"
                          ? "bg-positivo/12 text-positivo-texto"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {e.tipo === "resgate" ? (
                      <Gift className="size-3.5" />
                    ) : e.tipo === "visita" ? (
                      <CircleCheck className="size-3.5" />
                    ) : (
                      <Settings2 className="size-3.5" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate">
                      <span className="font-medium">{e.nome}</span>{" "}
                      <span className="text-muted-foreground">
                        {e.tipo === "visita"
                          ? `+${e.quantidade} selo${e.quantidade > 1 ? "s" : ""}`
                          : e.tipo === "resgate"
                            ? "resgatou o prêmio"
                            : "teve os selos ajustados"}
                      </span>
                    </p>
                    <p className="numeros text-xs text-texto-terciario">
                      {new Date(e.criadoEm).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
