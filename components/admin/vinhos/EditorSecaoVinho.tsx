"use client";

import { FolderPlus } from "lucide-react";
import { useState } from "react";

import { avisar, BotaoSalvar, CampoSwitch, CampoTexto } from "@/components/admin/campos";
import { Janela, useUltimo } from "@/components/admin/ui";
import { Button } from "@/components/sistema/ui/button";
import { salvarSecaoVinho } from "@/lib/admin/vinhos-actions";
import type { SecaoVinhoAdmin } from "@/lib/dados";

function Formulario({ aberto, secao, onFechar }: { aberto: boolean; secao: SecaoVinhoAdmin | null; onFechar: () => void }) {
  const [titulo, setTitulo] = useState(secao?.titulo ?? "");
  const [nota, setNota] = useState(secao?.nota ?? "");
  const [visivel, setVisivel] = useState(secao?.visivel ?? true);
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    setSalvando(true);
    const r = await salvarSecaoVinho({ id: secao?.id, titulo, nota: nota || null, visivel });
    setSalvando(false);
    if (avisar(r, secao ? "Seção atualizada" : "Seção criada")) onFechar();
  }

  return (
    <Janela
      aberta={aberto}
      aoFechar={onFechar}
      icone={FolderPlus}
      titulo={secao ? "Editar seção" : "Nova seção da carta"}
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
        <CampoTexto label="Nome da seção" value={titulo} onChange={setTitulo} obrigatorio autoFocus maxLength={60} placeholder="Ex.: Tintos, Em taça" />
        <CampoTexto label="Observação (opcional)" value={nota} onChange={setNota} maxLength={160} placeholder="Ex.: Taça de 150 ml." descricao="Aparece abaixo do nome da seção no site." />
        <CampoSwitch label="Visível no site" descricao="Uma seção oculta esconde todos os vinhos dela." value={visivel} onChange={setVisivel} />
      </div>
    </Janela>
  );
}

export default function EditorSecaoVinho({ editando, onFechar }: { editando: SecaoVinhoAdmin | "nova" | null; onFechar: () => void }) {
  const atual = useUltimo(editando);
  if (!atual) return null;
  const secao = atual === "nova" ? null : atual;
  return <Formulario key={secao?.id ?? "nova"} aberto={editando !== null} secao={secao} onFechar={onFechar} />;
}
