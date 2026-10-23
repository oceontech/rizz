"use client";

import type { ClipboardEvent, KeyboardEvent } from "react";
import { centavosDeTexto, formatarMoedaCampo, lerNumero } from "@/lib/mascaras";
import { cn } from "@/lib/utils";
import { Caixa, classeInputInterno, useLigacaoCampo } from "./caixa";
import type { PropsNumero } from "./input-numero";

/**
 * Moeda em R$ com digitação da direita para a esquerda, como em app de
 * banco: "1" → 0,01; "1234" → 12,34. Apagar tira o último dígito. Colar
 * aceita "R$ 1.234,56", "1234,56" ou "1234". Vazio = null.
 */
export function InputMoeda({
  valor,
  aoMudar,
  prefixo = "R$",
  sufixo,
  acao,
  classeCaixa,
  className,
  disabled,
  onKeyDown,
  onPaste,
  ref,
  ...props
}: Omit<PropsNumero, "casas">) {
  const ligacao = useLigacaoCampo(props);
  const exibicao = formatarMoedaCampo(valor);

  // O cursor guarda a distância até o fim, que é onde os dígitos entram
  const aplicar = (el: HTMLInputElement, centavos: number, distanciaDoFim: number) => {
    const novo = centavos === 0 ? null : centavos / 100;
    const texto = formatarMoedaCampo(novo);
    el.value = texto;
    if (el === el.ownerDocument.activeElement) {
      const pos = Math.max(0, texto.length - distanciaDoFim);
      el.setSelectionRange(pos, pos);
    }
    if (novo !== (valor ?? null)) aoMudar(novo);
  };

  const aoTeclar = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || (e.key !== "Backspace" && e.key !== "Delete")) return;
    const el = e.currentTarget;
    const [inicio, fim] = [el.selectionStart ?? el.value.length, el.selectionEnd ?? el.value.length];
    if (inicio !== fim) return;
    // Apagar sobre "." ou "," apaga o dígito vizinho
    const alvo = e.key === "Backspace" ? inicio - 1 : inicio;
    if (alvo < 0 || alvo >= el.value.length || /\d/.test(el.value[alvo])) return;
    let j = alvo;
    while (j >= 0 && j < el.value.length && !/\d/.test(el.value[j])) j += e.key === "Backspace" ? -1 : 1;
    if (j < 0 || j >= el.value.length) return;
    e.preventDefault();
    const texto = el.value.slice(0, j) + el.value.slice(j + 1);
    aplicar(el, centavosDeTexto(texto), el.value.length - (e.key === "Backspace" ? inicio : j + 1));
  };

  const aoColar = (e: ClipboardEvent<HTMLInputElement>) => {
    onPaste?.(e);
    const n = lerNumero(e.clipboardData.getData("text"));
    if (e.defaultPrevented || n === null) return;
    e.preventDefault();
    aplicar(e.currentTarget, Math.round(Math.abs(n) * 100), 0);
  };

  return (
    <Caixa prefixo={prefixo} sufixo={sufixo} acao={acao} invalido={ligacao.invalido} desabilitado={disabled} className={classeCaixa}>
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="0,00"
        {...props}
        id={ligacao.id}
        aria-invalid={ligacao["aria-invalid"]}
        aria-describedby={ligacao["aria-describedby"]}
        disabled={disabled}
        value={exibicao}
        onChange={(e) => {
          const el = e.currentTarget;
          const distancia = el.value.length - (el.selectionStart ?? el.value.length);
          aplicar(el, centavosDeTexto(el.value), distancia);
        }}
        onKeyDown={aoTeclar}
        onPaste={aoColar}
        className={classeInputInterno(Boolean(prefixo), cn("numeros", className))}
      />
    </Caixa>
  );
}
