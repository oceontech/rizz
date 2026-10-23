"use client";

import { useState, type ClipboardEvent, type KeyboardEvent, type Ref } from "react";
import {
  aplicarMascara,
  apagarSobreSeparador,
  formatarNumero,
  lerNumero,
  mascaraNumero,
  numeroDeLimpo,
  numeroParaEdicao,
  type Resultado,
} from "@/lib/mascaras";
import { cn } from "@/lib/utils";
import { Caixa, classeInputInterno, useLigacaoCampo, type PropsBase } from "./caixa";

export type PropsNumero = PropsBase & {
  valor: number | null | undefined;
  aoMudar: (valor: number | null) => void;
  /** Casas decimais (padrão: 0 em inteiro, 2 nos demais) */
  casas?: number;
  ref?: Ref<HTMLInputElement>;
};

type PropsBaseNumero = PropsNumero & {
  casas: number;
  /** Fator entre o que se digita e o valor (percentual: 100) */
  escala?: number;
};

const arredondar = (n: number, casas: number) => Math.round(n * 10 ** casas) / 10 ** casas;

/**
 * Número com milhar automático e vírgula decimal. Fora do foco mostra as
 * casas fixas ("1.234,50"); em edição, o que foi digitado.
 */
function InputNumero({
  valor,
  aoMudar,
  casas,
  escala = 1,
  prefixo,
  sufixo,
  acao,
  classeCaixa,
  className,
  disabled,
  onFocus,
  onBlur,
  onKeyDown,
  onPaste,
  ref,
  ...props
}: PropsBaseNumero) {
  const ligacao = useLigacaoCampo(props);
  const [editando, setEditando] = useState<string | null>(null);
  const mascara = mascaraNumero(casas);
  const temValor = valor !== null && valor !== undefined && Number.isFinite(valor);
  const exibicao = editando ?? (temValor ? formatarNumero(valor * escala, casas) : "");

  const emitir = (digitado: number | null) =>
    aoMudar(digitado === null ? null : arredondar(digitado / escala, casas + String(escala).length - 1));

  const aplicar = (el: HTMLInputElement, r: Resultado) => {
    el.value = r.exibicao;
    if (el === el.ownerDocument.activeElement) el.setSelectionRange(r.cursor, r.cursor);
    setEditando(r.exibicao);
    emitir(numeroDeLimpo(r.exibicao));
  };

  const aoTeclar = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    const el = e.currentTarget;
    const [inicio, fim] = [el.selectionStart ?? el.value.length, el.selectionEnd ?? el.value.length];
    // Ponto vira vírgula decimal (teclados que só têm ponto)
    if (e.key === "." && casas > 0 && !el.value.includes(",")) {
      e.preventDefault();
      const texto = `${el.value.slice(0, inicio)},${el.value.slice(fim)}`;
      aplicar(el, aplicarMascara(mascara, texto, inicio + 1));
      return;
    }
    if (e.key === "Backspace" || e.key === "Delete") {
      const r = apagarSobreSeparador(mascara, el.value, inicio, fim, e.key === "Backspace" ? "tras" : "frente");
      if (r) {
        e.preventDefault();
        aplicar(el, r);
      }
    }
  };

  // Colar substitui o valor inteiro, lendo qualquer formato ("1.234,56", "R$ 12", "12.5%")
  const aoColar = (e: ClipboardEvent<HTMLInputElement>) => {
    onPaste?.(e);
    const n = lerNumero(e.clipboardData.getData("text"));
    if (e.defaultPrevented || n === null) return;
    e.preventDefault();
    const texto = numeroParaEdicao(Math.abs(n), casas);
    e.currentTarget.value = texto;
    setEditando(texto);
    emitir(Math.abs(n));
  };

  return (
    <Caixa prefixo={prefixo} sufixo={sufixo} acao={acao} invalido={ligacao.invalido} desabilitado={disabled} className={classeCaixa}>
      <input
        ref={ref}
        type="text"
        inputMode={casas > 0 ? "decimal" : "numeric"}
        autoComplete="off"
        {...props}
        id={ligacao.id}
        aria-invalid={ligacao["aria-invalid"]}
        aria-describedby={ligacao["aria-describedby"]}
        disabled={disabled}
        value={exibicao}
        onFocus={(e) => {
          setEditando(temValor ? numeroParaEdicao(valor * escala, casas) : "");
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setEditando(null);
          onBlur?.(e);
        }}
        onChange={(e) => {
          const el = e.currentTarget;
          aplicar(el, aplicarMascara(mascara, el.value, el.selectionStart ?? el.value.length));
        }}
        onKeyDown={aoTeclar}
        onPaste={aoColar}
        className={classeInputInterno(Boolean(prefixo), cn("numeros", className))}
      />
    </Caixa>
  );
}

/** Inteiro com milhar: 1.281 */
export function InputInteiro(props: PropsNumero) {
  return <InputNumero {...props} casas={0} />;
}

/** Decimal com casas e unidade opcionais: 4,62 · 3,5 km */
export function InputDecimal({ casas = 2, unidade, ...props }: PropsNumero & { unidade?: string }) {
  return <InputNumero sufixo={unidade} {...props} casas={casas} />;
}

/** Percentual: digita 12,15 e o formulário recebe a fração 0.1215 */
export function InputPercentual({ casas = 2, ...props }: PropsNumero) {
  return <InputNumero sufixo="%" {...props} casas={casas} escala={100} />;
}
