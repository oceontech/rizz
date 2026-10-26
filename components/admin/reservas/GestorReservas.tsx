"use client";

import { format, parse } from "date-fns";
import { CalendarDays, Link as IconeLink, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { avisar, Confirmar } from "@/components/admin/campos";
import { Cabecalho, Selo, useUltimo } from "@/components/admin/ui";
import { SeloWhatsapp } from "@/components/admin/whatsapp/conexao";
import { EstadoVazio } from "@/components/sistema/estados/estado-vazio";
import { InputBusca } from "@/components/sistema/inputs/input-texto";
import { Calendario } from "@/components/sistema/pickers/calendario";
import { ControleSegmentado } from "@/components/sistema/pickers/controle-segmentado";
import { GatilhoCampo } from "@/components/sistema/pickers/gatilho-campo";
import { PainelAdaptavel } from "@/components/sistema/pickers/painel-adaptavel";
import { Button } from "@/components/sistema/ui/button";
import { Card } from "@/components/sistema/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/sistema/ui/table";
import type { Reserva } from "@/lib/admin/consultas";
import { formatarData, mascaraTelefone } from "@/lib/admin/formato";
import { excluirReserva } from "@/lib/admin/reservas-actions";
import { rotuloOcasiao, type Bloqueio, type ReservasConfig } from "@/lib/reservas/regras";

import AjustesReservas from "./AjustesReservas";
import { AcaoRapida, copiarTexto, EditorReserva, MenuReserva, STATUS } from "./compartilhado";
import VisaoDia from "./VisaoDia";

type Aba = "dia" | "lista" | "ajustes";
type Visao = "proximas" | "hoje" | "pendentes" | "anteriores";

/** Filtro de um dia só, em pílula clara sobre a página. */
function FiltroDia({ dia, aoMudar }: { dia: string | null; aoMudar: (d: string | null) => void }) {
  const [aberto, setAberto] = useState(false);
  const data = dia ? parse(dia, "yyyy-MM-dd", new Date()) : undefined;
  return (
    <div className="flex items-center gap-1">
      <PainelAdaptavel
        aberto={aberto}
        aoMudar={setAberto}
        titulo="Ir para o dia"
        alinhar="end"
        gatilho={
          <GatilhoCampo
            icone={CalendarDays}
            variante="pilula-clara"
            valor={dia ? formatarData(dia, { weekday: "short", day: "2-digit", month: "short" }) : null}
            placeholder="Qualquer dia"
            className="w-full sm:w-48"
          />
        }
      >
        <Calendario
          mode="single"
          selected={data}
          defaultMonth={data}
          onSelect={(d) => {
            aoMudar(d ? format(d, "yyyy-MM-dd") : null);
            setAberto(false);
          }}
          className="mx-auto"
        />
      </PainelAdaptavel>
      {dia && (
        <Button size="icon-sm" variant="ghost" className="rounded-full" aria-label="Limpar dia" onClick={() => aoMudar(null)}>
          <X />
        </Button>
      )}
    </div>
  );
}

function Lista({
  reservas,
  hoje,
  onEditar,
  onExcluir,
}: {
  reservas: Reserva[];
  hoje: string;
  onEditar: (r: Reserva) => void;
  onExcluir: (r: Reserva) => void;
}) {
  const [visao, setVisao] = useState<Visao>("proximas");
  const [dia, setDia] = useState<string | null>(null);
  const [busca, setBusca] = useState("");

  const contagem = {
    hoje: reservas.filter((r) => r.data === hoje && r.status !== "cancelada").length,
    proximas: reservas.filter((r) => (r.data ?? "9999") >= hoje && ["pendente", "confirmada"].includes(r.status)).length,
    pendentes: reservas.filter((r) => r.status === "pendente").length,
  };

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    let l = reservas;
    if (dia) l = l.filter((r) => r.data === dia);
    else if (visao === "hoje") l = l.filter((r) => r.data === hoje);
    else if (visao === "proximas")
      l = l.filter((r) => (r.data ?? "9999") >= hoje && ["pendente", "confirmada"].includes(r.status));
    else if (visao === "pendentes") l = l.filter((r) => r.status === "pendente");
    else l = l.filter((r) => r.data !== null && r.data < hoje).reverse();
    if (termo)
      l = l.filter((r) => `${r.nome} ${r.telefone ?? ""} ${r.obs ?? ""} ${r.mesa ?? ""}`.toLowerCase().includes(termo));
    return l;
  }, [reservas, visao, dia, busca, hoje]);

  const pessoas = lista
    .filter((r) => r.status !== "cancelada" && r.status !== "nao_compareceu")
    .reduce((s, r) => s + r.pessoas, 0);

  const vazio = (
    <EstadoVazio
      icone={CalendarDays}
      titulo="Nenhuma reserva aqui"
      descricao={busca || dia ? "Ajuste a busca ou o dia." : "As reservas feitas pelo site aparecem sozinhas."}
    />
  );

  const detalhe = (r: Reserva) =>
    [rotuloOcasiao(r.ocasiao), r.mesa && `Mesa ${r.mesa}`, r.obs].filter(Boolean).join(" · ");

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:px-0">
          <ControleSegmentado
            rotulo="Filtrar reservas"
            sobrePagina
            valor={dia ? ("" as Visao) : visao}
            aoMudar={(v) => {
              setDia(null);
              setVisao(v);
            }}
            opcoes={[
              { valor: "proximas", rotulo: "Próximas", contagem: contagem.proximas },
              { valor: "hoje", rotulo: "Hoje", contagem: contagem.hoje },
              { valor: "pendentes", rotulo: "Pendentes", contagem: contagem.pendentes },
              { valor: "anteriores", rotulo: "Anteriores" },
            ]}
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row xl:w-[520px]">
          <InputBusca
            valor={busca}
            aoMudar={setBusca}
            placeholder="Nome, telefone, mesa…"
            aria-label="Buscar reserva"
            classeCaixa="rounded-full border-0 bg-card shadow-suave"
          />
          <FiltroDia dia={dia} aoMudar={setDia} />
        </div>
      </div>

      <p className="numeros mb-3 text-[13px] text-muted-foreground">
        {dia ? `${formatarData(dia, { weekday: "long", day: "2-digit", month: "long" })} · ` : ""}
        {lista.length} {lista.length === 1 ? "reserva" : "reservas"} · {pessoas} pessoas
      </p>

      {/* Desktop: tabela */}
      <Card className="hidden py-0 md:flex">
        {lista.length === 0 ? (
          vazio
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-11 pl-5">Cliente</TableHead>
                <TableHead>Quando</TableHead>
                <TableHead>Pessoas</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead className="pr-5 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="py-3 pl-5">
                    <button type="button" onClick={() => onEditar(r)} className="text-left">
                      <span className="block font-medium hover:underline">{r.nome}</span>
                      <span className="numeros block max-w-72 truncate text-xs text-muted-foreground">
                        {r.telefone ? mascaraTelefone(r.telefone) : "sem telefone"}
                        {detalhe(r) ? ` · ${detalhe(r)}` : ""}
                      </span>
                    </button>
                  </TableCell>
                  <TableCell>
                    <span className="numeros block first-letter:uppercase">
                      {formatarData(r.data, { weekday: "short", day: "2-digit", month: "short" })}
                    </span>
                    <span className="numeros block text-xs text-muted-foreground">{r.hora ?? "sem horário"}</span>
                  </TableCell>
                  <TableCell className="numeros">{r.pessoas}</TableCell>
                  <TableCell>
                    <Selo tom={STATUS[r.status].tom} ponto>
                      {STATUS[r.status].rotulo}
                    </Selo>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.origem === "site" ? "Site" : "Painel"}</TableCell>
                  <TableCell className="pr-5">
                    <div className="flex items-center justify-end gap-1">
                      <AcaoRapida r={r} hoje={hoje} />
                      <MenuReserva r={r} onEditar={() => onEditar(r)} onExcluir={() => onExcluir(r)} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Celular: cartões */}
      <div className="flex flex-col gap-3 md:hidden">
        {lista.length === 0 ? (
          <Card>{vazio}</Card>
        ) : (
          lista.map((r) => (
            <Card key={r.id} size="sm" className="gap-3">
              <div className="flex items-start justify-between gap-3 px-(--card-spacing)">
                <button type="button" onClick={() => onEditar(r)} className="min-w-0 text-left">
                  <p className="truncate text-[15px] font-semibold">{r.nome}</p>
                  <p className="numeros text-[13px] text-muted-foreground">
                    {r.telefone ? mascaraTelefone(r.telefone) : "sem telefone"}
                  </p>
                </button>
                <Selo tom={STATUS[r.status].tom} ponto>
                  {STATUS[r.status].rotulo}
                </Selo>
              </div>
              <div className="numeros flex flex-wrap gap-x-4 gap-y-1 px-(--card-spacing) text-sm">
                <span className="first-letter:uppercase">
                  {formatarData(r.data, { weekday: "short", day: "2-digit", month: "short" })}
                </span>
                <span>{r.hora ?? "—"}</span>
                <span>
                  {r.pessoas} {r.pessoas === 1 ? "pessoa" : "pessoas"}
                </span>
              </div>
              {detalhe(r) && (
                <p className="mx-(--card-spacing) rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">{detalhe(r)}</p>
              )}
              <div className="flex items-center justify-end gap-1 px-(--card-spacing)">
                <AcaoRapida r={r} hoje={hoje} />
                <MenuReserva r={r} onEditar={() => onEditar(r)} onExcluir={() => onExcluir(r)} />
              </div>
            </Card>
          ))
        )}
      </div>
    </>
  );
}

