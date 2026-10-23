"use client";

import { FolderPlus } from "lucide-react";
import { useState } from "react";

import { avisar, BotaoSalvar, CampoSwitch, CampoTexto } from "@/components/admin/campos";
import { Janela, useUltimo } from "@/components/admin/ui";
import { Button } from "@/components/sistema/ui/button";
import { salvarCategoria } from "@/lib/admin/cardapio-actions";
import type { CategoriaCardapio } from "@/lib/dados";

function Formulario({
  aberto,
  categoria,
  onFechar,
}: {
  aberto: boolean;
  categoria: CategoriaCardapio | null;
  onFechar: () => void;
}) {
  const [nome, setNome] = useState(categoria?.nome ?? "");
  const [descricao, setDescricao] = useState(categoria?.descricao ?? "");
  const [visivel, setVisivel] = useState(categoria?.visivel ?? true);
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    setSalvando(true);
    const r = await salvarCategoria({ id: categoria?.id, nome, descricao: descricao || null, visivel });
    setSalvando(false);
    if (avisar(r, categoria ? "Categoria atualizada" : "Categoria criada")) onFechar();
  }

  return (
    <Janela
      aberta={aberto}
      aoFechar={onFechar}
      icone={FolderPlus}
      titulo={categoria ? "Editar categoria" : "Nova categoria"}
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
        <CampoTexto label="Nome" value={nome} onChange={setNome} obrigatorio autoFocus maxLength={60} />
        <CampoTexto
          label="Descrição (opcional)"
          value={descricao}
          onChange={setDescricao}
          maxLength={200}
          placeholder="Ex.: Nossa especialidade, em diferentes combinações."
        />
        <CampoSwitch
          label="Visível no site"
          descricao="Uma categoria oculta esconde todos os pratos dela."
          value={visivel}
          onChange={setVisivel}
        />
      </div>
    </Janela>
  );
}

export default function EditorCategoria({
  editando,
  onFechar,
}: {
  editando: CategoriaCardapio | "nova" | null;
  onFechar: () => void;
}) {
  const atual = useUltimo(editando);
  if (!atual) return null;
  const categoria = atual === "nova" ? null : atual;
  return (
    <Formulario key={categoria?.id ?? "nova"} aberto={editando !== null} categoria={categoria} onFechar={onFechar} />
  );
}
