"use client";

import { Copy, Ellipsis, Eye, Megaphone, Pencil, Plus, TrashBin, HandPointUp } from "@gravity-ui/icons";
import { Button, Card, Chip, Dropdown, EmptyState, Label, Switch } from "@heroui/react";
import { useState, useTransition } from "react";

import { avisar, Confirmar } from "@/components/admin/campos";
import { Cabecalho } from "@/components/admin/ui";
import { formatarData } from "@/lib/admin/formato";
import { alternarPromocao, duplicarPromocao, excluirPromocao } from "@/lib/admin/promocoes-actions";
import type { Promocao } from "@/lib/dados";

import EditorPromocao from "./EditorPromocao";

export function situacao(p: Promocao, hoje: string) {
  if (!p.ativo) return { rotulo: "Desativada", cor: "default" as const };
  if (p.inicio && p.inicio > hoje) return { rotulo: "Agendada", cor: "accent" as const };
  if (p.fim && p.fim < hoje) return { rotulo: "Encerrada", cor: "danger" as const };
  return { rotulo: "No ar", cor: "success" as const };
}

const PAGINAS = { todas: "Todas as páginas", home: "Página inicial", cardapio: "Cardápio", reservas: "Reservas" };
const FREQ = { sempre: "a cada visita", sessao: "uma vez por sessão", dia: "uma vez por dia" };

const FUNDO = { vinho: "bg-[#70012a]", creme: "bg-[#fdf1e5]", noite: "bg-[#2b0710]" };

function CartaoPromocao({
  p,
  hoje,
  onEditar,
  onExcluir,
}: {
  p: Promocao;
  hoje: string;
  onEditar: () => void;
  onExcluir: () => void;
}) {
  const [ativo, setAtivo] = useState(p.ativo);
  const [, iniciar] = useTransition();
  const s = situacao({ ...p, ativo }, hoje);
  const ctr = p.visualizacoes ? ((p.cliques / p.visualizacoes) * 100).toFixed(1).replace(".", ",") : "0";

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <button type="button" onClick={onEditar} className={`relative block aspect-[16/7] w-full text-left ${FUNDO[p.estilo]}`}>
        {p.imagemUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.imagemUrl} alt="" className="absolute inset-0 size-full object-cover" />
        ) : (
          <span
            className={`absolute inset-0 grid place-items-center px-6 text-center font-display text-2xl italic ${
              p.estilo === "creme" ? "text-[#70012a]" : "text-[#fdf1e5]"
            }`}
          >
            {p.titulo}
          </span>
        )}
        <Chip size="sm" color={s.cor} variant="primary" className="absolute left-3 top-3">
          {s.rotulo}
        </Chip>
      </button>

      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-medium">{p.titulo}</p>
            <p className="text-xs text-muted">
              {p.inicio || p.fim
                ? `${p.inicio ? formatarData(p.inicio) : "já"} → ${p.fim ? formatarData(p.fim) : "sem fim"}`
                : "Sem período definido"}
            </p>
          </div>
          <Switch
            size="sm"
            isSelected={ativo}
            aria-label={`Ativar ${p.titulo}`}
            onChange={(v) => {
              setAtivo(v);
              iniciar(async () => {
                const r = await alternarPromocao(p.id, v);
                if (!avisar(r, v ? "Pop-up ativado no site" : "Pop-up desativado")) setAtivo(!v);
              });
            }}
          >
            <Switch.Content>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
            </Switch.Content>
          </Switch>
        </div>

        <p className="text-xs text-muted">
          {PAGINAS[p.paginas]} · {FREQ[p.frequencia]} · após {p.atrasoSeg}s
          {p.cupom ? ` · cupom ${p.cupom}` : ""}
        </p>

        <div className="grid grid-cols-3 gap-2 rounded-xl bg-default p-3 text-center">
          <div>
            <p className="flex items-center justify-center gap-1 text-[0.625rem] uppercase tracking-wider text-muted">
              <Eye className="size-3" /> Exibições
            </p>
            <p className="mt-0.5 font-medium tabular-nums">{p.visualizacoes}</p>
          </div>
          <div>
            <p className="flex items-center justify-center gap-1 text-[0.625rem] uppercase tracking-wider text-muted">
              <HandPointUp className="size-3" /> Cliques
            </p>
            <p className="mt-0.5 font-medium tabular-nums">{p.cliques}</p>
          </div>
          <div>
            <p className="text-[0.625rem] uppercase tracking-wider text-muted">Conversão</p>
            <p className="mt-0.5 font-medium tabular-nums">{ctr}%</p>
          </div>
        </div>

        <div className="flex justify-end gap-1">
          <Button size="sm" variant="ghost" onPress={onEditar}>
            <Pencil /> Editar
          </Button>
          <Dropdown>
            <Button isIconOnly size="sm" variant="ghost" aria-label={`Mais ações de ${p.titulo}`}>
              <Ellipsis />
            </Button>
            <Dropdown.Popover placement="bottom end">
              <Dropdown.Menu
                onAction={(k) => {
                  if (k === "excluir") return onExcluir();
                  iniciar(async () => {
                    avisar(await duplicarPromocao(p.id), "Cópia criada (desativada)");
                  });
                }}
              >
                <Dropdown.Item id="duplicar" textValue="Duplicar">
                  <Copy className="size-4" />
                  <Label>Duplicar</Label>
                </Dropdown.Item>
                <Dropdown.Item id="excluir" textValue="Excluir" variant="danger">
                  <TrashBin className="size-4" />
                  <Label>Excluir</Label>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>
      </div>
    </Card>
  );
}

