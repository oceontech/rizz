"use client";

import { ArrowRight, Award, Bell, Clock, MapPin, MessageCircle, UserRound, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { avisar, BotaoSalvar, CampoSelect, CampoSwitch, CampoTexto } from "@/components/admin/campos";
import type { Secao as SecaoNav } from "@/components/admin/nav";
import { Cabecalho, Secao, SeloIcone } from "@/components/admin/ui";
import { salvarAviso } from "@/lib/admin/config-actions";
import type { ResumoConfiguracoes } from "@/lib/admin/consultas";
import type { AvisoConfig } from "@/lib/dados";
import { diaDaSemanaISO, hojeNoRestaurante, horarios } from "@/lib/hours";
import { pode, type Area, type Permissoes } from "@/lib/permissoes";
import { site } from "@/lib/site";
import { FIDELIDADE_ATIVA } from "@/lib/recursos";

const DESTINOS = [
  { id: "", rotulo: "Sem link" },
  { id: "/reservas", rotulo: "Reservas" },
  { id: "/cardapio", rotulo: "Cardápio" },
  { id: "/cardapio#executivo", rotulo: "Menu executivo" },
  { id: "/carta-de-vinhos", rotulo: "Carta de vinhos" },
  ...(FIDELIDADE_ATIVA ? [{ id: "/fidelidade", rotulo: "Fidelidade" }] : []),
];

/** Mensagens prontas: um toque preenche o texto. */
const MODELOS = [
  "Feriado: confira nossos horários especiais antes de vir.",
  "Hoje tem rodízio de risotos no jantar.",
  "Reservas abertas para o Dia das Mães.",
  "Estaremos fechados para manutenção nesta segunda.",
];

function AvisoSite({ aviso }: { aviso: AvisoConfig }) {
  const [ativo, setAtivo] = useState(aviso.ativo);
  const [texto, setTexto] = useState(aviso.texto);
  const [link, setLink] = useState(aviso.link);
  const [linkTexto, setLinkTexto] = useState(aviso.linkTexto);
  const [salvando, setSalvando] = useState(false);
  const alterado = JSON.stringify({ ativo, texto, link, linkTexto }) !== JSON.stringify(aviso);

  async function salvar() {
    setSalvando(true);
    const r = await salvarAviso({ ativo, texto, link, linkTexto: link ? linkTexto : "" });
    setSalvando(false);
    avisar(r, ativo ? "Aviso publicado no site" : "Aviso salvo (desligado)");
  }

  return (
    <Secao
      icone={Bell}
      titulo="Barra de aviso do site"
      descricao="Faixa fina no topo de todas as páginas. Ideal para feriados, eventos e mudanças de horário."
      acoes={
        <span className={ativo ? "text-xs font-medium text-positivo-texto" : "text-xs text-muted-foreground"}>
          {aviso.ativo ? "No ar" : "Desligada"}
        </span>
      }
    >
      <CampoSwitch label="Mostrar aviso no site" value={ativo} onChange={setAtivo} />
      <div className="flex flex-col gap-2">
        <CampoTexto
          label="Mensagem"
          value={texto}
          onChange={setTexto}
          maxLength={140}
          placeholder="Feriado de 12/10: abriremos no almoço e no jantar."
          descricao={`${texto.length}/140 caracteres`}
        />
        <div className="flex flex-wrap gap-1.5">
          {MODELOS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setTexto(m)}
              className="rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {m}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <CampoSelect
          label="Link"
          // O select do Radix não aceita valor vazio: "nenhum" representa "sem link"
          value={link && DESTINOS.some((d) => d.id === link) ? link : "nenhum"}
          onChange={(v) => setLink(v === "nenhum" ? "" : v)}
          opcoes={DESTINOS.map((d) => ({ ...d, id: d.id || "nenhum" }))}
        />
        {link && <CampoTexto label="Texto do link" value={linkTexto} onChange={setLinkTexto} maxLength={30} placeholder="Reservar" />}
      </div>

      {texto && (
        <div>
          <p className="mb-1.5 text-[0.7rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase">Prévia</p>
          <div className={ativo ? "" : "opacity-50"}>
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-xl bg-[#e8890c] px-4 py-2.5 text-center text-[0.8125rem] text-[#2b0710]">
              <span>{texto}</span>
              {link && linkTexto && (
                <span className="inline-flex items-center gap-1 font-medium underline underline-offset-4">
                  {linkTexto} <ArrowRight className="size-3.5" />
                </span>
              )}
            </div>
          </div>
          {!ativo && <p className="mt-1.5 text-xs text-muted-foreground">Desligado: não aparece no site.</p>}
        </div>
      )}

      <div className="flex justify-end">
        <BotaoSalvar pendente={salvando} onClick={salvar} disabled={!alterado}>
          Salvar aviso
        </BotaoSalvar>
      </div>
    </Secao>
  );
}

type Atalho = { href: string; titulo: string; texto: string; icone: LucideIcon; secao: SecaoNav; area?: Area };

/** Cartão-atalho para uma aba, com o estado dela numa linha. */
function CartaoAba({ href, titulo, texto, icone, secao }: Atalho) {
  return (
    <Link
      href={href}
      data-secao={secao}
      className="group flex items-center gap-3 rounded-2xl border bg-card p-3.5 transition-colors outline-none hover:border-foreground/20 hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/30"
    >
      <SeloIcone icone={icone} />
      <span className="min-w-0 grow">
        <span className="block text-sm font-semibold">{titulo}</span>
        <span className="block truncate text-[13px] text-muted-foreground">{texto}</span>
      </span>
      <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

export default function Configuracoes({
  aviso,
  resumo,
  permissoes,
}: {
  aviso: AvisoConfig;
  resumo: ResumoConfiguracoes;
  permissoes: Permissoes;
}) {
  // Horários e contato já vêm aplicados pelo layout do painel (ConteudoSite).
  const hoje = horarios.find((d) => d.dia === diaDaSemanaISO(hojeNoRestaurante()));
  const textoHoje = !hoje || hoje.fechado ? "Hoje: fechado" : `Hoje: ${[hoje.almoco, hoje.jantar].filter(Boolean).map((s) => `${s!.inicio}–${s!.fim}`).join(" · ")}`;
  const abertos = horarios.filter((d) => !d.fechado).length;

  const atalhos: Atalho[] = [
    { href: "/admin/configuracoes/horarios", titulo: "Horários", texto: `${textoHoje} · ${abertos} dias abertos`, icone: Clock, secao: "funcionamento", area: "horarios" },
    { href: "/admin/configuracoes/contato", titulo: "Contato e endereço", texto: `${site.telefone} · ${site.endereco.cidade}`, icone: MapPin, secao: "contato", area: "horarios" },
    {
      href: "/admin/configuracoes/equipe",
      titulo: "Equipe e acessos",
      texto: `${resumo.pessoas} ${resumo.pessoas === 1 ? "pessoa" : "pessoas"}${resumo.convites ? ` · ${resumo.convites} ${resumo.convites === 1 ? "convite pendente" : "convites pendentes"}` : ""}`,
      icone: Users,
      secao: "equipe",
      area: "equipe",
    },
    { href: "/admin/selos", titulo: "Selos", texto: `${resumo.selos} selos para marcar os pratos`, icone: Award, secao: "selos", area: "configuracoes" },
    { href: "/admin/whatsapp", titulo: "WhatsApp", texto: resumo.whatsappAtivo ? "Mensagens automáticas ligadas" : "Mensagens automáticas desligadas", icone: MessageCircle, secao: "whatsapp", area: "configuracoes" },
    { href: "/admin/configuracoes/conta", titulo: "Minha conta", texto: "Nome, e-mail, senha e aparelhos conectados", icone: UserRound, secao: "conta" },
  ];

  return (
    <>
      <Cabecalho titulo="Configurações" descricao="Tudo o que ajusta o funcionamento do painel e do site, separado por abas." />
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <AvisoSite aviso={aviso} />
        <nav aria-label="Outras configurações" className="flex flex-col gap-2">
          {atalhos
            .filter((a) => !a.area || pode(permissoes, a.area))
            .map((a) => (
              <CartaoAba key={a.href} {...a} />
            ))}
        </nav>
      </div>
    </>
  );
}
