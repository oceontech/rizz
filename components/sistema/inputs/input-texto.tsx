"use client";

import { Search, X } from "lucide-react";
import { useState, type ComponentProps, type Ref } from "react";
import { Textarea } from "@/components/sistema/ui/textarea";
import { cn } from "@/lib/utils";
import { BotaoInterno, Caixa, classeInputInterno, useLigacaoCampo, type PropsBase } from "./caixa";

// Texto livre. Funciona com register() do React Hook Form (não controlado) e
// controlado. Espaços sobrando saem no Zod (trim); aqui só o contador.

/** Contador "45/50" que aparece a partir de 80% do limite */
function Contador({ tamanho, maximo }: { tamanho: number; maximo?: number }) {
  if (!maximo || tamanho < maximo * 0.8) return null;
  return (
    <span aria-live="polite" className={cn("numeros text-xs", tamanho >= maximo ? "text-negativo-texto" : "text-muted-foreground")}>
      {tamanho}/{maximo}
    </span>
  );
}

const tamanhoInicial = (valor: unknown) => (typeof valor === "string" ? valor.length : 0);

type PropsTexto = Omit<PropsBase, "defaultValue"> & {
  value?: string;
  defaultValue?: string;
  onChange?: ComponentProps<"input">["onChange"];
  ref?: Ref<HTMLInputElement>;
};

/** Nome, cidade, título… com limite e contador perto do limite. */
export function InputTexto({ prefixo, sufixo, acao, classeCaixa, className, maxLength, onChange, disabled, ref, ...props }: PropsTexto) {
  const ligacao = useLigacaoCampo(props);
  const [tamanho, setTamanho] = useState(() => tamanhoInicial(props.value ?? props.defaultValue));
  const atual = props.value !== undefined ? props.value.length : tamanho;

  return (
    <Caixa
      prefixo={prefixo}
      sufixo={sufixo ?? <Contador tamanho={atual} maximo={maxLength} />}
      acao={acao}
      invalido={ligacao.invalido}
      desabilitado={disabled}
      className={classeCaixa}
    >
      <input
        ref={ref}
        type="text"
        {...props}
        id={ligacao.id}
        aria-invalid={ligacao["aria-invalid"]}
        aria-describedby={ligacao["aria-describedby"]}
        disabled={disabled}
        maxLength={maxLength}
        onChange={(e) => {
          setTamanho(e.currentTarget.value.length);
          onChange?.(e);
        }}
        className={classeInputInterno(Boolean(prefixo), className)}
      />
    </Caixa>
  );
}

/** Texto longo: cresce com o conteúdo, com contador perto do limite. */
export function AreaTexto({ maxLength, onChange, className, ...props }: ComponentProps<typeof Textarea>) {
  const ligacao = useLigacaoCampo(props);
  const [tamanho, setTamanho] = useState(() => tamanhoInicial(props.value ?? props.defaultValue));
  const atual = typeof props.value === "string" ? props.value.length : tamanho;

  return (
    <div className="relative">
      <Textarea
        {...props}
        id={ligacao.id}
        aria-invalid={ligacao["aria-invalid"]}
        aria-describedby={ligacao["aria-describedby"]}
        maxLength={maxLength}
        onChange={(e) => {
          setTamanho(e.currentTarget.value.length);
          onChange?.(e);
        }}
        className={cn(maxLength && atual >= maxLength * 0.8 && "pb-7", className)}
      />
      <span className="pointer-events-none absolute right-3 bottom-2">
        <Contador tamanho={atual} maximo={maxLength} />
      </span>
    </div>
  );
}

type PropsBusca = Omit<PropsBase, "prefixo"> & {
  valor: string;
  aoMudar: (texto: string) => void;
  ref?: Ref<HTMLInputElement>;
};

/** Busca com lupa e botão de limpar; Esc também limpa. */
export function InputBusca({ valor, aoMudar, classeCaixa, className, onKeyDown, ref, ...props }: PropsBusca) {
  const ligacao = useLigacaoCampo(props);
  return (
    <Caixa
      prefixo={<Search aria-hidden />}
      acao={
        valor ? (
          <BotaoInterno aria-label="Limpar busca" onClick={() => aoMudar("")}>
            <X />
          </BotaoInterno>
        ) : undefined
      }
      invalido={ligacao.invalido}
      className={classeCaixa}
    >
      <input
        ref={ref}
        type="search"
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        {...props}
        id={ligacao.id}
        aria-describedby={ligacao["aria-describedby"]}
        value={valor}
        onChange={(e) => aoMudar(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && valor) {
            e.preventDefault();
            aoMudar("");
          }
          onKeyDown?.(e);
        }}
        className={classeInputInterno(true, cn("[&::-webkit-search-cancel-button]:hidden", className))}
      />
    </Caixa>
  );
}
