"use client";

import { ArrowRight, Bell, CircleAlert, KeyRound, UserRound } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";

import { avisar, BotaoSalvar, CampoSelect, CampoSwitch, CampoTexto } from "@/components/admin/campos";
import { Cabecalho, Secao } from "@/components/admin/ui";
import { Campo } from "@/components/sistema/formulario/campo";
import { InputSenha } from "@/components/sistema/inputs/input-senha";
import { InputTexto } from "@/components/sistema/inputs/input-texto";
import { InputEmail } from "@/components/sistema/inputs/input-web";
import { salvarAviso } from "@/lib/admin/config-actions";
import { atualizarPerfil, trocarSenha, type EstadoSenha } from "@/lib/admin/sessao-actions";
import type { AvisoConfig } from "@/lib/dados";

const DESTINOS = [
  { id: "", rotulo: "Sem link" },
  { id: "/reservas", rotulo: "Reservas" },
  { id: "/cardapio", rotulo: "Cardápio" },
  { id: "/cardapio#executivo", rotulo: "Menu executivo" },
  { id: "/fidelidade", rotulo: "Fidelidade" },
];

function Erro({ texto }: { texto?: string }) {
  if (!texto) return null;
  return (
    <p role="alert" className="flex items-start gap-2.5 rounded-xl bg-negativo/10 px-3.5 py-3 text-sm text-negativo-texto">
      <CircleAlert className="mt-0.5 size-4 shrink-0" />
      {texto}
    </p>
  );
}

function AvisoSite({ aviso }: { aviso: AvisoConfig }) {
  const [ativo, setAtivo] = useState(aviso.ativo);
  const [texto, setTexto] = useState(aviso.texto);
  const [link, setLink] = useState(aviso.link);
  const [linkTexto, setLinkTexto] = useState(aviso.linkTexto);
  const [salvando, setSalvando] = useState(false);

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
    >
      <CampoSwitch label="Mostrar aviso" value={ativo} onChange={setAtivo} />
      <CampoTexto
        label="Mensagem"
        value={texto}
        onChange={setTexto}
        maxLength={140}
        placeholder="Feriado de 12/10: abriremos no almoço e no jantar."
      />
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
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-xl bg-[#e8890c] px-4 py-2.5 text-center text-[0.8125rem] text-[#2b0710]">
            <span>{texto}</span>
            {link && linkTexto && (
              <span className="inline-flex items-center gap-1 font-medium underline underline-offset-4">
                {linkTexto} <ArrowRight className="size-3.5" />
              </span>
            )}
          </div>
        </div>
      )}

      <BotaoSalvar pendente={salvando} onClick={salvar} className="self-start">
        Salvar aviso
      </BotaoSalvar>
    </Secao>
  );
}

function Perfil({ usuario }: { usuario: { nome: string; email: string } }) {
  const [estado, acao, pendente] = useActionState<EstadoSenha, FormData>(atualizarPerfil, {});
  const [nome, setNome] = useState(usuario.nome);
  const [email, setEmail] = useState(usuario.email);
  useEffect(() => {
    if (estado.ok) avisar({ ok: true }, "Perfil atualizado");
  }, [estado]);

  return (
    <Secao icone={UserRound} titulo="Seu acesso" descricao="Nome e e-mail usados para entrar no painel.">
      <form action={acao} className="flex flex-col gap-4">
        <Erro texto={estado.erro} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo id="perfil-nome" rotulo="Nome">
            <InputTexto name="nome" required value={nome} onChange={(e) => setNome(e.currentTarget.value)} />
          </Campo>
          <Campo id="perfil-email" rotulo="E-mail">
            <InputEmail name="email" required valor={email} aoMudar={(v) => setEmail(v ?? "")} />
          </Campo>
        </div>
        <BotaoSalvar type="submit" pendente={pendente} className="self-start">
          Salvar perfil
        </BotaoSalvar>
      </form>
    </Secao>
  );
}

function Senha() {
  const [estado, acao, pendente] = useActionState<EstadoSenha, FormData>(trocarSenha, {});
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (estado.ok) {
      avisar({ ok: true }, "Senha alterada");
      form.current?.reset();
    }
  }, [estado]);

  return (
    <Secao icone={KeyRound} titulo="Trocar senha" descricao="Mínimo de 8 caracteres.">
      <form ref={form} action={acao} className="flex flex-col gap-4">
        <Erro texto={estado.erro} />
        <Campo id="senha-atual" rotulo="Senha atual">
          <InputSenha name="atual" autoComplete="current-password" required />
        </Campo>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo id="senha-nova" rotulo="Nova senha">
            <InputSenha name="nova" autoComplete="new-password" required minLength={8} />
          </Campo>
          <Campo id="senha-confirmacao" rotulo="Confirmar nova senha">
            <InputSenha name="confirmacao" autoComplete="new-password" required />
          </Campo>
        </div>
        <BotaoSalvar type="submit" pendente={pendente} className="self-start">
          Alterar senha
        </BotaoSalvar>
      </form>
    </Secao>
  );
}

export default function Configuracoes({
  aviso,
  usuario,
}: {
  aviso: AvisoConfig;
  usuario: { nome: string; email: string };
}) {
  return (
    <>
      <Cabecalho titulo="Configurações" descricao="Aviso do site e dados de acesso ao painel." />
      <div className="grid items-start gap-4 xl:grid-cols-2">
        <AvisoSite aviso={aviso} />
        <div className="flex flex-col gap-4">
          <Perfil usuario={usuario} />
          <Senha />
        </div>
      </div>
    </>
  );
}
