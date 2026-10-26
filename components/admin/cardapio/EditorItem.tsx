"use client";

import { BookOpen } from "lucide-react";
import Image from "next/image";
import { useState, type ReactNode } from "react";

import {
  avisar,
  BotaoSalvar,
  CampoMoeda,
  CampoOpcoes,
  CampoSelect,
  CampoSwitch,
  CampoTexto,
  UploadImagem,
} from "@/components/admin/campos";
import { EscolhaSelos } from "@/components/admin/selos/compartilhado";
import { PainelLateral, useUltimo } from "@/components/admin/ui";
import { Button } from "@/components/sistema/ui/button";
import { Checkbox } from "@/components/sistema/ui/checkbox";
import SeloSvg from "@/components/ui/SeloSvg";
import { salvarItem } from "@/lib/admin/cardapio-actions";
import { brl } from "@/lib/admin/formato";
import type { CategoriaCardapio, ItemCardapio } from "@/lib/dados";
import { images } from "@/lib/images";
import type { SeloDef } from "@/lib/selos";
import { cn } from "@/lib/utils";

type Props = {
  aberto: boolean;
  item: ItemCardapio | null;
  categoriaInicial: string | null;
  categorias: CategoriaCardapio[];
  selos: SeloDef[];
  onFechar: () => void;
};

function Bloco({ titulo, descricao, children }: { titulo: string; descricao?: string; children: ReactNode }) {
  return (
    <section className="@container flex flex-col gap-4 border-t pt-5 first:border-t-0 first:pt-0">
      <div>
        <h3 className="text-[0.7rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase">{titulo}</h3>
        {descricao && <p className="mt-1 text-[13px] text-muted-foreground">{descricao}</p>}
      </div>
      {children}
    </section>
  );
}

/** Como a linha do prato aparece no cardápio do site (cores e tipografia de lá). */
function Previa({
  nome,
  descricao,
  preco,
  foto,
  selos,
  disponivel,
}: {
  nome: string;
  descricao: string;
  preco: number | null;
  foto: string | null;
  selos: SeloDef[];
  disponivel: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl" style={{ background: "#fdf1e5", color: "#3a1219" }}>
      <p className="px-4 pt-3 text-[0.62rem] font-semibold tracking-[0.14em] uppercase opacity-50">Prévia no cardápio do site</p>
      <div className={cn("flex items-start gap-3 px-4 pt-2.5 pb-4", !disponivel && "opacity-55")}>
        {foto && (
          <div className="relative size-12 shrink-0 overflow-hidden rounded-full border" style={{ borderColor: "rgb(201 162 39 / 0.4)" }}>
            <Image src={foto} alt="" fill sizes="48px" className="object-cover" />
          </div>
        )}
        <div className="min-w-0 grow">
          <p className="font-display text-[1.15rem] leading-snug" style={{ color: "#70012a" }}>
            {nome || "Nome do prato"}
            {!disponivel && (
              <span
                className="ml-2 inline-block -translate-y-0.5 rounded-full border px-2 py-0.5 align-middle text-[0.55rem] tracking-[0.16em] uppercase"
                style={{ borderColor: "rgb(112 1 42 / 0.3)" }}
              >
                Esgotado hoje
              </span>
            )}
          </p>
          {descricao && <p className="mt-0.5 font-display text-[0.95rem] leading-snug italic opacity-65">{descricao}</p>}
          {selos.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {selos.map((s, i) => (
                <span
                  key={s.id}
                  className="inline-flex h-6 items-center gap-1.5 rounded-full border pr-2.5 pl-[3px] text-[0.68rem] tracking-[0.03em]"
                  style={{ borderColor: "rgb(58 18 25 / 0.15)" }}
                >
                  <SeloSvg selo={s} tamanho={18} animar chave={s.id} atraso={i * 0.06} titulo={false} />
                  {s.nome}
                </span>
              ))}
            </div>
          )}
        </div>
        {disponivel && (
          <p className="numeros shrink-0 font-display text-[1.15rem]" style={{ color: "#70012a" }}>
            {preco === null ? "consulta" : brl.format(preco).replace("R$", "").trim()}
          </p>
        )}
      </div>
    </div>
  );
}

