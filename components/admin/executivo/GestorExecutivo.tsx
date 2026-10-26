"use client";

import { ArrowDown, ArrowUp, BriefcaseBusiness, Pencil, Plus, Settings2, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";

import {
  avisar,
  BotaoSalvar,
  CampoMoeda,
  CampoOpcoes,
  CampoSwitch,
  CampoTexto,
  Confirmar,
} from "@/components/admin/campos";
import { EscolhaSelos, SeloEtiqueta } from "@/components/admin/selos/compartilhado";
import { Cabecalho, Janela, MenuAcoes, Secao, Selo, useUltimo } from "@/components/admin/ui";
import { ItemEscalonado, ListaEscalonada } from "@/components/sistema/movimento";
import { Button } from "@/components/sistema/ui/button";
import { Card } from "@/components/sistema/ui/card";
import { Switch } from "@/components/sistema/ui/switch";
import {
  alternarItemExecutivo,
  excluirItemExecutivo,
  moverItemExecutivo,
  salvarConfigExecutivo,
  salvarItemExecutivo,
} from "@/lib/admin/executivo-actions";
import { brl } from "@/lib/admin/formato";
import type { ExecutivoDados, ItemExecutivoDB, SecaoExecutivo } from "@/lib/dados";
import type { SeloDef } from "@/lib/selos";
import { cn } from "@/lib/utils";

const SECOES: { id: SecaoExecutivo; titulo: string; curto: string }[] = [
  { id: "entradas", titulo: "Entradas", curto: "Entrada" },
  { id: "pratos", titulo: "Pratos principais", curto: "Principal" },
  { id: "sobremesas", titulo: "Sobremesas", curto: "Sobremesa" },
];

function Configuracao({ dados }: { dados: ExecutivoDados }) {
  const [ativo, setAtivo] = useState(dados.ativo);
  const [preco, setPreco] = useState<number | null>(dados.precoCompleto);
  const [confirmadas, setConfirmadas] = useState(dados.condicoesConfirmadas);
  const [dias, setDias] = useState(dados.dias);
  const [horario, setHorario] = useState(dados.horario);
  const [chamada, setChamada] = useState(dados.chamada);
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    setSalvando(true);
    const r = await salvarConfigExecutivo({
      ativo,
      precoCompleto: preco ?? 0,
      condicoesConfirmadas: confirmadas,
      dias,
      horario,
      chamada,
    });
    setSalvando(false);
    avisar(r, "Menu executivo atualizado no site");
  }

  return (
    <Secao icone={Settings2} titulo="Condições" descricao="O que o cliente vê na home e no cardápio." className="lg:sticky lg:top-6">
      <CampoSwitch
        label="Executivo ativo"
        descricao="Desligado, as seções do executivo somem do site."
        value={ativo}
        onChange={setAtivo}
      />
      <CampoSwitch
        label="Mostrar preços"
        descricao="Exibe o valor do menu completo e de cada prato."
        value={confirmadas}
        onChange={setConfirmadas}
      />
      <CampoMoeda
        label="Menu completo (por pessoa)"
        value={preco}
        onChange={setPreco}
        descricao={dados.precoAvulsoMin ? `Pratos avulsos a partir de ${brl.format(dados.precoAvulsoMin)}` : undefined}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <CampoTexto label="Dias" value={dias} onChange={setDias} placeholder="Terça a sexta" />
        <CampoTexto label="Horário" value={horario} onChange={setHorario} placeholder="11h às 14h30" />
      </div>
      <CampoTexto label="Chamada" value={chamada} onChange={setChamada} multilinha linhas={3} maxLength={300} />
      <BotaoSalvar pendente={salvando} onClick={salvar} className="w-full">
        Salvar condições
      </BotaoSalvar>
    </Secao>
  );
}

function FormItem({
  aberto,
  item,
  secaoInicial,
  selos,
  onFechar,
}: {
  aberto: boolean;
  item: ItemExecutivoDB | null;
  secaoInicial: SecaoExecutivo;
  selos: SeloDef[];
  onFechar: () => void;
}) {
  const [secao, setSecao] = useState<SecaoExecutivo>(item?.secao ?? secaoInicial);
  const [nome, setNome] = useState(item?.nome ?? "");
  const [preco, setPreco] = useState<number | null>(item?.preco ?? null);
  const [selo, setSelo] = useState<string | null>(item?.selo ?? null);
  const [disponivel, setDisponivel] = useState(item?.disponivel ?? true);
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    setSalvando(true);
    const r = await salvarItemExecutivo({
      id: item?.id,
      secao,
      nome,
      preco: preco ?? 0,
      selo,
      disponivel,
    });
    setSalvando(false);
    if (avisar(r, item ? "Item atualizado" : "Item adicionado")) onFechar();
  }

  return (
    <Janela
      aberta={aberto}
      aoFechar={onFechar}
      icone={BriefcaseBusiness}
      titulo={item ? "Editar item" : "Novo item do executivo"}
      rodape={
        <>
          <Button variant="secondary" className="rounded-full" onClick={onFechar} disabled={salvando}>
            Cancelar
          </Button>
          <BotaoSalvar pendente={salvando} onClick={salvar}>
            Salvar
          </BotaoSalvar>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <CampoOpcoes
          label="Seção"
          value={secao}
          onChange={setSecao}
          opcoes={SECOES.map((s) => ({ id: s.id, rotulo: s.curto }))}
        />
        <CampoTexto label="Nome" value={nome} onChange={setNome} obrigatorio autoFocus maxLength={120} />
        <CampoMoeda label="Preço avulso" value={preco} onChange={setPreco} />
        <div className="@container flex flex-col gap-1.5">
          <span className="text-sm font-medium">Selo (opcional)</span>
          <EscolhaSelos unico selos={selos} marcados={selo ? [selo] : []} aoMudar={(ids) => setSelo(ids[0] ?? null)} />
        </div>
        <CampoSwitch label="Disponível" value={disponivel} onChange={setDisponivel} />
      </div>
    </Janela>
  );
}

