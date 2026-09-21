"use client";

import {
  ArrowRight,
  Calendar,
  Gift,
  Heart,
  Megaphone,
  Persons,
  Book,
  CircleCheck,
  Clock,
} from "@gravity-ui/icons";
import { Card, Chip, Tooltip } from "@heroui/react";
import Link from "next/link";

import { BotaoLink, Kpi } from "@/components/admin/ui";
import type { ResumoPainel } from "@/lib/admin/consultas";
import { formatarData, telefoneWhats } from "@/lib/admin/formato";

function saudacao() {
  const h = Number(
    new Intl.DateTimeFormat("pt-BR", { hour: "numeric", hour12: false, timeZone: "America/Sao_Paulo" }).format(new Date()),
  );
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}

const STATUS = {
  pendente: { rotulo: "Pendente", cor: "warning" },
  confirmada: { rotulo: "Confirmada", cor: "success" },
  concluida: { rotulo: "Concluída", cor: "default" },
  cancelada: { rotulo: "Cancelada", cor: "danger" },
} as const;

/** Visitas carimbadas por dia — série única, barras finas, tooltip por barra. */
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
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-3xl font-medium tabular-nums">{total}</p>
        <p className="text-xs text-muted">visitas em 14 dias</p>
      </div>
      <div className="relative mt-4 h-36">
        {/* grade recessiva */}
        <div className="absolute inset-x-0 top-0 border-t border-dashed border-separator" />
        <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-separator" />
        <div className="absolute inset-x-0 bottom-0 border-t border-border" />
        <span className="absolute -top-2 right-0 bg-surface pl-1 text-[0.625rem] tabular-nums text-muted">{max}</span>
        <div className="relative flex h-full items-end gap-[2px]">
          {dias.map((x) => (
            <Tooltip key={x.chave} delay={0} closeDelay={0}>
              <Tooltip.Trigger
                aria-label={`${x.dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}: ${x.n} visitas`}
                className="flex h-full grow cursor-default items-end justify-center outline-none"
              >
                <span
                  className="block w-full max-w-5 rounded-t-[4px] bg-accent transition-opacity hover:opacity-80"
                  style={{ height: `${Math.max(x.n ? 4 : 1, (x.n / max) * 100)}%`, opacity: x.n ? 1 : 0.25 }}
                />
              </Tooltip.Trigger>
              <Tooltip.Content>
                <p className="text-xs">
                  {x.dt.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" })}
                  <span className="ml-2 font-medium tabular-nums">{x.n} visitas</span>
                </p>
              </Tooltip.Content>
            </Tooltip>
          ))}
        </div>
      </div>
      <div className="mt-2 flex justify-between text-[0.625rem] text-muted">
        <span>{dias[0]!.dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>
        <span>hoje</span>
      </div>
    </div>
  );
}

