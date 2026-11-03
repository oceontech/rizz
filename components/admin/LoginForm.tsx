"use client";

import { ArrowLeft, CircleAlert, CircleCheck, Loader2 } from "lucide-react";
import { useActionState, useState } from "react";

import { Campo } from "@/components/sistema/formulario/campo";
import { InputSenha } from "@/components/sistema/inputs/input-senha";
import { InputEmail } from "@/components/sistema/inputs/input-web";
import { Button } from "@/components/sistema/ui/button";
import { entrar, pedirNovaSenha, type EstadoEsqueci, type EstadoLogin } from "@/lib/admin/sessao-actions";

function Alerta({ texto }: { texto?: string }) {
  if (!texto) return null;
  return (
    <p role="alert" className="flex items-start gap-2.5 rounded-xl bg-negativo/10 px-3.5 py-3 text-sm text-negativo-texto">
      <CircleAlert className="mt-0.5 size-4 shrink-0" />
      {texto}
    </p>
  );
}

/** "Esqueci minha senha": pede o e-mail e manda o link por e-mail e WhatsApp. */
function Esqueci({ emailInicial, aoVoltar }: { emailInicial: string; aoVoltar: () => void }) {
  const [estado, acao, pendente] = useActionState<EstadoEsqueci, FormData>(pedirNovaSenha, {});
  const [email, setEmail] = useState(emailInicial);

  if (estado.enviado) {
    return (
      <div className="flex flex-col gap-5">
        <p className="flex items-start gap-2.5 rounded-xl bg-positivo/10 px-3.5 py-3 text-sm text-positivo-texto">
          <CircleCheck className="mt-0.5 size-4 shrink-0" />
          Se esse e-mail tiver acesso ao painel, enviamos um link para criar uma senha nova (por e-mail e, se houver número cadastrado, pelo WhatsApp). Ele vale 24 horas.
        </p>
        <p className="text-sm text-muted-foreground">Não chegou em alguns minutos? Peça a um administrador para enviar pelo painel, em Configurações → Equipe.</p>
        <Button variant="secondary" className="rounded-full" onClick={aoVoltar}>
          <ArrowLeft /> Voltar para o login
        </Button>
      </div>
    );
  }

  return (
    <form action={acao} className="flex flex-col gap-5">
      <Alerta texto={estado.erro} />
      <Campo id="esqueci-email" rotulo="E-mail do painel" ajuda="Vamos mandar um link para você criar uma senha nova.">
        <InputEmail name="email" autoComplete="username" required valor={email} aoMudar={(v) => setEmail(v ?? "")} />
      </Campo>
      <Button type="submit" size="lg" variant="marca" disabled={pendente} className="w-full rounded-full">
        {pendente && <Loader2 className="animate-spin" />}
        {pendente ? "Enviando…" : "Enviar link"}
      </Button>
      <button type="button" onClick={aoVoltar} className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-4" /> Voltar para o login
      </button>
    </form>
  );
}

export default function LoginForm({ de }: { de?: string }) {
  const [estado, acao, pendente] = useActionState<EstadoLogin, FormData>(entrar, {});
  const [email, setEmail] = useState(estado.email ?? "");
  const [esqueci, setEsqueci] = useState(false);

  if (esqueci) return <Esqueci emailInicial={email} aoVoltar={() => setEsqueci(false)} />;

  return (
    <form action={acao} className="flex flex-col gap-5">
      {de && <input type="hidden" name="de" value={de} />}

      <Alerta texto={estado.erro} />

      <Campo id="email" rotulo="E-mail">
        <InputEmail
          name="email"
          autoComplete="username"
          required
          valor={email}
          aoMudar={(v) => setEmail(v ?? "")}
          placeholder="voce@rizzcucinaevino.com.br"
        />
      </Campo>

      <Campo
        id="senha"
        rotulo="Senha"
        extra={
          <button type="button" onClick={() => setEsqueci(true)} className="text-[13px] text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline">
            Esqueci minha senha
          </button>
        }
      >
        <InputSenha name="senha" autoComplete="current-password" required placeholder="••••••••" />
      </Campo>

      <Button type="submit" size="lg" variant="marca" disabled={pendente} className="mt-1 w-full rounded-full">
        {pendente && <Loader2 className="animate-spin" />}
        {pendente ? "Entrando…" : "Entrar no painel"}
      </Button>
    </form>
  );
}