function Formulario({ aberto, item, categoriaInicial, categorias, selos, onFechar }: Props) {
  const [nome, setNome] = useState(item?.nome ?? "");
  const [descricao, setDescricao] = useState(item?.descricao ?? "");
  const [categoriaId, setCategoriaId] = useState(item?.categoriaId ?? categoriaInicial ?? categorias[0]?.id ?? "");
  const [preco, setPreco] = useState<number | null>(item ? item.preco : null);
  const [semPreco, setSemPreco] = useState(item ? item.preco === null : false);
  const [badges, setBadges] = useState<string[]>(item?.badges ?? []);
  const [grupo, setGrupo] = useState(item?.grupo ?? "");
  const [disponivel, setDisponivel] = useState(item?.disponivel ?? true);
  const [visivel, setVisivel] = useState(item?.visivel ?? true);
  const [fotoUrl, setFotoUrl] = useState(item?.fotoUrl ?? null);
  const [salvando, setSalvando] = useState(false);

  const grupos = Array.from(
    new Set(categorias.find((c) => c.id === categoriaId)?.itens.map((i) => i.grupo).filter(Boolean)),
  ) as string[];
  const mapa = new Map(selos.map((s) => [s.id, s]));
  const selosMarcados = badges.map((b) => mapa.get(b)).filter((s): s is SeloDef => Boolean(s?.ativo));
  // Foto da prévia: a enviada agora, ou a do acervo do site (pratos que vieram da peça).
  const fotoPrevia = fotoUrl ?? (item?.img && item.img in images ? images[item.img].src : null);

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
      largura="data-[side=right]:sm:max-w-2xl"
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
        <Previa
          nome={nome}
          descricao={descricao}
          preco={semPreco ? null : preco}
          foto={fotoPrevia}
          selos={selosMarcados}
          disponivel={disponivel}
        />

        <Bloco titulo="O prato">
          <div className="grid gap-4 sm:grid-cols-[1fr_168px]">
            <div className="flex flex-col gap-4">
              <CampoTexto label="Nome do prato" value={nome} onChange={setNome} obrigatorio autoFocus={!item} maxLength={120} />
              <CampoTexto
                label="Descrição"
                value={descricao}
                onChange={setDescricao}
                multilinha
                linhas={3}
                maxLength={400}
                placeholder="Ingredientes, acompanhamentos, porção…"
                descricao="Aparece em itálico abaixo do nome."
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
        </Bloco>

        <Bloco titulo="Onde fica e quanto custa">
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
        </Bloco>

        <Bloco titulo="Selos" descricao="Aparecem ao lado do prato e servem de filtro no cardápio do site.">
          <EscolhaSelos selos={selos} marcados={badges} aoMudar={setBadges} />
        </Bloco>

        <Bloco titulo="No site">
          <CampoOpcoes
            label="Situação hoje"
            value={disponivel ? "sim" : "nao"}
            onChange={(v) => setDisponivel(v === "sim")}
            opcoes={[
              { id: "sim", rotulo: "Disponível" },
              { id: "nao", rotulo: "Esgotado hoje" },
            ]}
            descricao="Esgotado, o prato continua listado no site, apagado e sem preço."
          />
          <div className="rounded-2xl bg-muted/70 p-4">
            <CampoSwitch
              label="Visível no site"
              descricao="Oculte pratos sazonais sem precisar excluí-los."
              value={visivel}
              onChange={setVisivel}
            />
          </div>
        </Bloco>
      </div>
    </PainelLateral>
  );
}

/** `sessao` muda a cada abertura: um "novo prato" sempre começa em branco. */
export default function EditorItem({
  editando,
  sessao,
  categoriaInicial,
  categorias,
  selos,
  onFechar,
}: {
  editando: ItemCardapio | "novo" | null;
  sessao: number;
  categoriaInicial: string | null;
  categorias: CategoriaCardapio[];
  selos: SeloDef[];
  onFechar: () => void;
}) {
  const atual = useUltimo(editando);
  if (!atual) return null;
  const item = atual === "novo" ? null : atual;
  return (
    <Formulario
      key={`${item?.id ?? `novo-${categoriaInicial}`}-${sessao}`}
      aberto={editando !== null}
      item={item}
      categoriaInicial={categoriaInicial}
      categorias={categorias}
      selos={selos}
      onFechar={onFechar}
    />
  );
}
