"use client";

import { CircleAlert, Loader2, Mail } from "lucide-react";
import { useActionState, useState } from "react";

import { Campo } from "@/components/sistema/formulario/campo";
import { InputSenha } from "@/components/sistema/inputs/input-senha";
import { InputTexto } from "@/components/sistema/inputs/input-texto";
import { Button } from "@/components/sistema/ui/button";
import { aceitarConvite, type EstadoConvite } from "@/lib/admin/convite-actions";

export default function FormConvite({ token, tipo, nome, email }: { token: string; tipo: "convite" | "senha"; nome: string; email: string }) {
  const [estado, acao, pendente] = useActionState<EstadoConvite, FormData>(aceitarConvite, {});
  const [valorNome, setValorNome] = useState(nome);

  return (
    <form action={acao} className="flex flex-col gap-5">
      <input type="hidden" name="token" value={token} />
      {/* Ajuda o gerenciador de senhas a guardar a senha com o e-mail certo. */}
      <input type="email" name="email" value={email} autoComplete="username" readOnly hidden />

      {estado.erro && (
        <p role="alert" className="flex items-start gap-2.5 rounded-xl bg-negativo/10 px-3.5 py-3 text-sm text-negativo-texto">
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          {estado.erro}
        </p>
      )}

      <div className="flex items-center gap-3 rounded-2xl bg-muted/60 px-3.5 py-3 text-sm">
        <Mail className="size-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0">
          <span className="block text-xs text-muted-foreground">Você vai entrar com</span>
          <span className="block truncate font-medium">{email}</span>
        </span>
      </div>

      <Campo id="convite-nome" rotulo="Seu nome">
        <InputTexto name="nome" required maxLength={60} value={valorNome} onChange={(e) => setValorNome(e.currentTarget.value)} autoComplete="name" />
      </Campo>
      <Campo id="convite-senha" rotulo={tipo === "senha" ? "Nova senha" : "Crie uma senha"} ajuda="Mínimo de 8 caracteres.">
        <InputSenha name="senha" autoComplete="new-password" required minLength={8} />
      </Campo>
      <Campo id="convite-confirmacao" rotulo="Repita a senha">
        <InputSenha name="confirmacao" autoComplete="new-password" required />
      </Campo>

      <Button type="submit" size="lg" variant="marca" disabled={pendente} className="mt-1 w-full rounded-full">
        {pendente && <Loader2 className="animate-spin" />}
        {pendente ? "Entrando…" : tipo === "senha" ? "Salvar e entrar" : "Criar acesso e entrar"}
      </Button>
    </form>
  );
}