export default function Dashboard({ nome, resumo }: { nome: string; resumo: ResumoPainel }) {
  const { reservas, clientes, promocoes, cardapio } = resumo;
  const ctr = promocoes.views ? Math.round((promocoes.cliques / promocoes.views) * 100) : 0;
  const primeiroNome = nome.split(" ")[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted first-letter:uppercase">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", timeZone: "America/Sao_Paulo" })}
          </p>
          <h1 className="titulo-display mt-1 text-[2rem] leading-tight text-accent sm:text-[2.5rem]">
            {saudacao()}, {primeiroNome}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <BotaoLink href="/admin/reservas?nova=1" variant="secondary" size="sm">
            <Calendar /> Nova reserva
          </BotaoLink>
          <BotaoLink href="/admin/fidelidade" size="sm">
            <Heart /> Registrar visita
          </BotaoLink>
        </div>
      </div>

      {/* Indicadores */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <Kpi
          rotulo="Reservas hoje"
          valor={reservas.hoje}
          detalhe={`${reservas.pessoas_hoje} pessoas · ${reservas.semana} nos próximos 7 dias`}
          icone={<Calendar className="size-4" />}
          tom="accent"
        />
        <Kpi
          rotulo="A confirmar"
          valor={reservas.pendentes}
          detalhe={reservas.pendentes ? "Pedidos aguardando retorno" : "Nada pendente"}
          icone={<Clock className="size-4" />}
          tom="warning"
        />
        <Kpi
          rotulo="Clientes fidelidade"
          valor={clientes.total}
          detalhe={`+${clientes.novos} em 30 dias · ${clientes.prontos} com prêmio`}
          icone={<Persons className="size-4" />}
          tom="success"
        />
        <Kpi
          rotulo="Pop-up"
          valor={`${ctr}%`}
          detalhe={`${promocoes.cliques} cliques em ${promocoes.views} exibições · ${promocoes.ativas} ativa(s)`}
          icone={<Megaphone className="size-4" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* Próximas reservas */}
        <Card className="p-0">
          <Card.Header className="flex-row items-center justify-between px-5 pt-5">
            <div>
              <Card.Title>Próximas reservas</Card.Title>
              <Card.Description>Pendentes e confirmadas a partir de hoje</Card.Description>
            </div>
            <Link href="/admin/reservas" className="flex items-center gap-1 text-sm text-accent hover:underline">
              Ver todas <ArrowRight className="size-3.5" />
            </Link>
          </Card.Header>
          <Card.Content className="px-2 pb-3">
            {resumo.proximas.length === 0 ? (
              <p className="px-3 py-10 text-center text-sm text-muted">Nenhuma reserva nos próximos dias.</p>
            ) : (
              <ul className="divide-y divide-separator">
                {resumo.proximas.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 px-3 py-3">
                    <div className="grid w-14 shrink-0 place-items-center rounded-xl bg-default py-1.5 text-center">
                      <span className="text-[0.625rem] uppercase text-muted">
                        {formatarData(r.data, { month: "short" }).replace(".", "")}
                      </span>
                      <span className="text-lg font-medium leading-none tabular-nums">
                        {r.data?.slice(8, 10)}
                      </span>
                    </div>
                    <div className="min-w-0 grow">
                      <p className="truncate text-sm font-medium">{r.nome}</p>
                      <p className="text-xs text-muted">
                        {r.hora ?? "sem horário"} · {r.pessoas} {r.pessoas === 1 ? "pessoa" : "pessoas"}
                      </p>
                    </div>
                    <Chip size="sm" variant="soft" color={STATUS[r.status].cor}>
                      {STATUS[r.status].rotulo}
                    </Chip>
                  </li>
                ))}
              </ul>
            )}
          </Card.Content>
        </Card>

        {/* Fidelidade */}
        <Card className="p-5">
          <Card.Header className="p-0">
            <Card.Title>Movimento da fidelidade</Card.Title>
            <Card.Description>Visitas carimbadas por dia</Card.Description>
          </Card.Header>
          <Card.Content className="p-0">
            <GraficoVisitas dados={resumo.visitasSemana} hoje={resumo.hoje} />
          </Card.Content>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Aniversariantes */}
        <Card className="p-5">
          <Card.Header className="p-0">
            <Card.Title className="flex items-center gap-2">
              <Gift className="size-4 text-accent" /> Aniversariantes do mês
            </Card.Title>
            <Card.Description>Uma mensagem com um mimo traz o cliente de volta</Card.Description>
          </Card.Header>
          <Card.Content className="p-0">
            {resumo.aniversariantes.length === 0 ? (
              <p className="py-6 text-sm text-muted">Nenhum aniversariante cadastrado neste mês.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {resumo.aniversariantes.map((c) => {
                  const whats = telefoneWhats(c.telefone);
                  return (
                    <li key={c.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate">
                        <span className="mr-2 tabular-nums text-muted">{c.aniversario?.slice(8, 10)}</span>
                        {c.nome}
                      </span>
                      {whats && c.aceitaContato && (
                        <a
                          href={`https://wa.me/${whats}?text=${encodeURIComponent(`Olá, ${c.nome.split(" ")[0]}! O Rizz deseja um feliz aniversário 🎉 Venha comemorar com a gente: sua sobremesa é por nossa conta este mês.`)}`}
                          target="_blank"
                          rel="noopener"
                          className="shrink-0 text-xs text-accent hover:underline"
                        >
                          Parabenizar
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card.Content>
        </Card>

        {/* Cardápio */}
        <Card className="p-5">
          <Card.Header className="p-0">
            <Card.Title className="flex items-center gap-2">
              <Book className="size-4 text-accent" /> Cardápio
            </Card.Title>
            <Card.Description>{cardapio.total} pratos cadastrados</Card.Description>
          </Card.Header>
          <Card.Content className="flex flex-col gap-3 p-0">
            <div className="flex items-center justify-between rounded-xl bg-default px-3 py-2.5 text-sm">
              <span>Marcados como esgotados</span>
              <span className="font-medium tabular-nums">{cardapio.esgotados}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-default px-3 py-2.5 text-sm">
              <span>Ocultos no site</span>
              <span className="font-medium tabular-nums">{cardapio.ocultos}</span>
            </div>
            <Link href="/admin/cardapio" className="mt-1 flex items-center gap-1 text-sm text-accent hover:underline">
              Gerenciar cardápio <ArrowRight className="size-3.5" />
            </Link>
          </Card.Content>
        </Card>

        {/* Atividade */}
        <Card className="p-5 md:col-span-2 lg:col-span-1">
          <Card.Header className="p-0">
            <Card.Title>Atividade recente</Card.Title>
            <Card.Description>Fidelidade</Card.Description>
          </Card.Header>
          <Card.Content className="p-0">
            {resumo.eventos.length === 0 ? (
              <p className="py-6 text-sm text-muted">Sem movimentação ainda.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {resumo.eventos.map((e, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span
                      className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full ${
                        e.tipo === "resgate" ? "bg-warning/20" : "bg-success/15 text-success"
                      }`}
                    >
                      {e.tipo === "resgate" ? <Gift className="size-3.5" /> : <CircleCheck className="size-3.5" />}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate">
                        <span className="font-medium">{e.nome}</span>{" "}
                        {e.tipo === "visita"
                          ? `+${e.quantidade} selo${e.quantidade > 1 ? "s" : ""}`
                          : e.tipo === "resgate"
                            ? "resgatou o prêmio"
                            : "teve os selos ajustados"}
                      </p>
                      <p className="text-xs text-muted">
                        {new Date(e.criadoEm).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
