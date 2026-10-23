"use client";

import type { Ref } from "react";
import {
  MASCARA_CODIGO,
  MASCARA_CONTA_ANUNCIO,
  MASCARA_EMAIL,
  MASCARA_INSTAGRAM,
  MASCARA_URL,
  completarUrl,
  contaAnuncioDigitos,
  instagramParaBanco,
  sugerirEmail,
  usuarioInstagram,
} from "@/lib/mascaras";
import { cn } from "@/lib/utils";
import type { PropsBase } from "./caixa";
import { InputMascarado } from "./input-mascarado";

type PropsTexto = PropsBase & {
  valor: string | null | undefined;
  aoMudar: (valor: string | null) => void;
  ref?: Ref<HTMLInputElement>;
};

/** E-mail: minúsculas, sem espaços; sugere o domínio certo (gmial → gmail). */
export function InputEmail({ valor, aoMudar, ...props }: PropsTexto) {
  const sugestao = sugerirEmail(valor ?? "");
  return (
    <div className="flex flex-col gap-1.5">
      <InputMascarado
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        placeholder="nome@empresa.com.br"
        {...props}
        mascara={MASCARA_EMAIL}
        valor={valor ?? ""}
        aoMudar={(limpo) => aoMudar(limpo || null)}
      />
      {sugestao && (
        <button
          type="button"
          onClick={() => aoMudar(sugestao)}
          className="w-fit text-left text-[0.8rem] text-muted-foreground outline-none hover:text-foreground focus-visible:underline"
        >
          Você quis dizer <span className="font-medium text-primary-texto">{sugestao}</span>?
        </button>
      )}
    </div>
  );
}

/** Endereço de site: sem espaços; completa "https://" ao sair do campo. */
export function InputUrl({ valor, aoMudar, onBlur, ...props }: PropsTexto) {
  return (
    <InputMascarado
      inputMode="url"
      autoCapitalize="none"
      placeholder="burgerdavila.com.br"
      {...props}
      mascara={MASCARA_URL}
      valor={valor ?? ""}
      aoMudar={(limpo) => aoMudar(limpo || null)}
      onBlur={(e) => {
        const completa = completarUrl(valor ?? "");
        if (completa !== (valor ?? "")) aoMudar(completa || null);
        onBlur?.(e);
      }}
    />
  );
}

/** @usuario na tela; o formulário recebe o link do perfil. Aceita colar o link. */
export function InputInstagram({ valor, aoMudar, ...props }: PropsTexto) {
  return (
    <InputMascarado
      autoCapitalize="none"
      placeholder="burgerdavila"
      prefixo="@"
      {...props}
      mascara={MASCARA_INSTAGRAM}
      valor={usuarioInstagram(valor)}
      aoMudar={(usuario) => aoMudar(instagramParaBanco(usuario))}
    />
  );
}

/** ID da conta de anúncio da Meta: "act_" fixo + números. */
export function InputContaAnuncio({ valor, aoMudar, className, ...props }: PropsTexto) {
  return (
    <InputMascarado
      inputMode="numeric"
      placeholder="123456789"
      prefixo={<span className="font-mono text-[0.9em]">act_</span>}
      {...props}
      className={cn("font-mono", className)}
      mascara={MASCARA_CONTA_ANUNCIO}
      valor={contaAnuncioDigitos(valor)}
      aoMudar={(digitos) => aoMudar(digitos ? `act_${digitos}` : null)}
    />
  );
}

/** Código técnico (ex.: evento da Meta): minúsculas, números, _ e ponto. */
export function InputCodigo({ valor, aoMudar, className, ...props }: PropsTexto) {
  return (
    <InputMascarado
      autoCapitalize="none"
      {...props}
      className={cn("font-mono", className)}
      mascara={MASCARA_CODIGO}
      valor={valor ?? ""}
      aoMudar={(limpo) => aoMudar(limpo || null)}
    />
  );
}