function LinhaItem({
  item,
  selo,
  primeiro,
  ultimo,
  onEditar,
  onExcluir,
}: {
  item: ItemExecutivoDB;
  selo: SeloDef | undefined;
  primeiro: boolean;
  ultimo: boolean;
  onEditar: () => void;
  onExcluir: () => void;
}) {
  const [disponivel, setDisponivel] = useState(item.disponivel);
  const [, iniciar] = useTransition();

  return (
    <li className="flex items-center gap-3 px-4 py-3 sm:px-5">
      <button type="button" onClick={onEditar} className="min-w-0 grow text-left">
        <p className={cn("text-sm leading-snug font-medium", !disponivel && "text-muted-foreground line-through")}>
          {item.nome}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <span className="numeros text-[13px] text-muted-foreground">{brl.format(item.preco)}</span>
          {selo && <SeloEtiqueta selo={selo} />}
          {!disponivel && <Selo tom="negativo">Esgotado</Selo>}
        </div>
      </button>
      <Switch
        checked={disponivel}
        aria-label={`${item.nome} disponível`}
        onCheckedChange={(v) => {
          setDisponivel(v);
          iniciar(async () => {
            const r = await alternarItemExecutivo(item.id, v);
            if (!avisar(r, v ? "Item disponível" : "Item marcado como esgotado")) setDisponivel(!v);
          });
        }}
      />
      <MenuAcoes
        rotulo={`Ações de ${item.nome}`}
        acoes={[
          { id: "editar", rotulo: "Editar", icone: Pencil },
          { id: "cima", rotulo: "Mover para cima", icone: ArrowUp, desabilitada: primeiro, separar: true },
          { id: "baixo", rotulo: "Mover para baixo", icone: ArrowDown, desabilitada: ultimo },
          { id: "excluir", rotulo: "Excluir", icone: Trash2, perigo: true, separar: true },
        ]}
        aoEscolher={(k) => {
          if (k === "editar") return onEditar();
          if (k === "excluir") return onExcluir();
          iniciar(async () => {
            const r = await moverItemExecutivo(item.id, k as "cima" | "baixo");
            if (!r.ok) avisar(r, "");
          });
        }}
      />
    </li>
  );
}

export default function GestorExecutivo({ dados, selos }: { dados: ExecutivoDados; selos: SeloDef[] }) {
  const [editando, setEditando] = useState<{ item: ItemExecutivoDB | null; secao: SecaoExecutivo } | null>(null);
  const atual = useUltimo(editando);
  const [excluindo, setExcluindo] = useState<ItemExecutivoDB | null>(null);
  const excluido = useUltimo(excluindo);

  return (
    <>
      <Cabecalho
        titulo="Menu executivo"
        descricao="Almoço de dias úteis: condições, preços e os pratos do dia."
        acoes={
          <Button className="rounded-full" onClick={() => setEditando({ item: null, secao: "pratos" })}>
            <Plus /> Novo item
          </Button>
        }
      />

      <div className="grid items-start gap-4 lg:grid-cols-[1fr_380px]">
        <ListaEscalonada className="order-2 flex flex-col gap-4 lg:order-1">
          {SECOES.map((s) => {
            const itens = dados[s.id];
            return (
              <ItemEscalonado key={s.id}>
                <Card className="gap-0 py-0">
                  <div className="flex items-center justify-between px-4 py-3.5 sm:px-5">
                    <h2 className="text-[15px] font-semibold">
                      {s.titulo} <span className="numeros ml-1 text-xs font-medium text-muted-foreground">{itens.length}</span>
                    </h2>
                    <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setEditando({ item: null, secao: s.id })}>
                      <Plus /> Adicionar
                    </Button>
                  </div>
                  {itens.length === 0 ? (
                    <p className="border-t px-5 py-6 text-sm text-muted-foreground">Nenhum item.</p>
                  ) : (
                    <ul className="divide-y border-t">
                      {itens.map((item, i) => (
                        <LinhaItem
                          key={`${item.id}-${item.disponivel}`}
                          item={item}
                          selo={selos.find((x) => x.id === item.selo)}
                          primeiro={i === 0}
                          ultimo={i === itens.length - 1}
                          onEditar={() => setEditando({ item, secao: item.secao })}
                          onExcluir={() => setExcluindo(item)}
                        />
                      ))}
                    </ul>
                  )}
                </Card>
              </ItemEscalonado>
            );
          })}
        </ListaEscalonada>
        <div className="order-1 lg:order-2">
          <Configuracao dados={dados} />
        </div>
      </div>

      {atual && (
        <FormItem
          key={atual.item?.id ?? `novo-${atual.secao}`}
          aberto={editando !== null}
          item={atual.item}
          secaoInicial={atual.secao}
          selos={selos}
          onFechar={() => setEditando(null)}
        />
      )}
      <Confirmar
        aberto={excluindo !== null}
        onFechar={() => setExcluindo(null)}
        titulo="Excluir item?"
        texto={
          <>
            <strong className="text-foreground">{excluido?.nome}</strong> sai do menu executivo.
          </>
        }
        onConfirmar={async () => {
          if (excluindo) avisar(await excluirItemExecutivo(excluindo.id), "Item excluído");
        }}
      />
    </>
  );
}
