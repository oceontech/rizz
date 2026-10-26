"use client";

import { CircleAlert, Loader2 } from "lucide-react";
import { useActionState, useState } from "react";

import { Campo } from "@/components/sistema/formulario/campo";
import { InputSenha } from "@/components/sistema/inputs/input-senha";
import { InputEmail } from "@/components/sistema/inputs/input-web";
import { Button } from "@/components/sistema/ui/button";
import { entrar, type EstadoLogin } from "@/lib/admin/sessao-actions";

export default function LoginForm({ de }: { de?: string }) {
  const [estado, acao, pendente] = useActionState<EstadoLogin, FormData>(entrar, {});
  const [email, setEmail] = useState(estado.email ?? "");

  return (
    <form action={acao} className="flex flex-col gap-5">
      {de && <input type="hidden" name="de" value={de} />}

      {estado.erro && (
        <p role="alert" className="flex items-start gap-2.5 rounded-xl bg-negativo/10 px-3.5 py-3 text-sm text-negativo-texto">
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          {estado.erro}
        </p>
      )}

      <Campo id="email" rotulo="E-mail">
        <InputEmail
          name="email"
          autoComplete="username"
          required
          valor={email}
          aoMudar={(v) => setEmail(v ?? "")}
          placeholder="voce@rizzrestaurante.com.br"
        />
      </Campo>

      <Campo id="senha" rotulo="Senha">
        <InputSenha name="senha" autoComplete="current-password" required placeholder="••••••••" />
      </Campo>

      <Button type="submit" size="lg" variant="marca" disabled={pendente} className="mt-1 w-full rounded-full">
        {pendente && <Loader2 className="animate-spin" />}
        {pendente ? "Entrando…" : "Entrar no painel"}
      </Button>
    </form>
  );
}
