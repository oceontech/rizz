"use client";

import type { ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/sistema/ui/alert-dialog";

type Props = {
  gatilho: ReactNode;
  titulo: string;
  descricao: string;
  acao: string;
  aoConfirmar: () => void;
};

/**
 * Pede confirmação antes de uma ação que não dá para desfazer. O gatilho na
 * tela é fantasma vermelho (`ghost-destructive`); o vermelho sólido fica só aqui.
 */
export function Confirmar({ gatilho, titulo, descricao, acao, aoConfirmar }: Props) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{gatilho}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{titulo}</AlertDialogTitle>
          <AlertDialogDescription>{descricao}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-full">Cancelar</AlertDialogCancel>
          <AlertDialogAction variant="destructive" className="rounded-full" onClick={aoConfirmar}>
            {acao}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
