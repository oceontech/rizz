"use client";

import { Megaphone } from "@gravity-ui/icons";
import { Button, Label, Modal, Separator, ToggleButton, ToggleButtonGroup } from "@heroui/react";
import { useState } from "react";

import {
  avisar,
  CampoNumero,
  CampoPeriodo,
  CampoSelect,
  CampoSwitch,
  CampoTexto,
  UploadImagem,
} from "@/components/admin/campos";
import PopupConteudo from "@/components/promo/PopupConteudo";
import { salvarPromocao, type PromocaoEntrada } from "@/lib/admin/promocoes-actions";
import type { Promocao } from "@/lib/dados";
import { whatsappLink } from "@/lib/site";

const DESTINOS = [
  { id: "/reservas", rotulo: "Página de reservas" },
  { id: "/cardapio", rotulo: "Cardápio" },
  { id: "/cardapio#executivo", rotulo: "Menu executivo" },
  { id: "/fidelidade", rotulo: "Programa de fidelidade" },
  { id: "whatsapp", rotulo: "WhatsApp do restaurante" },
  { id: "outro", rotulo: "Outro link…" },
];

function destinoDe(url: string | null) {
  if (!url) return "/reservas";
  if (url.startsWith("https://wa.me/")) return "whatsapp";
  return DESTINOS.some((d) => d.id === url) ? url : "outro";
}

