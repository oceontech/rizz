"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { BotaoLink } from "@/components/ui/Botao";
import Preco from "@/components/ui/Preco";
import { EtiquetaSelo } from "@/components/ui/Selos";
import type { ExecutivoDados, ItemExecutivoDB } from "@/lib/dados";
import { statusDoExecutivo, type StatusExecutivo } from "@/lib/hours";
import { img } from "@/lib/images";
import { whatsappLink } from "@/lib/site";

/** Situação do executivo no relógio de quem visita (como o "aberto agora"). */
function useStatusExecutivo() {
  const [status, setStatus] = useState<StatusExecutivo | null>(null);
  useEffect(() => {
    const atualizar = () => setStatus(statusDoExecutivo());
    atualizar();
    const id = setInterval(atualizar, 60_000);
    return () => clearInterval(id);
  }, []);
  return status;
}

function CartaoStatus() {
  const status = useStatusExecutivo();
  if (!status) return <div className="h-[4.5rem]" aria-hidden />;

  return (
    <div
      className={`flex items-center gap-4 rounded-2xl px-5 py-4 ${status.disponivel ? "bg-verde text-creme" : "bg-noite text-creme"}`}
      role="status"
    >
      <span className={`relative flex size-3 shrink-0 ${status.disponivel ? "text-emerald-300" : "text-ambar"}`}>
        {status.disponivel && <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-70 motion-reduce:animate-none" />}
        <span className="relative inline-flex size-3 rounded-full bg-current" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold tracking-[0.14em] uppercase">{status.rotulo}</p>
        {status.detalhe && <p className="mt-0.5 text-sm text-creme/75">{status.detalhe}</p>}
      </div>
    </div>
  );
}

function Coluna({
  titulo,
  itens,
  capa,
  comPreco,
}: {
  titulo: string;
  itens: ItemExecutivoDB[];
  capa: ReturnType<typeof img>;
  comPreco: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-3xl bg-creme shadow-[0_20px_50px_rgb(58_18_25/0.08)]">
      <div className="relative aspect-[16/9]">
        <Image src={capa} alt="" fill placeholder="blur" sizes="(min-width: 860px) 30vw, 100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        <h3 className="absolute bottom-4 left-5 font-[family-name:var(--font-instrument)] text-[2.5rem] leading-none tracking-[0.01em] text-white uppercase not-italic">
          {titulo}
        </h3>
      </div>
      <ul className="px-5 py-2">
        {itens.map((item) => (
          <li key={item.id} className="flex items-center gap-3.5 border-b border-tinta/10 py-3.5 last:border-0">
            {item.img ? (
              <span className="relative size-12 shrink-0 overflow-hidden rounded-full">
                <Image src={img(item.img)} alt="" fill sizes="48px" className="object-cover" />
              </span>
            ) : (
              <span className="size-12 shrink-0 rounded-full bg-creme-2" aria-hidden />
            )}
            <span className="min-w-0 grow">
              <span className="block text-[0.9375rem] leading-snug font-medium text-tinta">{item.nome}</span>
              {item.selo && (
                <span className="mt-1 inline-block">
                  <EtiquetaSelo id={item.selo} />
                </span>
              )}
            </span>
            {comPreco && <Preco valor={item.preco} className="shrink-0 text-lg text-vinho [&>span]:opacity-75" />}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Menu executivo no cardápio: cartão com a situação de agora (disponível,
 * hoje mais tarde ou o próximo dia), o preço do menu completo ao lado da
 * foto da mesa, e as três etapas em cartões com foto de capa e miniatura de
 * cada prato.
 */
export default function BlocoExecutivo({ executivo }: { executivo: ExecutivoDados }) {
  const confirmado = executivo.condicoesConfirmadas;
  const capa = (itens: ItemExecutivoDB[], padrao: Parameters<typeof img>[0]) => img(itens.find((i) => i.img)?.img ?? padrao);

  return (
    <div className="relative mx-[calc(50%-50vw)] bg-creme-2 py-20 md:py-28">
      <div className="wrap">
        <div className="grid items-center gap-10 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-6">
            <p className="eyebrow text-vinho">Almoço executivo</p>
            <h2 className="mt-4 flex flex-col items-start text-vinho not-italic">
              <span className="relative z-10 -mb-[0.1em] font-[family-name:var(--font-pinyon)] text-[clamp(2.4rem,6vw,4rem)] leading-none">Menu</span>
              <span className="font-[family-name:var(--font-instrument)] text-[clamp(3.75rem,11vw,7rem)] leading-[0.9] tracking-[0.01em] uppercase">executivo</span>
            </h2>

            <div className="mt-7 max-w-md">
              <CartaoStatus />
            </div>

            {confirmado ? (
              <div className="mt-8 flex flex-wrap items-end gap-x-10 gap-y-4">
                <div>
                  <p className="eyebrow text-tinta/60">Entrada + prato + sobremesa</p>
                  <Preco valor={executivo.precoCompleto} className="mt-2 text-[3.25rem] leading-none text-vinho md:text-[4rem] [&>span]:opacity-100" />
                </div>
                <p className="max-w-[16rem] text-base leading-relaxed text-tinta/80">
                  Por pessoa. Pratos principais avulsos a partir de{" "}
                  <strong className="font-semibold text-vinho">R$ {executivo.precoAvulsoMin.toFixed(2).replace(".", ",")}</strong>.
                </p>
              </div>
            ) : (
              <div className="mt-8">
                <p className="max-w-prose text-base leading-relaxed text-tinta/80">{executivo.chamada}. Consulte os dias e os valores com a equipe.</p>
                <div className="mt-5">
                  <BotaoLink href={whatsappLink("Olá! Gostaria de consultar os dias, as opções e os valores do almoço executivo do Rizz.")} variante="vinho">
                    Consultar executivo pelo WhatsApp
                  </BotaoLink>
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-6">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
              <Image
                src={img("mesa-executivo")}
                alt="Mesa vista de cima com os pratos do menu executivo: parmegiana com arroz e fritas, risoto de funghi, massa, salada, arancini e sobremesas"
                fill
                placeholder="blur"
                sizes="(min-width: 860px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <div className="mt-14 grid items-start gap-6 md:mt-20 lg:grid-cols-3">
          <Coluna titulo="Entradas" itens={executivo.entradas} capa={capa(executivo.entradas, "arancini-parmesao")} comPreco={confirmado} />
          <Coluna titulo="Pratos" itens={executivo.pratos} capa={capa(executivo.pratos, "steak-milanesa-risoto-brie")} comPreco={confirmado} />
          <Coluna titulo="Sobremesas" itens={executivo.sobremesas} capa={capa(executivo.sobremesas, "brigadeiro-colher")} comPreco={confirmado} />
        </div>

        <p className="mt-10 text-sm text-tinta/65">Consulte a equipe sobre as opções disponíveis no dia.</p>
      </div>
    </div>
  );
}
