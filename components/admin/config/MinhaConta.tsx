"use client";

import { CircleAlert, KeyRound, LogOut, MonitorSmartphone, ShieldCheck, UserRound } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";

import { avisar, BotaoSalvar, CampoTelefone } from "@/components/admin/campos";
import { Cabecalho, Secao, Selo } from "@/components/admin/ui";
import { Campo } from "@/components/sistema/formulario/campo";
import { InputSenha } from "@/components/sistema/inputs/input-senha";
import { InputTexto } from "@/components/sistema/inputs/input-texto";
import { InputEmail } from "@/components/sistema/inputs/input-web";
import { Button } from "@/components/sistema/ui/button";
import { atualizarPerfil, sairDeTodos, trocarSenha, type EstadoSenha } from "@/lib/admin/sessao-actions";
import { AREAS_VISIVEIS, papelInfo, type Papel, type Permissoes } from "@/lib/permissoes";

import { MatrizLeitura } from "../equipe/acesso";

function Erro({ texto }: { texto?: string }) {
  if (!texto) return null;
  return (
    <p role="alert" className="flex items-start gap-2.5 rounded-xl bg-negativo/10 px-3.5 py-3 text-sm text-negativo-texto">
      <CircleAlert className="mt-0.5 size-4 shrink-0" />
      {texto}
    </p>
  );
}

type Usuario = { nome: string; email: string; cargo: string; telefone: string; papel: Papel; permissoes: Permissoes };

function Perfil({ usuario }: { usuario: Usuario }) {
  const [estado, acao, pendente] = useActionState<EstadoSenha, FormData>(atualizarPerfil, {});
  const [nome, setNome] = useState(usuario.nome);
  const [email, setEmail] = useState(usuario.email);
  const [cargo, setCargo] = useState(usuario.cargo);
  const [telefone, setTelefone] = useState(usuario.telefone);
  useEffect(() => {
    if (estado.ok) avisar({ ok: true }, "Perfil atualizado");
  }, [estado]);

  return (
    <Secao icone={UserRound} titulo="Seus dados" descricao="O e-mail é o que você usa para entrar no painel.">
      <form action={acao} className="flex flex-col gap-4">
        <Erro texto={estado.erro} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo id="perfil-nome" rotulo="Nome">
            <InputTexto name="nome" required maxLength={60} value={nome} onChange={(e) => setNome(e.currentTarget.value)} />
          </Campo>
          <Campo id="perfil-cargo" rotulo="Cargo" ajuda="Opcional. Aparece na equipe e no menu.">
            <InputTexto name="cargo" maxLength={40} value={cargo} placeholder="Ex.: Gerente do salão" onChange={(e) => setCargo(e.currentTarget.value)} />
          </Campo>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo id="perfil-email" rotulo="E-mail">
            <InputEmail name="email" required valor={email} aoMudar={(v) => setEmail(v ?? "")} />
          </Campo>
          <input type="hidden" name="telefone" value={telefone} />
          <CampoTelefone label="WhatsApp" value={telefone} onChange={setTelefone} descricao="Para receber o link se esquecer a senha." />
        </div>
        <BotaoSalvar type="submit" pendente={pendente} className="self-start">
          Salvar dados
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
      avisar({ ok: true }, "Senha alterada. Os outros aparelhos vão pedir login de novo.");
      form.current?.reset();
    }
  }, [estado]);

  return (
    <Secao icone={KeyRound} titulo="Trocar senha" descricao="Mínimo de 8 caracteres. Ao trocar, os outros aparelhos saem do painel.">
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

export default function MinhaConta({ usuario }: { usuario: Usuario }) {
  const papel = papelInfo(usuario.papel);
  const edita = AREAS_VISIVEIS.filter((a) => usuario.permissoes[a.id] === "editar").length;

  return (
    <>
      <Cabecalho titulo="Minha conta" descricao="Seus dados de acesso ao painel." />
      <div className="grid items-start gap-4 xl:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Perfil usuario={usuario} />
          <Senha />
        </div>
        <div className="flex flex-col gap-4">
          <Secao
            icone={ShieldCheck}
            titulo="Seu acesso"
            descricao={papel.descricao}
            acoes={<Selo tom="secao">{papel.rotulo}</Selo>}
          >
            <MatrizLeitura permissoes={usuario.permissoes} />
            {edita < AREAS_VISIVEIS.length && (
              <p className="text-[13px] text-muted-foreground">Precisa de mais acesso? Peça a quem administra a equipe.</p>
            )}
          </Secao>
          <Secao icone={MonitorSmartphone} titulo="Aparelhos conectados" descricao="O login vale por 7 dias em cada aparelho. Perdeu o celular ou entrou num computador de outra pessoa? Encerre todos.">
            <form action={sairDeTodos}>
              <Button type="submit" variant="secondary" className="rounded-full">
                <LogOut /> Sair de todos os aparelhos
              </Button>
            </form>
          </Secao>
        </div>
      </div>
    </>
  );
}
