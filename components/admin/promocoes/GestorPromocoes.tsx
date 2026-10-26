"use client";

import { Copy, Eye, Megaphone, MousePointerClick, Pencil, Plus, Trash2, TrendingUp } from "lucide-react";
import { useState, useTransition } from "react";

import { avisar, Confirmar } from "@/components/admin/campos";
import { Cabecalho, MenuAcoes, Selo, useUltimo, type Tom } from "@/components/admin/ui";
import { EstadoVazio } from "@/components/sistema/estados/estado-vazio";
import { ItemEscalonado, ListaEscalonada } from "@/components/sistema/movimento";
import { Button } from "@/components/sistema/ui/button";
import { Card } from "@/components/sistema/ui/card";
import { Switch } from "@/components/sistema/ui/switch";
import { formatarData } from "@/lib/admin/formato";
import { alternarPromocao, duplicarPromocao, excluirPromocao } from "@/lib/admin/promocoes-actions";
import type { Promocao } from "@/lib/dados";
import { cn } from "@/lib/utils";

import EditorPromocao from "./EditorPromocao";

export function situacao(p: Promocao, hoje: string): { rotulo: string; tom: Tom } {
  if (!p.ativo) return { rotulo: "Desativada", tom: "neutro" };
  if (p.inicio && p.inicio > hoje) return { rotulo: "Agendada", tom: "info" };
  if (p.fim && p.fim < hoje) return { rotulo: "Encerrada", tom: "neutro" };
  return { rotulo: "No ar", tom: "positivo" };
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
    <Card className="h-full gap-0 py-0 transition-shadow hover:shadow-elevado">
      <button
        type="button"
        onClick={onEditar}
        className={cn("relative block aspect-[16/8] w-full overflow-hidden text-left", FUNDO[p.estilo])}
      >
        {p.imagemUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.imagemUrl} alt="" className="absolute inset-0 size-full object-cover transition-transform duration-500 hover:scale-[1.03]" />
        ) : (
          <span
            className={cn(
              "absolute inset-0 grid place-items-center px-6 text-center font-display text-2xl italic",
              p.estilo === "creme" ? "text-[#70012a]" : "text-[#fdf1e5]",
            )}
          >
            {p.titulo}
          </span>
        )}
        <Selo tom={s.tom} ponto className="absolute top-3 left-3 bg-card/95 shadow-suave backdrop-blur">
          {s.rotulo}
        </Selo>
      </button>

      <div className="flex grow flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold">{p.titulo}</p>
            <p className="numeros text-[13px] text-muted-foreground">
              {p.inicio || p.fim
                ? `${p.inicio ? formatarData(p.inicio) : "já"} → ${p.fim ? formatarData(p.fim) : "sem fim"}`
                : "Sem período definido"}
            </p>
          </div>
          <Switch
            checked={ativo}
            aria-label={`Ativar ${p.titulo}`}
            onCheckedChange={(v) => {
              setAtivo(v);
              iniciar(async () => {
                const r = await alternarPromocao(p.id, v);
                if (!avisar(r, v ? "Pop-up ativado no site" : "Pop-up desativado")) setAtivo(!v);
              });
            }}
          />
        </div>

        <p className="text-[13px] text-muted-foreground">
          {PAGINAS[p.paginas]} · {FREQ[p.frequencia]} · após {p.atrasoSeg}s
          {p.cupom ? ` · cupom ${p.cupom}` : ""}
        </p>

        <div className="mt-auto grid grid-cols-3 gap-2 rounded-2xl bg-muted/70 p-3 text-center">
          {[
            { rotulo: "Exibições", valor: p.visualizacoes, Icone: Eye },
            { rotulo: "Cliques", valor: p.cliques, Icone: MousePointerClick },
            { rotulo: "Conversão", valor: `${ctr}%`, Icone: TrendingUp },
          ].map(({ rotulo, valor, Icone }) => (
            <div key={rotulo}>
              <p className="flex items-center justify-center gap-1 text-[0.65rem] font-medium text-muted-foreground uppercase">
                <Icone className="size-3" /> {rotulo}
              </p>
              <p className="numeros mt-0.5 font-semibold">{valor}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-1">
          <Button size="sm" variant="ghost" className="rounded-full" onClick={onEditar}>
            <Pencil /> Editar
          </Button>
          <MenuAcoes
            rotulo={`Mais ações de ${p.titulo}`}
            acoes={[
              { id: "duplicar", rotulo: "Duplicar", icone: Copy },
              { id: "excluir", rotulo: "Excluir", icone: Trash2, perigo: true, separar: true },
            ]}
            aoEscolher={(k) => {
              if (k === "excluir") return onExcluir();
              iniciar(async () => {
                avisar(await duplicarPromocao(p.id), "Cópia criada (desativada)");
              });
            }}
          />
        </div>
      </div>
    </Card>
  );
}

export default function GestorPromocoes({ promocoes, hoje }: { promocoes: Promocao[]; hoje: string }) {
  const [editando, setEditando] = useState<Promocao | "nova" | null>(null);
  const [excluindo, setExcluindo] = useState<Promocao | null>(null);
  const excluida = useUltimo(excluindo);
  const noAr = promocoes.filter((p) => situacao(p, hoje).rotulo === "No ar");

  return (
    <>
      <Cabecalho
        titulo="Promoções e pop-up"
        descricao="Crie o pop-up que aparece para quem visita o site: ofertas, datas especiais, cupons e eventos."
        acoes={
          <Button className="rounded-full" onClick={() => setEditando("nova")}>
            <Plus /> Nova promoção
          </Button>
        }
      />

      {noAr.length > 1 && (
        <p className="mb-4 rounded-2xl bg-atencao/14 px-4 py-3 text-sm text-atencao-texto">
          Há {noAr.length} pop-ups no ar. O site mostra um de cada vez: o mais recente que vale para a página visitada.
        </p>
      )}

      {promocoes.length === 0 ? (
        <Card>
          <EstadoVazio
            icone={Megaphone}
            titulo="Nenhuma promoção ainda"
            descricao="Que tal divulgar o almoço executivo, um vinho da semana ou um cupom de primeira visita?"
            acao={
              <Button className="rounded-full" onClick={() => setEditando("nova")}>
                <Plus /> Criar a primeira
              </Button>
            }
          />
        </Card>
      ) : (
        <ListaEscalonada className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {promocoes.map((p) => (
            <ItemEscalonado key={`${p.id}-${p.ativo}`}>
              <CartaoPromocao p={p} hoje={hoje} onEditar={() => setEditando(p)} onExcluir={() => setExcluindo(p)} />
            </ItemEscalonado>
          ))}
        </ListaEscalonada>
      )}

      <EditorPromocao editando={editando} onFechar={() => setEditando(null)} />

      <Confirmar
        aberto={excluindo !== null}
        onFechar={() => setExcluindo(null)}
        titulo="Excluir promoção?"
        texto={
          <>
            <strong className="text-foreground">{excluida?.titulo}</strong> e as estatísticas dela serão apagadas.
          </>
        }
        onConfirmar={async () => {
          if (excluindo) avisar(await excluirPromocao(excluindo.id), "Promoção excluída");
        }}
      />
    </>
  );
}