export default function GestorReservas({
  reservas,
  config,
  bloqueios,
  hoje,
  abrirNova,
}: {
  reservas: Reserva[];
  config: ReservasConfig;
  bloqueios: Bloqueio[];
  hoje: string;
  abrirNova: boolean;
}) {
  const router = useRouter();
  const [aba, setAba] = useState<Aba>("dia");
  const [editando, setEditando] = useState<Reserva | { nova: string } | null>(abrirNova ? { nova: hoje } : null);
  const [excluindo, setExcluindo] = useState<Reserva | null>(null);
  const excluida = useUltimo(excluindo);

  function fecharEditor() {
    setEditando(null);
    if (abrirNova) router.replace("/admin/reservas");
  }

  return (
    <>
      <Cabecalho
        titulo="Reservas"
        descricao={
          config.ativo
            ? "O cliente reserva pelo site entre os horários livres. Envie o link para quem pedir uma mesa."
            : "As reservas pelo site estão pausadas: o site monta o pedido no WhatsApp da equipe."
        }
        acoes={
          <>
            <SeloWhatsapp />
            <Button
              variant="secondary"
              className="rounded-full bg-card shadow-suave hover:bg-accent"
              onClick={() => copiarTexto(`${window.location.origin}/reservas`, "Link de reservas copiado")}
            >
              <IconeLink /> Copiar link
            </Button>
            <Button className="rounded-full" onClick={() => setEditando({ nova: hoje })}>
              <Plus /> Nova reserva
            </Button>
          </>
        }
      />

      <ControleSegmentado
        rotulo="Seções de reservas"
        sobrePagina
        valor={aba}
        aoMudar={setAba}
        className="mb-5"
        opcoes={[
          { valor: "dia", rotulo: "Dia" },
          { valor: "lista", rotulo: "Todas" },
          { valor: "ajustes", rotulo: "Ajustes" },
        ]}
      />

      {!config.ativo && aba !== "ajustes" && (
        <p className="mb-4 rounded-2xl bg-atencao/14 px-4 py-3 text-sm text-atencao-texto">
          Reservas pelo site pausadas. Religue em <strong>Ajustes</strong>.
        </p>
      )}

      {aba === "dia" && (
        <VisaoDia
          reservas={reservas}
          config={config}
          bloqueios={bloqueios}
          hoje={hoje}
          onNova={(dia) => setEditando({ nova: dia })}
          onEditar={setEditando}
          onExcluir={setExcluindo}
        />
      )}
      {aba === "lista" && <Lista reservas={reservas} hoje={hoje} onEditar={setEditando} onExcluir={setExcluindo} />}
      {aba === "ajustes" && <AjustesReservas config={config} bloqueios={bloqueios} hoje={hoje} />}

      <EditorReserva editando={editando} hoje={hoje} onFechar={fecharEditor} />

      <Confirmar
        aberto={excluindo !== null}
        onFechar={() => setExcluindo(null)}
        titulo="Excluir reserva?"
        texto={
          <>
            A reserva de <strong className="text-foreground">{excluida?.nome}</strong> será apagada. Para manter o
            histórico, prefira cancelar.
          </>
        }
        onConfirmar={async () => {
          if (excluindo) avisar(await excluirReserva(excluindo.id), "Reserva excluída");
        }}
      />
    </>
  );
}
