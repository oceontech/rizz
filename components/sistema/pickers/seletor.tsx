"use client";

import { useRef } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/sistema/ui/select";
import { cn } from "@/lib/utils";
import { CLASSE_VARIANTE, type VarianteSeletor } from "./variantes";

export type Opcao = { valor: string; rotulo: string; descricao?: string; desabilitada?: boolean };

type Props = {
  opcoes: Opcao[];
  valor: string | undefined;
  aoMudar: (valor: string) => void;
  placeholder?: string;
  desabilitado?: boolean;
  id?: string;
  /** "campo" em formulário (padrão); "pilula" para controle solto num card; "pilula-clara" sobre o fundo da página */
  variante?: VarianteSeletor;
  className?: string;
  "aria-invalid"?: boolean;
  "aria-label"?: string;
};

/** Select próprio (Radix), para listas curtas. Para listas longas, use o Combobox. */
export function Seletor({ opcoes, valor, aoMudar, placeholder = "Selecione", desabilitado, id, variante = "campo", className, ...props }: Props) {
  // Na pílula, quem abriu com o mouse ou o dedo não recebe o foco de volta ao fechar: senão o anel azul de foco
  // ficava aceso depois da escolha. Pelo teclado, o foco volta normalmente.
  const abriuComPonteiro = useRef(false);
  const pilula = variante !== "campo";
  return (
    <Select value={valor} onValueChange={aoMudar} disabled={desabilitado}>
      <SelectTrigger
        id={id}
        // Na pílula, a seta fica azul (o destaque do sistema)
        className={cn("w-full", CLASSE_VARIANTE[variante], pilula && "[&_[data-slot=select-seta]]:text-primary-texto", className)}
        aria-invalid={props["aria-invalid"]}
        aria-label={props["aria-label"]}
        onPointerDown={() => (abriuComPonteiro.current = true)}
        onKeyDown={() => (abriuComPonteiro.current = false)}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        position="popper"
        onCloseAutoFocus={(evento) => {
          if (pilula && abriuComPonteiro.current) evento.preventDefault();
        }}
      >
        {opcoes.map((opcao) => (
          <SelectItem key={opcao.valor} value={opcao.valor} disabled={opcao.desabilitada}>
            {opcao.rotulo}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
