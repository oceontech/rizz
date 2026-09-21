"use client";

import { Percent } from "@gravity-ui/icons";
import { Alert, Button, Modal } from "@heroui/react";
import { useState } from "react";

import { avisar, CampoNumero, CampoSelect } from "@/components/admin/campos";
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
  const [percentual, setPercentual] = useState<number | null>(5);
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
    <Modal>
      <Modal.Backdrop isOpen={aberto} onOpenChange={(v) => !v && onFechar()}>
        <Modal.Container size="sm">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Icon className="bg-accent/10 text-accent">
                <Percent className="size-5" />
              </Modal.Icon>
              <Modal.Heading>Reajustar preços</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-4">
              <CampoSelect
                label="Aplicar em"
                value={categoria}
                onChange={setCategoria}
                opcoes={[{ id: "todas", rotulo: "Todo o cardápio" }, ...categorias.map((c) => ({ id: c.id, rotulo: c.nome }))]}
              />
              <CampoNumero
                label="Percentual"
                value={percentual}
                onChange={setPercentual}
                min={-50}
                max={50}
                passo={1}
                formato={{ style: "unit", unit: "percent", maximumFractionDigits: 1, signDisplay: "exceptZero" }}
                descricao="Valores arredondados para o real inteiro, como no cardápio impresso."
              />
              {percentual !== null && percentual !== 0 && percentual !== undefined && (
                <Alert status="accent">
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Title>{afetados.length} pratos serão reajustados</Alert.Title>
                    {exemplo && exemplo.preco !== null && (
                      <Alert.Description>
                        Ex.: {exemplo.nome} — {brl.format(exemplo.preco)} →{" "}
                        {brl.format(Math.round(exemplo.preco * fator))}
                      </Alert.Description>
                    )}
                  </Alert.Content>
                </Alert>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="tertiary" onPress={onFechar} isDisabled={salvando}>
                Cancelar
              </Button>
              <Button onPress={aplicar} isPending={salvando} isDisabled={!percentual}>
                Aplicar reajuste
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
