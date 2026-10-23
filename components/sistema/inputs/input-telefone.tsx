"use client";

import { useState, type Ref } from "react";
import { MASCARA_TELEFONE, telefoneLocal, telefoneParaBanco } from "@/lib/mascaras";
import type { PropsBase } from "./caixa";
import { InputMascarado } from "./input-mascarado";

type PropsDigitos = PropsBase & {
  valor: string | null | undefined;
  aoMudar: (digitos: string | null) => void;
  ref?: Ref<HTMLInputElement>;
};

/**
 * Telefone e WhatsApp: "+55" fixo à esquerda e (11) 91234-5678 no campo.
 * Recebe o valor do banco (com ou sem 55) e devolve sempre com 55.
 */
export function InputTelefone({ valor, aoMudar, ...props }: PropsDigitos) {
  // Enquanto digita, "5511" seria ambíguo (DDD 55?), então o campo guarda os
  // dígitos locais e só relê o valor quando ele muda por fora (ex.: reset).
  const [local, setLocal] = useState(() => telefoneLocal(valor));
  const atual = telefoneParaBanco(local) === (valor || null) ? local : telefoneLocal(valor);

  return (
    <InputMascarado
      inputMode="tel"
      autoComplete="tel-national"
      placeholder="(11) 91234-5678"
      prefixo={<span className="numeros">+55</span>}
      {...props}
      mascara={MASCARA_TELEFONE}
      valor={atual}
      aoMudar={(novo) => {
        setLocal(novo);
        aoMudar(telefoneParaBanco(novo));
      }}
      className="numeros"
    />
  );
}
