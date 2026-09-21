"use client";

import { Book } from "@gravity-ui/icons";
import { Button, Checkbox, CheckboxGroup, Description, Label, Modal, Separator } from "@heroui/react";
import { useState } from "react";

import {
  avisar,
  CampoNumero,
  CampoSelect,
  CampoSwitch,
  CampoTexto,
  FORMATO_BRL,
  UploadImagem,
} from "@/components/admin/campos";
import { BADGES, type Badge } from "@/data/menu";
import { salvarItem } from "@/lib/admin/cardapio-actions";
import type { CategoriaCardapio, ItemCardapio } from "@/lib/dados";

type Props = {
  aberto: boolean;
  item: ItemCardapio | null;
  categoriaInicial: string | null;
  categorias: CategoriaCardapio[];
  onFechar: () => void;
};

function Formulario({ item, categoriaInicial, categorias, onFechar }: Omit<Props, "aberto">) {
  const [nome, setNome] = useState(item?.nome ?? "");
  const [descricao, setDescricao] = useState(item?.descricao ?? "");
  const [categoriaId, setCategoriaId] = useState(item?.categoriaId ?? categoriaInicial ?? categorias[0]?.id ?? "");
  const [preco, setPreco] = useState<number | null>(item ? item.preco : null);
  const [semPreco, setSemPreco] = useState(item ? item.preco === null : false);
  const [badges, setBadges] = useState<Badge[]>(item?.badges ?? []);
  const [vpj, setVpj] = useState(item?.vpj ?? false);
  const [grupo, setGrupo] = useState(item?.grupo ?? "");
  const [disponivel, setDisponivel] = useState(item?.disponivel ?? true);
  const [visivel, setVisivel] = useState(item?.visivel ?? true);
  const [fotoUrl, setFotoUrl] = useState(item?.fotoUrl ?? null);
  const [salvando, setSalvando] = useState(false);

  const grupos = Array.from(
    new Set(categorias.find((c) => c.id === categoriaId)?.itens.map((i) => i.grupo).filter(Boolean)),
  ) as string[];

  async function salvar() {
    if (nome.trim().length < 2) return avisar({ ok: false, erro: "Informe o nome do prato." }, "");
    if (!semPreco && (preco === null || preco < 0)) {
      return avisar({ ok: false, erro: "Informe o preço ou marque “sob consulta”." }, "");
    }
    setSalvando(true);
    const r = await salvarItem({
      id: item?.id,
      categoriaId,
      nome,
      descricao: descricao || null,
      preco: semPreco ? null : preco,
      badges,
      vpj,
      grupo: grupo || null,
      disponivel,
      visivel,
      fotoUrl,
    });
    setSalvando(false);
    if (avisar(r, item ? "Prato atualizado" : "Prato adicionado ao cardápio")) onFechar();
  }

  return (
    <>
      <Modal.Header>
        <Modal.Icon className="bg-accent/10 text-accent">
          <Book className="size-5" />
        </Modal.Icon>
        <Modal.Heading>{item ? "Editar prato" : "Novo prato"}</Modal.Heading>
      </Modal.Header>
      <Modal.Body className="flex flex-col gap-5">
        <div className="grid gap-5 md:grid-cols-[1fr_220px]">
          <div className="flex flex-col gap-4">
            <CampoTexto label="Nome do prato" value={nome} onChange={setNome} obrigatorio autoFocus maxLength={120} />
            <CampoTexto
              label="Descrição"
              value={descricao}
              onChange={setDescricao}
              multilinha
              linhas={3}
              maxLength={400}
              placeholder="Ingredientes, acompanhamentos, porção…"
              descricao="Aparece em itálico abaixo do nome, no site."
            />
          </div>
          <UploadImagem
            label="Foto (opcional)"
            value={fotoUrl}
            onChange={setFotoUrl}
            pasta="pratos"
            proporcao="aspect-square"
            descricao="JPG, PNG ou WebP até 4,5 MB."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <CampoSelect
            label="Categoria"
            value={categoriaId}
            onChange={setCategoriaId}
            opcoes={categorias.map((c) => ({ id: c.id, rotulo: c.nome }))}
          />
          <CampoTexto
            label="Subgrupo (opcional)"
            value={grupo}
            onChange={setGrupo}
            placeholder={grupos[0] ? `Ex.: ${grupos.slice(0, 2).join(", ")}` : "Ex.: Drinks"}
            descricao="Agrupa itens dentro da categoria, como em Bebidas."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <CampoNumero
            label="Preço"
            value={semPreco ? null : preco}
            onChange={setPreco}
            min={0}
            passo={1}
            formato={FORMATO_BRL}
            desabilitado={semPreco}
          />
          <div className="flex items-end pb-2">
            <Checkbox isSelected={semPreco} onChange={setSemPreco}>
              <Checkbox.Content>
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                Sem preço (sob consulta)
              </Checkbox.Content>
            </Checkbox>
          </div>
        </div>

        <CheckboxGroup value={badges} onChange={(v) => setBadges(v as Badge[])}>
          <Label>Selos</Label>
          <Description>Aparecem no cardápio e servem de filtro para o cliente.</Description>
          <div className="mt-1 grid gap-2 sm:grid-cols-3">
            {(Object.keys(BADGES) as Badge[]).map((b) => (
              <Checkbox key={b} value={b} className="rounded-xl border border-border px-3 py-2.5">
                <Checkbox.Content>
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  {BADGES[b].rotulo}
                </Checkbox.Content>
              </Checkbox>
            ))}
          </div>
        </CheckboxGroup>

        <Separator />

        <div className="flex flex-col gap-4">
          <CampoSwitch
            label="Disponível hoje"
            descricao="Desligue quando acabar — o prato aparece como esgotado no site."
            value={disponivel}
            onChange={setDisponivel}
          />
          <CampoSwitch
            label="Visível no site"
            descricao="Oculte pratos sazonais sem precisar excluí-los."
            value={visivel}
            onChange={setVisivel}
          />
          <CampoSwitch label="Selo VPJ" descricao="Carne com origem certificada VPJ." value={vpj} onChange={setVpj} />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="tertiary" onPress={onFechar} isDisabled={salvando}>
          Cancelar
        </Button>
        <Button onPress={salvar} isPending={salvando}>
          {item ? "Salvar alterações" : "Adicionar prato"}
        </Button>
      </Modal.Footer>
    </>
  );
}

export default function EditorItem({ aberto, onFechar, ...resto }: Props) {
  return (
    <Modal>
      <Modal.Backdrop isOpen={aberto} onOpenChange={(v) => !v && onFechar()}>
        <Modal.Container size="lg" scroll="inside" placement="auto">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            {aberto && (
              <Formulario key={resto.item?.id ?? `novo-${resto.categoriaInicial}`} onFechar={onFechar} {...resto} />
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
