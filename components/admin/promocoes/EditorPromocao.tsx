"use client";

import { Check, Megaphone } from "lucide-react";
import { useState } from "react";

import {
  avisar,
  BotaoSalvar,
  CampoNumero,
  CampoPeriodo,
  CampoSelect,
  CampoSwitch,
  CampoTexto,
  UploadImagem,
} from "@/components/admin/campos";
import { Janela, useUltimo } from "@/components/admin/ui";
import PopupConteudo from "@/components/promo/PopupConteudo";
import { Button } from "@/components/sistema/ui/button";
import { salvarPromocao, type PromocaoEntrada } from "@/lib/admin/promocoes-actions";
import type { Promocao } from "@/lib/dados";
import { whatsappLink } from "@/lib/site";
import { cn } from "@/lib/utils";

const DESTINOS = [
  { id: "/reservas", rotulo: "Página de reservas" },
  { id: "/cardapio", rotulo: "Cardápio" },
  { id: "/cardapio#executivo", rotulo: "Menu executivo" },
  { id: "/fidelidade", rotulo: "Programa de fidelidade" },
  { id: "whatsapp", rotulo: "WhatsApp do restaurante" },
  { id: "outro", rotulo: "Outro link…" },
];

const ESTILOS = [
  { id: "vinho", rotulo: "Vinho", cor: "#70012a" },
  { id: "creme", rotulo: "Creme", cor: "#fdf1e5" },
  { id: "noite", rotulo: "Noite", cor: "#2b0710" },
] as const;

function destinoDe(url: string | null) {
  if (!url) return "/reservas";
  if (url.startsWith("https://wa.me/")) return "whatsapp";
  return DESTINOS.some((d) => d.id === url) ? url : "outro";
}

/** Título de grupo dentro do formulário longo. */
function Grupo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-[0.7rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase">{titulo}</h3>
      {children}
    </section>
  );
}

function Formulario({ aberto, promocao, onFechar }: { aberto: boolean; promocao: Promocao | null; onFechar: () => void }) {
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
    <Janela
      aberta={aberto}
      aoFechar={onFechar}
      icone={Megaphone}
      titulo={promocao ? "Editar promoção" : "Nova promoção"}
      descricao="A prévia ao lado mostra o pop-up como o cliente vai ver."
      largura="sm:max-w-[min(1040px,calc(100%-2rem))]"
      rodape={
        <>
          <Button variant="secondary" className="rounded-full" onClick={onFechar} disabled={salvando}>
            Cancelar
          </Button>
          <BotaoSalvar pendente={salvando} onClick={salvar}>
            {promocao ? "Salvar promoção" : "Criar promoção"}
          </BotaoSalvar>
        </>
      }
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-8">
          <Grupo titulo="Conteúdo">
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
              proporcao="aspect-[16/9]"
              descricao="Formato paisagem funciona melhor. Até 4,5 MB."
            />
          </Grupo>

          <Grupo titulo="Botão">
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
            {destino === "outro" && <CampoTexto label="Link" tipo="url" value={f.ctaUrl ?? ""} onChange={muda("ctaUrl")} />}
          </Grupo>

          <Grupo titulo="Aparência e exibição">
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Estilo</span>
              <div role="radiogroup" aria-label="Estilo" className="grid grid-cols-3 gap-2">
                {ESTILOS.map((e) => {
                  const escolhido = f.estilo === e.id;
                  return (
                    <button
                      key={e.id}
                      type="button"
                      role="radio"
                      aria-checked={escolhido}
                      onClick={() => muda("estilo")(e.id)}
                      className={cn(
                        "flex h-12 items-center gap-2.5 rounded-xl px-3 text-sm font-medium transition-[background-color,box-shadow] duration-150 outline-none focus-visible:ring-3 focus-visible:ring-primary-suave",
                        escolhido ? "bg-primary-suave ring-2 ring-primary" : "bg-muted hover:bg-muted-hover",
                      )}
                    >
                      <span
                        className="grid size-6 place-items-center rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.1)]"
                        style={{ background: e.cor }}
                      >
                        {escolhido && <Check className={cn("size-3.5", e.id === "creme" ? "text-[#70012a]" : "text-white")} />}
                      </span>
                      {e.rotulo}
                    </button>
                  );
                })}
              </div>
            </div>

            <CampoPeriodo
              label="Período de exibição"
              inicio={f.inicio}
              fim={f.fim}
              onChange={(a, b) => setF((x) => ({ ...x, inicio: a, fim: b }))}
              descricao="Opcional. Fora do período o pop-up não aparece, mesmo ativo."
            />

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
                unidade="s"
                value={f.atrasoSeg}
                onChange={(v) => muda("atrasoSeg")(v ?? 0)}
                min={0}
                max={60}
              />
            </div>

            <CampoSwitch
              label="Ativar no site"
              descricao="Pode deixar pronta e ativar depois."
              value={f.ativo}
              onChange={muda("ativo")}
            />
          </Grupo>
        </div>

        {/* Prévia */}
        <div className="lg:sticky lg:top-0 lg:self-start">
          <p className="mb-2 text-[0.7rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase">Prévia</p>
          <div className="rounded-3xl bg-[#1a0409]/90 p-5 sm:p-6">
            <div className="mx-auto max-w-[320px]">
              <PopupConteudo dados={{ ...f, ctaUrl: f.ctaUrl ?? "#" }} onFechar={() => {}} />
            </div>
          </div>
        </div>
      </div>
    </Janela>
  );
}

export default function EditorPromocao({
  editando,
  onFechar,
}: {
  editando: Promocao | "nova" | null;
  onFechar: () => void;
}) {
  const atual = useUltimo(editando);
  if (!atual) return null;
  const promocao = atual === "nova" ? null : atual;
  return <Formulario key={promocao?.id ?? "nova"} aberto={editando !== null} promocao={promocao} onFechar={onFechar} />;
}