export default function GestorPromocoes({ promocoes, hoje }: { promocoes: Promocao[]; hoje: string }) {
  const [editando, setEditando] = useState<Promocao | "nova" | null>(null);
  const [excluindo, setExcluindo] = useState<Promocao | null>(null);
  const noAr = promocoes.filter((p) => situacao(p, hoje).rotulo === "No ar");

  return (
    <>
      <Cabecalho
        titulo="Promoções e pop-up"
        descricao="Crie o pop-up que aparece para quem visita o site: ofertas, datas especiais, cupons e eventos."
        acoes={
          <Button size="sm" onPress={() => setEditando("nova")}>
            <Plus /> Nova promoção
          </Button>
        }
      />

      {noAr.length > 1 && (
        <p className="mb-4 rounded-xl bg-warning/15 px-4 py-3 text-sm">
          Há {noAr.length} pop-ups no ar. O site mostra um de cada vez: o mais recente que vale para a página visitada.
        </p>
      )}

      {promocoes.length === 0 ? (
        <Card className="py-14">
          <EmptyState className="flex flex-col items-center gap-3 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-accent/10 text-accent">
              <Megaphone className="size-6" />
            </span>
            <p className="font-medium">Nenhuma promoção ainda</p>
            <p className="max-w-sm text-sm text-muted">
              Que tal divulgar o almoço executivo, um vinho da semana ou um cupom de primeira visita?
            </p>
            <Button size="sm" onPress={() => setEditando("nova")}>
              <Plus /> Criar a primeira
            </Button>
          </EmptyState>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {promocoes.map((p) => (
            <CartaoPromocao
              key={`${p.id}-${p.ativo}`}
              p={p}
              hoje={hoje}
              onEditar={() => setEditando(p)}
              onExcluir={() => setExcluindo(p)}
            />
          ))}
        </div>
      )}

      <EditorPromocao
        aberto={editando !== null}
        promocao={editando === "nova" ? null : editando}
        onFechar={() => setEditando(null)}
      />

      <Confirmar
        aberto={excluindo !== null}
        onFechar={() => setExcluindo(null)}
        titulo="Excluir promoção?"
        texto={
          <>
            <strong>{excluindo?.titulo}</strong> e as estatísticas dela serão apagadas.
          </>
        }
        onConfirmar={async () => {
          if (excluindo) avisar(await excluirPromocao(excluindo.id), "Promoção excluída");
        }}
      />
    </>
  );
}
