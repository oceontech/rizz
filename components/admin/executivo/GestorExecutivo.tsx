"use client";

import { ArrowDown, ArrowUp, Briefcase, Ellipsis, Pencil, Plus, TrashBin } from "@gravity-ui/icons";
import { Button, Card, Chip, Dropdown, Label, Modal, Separator, Switch } from "@heroui/react";
import { useState, useTransition } from "react";

import {
  avisar,
  CampoNumero,
  CampoSelect,
  CampoSwitch,
  CampoTexto,
  Confirmar,
  FORMATO_BRL,
} from "@/components/admin/campos";
import { Cabecalho } from "@/components/admin/ui";
import {
  alternarItemExecutivo,
  excluirItemExecutivo,
  moverItemExecutivo,
  salvarConfigExecutivo,
  salvarItemExecutivo,
} from "@/lib/admin/executivo-actions";
import { brl } from "@/lib/admin/formato";
import type { ExecutivoDados, ItemExecutivoDB, SecaoExecutivo } from "@/lib/dados";

const SECOES: { id: SecaoExecutivo; titulo: string }[] = [
  { id: "entradas", titulo: "Entradas" },
  { id: "pratos", titulo: "Pratos principais" },
  { id: "sobremesas", titulo: "Sobremesas" },
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
    <Card className="gap-5 p-5 lg:sticky lg:top-8">
      <Card.Header className="p-0">
        <Card.Title>Condições</Card.Title>
        <Card.Description>O que o cliente vê na home e no cardápio.</Card.Description>
      </Card.Header>
      <div className="flex flex-col gap-4">
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
        <Separator />
        <CampoNumero
          label="Menu completo (por pessoa)"
          value={preco}
          onChange={setPreco}
          min={0}
          passo={0.5}
          formato={FORMATO_BRL}
          descricao={
            dados.precoAvulsoMin
              ? `Pratos avulsos a partir de ${brl.format(dados.precoAvulsoMin)}`
              : undefined
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <CampoTexto label="Dias" value={dias} onChange={setDias} placeholder="Terça a sexta" />
          <CampoTexto label="Horário" value={horario} onChange={setHorario} placeholder="11h às 14h30" />
        </div>
        <CampoTexto
          label="Chamada"
          value={chamada}
          onChange={setChamada}
          multilinha
          linhas={3}
          maxLength={300}
        />
      </div>
      <Button onPress={salvar} isPending={salvando} fullWidth>
        Salvar condições
      </Button>
    </Card>
  );
}

