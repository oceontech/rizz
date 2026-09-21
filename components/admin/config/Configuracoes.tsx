"use client";

import { Bell, Lock, Person } from "@gravity-ui/icons";
import { Alert, Button, Card, Form, Input, Label, TextField, FieldError } from "@heroui/react";
import { useActionState, useEffect, useRef, useState } from "react";

import { avisar, CampoSelect, CampoSwitch, CampoTexto } from "@/components/admin/campos";
import { Cabecalho } from "@/components/admin/ui";
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

function Secao({
  icone,
  titulo,
  descricao,
  children,
}: {
  icone: React.ReactNode;
  titulo: string;
  descricao: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="gap-5 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">{icone}</span>
        <div>
          <h2 className="font-medium">{titulo}</h2>
          <p className="text-sm text-muted">{descricao}</p>
        </div>
      </div>
      {children}
    </Card>
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
      icone={<Bell className="size-5" />}
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
        descricao={`${texto.length}/140`}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <CampoSelect
          label="Link"
          value={DESTINOS.some((d) => d.id === link) ? link : ""}
          onChange={setLink}
          opcoes={DESTINOS}
        />
        {link && <CampoTexto label="Texto do link" value={linkTexto} onChange={setLinkTexto} maxLength={30} placeholder="Reservar" />}
      </div>

      {texto && (
        <div>
          <p className="mb-1.5 text-xs text-muted">Prévia</p>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-xl bg-[#e8890c] px-4 py-2 text-center text-[0.8125rem] text-[#2b0710]">
            <span>{texto}</span>
            {link && linkTexto && <span className="font-medium underline underline-offset-4">{linkTexto} →</span>}
          </div>
        </div>
      )}

      <Button onPress={salvar} isPending={salvando} className="self-start">
        Salvar aviso
      </Button>
    </Secao>
  );
}

function Perfil({ usuario }: { usuario: { nome: string; email: string } }) {
  const [estado, acao, pendente] = useActionState<EstadoSenha, FormData>(atualizarPerfil, {});
  useEffect(() => {
    if (estado.ok) avisar({ ok: true }, "Perfil atualizado");
  }, [estado]);

  return (
    <Secao icone={<Person className="size-5" />} titulo="Seu acesso" descricao="Nome e e-mail usados para entrar no painel.">
      <Form action={acao} className="flex flex-col gap-4">
        {estado.erro && (
          <Alert status="danger">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>{estado.erro}</Alert.Title>
            </Alert.Content>
          </Alert>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField name="nome" defaultValue={usuario.nome} isRequired fullWidth>
            <Label>Nome</Label>
            <Input className="w-full" />
            <FieldError />
          </TextField>
          <TextField name="email" type="email" defaultValue={usuario.email} isRequired fullWidth>
            <Label>E-mail</Label>
            <Input className="w-full" />
            <FieldError />
          </TextField>
        </div>
        <Button type="submit" isPending={pendente} className="self-start">
          Salvar perfil
        </Button>
      </Form>
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
    <Secao icone={<Lock className="size-5" />} titulo="Trocar senha" descricao="Mínimo de 8 caracteres.">
      <Form ref={form} action={acao} className="flex flex-col gap-4">
        {estado.erro && (
          <Alert status="danger">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>{estado.erro}</Alert.Title>
            </Alert.Content>
          </Alert>
        )}
        <TextField name="atual" type="password" autoComplete="current-password" isRequired fullWidth>
          <Label>Senha atual</Label>
          <Input className="w-full" />
        </TextField>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField name="nova" type="password" autoComplete="new-password" isRequired minLength={8} fullWidth>
            <Label>Nova senha</Label>
            <Input className="w-full" />
            <FieldError />
          </TextField>
          <TextField name="confirmacao" type="password" autoComplete="new-password" isRequired fullWidth>
            <Label>Confirmar nova senha</Label>
            <Input className="w-full" />
          </TextField>
        </div>
        <Button type="submit" isPending={pendente} className="self-start">
          Alterar senha
        </Button>
      </Form>
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
      <div className="grid items-start gap-5 xl:grid-cols-2">
        <AvisoSite aviso={aviso} />
        <div className="flex flex-col gap-5">
          <Perfil usuario={usuario} />
          <Senha />
        </div>
      </div>
    </>
  );
}
