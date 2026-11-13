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
    const saiu = estado.envios?.filter((e) => e.ok) ?? [];
    const falhou = estado.envios?.filter((e) => !e.ok) ?? [];
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-2.5 rounded-xl bg-positivo/10 px-3.5 py-3 text-sm text-positivo-texto">
          <CircleCheck className="mt-0.5 size-4 shrink-0" />
          {estado.recente ? (
            <p>Já enviamos um link há poucos minutos. Confira o e-mail (inclusive a caixa de spam) e o WhatsApp antes de pedir outro.</p>
          ) : (
            <div className="flex flex-col gap-1">
              <p>Enviamos um link para criar uma senha nova. Ele vale 24 horas.</p>
              <ul className="flex flex-col gap-0.5">
                {saiu.map((e) => (
                  <li key={e.canal}>
                    {e.canal === "email" ? "E-mail" : "WhatsApp"}: <strong className="font-medium">{e.destino}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {falhou.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {falhou.map((e) => `${e.canal === "email" ? "E-mail" : "WhatsApp"} não enviado: ${e.motivo ?? "falha no envio"}.`).join(" ")}
          </p>
        )}
        <p className="text-sm text-muted-foreground">Não chegou? Olhe a caixa de spam ou peça a um administrador para gerar o link em Configurações → Equipe.</p>
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