function EditorItem({
  aberto,
  item,
  secaoInicial,
  onFechar,
}: {
  aberto: boolean;
  item: ItemExecutivoDB | null;
  secaoInicial: SecaoExecutivo;
  onFechar: () => void;
}) {
  return (
    <Modal>
      <Modal.Backdrop isOpen={aberto} onOpenChange={(v) => !v && onFechar()}>
        <Modal.Container size="sm">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            {aberto && (
              <FormItem key={item?.id ?? `novo-${secaoInicial}`} item={item} secaoInicial={secaoInicial} onFechar={onFechar} />
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

function FormItem({
  item,
  secaoInicial,
  onFechar,
}: {
  item: ItemExecutivoDB | null;
  secaoInicial: SecaoExecutivo;
  onFechar: () => void;
}) {
  const [secao, setSecao] = useState<SecaoExecutivo>(item?.secao ?? secaoInicial);
  const [nome, setNome] = useState(item?.nome ?? "");
  const [preco, setPreco] = useState<number | null>(item?.preco ?? null);
  const [selo, setSelo] = useState<string>(item?.selo ?? "nenhum");
  const [disponivel, setDisponivel] = useState(item?.disponivel ?? true);
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    setSalvando(true);
    const r = await salvarItemExecutivo({
      id: item?.id,
      secao,
      nome,
      preco: preco ?? 0,
      selo: selo === "nenhum" ? null : (selo as "vpj" | "duroc"),
      disponivel,
    });
    setSalvando(false);
    if (avisar(r, item ? "Item atualizado" : "Item adicionado")) onFechar();
  }

  return (
    <>
      <Modal.Header>
        <Modal.Icon className="bg-accent/10 text-accent">
          <Briefcase className="size-5" />
        </Modal.Icon>
        <Modal.Heading>{item ? "Editar item" : "Novo item do executivo"}</Modal.Heading>
      </Modal.Header>
      <Modal.Body className="flex flex-col gap-4">
        <CampoSelect
          label="Seção"
          value={secao}
          onChange={(v) => setSecao(v as SecaoExecutivo)}
          opcoes={SECOES.map((s) => ({ id: s.id, rotulo: s.titulo }))}
        />
        <CampoTexto label="Nome" value={nome} onChange={setNome} obrigatorio autoFocus maxLength={120} />
        <CampoNumero label="Preço avulso" value={preco} onChange={setPreco} min={0} formato={FORMATO_BRL} />
        <CampoSelect
          label="Selo de origem"
          value={selo}
          onChange={setSelo}
          opcoes={[
            { id: "nenhum", rotulo: "Nenhum" },
            { id: "vpj", rotulo: "VPJ", descricao: "Carne bovina/frango certificados" },
            { id: "duroc", rotulo: "Duroc Pork", descricao: "Suíno Duroc" },
          ]}
        />
        <CampoSwitch label="Disponível" value={disponivel} onChange={setDisponivel} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="tertiary" onPress={onFechar} isDisabled={salvando}>
          Cancelar
        </Button>
        <Button onPress={salvar} isPending={salvando}>
          Salvar
        </Button>
      </Modal.Footer>
    </>
  );
}

function LinhaItem({
  item,
  primeiro,
  ultimo,
  onEditar,
  onExcluir,
}: {
  item: ItemExecutivoDB;
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
        <p className={`text-sm font-medium leading-snug ${!disponivel ? "text-muted line-through" : ""}`}>
          {item.nome}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs tabular-nums text-muted">{brl.format(item.preco)}</span>
          {item.selo && (
            <Chip size="sm" variant="soft">
              {item.selo === "vpj" ? "VPJ" : "Duroc"}
            </Chip>
          )}
        </div>
      </button>
      <Switch
        size="sm"
        isSelected={disponivel}
        aria-label={`${item.nome} disponível`}
        onChange={(v) => {
          setDisponivel(v);
          iniciar(async () => {
            const r = await alternarItemExecutivo(item.id, v);
            if (!avisar(r, v ? "Item disponível" : "Item marcado como esgotado")) setDisponivel(!v);
          });
        }}
      >
        <Switch.Content>
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
        </Switch.Content>
      </Switch>
      <Dropdown>
        <Button isIconOnly size="sm" variant="ghost" aria-label={`Ações de ${item.nome}`}>
          <Ellipsis />
        </Button>
        <Dropdown.Popover placement="bottom end">
          <Dropdown.Menu
            disabledKeys={[...(primeiro ? ["cima"] : []), ...(ultimo ? ["baixo"] : [])]}
            onAction={(k) => {
              if (k === "editar") return onEditar();
              if (k === "excluir") return onExcluir();
              iniciar(async () => {
                const r = await moverItemExecutivo(item.id, k as "cima" | "baixo");
                if (!r.ok) avisar(r, "");
              });
            }}
          >
            <Dropdown.Item id="editar" textValue="Editar">
              <Pencil className="size-4" />
              <Label>Editar</Label>
            </Dropdown.Item>
            <Dropdown.Item id="cima" textValue="Mover para cima">
              <ArrowUp className="size-4" />
              <Label>Mover para cima</Label>
            </Dropdown.Item>
            <Dropdown.Item id="baixo" textValue="Mover para baixo">
              <ArrowDown className="size-4" />
              <Label>Mover para baixo</Label>
            </Dropdown.Item>
            <Dropdown.Item id="excluir" textValue="Excluir" variant="danger">
              <TrashBin className="size-4" />
              <Label>Excluir</Label>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
    </li>
  );
}

export default function GestorExecutivo({ dados }: { dados: ExecutivoDados }) {
  const [editando, setEditando] = useState<{ item: ItemExecutivoDB | null; secao: SecaoExecutivo } | null>(null);
  const [excluindo, setExcluindo] = useState<ItemExecutivoDB | null>(null);

  return (
    <>
      <Cabecalho
        titulo="Menu executivo"
        descricao="Almoço de dias úteis: condições, preços e os pratos do dia."
        acoes={
          <Button size="sm" onPress={() => setEditando({ item: null, secao: "pratos" })}>
            <Plus /> Novo item
          </Button>
        }
      />

      <div className="grid items-start gap-5 lg:grid-cols-[1fr_360px]">
        <div className="order-2 flex flex-col gap-4 lg:order-1">
          {SECOES.map((s) => {
            const itens = dados[s.id];
            return (
              <Card key={s.id} className="gap-0 overflow-hidden p-0">
                <div className="flex items-center justify-between px-4 py-3.5 sm:px-5">
                  <h2 className="font-medium">
                    {s.titulo} <span className="ml-1 text-xs font-normal text-muted">{itens.length}</span>
                  </h2>
                  <Button size="sm" variant="ghost" onPress={() => setEditando({ item: null, secao: s.id })}>
                    <Plus /> Adicionar
                  </Button>
                </div>
                <Separator />
                {itens.length === 0 ? (
                  <p className="px-5 py-6 text-sm text-muted">Nenhum item.</p>
                ) : (
                  <ul className="divide-y divide-separator">
                    {itens.map((item, i) => (
                      <LinhaItem
                        key={`${item.id}-${item.disponivel}`}
                        item={item}
                        primeiro={i === 0}
                        ultimo={i === itens.length - 1}
                        onEditar={() => setEditando({ item, secao: item.secao })}
                        onExcluir={() => setExcluindo(item)}
                      />
                    ))}
                  </ul>
                )}
              </Card>
            );
          })}
        </div>
        <div className="order-1 lg:order-2">
          <Configuracao dados={dados} />
        </div>
      </div>

      <EditorItem
        aberto={editando !== null}
        item={editando?.item ?? null}
        secaoInicial={editando?.secao ?? "pratos"}
        onFechar={() => setEditando(null)}
      />
      <Confirmar
        aberto={excluindo !== null}
        onFechar={() => setExcluindo(null)}
        titulo="Excluir item?"
        texto={
          <>
            <strong>{excluindo?.nome}</strong> sai do menu executivo.
          </>
        }
        onConfirmar={async () => {
          if (excluindo) avisar(await excluirItemExecutivo(excluindo.id), "Item excluído");
        }}
      />
    </>
  );
}
