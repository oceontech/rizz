"use client";

import { Check, Eye, EyeOff } from "lucide-react";
import { useState, type ComponentProps, type Ref } from "react";
import { cn } from "@/lib/utils";
import { BotaoInterno, Caixa, classeInputInterno, useLigacaoCampo, type PropsBase } from "./caixa";

const REGRAS = [
  { rotulo: "8 ou mais caracteres", ok: (s: string) => s.length >= 8 },
  { rotulo: "Uma letra", ok: (s: string) => /[a-zA-Z]/.test(s) },
  { rotulo: "Um número", ok: (s: string) => /\d/.test(s) },
];

type Props = Omit<PropsBase, "defaultValue"> & {
  value?: string;
  defaultValue?: string;
  onChange?: ComponentProps<"input">["onChange"];
  /** Mostra as regras de senha sendo cumpridas enquanto digita */
  indicador?: boolean;
  ref?: Ref<HTMLInputElement>;
};

/** Senha com botão de mostrar/ocultar e, opcionalmente, as regras ao vivo. */
export function InputSenha({ indicador, classeCaixa, className, onChange, disabled, ref, ...props }: Props) {
  const ligacao = useLigacaoCampo(props);
  const [visivel, setVisivel] = useState(false);
  const [texto, setTexto] = useState(props.value ?? props.defaultValue ?? "");
  const atual = props.value ?? texto;

  return (
    <div className="flex flex-col gap-2">
      <Caixa
        invalido={ligacao.invalido}
        desabilitado={disabled}
        className={classeCaixa}
        acao={
          <BotaoInterno onClick={() => setVisivel(!visivel)} aria-label={visivel ? "Ocultar senha" : "Mostrar senha"} aria-pressed={visivel}>
            {visivel ? <EyeOff /> : <Eye />}
          </BotaoInterno>
        }
      >
        <input
          ref={ref}
          type={visivel ? "text" : "password"}
          autoCapitalize="none"
          spellCheck={false}
          {...props}
          id={ligacao.id}
          aria-invalid={ligacao["aria-invalid"]}
          aria-describedby={[ligacao["aria-describedby"], indicador ? `${ligacao.id}-regras` : null].filter(Boolean).join(" ") || undefined}
          disabled={disabled}
          onChange={(e) => {
            setTexto(e.currentTarget.value);
            onChange?.(e);
          }}
          className={classeInputInterno(false, className)}
        />
      </Caixa>
      {indicador && (
        <ul id={`${ligacao.id}-regras`} className="flex flex-wrap gap-x-4 gap-y-1 text-[0.8rem]">
          {REGRAS.map((regra) => {
            const ok = regra.ok(atual);
            return (
              <li key={regra.rotulo} className={cn("flex items-center gap-1.5 transition-colors", ok ? "text-positivo-texto" : "text-muted-foreground")}>
                <Check className={cn("size-3.5 transition-opacity", ok ? "opacity-100" : "opacity-30")} aria-hidden />
                {regra.rotulo}
                <span className="sr-only">{ok ? "(cumprido)" : "(pendente)"}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
