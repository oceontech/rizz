"use client";

import { ArrowDown, ArrowUp, Award, Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";

import { avisar, Confirmar } from "@/components/admin/campos";
import { Cabecalho, MenuAcoes, Selo, useUltimo } from "@/components/admin/ui";
import { EstadoVazio } from "@/components/sistema/estados/estado-vazio";
import { ItemEscalonado, ListaEscalonada } from "@/components/sistema/movimento";
import { Button } from "@/components/sistema/ui/button";
import { Card } from "@/components/sistema/ui/card";
import SeloSvg from "@/components/ui/SeloSvg";
import { alternarSelo, excluirSelo, moverSelo } from "@/lib/admin/selos-actions";
import type { SeloDef } from "@/lib/selos";
import { cn } from "@/lib/utils";

import EditorSelo from "./EditorSelo";

function CartaoSelo({
  selo,
  uso,
  indice,
  primeiro,
  ultimo,
  onEditar,
  onExcluir,
}: {
  selo: SeloDef;
  uso: number;
  indice: number;
  primeiro: boolean;
  ultimo: boolean;
  onEditar: () => void;
  onExcluir: () => void;
}) {
  const [, iniciar] = useTransition();

  function acao(chave: string) {
    if (chave === "editar") return onEditar();
    if (chave === "excluir") return onExcluir();
    iniciar(async () => {
      if (chave === "ativo") {
        avisar(await alternarSelo(selo.id, !selo.ativo), selo.ativo ? "Selo desativado no site" : "Selo ativo no site");
      } else if (chave === "cima" || chave === "baixo") {
        const r = await moverSelo(selo.id, chave);
        if (!r.ok) avisar(r, "");
      }
    });
  }

  return (
    <Card className={cn("gap-0 overflow-hidden py-0", !selo.ativo && "opacity-70")}>
      <button
        type="button"
        onClick={onEditar}
        className="relative grid place-items-center py-7 outline-none focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:ring-inset"
        style={{
          background: `radial-gradient(circle at 50% 50%, color-mix(in oklab, ${selo.cor} 14%, transparent), transparent 70%)`,
        }}
        aria-label={`Editar ${selo.nome}`}
      >
        <SeloSvg selo={selo} tamanho={76} animar atraso={indice * 0.06} />
        {!selo.ativo && (
          <Selo className="absolute top-3 left-3">
            <EyeOff /> Desativado
          </Selo>
        )}
      </button>
      <div className="flex items-start gap-2 border-t px-4 py-3.5">
        <div className="min-w-0 grow">
          <p className="truncate text-[15px] font-semibold">{selo.nome}</p>
          <p className="truncate text-[13px] text-muted-foreground">{selo.descricao ?? "Sem legenda"}</p>
          <p className="mt-2 text-xs text-texto-terciario">
            {uso === 0 ? "Nenhum prato usa" : uso === 1 ? "Em 1 prato" : `Em ${uso} pratos`}
          </p>
        </div>
        <MenuAcoes
          rotulo={`Ações do selo ${selo.nome}`}
          aoEscolher={acao}
          acoes={[
            { id: "editar", rotulo: "Editar", icone: Pencil },
            { id: "ativo", rotulo: selo.ativo ? "Desativar no site" : "Ativar no site", icone: selo.ativo ? EyeOff : Eye },
            { id: "cima", rotulo: "Mover para antes", icone: ArrowUp, desabilitada: primeiro, separar: true },
            { id: "baixo", rotulo: "Mover para depois", icone: ArrowDown, desabilitada: ultimo },
            { id: "excluir", rotulo: "Excluir", icone: Trash2, perigo: true, separar: true },
          ]}
        />
      </div>
    </Card>
  );
}

export default function GestorSelos({ selos, uso }: { selos: SeloDef[]; uso: Record<string, number> }) {
  const [editando, setEditando] = useState<SeloDef | "novo" | null>(null);
  const [sessao, setSessao] = useState(0);
  const [excluindo, setExcluindo] = useState<SeloDef | null>(null);
  const excluido = useUltimo(excluindo);

  function abrir(alvo: SeloDef | "novo") {
    setSessao((n) => n + 1);
    setEditando(alvo);
  }

  return (
    <>
      <Cabecalho
        titulo="Selos"
        descricao="Os símbolos ao lado dos pratos no cardápio, no executivo e na página inicial. Cada selo tem formato, símbolo e cor próprios, e entra animado no site."
        acoes={
          <Button className="rounded-full" onClick={() => abrir("novo")}>
            <Plus /> Novo selo
          </Button>
        }
      />

      {selos.length === 0 ? (
        <Card>
          <EstadoVazio
            icone={Award}
            titulo="Nenhum selo cadastrado"
            descricao="Crie selos como Vegetariano ou Sem glúten e marque nos pratos."
          />
        </Card>
      ) : (
        <ListaEscalonada className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {selos.map((s, i) => (
            <ItemEscalonado key={s.id}>
              <CartaoSelo
                selo={s}
                uso={uso[s.id] ?? 0}
                indice={i}
                primeiro={i === 0}
                ultimo={i === selos.length - 1}
                onEditar={() => abrir(s)}
                onExcluir={() => setExcluindo(s)}
              />
            </ItemEscalonado>
          ))}
          <ItemEscalonado>
            <button
              type="button"
              onClick={() => abrir("novo")}
              className="flex h-full min-h-56 w-full flex-col items-center justify-center gap-3 rounded-[20px] border-2 border-dashed border-input text-sm font-medium text-muted-foreground transition-colors hover:border-secao/50 hover:bg-secao/5 hover:text-secao-texto"
            >
              <span className="grid size-12 place-items-center rounded-full bg-muted">
                <Plus className="size-5" />
              </span>
              Criar um selo
            </button>
          </ItemEscalonado>
        </ListaEscalonada>
      )}

      <EditorSelo editando={editando} sessao={sessao} onFechar={() => setEditando(null)} />

      <Confirmar
        aberto={excluindo !== null}
        onFechar={() => setExcluindo(null)}
        titulo="Excluir selo?"
        texto={
          excluido ? (
            <>
              <strong className="text-foreground">{excluido.nome}</strong> sai do site e de{" "}
              {(uso[excluido.id] ?? 0) === 1 ? "1 prato" : `${uso[excluido.id] ?? 0} pratos`}. Se for só por um tempo,
              prefira desativar.
            </>
          ) : null
        }
        onConfirmar={async () => {
          if (!excluindo) return;
          avisar(await excluirSelo(excluindo.id), "Selo excluído");
        }}
      />
    </>
  );
}