function Formulario({ promocao, onFechar }: { promocao: Promocao | null; onFechar: () => void }) {
  const [f, setF] = useState<PromocaoEntrada>({
    id: promocao?.id,
    titulo: promocao?.titulo ?? "",
    subtitulo: promocao?.subtitulo ?? "",
    texto: promocao?.texto ?? "",
    imagemUrl: promocao?.imagemUrl ?? null,
    cupom: promocao?.cupom ?? "",
    ctaTexto: promocao?.ctaTexto ?? "Reservar mesa",
    ctaUrl: promocao?.ctaUrl ?? "/reservas",
    inicio: promocao?.inicio ?? null,
    fim: promocao?.fim ?? null,
    ativo: promocao?.ativo ?? true,
    paginas: promocao?.paginas ?? "todas",
    frequencia: promocao?.frequencia ?? "sessao",
    atrasoSeg: promocao?.atrasoSeg ?? 4,
    estilo: promocao?.estilo ?? "vinho",
  });
  const [destino, setDestino] = useState(destinoDe(promocao?.ctaUrl ?? null));
  const [salvando, setSalvando] = useState(false);
  const muda = <K extends keyof PromocaoEntrada>(k: K) => (v: PromocaoEntrada[K]) => setF((a) => ({ ...a, [k]: v }));

  function escolherDestino(d: string) {
    setDestino(d);
    if (d === "whatsapp") muda("ctaUrl")(whatsappLink(`Olá! Vi a promoção "${f.titulo}" no site do Rizz.`));
    else if (d !== "outro") muda("ctaUrl")(d);
    else muda("ctaUrl")("https://");
  }

  async function salvar() {
    setSalvando(true);
    const url = destino === "whatsapp" ? whatsappLink(`Olá! Vi a promoção "${f.titulo}" no site do Rizz.`) : f.ctaUrl;
    const r = await salvarPromocao({
      ...f,
      ctaUrl: f.ctaTexto ? url : null,
      subtitulo: f.subtitulo || null,
      texto: f.texto || null,
      cupom: f.cupom || null,
      ctaTexto: f.ctaTexto || null,
    });
    setSalvando(false);
    if (avisar(r, promocao ? "Promoção atualizada" : "Promoção criada")) onFechar();
  }

  return (
    <>
      <Modal.Header>
        <Modal.Icon className="bg-accent/10 text-accent">
          <Megaphone className="size-5" />
        </Modal.Icon>
        <Modal.Heading>{promocao ? "Editar promoção" : "Nova promoção"}</Modal.Heading>
      </Modal.Header>
      <Modal.Body>
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-4">
            <CampoTexto
              label="Título"
              value={f.titulo}
              onChange={muda("titulo")}
              obrigatorio
              autoFocus
              maxLength={80}
              placeholder="Noite do Risoto"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <CampoTexto
                label="Chamada acima do título"
                value={f.subtitulo ?? ""}
                onChange={muda("subtitulo")}
                maxLength={80}
                placeholder="Só nesta quinta"
              />
              <CampoTexto
                label="Cupom (opcional)"
                value={f.cupom ?? ""}
                onChange={(v) => muda("cupom")(v.toUpperCase().replace(/\s/g, ""))}
                maxLength={30}
                placeholder="RIZZ10"
              />
            </div>
            <CampoTexto
              label="Texto"
              value={f.texto ?? ""}
              onChange={muda("texto")}
              multilinha
              linhas={3}
              maxLength={400}
              placeholder="Rodízio de risotos com taça de vinho da casa por R$ 129."
            />

            <UploadImagem
              label="Imagem (opcional)"
              value={f.imagemUrl}
              onChange={muda("imagemUrl")}
              pasta="promocoes"
              proporcao="aspect-[16/10]"
              descricao="Formato paisagem funciona melhor. Até 4,5 MB."
            />

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <CampoTexto
                label="Texto do botão"
                value={f.ctaTexto ?? ""}
                onChange={muda("ctaTexto")}
                maxLength={40}
                descricao="Deixe vazio para não mostrar botão."
              />
              <CampoSelect label="O botão leva para" value={destino} onChange={escolherDestino} opcoes={DESTINOS} />
            </div>
            {destino === "outro" && (
              <CampoTexto label="Link" tipo="url" value={f.ctaUrl ?? ""} onChange={muda("ctaUrl")} />
            )}

            <Separator />

            <div className="flex flex-col gap-2">
              <Label>Estilo</Label>
              <ToggleButtonGroup
                selectionMode="single"
                disallowEmptySelection
                selectedKeys={new Set([f.estilo])}
                onSelectionChange={(k) => muda("estilo")([...k][0] as PromocaoEntrada["estilo"])}
                className="w-full"
              >
                {(
                  [
                    ["vinho", "Vinho", "#70012a"],
                    ["creme", "Creme", "#fdf1e5"],
                    ["noite", "Noite", "#2b0710"],
                  ] as const
                ).map(([id, rotulo, cor], i) => (
                  <ToggleButton key={id} id={id} className="grow">
                    {i > 0 && <ToggleButtonGroup.Separator />}
                    <span className="size-3.5 rounded-full border border-black/10" style={{ background: cor }} />
                    {rotulo}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </div>

            <CampoPeriodo
              label="Período de exibição"
              inicio={f.inicio}
              fim={f.fim}
              onChange={(a, b) => setF((x) => ({ ...x, inicio: a, fim: b }))}
              descricao="Opcional. Fora do período o pop-up não aparece, mesmo ativo."
            />
            {(f.inicio || f.fim) && (
              <Button
                size="sm"
                variant="ghost"
                className="self-start"
                onPress={() => setF((x) => ({ ...x, inicio: null, fim: null }))}
              >
                Remover período
              </Button>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
              <CampoSelect
                label="Onde aparece"
                value={f.paginas}
                onChange={(v) => muda("paginas")(v as PromocaoEntrada["paginas"])}
                opcoes={[
                  { id: "todas", rotulo: "Todas as páginas" },
                  { id: "home", rotulo: "Página inicial" },
                  { id: "cardapio", rotulo: "Cardápio" },
                  { id: "reservas", rotulo: "Reservas" },
                ]}
              />
              <CampoSelect
                label="Frequência"
                value={f.frequencia}
                onChange={(v) => muda("frequencia")(v as PromocaoEntrada["frequencia"])}
                opcoes={[
                  { id: "sessao", rotulo: "1× por sessão" },
                  { id: "dia", rotulo: "1× por dia" },
                  { id: "sempre", rotulo: "Toda visita" },
                ]}
              />
              <CampoNumero
                label="Aparece após"
                value={f.atrasoSeg}
                onChange={(v) => muda("atrasoSeg")(v ?? 0)}
                min={0}
                max={60}
                formato={{ style: "unit", unit: "second", unitDisplay: "short" }}
              />
            </div>

            <CampoSwitch
              label="Ativar no site"
              descricao="Pode deixar pronta e ativar depois."
              value={f.ativo}
              onChange={muda("ativo")}
            />
          </div>

          {/* Prévia */}
          <div className="lg:sticky lg:top-0 lg:self-start">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-muted">Prévia</p>
            <div className="rounded-2xl bg-[#1a0409]/85 p-4 sm:p-6">
              <div className="mx-auto max-w-[340px]">
                <PopupConteudo dados={{ ...f, ctaUrl: f.ctaUrl ?? "#" }} onFechar={() => {}} />
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="tertiary" onPress={onFechar} isDisabled={salvando}>
          Cancelar
        </Button>
        <Button onPress={salvar} isPending={salvando}>
          {promocao ? "Salvar promoção" : "Criar promoção"}
        </Button>
      </Modal.Footer>
    </>
  );
}

export default function EditorPromocao({
  aberto,
  promocao,
  onFechar,
}: {
  aberto: boolean;
  promocao: Promocao | null;
  onFechar: () => void;
}) {
  return (
    <Modal>
      <Modal.Backdrop isOpen={aberto} onOpenChange={(v) => !v && onFechar()}>
        <Modal.Container size="lg" scroll="inside" className="lg:max-w-[960px]">
          <Modal.Dialog className="lg:max-w-[960px]">
            <Modal.CloseTrigger />
            {aberto && <Formulario key={promocao?.id ?? "nova"} promocao={promocao} onFechar={onFechar} />}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
