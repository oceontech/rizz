"use client";

import type { KeyboardEvent, Ref } from "react";
import { aplicarMascara, apagarSobreSeparador, limparTexto, type Mascara, type Resultado } from "@/lib/mascaras";
import { Caixa, classeInputInterno, useLigacaoCampo, type PropsBase } from "./caixa";

export type PropsMascarado = PropsBase & {
  mascara: Mascara;
  /** Valor limpo (só os caracteres significativos) */
  valor: string;
  aoMudar: (limpo: string) => void;
  ref?: Ref<HTMLInputElement>;
};

/**
 * Base de todos os campos com máscara. Formata enquanto digita sem pular o
 * cursor, recusa caracteres fora da máscara, aceita colar com ou sem
 * formatação e apaga "através" dos separadores.
 */
export function InputMascarado({
  mascara,
  valor,
  aoMudar,
  prefixo,
  sufixo,
  acao,
  classeCaixa,
  className,
  onKeyDown,
  disabled,
  ref,
  ...props
}: PropsMascarado) {
  const ligacao = useLigacaoCampo(props);
  const limpoAtual = limparTexto(mascara, valor);
  const exibicao = mascara.formatar(limpoAtual);

  // Escreve direto no campo (o React encontra o mesmo valor e não mexe no
  // cursor) e só avisa o formulário quando o valor limpo muda.
  const aplicar = (el: HTMLInputElement, r: Resultado) => {
    el.value = r.exibicao;
    if (el === el.ownerDocument.activeElement) el.setSelectionRange(r.cursor, r.cursor);
    if (r.limpo !== limpoAtual) aoMudar(r.limpo);
  };

  const aoTeclar = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || (e.key !== "Backspace" && e.key !== "Delete")) return;
    const el = e.currentTarget;
    const r = apagarSobreSeparador(
      mascara,
      el.value,
      el.selectionStart ?? 0,
      el.selectionEnd ?? 0,
      e.key === "Backspace" ? "tras" : "frente",
    );
    if (r) {
      e.preventDefault();
      aplicar(el, r);
    }
  };

  return (
    <Caixa prefixo={prefixo} sufixo={sufixo} acao={acao} invalido={ligacao.invalido} desabilitado={disabled} className={classeCaixa}>
      <input
        ref={ref}
        type="text"
        autoComplete="off"
        spellCheck={false}
        {...props}
        id={ligacao.id}
        aria-invalid={ligacao["aria-invalid"]}
        aria-describedby={ligacao["aria-describedby"]}
        disabled={disabled}
        value={exibicao}
        onChange={(e) => {
          const el = e.currentTarget;
          aplicar(el, aplicarMascara(mascara, el.value, el.selectionStart ?? el.value.length));
        }}
        onKeyDown={aoTeclar}
        className={classeInputInterno(Boolean(prefixo), className)}
      />
    </Caixa>
  );
}
