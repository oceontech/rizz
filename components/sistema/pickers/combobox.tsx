"use client";

import { Check, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/sistema/ui/command";
import { cn } from "@/lib/utils";
import { GatilhoCampo } from "./gatilho-campo";
import type { VarianteSeletor } from "./variantes";
import { PainelAdaptavel } from "./painel-adaptavel";
import type { Opcao } from "./seletor";

type Props = {
  opcoes: Opcao[];
  valor: string | undefined;
  aoMudar: (valor: string) => void;
  placeholder?: string;
  titulo?: string;
  textoBusca?: string;
  textoVazio?: string;
  icone?: LucideIcon;
  id?: string;
  /** "campo" em formulário (padrão); "pilula" para controle solto num card; "pilula-clara" sobre o fundo da página */
  variante?: VarianteSeletor;
  className?: string;
  invalido?: boolean;
  /** Gatilho próprio; por padrão é um botão com aparência de campo */
  gatilho?: (props: { valor: Opcao | undefined; aberto: boolean }) => React.ReactNode;
};

/** Seleção com busca para listas longas (clientes, usuários). */
export function Combobox({
  opcoes,
  valor,
  aoMudar,
  placeholder = "Selecione",
  titulo = "Selecione",
  textoBusca = "Buscar…",
  textoVazio = "Nada encontrado.",
  icone,
  id,
  variante,
  className,
  invalido,
  gatilho,
}: Props) {
  const [aberto, setAberto] = useState(false);
  const selecionada = opcoes.find((opcao) => opcao.valor === valor);

  return (
    <PainelAdaptavel
      aberto={aberto}
      aoMudar={setAberto}
      titulo={titulo}
      className="p-0 md:w-72"
      gatilho={
        gatilho ? (
          gatilho({ valor: selecionada, aberto })
        ) : (
          <GatilhoCampo
            id={id}
            icone={icone}
            valor={selecionada?.rotulo}
            placeholder={placeholder}
            variante={variante}
            className={className}
            role="combobox"
            aria-expanded={aberto}
            aria-invalid={invalido || undefined}
          />
        )
      }
    >
      <Command className="bg-transparent">
        <CommandInput placeholder={textoBusca} />
        <CommandList className="max-h-72">
          <CommandEmpty className="py-8 text-center text-sm text-muted-foreground">{textoVazio}</CommandEmpty>
          <CommandGroup>
            {opcoes.map((opcao) => (
              <CommandItem
                key={opcao.valor}
                value={`${opcao.rotulo} ${opcao.descricao ?? ""}`}
                disabled={opcao.desabilitada}
                onSelect={() => {
                  aoMudar(opcao.valor);
                  setAberto(false);
                }}
                className="min-h-11 md:min-h-9"
              >
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate">{opcao.rotulo}</span>
                  {opcao.descricao && <span className="truncate text-xs text-muted-foreground">{opcao.descricao}</span>}
                </div>
                <Check className={cn("size-4 text-primary-texto", opcao.valor === valor ? "opacity-100" : "opacity-0")} />
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </PainelAdaptavel>
  );
}
