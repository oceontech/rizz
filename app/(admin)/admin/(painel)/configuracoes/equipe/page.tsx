import type { Metadata } from "next";

import GestorEquipe from "@/components/admin/equipe/GestorEquipe";
import { canaisDisponiveis } from "@/lib/admin/envio-acesso";
import { lerEquipe } from "@/lib/admin/equipe";
import { exigirAcesso } from "@/lib/auth";

export const metadata: Metadata = { title: "Equipe e acessos" };

/** Hora da renderização: a tela calcula o "entrou há X" a partir dela. */
const agoraMs = () => Date.now();

export default async function EquipePage() {
  const sessao = await exigirAcesso("equipe");
  const [{ membros, convites }, canais] = await Promise.all([lerEquipe(), canaisDisponiveis()]);
  return (
    <GestorEquipe
      membros={membros}
      convites={convites}
      eu={{ id: sessao.id, papel: sessao.papel }}
      podeEditar={sessao.permissoes.equipe === "editar"}
      agora={agoraMs()}
      canais={canais}
    />
  );
}
