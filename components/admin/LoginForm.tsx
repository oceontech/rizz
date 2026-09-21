"use client";

import { Eye, EyeSlash, Envelope, Lock } from "@gravity-ui/icons";
import { Alert, Button, Form, InputGroup, Label, Spinner, TextField } from "@heroui/react";
import { useActionState, useState } from "react";

import { entrar, type EstadoLogin } from "@/lib/admin/sessao-actions";

export default function LoginForm({ de }: { de?: string }) {
  const [estado, acao, pendente] = useActionState<EstadoLogin, FormData>(entrar, {});
  const [verSenha, setVerSenha] = useState(false);

  return (
    <Form action={acao} className="flex flex-col gap-5">
      {de && <input type="hidden" name="de" value={de} />}

      {estado.erro && (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>{estado.erro}</Alert.Title>
          </Alert.Content>
        </Alert>
      )}

      <TextField
        isRequired
        name="email"
        type="email"
        autoComplete="username"
        defaultValue={estado.email}
        fullWidth
      >
        <Label>E-mail</Label>
        <InputGroup fullWidth>
          <InputGroup.Prefix>
            <Envelope className="size-4 text-muted" />
          </InputGroup.Prefix>
          <InputGroup.Input placeholder="voce@rizzrestaurante.com.br" />
        </InputGroup>
      </TextField>

      <TextField
        isRequired
        name="senha"
        type={verSenha ? "text" : "password"}
        autoComplete="current-password"
        fullWidth
      >
        <Label>Senha</Label>
        <InputGroup fullWidth>
          <InputGroup.Prefix>
            <Lock className="size-4 text-muted" />
          </InputGroup.Prefix>
          <InputGroup.Input placeholder="••••••••" />
          <InputGroup.Suffix className="pr-1">
            <Button
              isIconOnly
              size="sm"
              variant="ghost"
              aria-label={verSenha ? "Ocultar senha" : "Mostrar senha"}
              onPress={() => setVerSenha((v) => !v)}
            >
              {verSenha ? <EyeSlash /> : <Eye />}
            </Button>
          </InputGroup.Suffix>
        </InputGroup>
      </TextField>

      <Button type="submit" size="lg" fullWidth isPending={pendente} className="mt-1">
        {({ isPending }) => (
          <>
            {isPending && <Spinner color="current" size="sm" />}
            {isPending ? "Entrando…" : "Entrar no painel"}
          </>
        )}
      </Button>
    </Form>
  );
}
