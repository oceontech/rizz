"use client";

import { BookOpen, Check } from "lucide-react";
import { useState } from "react";

import {
  avisar,
  BotaoSalvar,
  CampoMoeda,
  CampoSelect,
  CampoSwitch,
  CampoTexto,
  UploadImagem,
} from "@/components/admin/campos";
import { PainelLateral, useUltimo } from "@/components/admin/ui";
import { Button } from "@/components/sistema/ui/button";
import { Checkbox } from "@/components/sistema/ui/checkbox";
import { BADGES, type Badge } from "@/data/menu";
import { salvarItem } from "@/lib/admin/cardapio-actions";
import type { CategoriaCardapio, ItemCardapio } from "@/lib/dados";
import { cn } from "@/lib/utils";

type Props = {
  aberto: boolean;
  item: ItemCardapio | null;
  categoriaInicial: string | null;
  categorias: CategoriaCardapio[];
  onFechar: () => void;
};

function Formulario({ aberto, item, categoriaInicial, categorias, onFechar }: Props) {
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
    <PainelLateral
      aberto={aberto}
      aoFechar={onFechar}
      icone={BookOpen}
      titulo={item ? "Editar prato" : "Novo prato"}
      descricao={item?.nome ?? "Aparece no cardápio do site assim que salvar"}
      largura="data-[side=right]:sm:max-w-xl"
      rodape={
        <>
          <Button variant="secondary" className="rounded-full" onClick={onFechar} disabled={salvando}>
            Cancelar
          </Button>
          <BotaoSalvar className="flex-1" pendente={salvando} onClick={salvar}>
            {item ? "Salvar alterações" : "Adicionar prato"}
          </BotaoSalvar>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-[1fr_168px]">
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
            label="Foto"
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

        <div className="flex flex-col gap-2">
          <CampoMoeda label="Preço" value={semPreco ? null : preco} onChange={setPreco} desabilitado={semPreco} />
          <label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm">
            <Checkbox checked={semPreco} onCheckedChange={(v) => setSemPreco(v === true)} />
            Sem preço (sob consulta)
          </label>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium">Selos</legend>
          <p className="-mt-1 text-[0.8rem] text-muted-foreground">Aparecem no cardápio e servem de filtro para o cliente.</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(BADGES) as Badge[]).map((b) => {
              const marcado = badges.includes(b);
              return (
                <button
                  key={b}
                  type="button"
                  aria-pressed={marcado}
                  onClick={() => setBadges(marcado ? badges.filter((x) => x !== b) : [...badges, b])}
                  className={cn(
                    "flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition-colors duration-150 outline-none focus-visible:ring-3 focus-visible:ring-primary-suave",
                    marcado ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted-hover",
                  )}
                >
                  {marcado && <Check className="size-3.5" />}
                  {BADGES[b].rotulo}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="flex flex-col gap-4 rounded-2xl bg-muted/70 p-4">
          <CampoSwitch
            label="Disponível hoje"
            descricao="Desligue quando acabar: o prato aparece como esgotado no site."
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
      </div>
    </PainelLateral>
  );
}

export default function EditorItem({
  editando,
  categoriaInicial,
  categorias,
  onFechar,
}: {
  editando: ItemCardapio | "novo" | null;
  categoriaInicial: string | null;
  categorias: CategoriaCardapio[];
  onFechar: () => void;
}) {
  const atual = useUltimo(editando);
  if (!atual) return null;
  const item = atual === "novo" ? null : atual;
  return (
    <Formulario
      key={item?.id ?? `novo-${categoriaInicial}`}
      aberto={editando !== null}
      item={item}
      categoriaInicial={categoriaInicial}
      categorias={categorias}
      onFechar={onFechar}
    />
  );
}
