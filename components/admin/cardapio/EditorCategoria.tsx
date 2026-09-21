"use client";

import { FolderPlus } from "@gravity-ui/icons";
import { Button, Modal } from "@heroui/react";
import { useState } from "react";

import { avisar, CampoSwitch, CampoTexto } from "@/components/admin/campos";
import { salvarCategoria } from "@/lib/admin/cardapio-actions";
import type { CategoriaCardapio } from "@/lib/dados";

function Formulario({ categoria, onFechar }: { categoria: CategoriaCardapio | null; onFechar: () => void }) {
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
    <>
      <Modal.Header>
        <Modal.Icon className="bg-accent/10 text-accent">
          <FolderPlus className="size-5" />
        </Modal.Icon>
        <Modal.Heading>{categoria ? "Editar categoria" : "Nova categoria"}</Modal.Heading>
      </Modal.Header>
      <Modal.Body className="flex flex-col gap-4">
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

export default function EditorCategoria({
  aberto,
  categoria,
  onFechar,
}: {
  aberto: boolean;
  categoria: CategoriaCardapio | null;
  onFechar: () => void;
}) {
  return (
    <Modal>
      <Modal.Backdrop isOpen={aberto} onOpenChange={(v) => !v && onFechar()}>
        <Modal.Container size="sm">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            {aberto && <Formulario key={categoria?.id ?? "nova"} categoria={categoria} onFechar={onFechar} />}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
