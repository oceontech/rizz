"use client";

import { ArrowRight, Percent } from "lucide-react";
import { useState } from "react";

import { avisar, BotaoSalvar, CampoNumero, CampoOpcoes, CampoSelect } from "@/components/admin/campos";
import { Janela } from "@/components/admin/ui";
import { Button } from "@/components/sistema/ui/button";
import { reajustarPrecos } from "@/lib/admin/cardapio-actions";
import { brl } from "@/lib/admin/formato";
import type { CategoriaCardapio } from "@/lib/dados";

export default function ReajustePrecos({
  aberto,
  categorias,
  onFechar,
}: {
  aberto: boolean;
  categorias: CategoriaCardapio[];
  onFechar: () => void;
}) {
  const [categoria, setCategoria] = useState("todas");
  const [sentido, setSentido] = useState<"subir" | "baixar">("subir");
  const [valor, setValor] = useState<number | null>(5);
  const percentual = valor ? (sentido === "subir" ? valor : -valor) : null;
  const [salvando, setSalvando] = useState(false);

  const afetados = categorias
    .filter((c) => categoria === "todas" || c.id === categoria)
    .flatMap((c) => c.itens)
    .filter((i) => i.preco !== null);
  const exemplo = afetados[0];
  const fator = 1 + (percentual ?? 0) / 100;

  async function aplicar() {
    if (!percentual) return;
    setSalvando(true);
    const r = await reajustarPrecos(categoria, percentual);
    setSalvando(false);
    if (avisar(r, `${r.ok ? r.dados : 0} preços reajustados`)) onFechar();
  }

  return (
    <Janela
      aberta={aberto}
      aoFechar={onFechar}
      icone={Percent}
      titulo="Reajustar preços"
      descricao="Valores arredondados para o real inteiro, como no cardápio impresso."
      rodape={
        <>
          <Button variant="secondary" className="rounded-full" onClick={onFechar} disabled={salvando}>
            Cancelar
          </Button>
          <BotaoSalvar pendente={salvando} onClick={aplicar} disabled={!percentual}>
            Aplicar reajuste
          </BotaoSalvar>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <CampoSelect
          label="Aplicar em"
          value={categoria}
          onChange={setCategoria}
          opcoes={[{ id: "todas", rotulo: "Todo o cardápio" }, ...categorias.map((c) => ({ id: c.id, rotulo: c.nome }))]}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <CampoOpcoes
            label="Sentido"
            value={sentido}
            onChange={setSentido}
            opcoes={[
              { id: "subir", rotulo: "Aumentar" },
              { id: "baixar", rotulo: "Reduzir" },
            ]}
          />
          <CampoNumero label="Percentual" unidade="%" value={valor} onChange={setValor} min={1} max={50} />
        </div>
        {percentual !== null && percentual !== 0 && (
          <div className="rounded-2xl bg-primary-suave p-4">
            <p className="text-sm font-semibold text-primary-texto">
              {afetados.length} {afetados.length === 1 ? "prato será reajustado" : "pratos serão reajustados"}
            </p>
            {exemplo && exemplo.preco !== null && (
              <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[13px] text-muted-foreground">
                {exemplo.nome}:
                <span className="numeros">{brl.format(exemplo.preco)}</span>
                <ArrowRight className="size-3.5" />
                <span className="numeros font-semibold text-foreground">{brl.format(Math.round(exemplo.preco * fator))}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </Janela>
  );
}
