# WhatsApp (Evolution API)

Mensagens automáticas de reserva pelo WhatsApp do restaurante, enviadas pela **Evolution API** que roda na VPS (Docker Compose, projeto `rizz` do repositório `genext-group/vps-infra`; detalhes em `projects/rizz/README.md` de lá). O número é conectado pelo painel, em **`/admin/whatsapp`**, como um "aparelho conectado" (igual ao WhatsApp Web): o celular do restaurante continua funcionando normalmente.

## O que é enviado

| Mensagem | Quando | Para |
|---|---|---|
| Reserva confirmada | Reserva nasce confirmada, ou a equipe confirma uma pendente | Cliente |
| Pedido recebido | Reserva nasce pendente (confirmação manual ou grupo grande) | Cliente |
| Reserva alterada | Cliente (pelo link) ou equipe (no painel) muda dia, horário ou pessoas | Cliente |
| Reserva cancelada | Cliente cancela pelo link ou a equipe cancela no painel | Cliente |
| Lembrete | X horas antes do horário (2, 3, 6, 12 ou 24), só reservas confirmadas | Cliente |
| Aviso de reserva nova | A cada reserva feita pelo site | Números da equipe (até 5) |

Tudo se liga e desliga no painel, e os textos são editáveis lá (com variáveis como `{nome}`, `{data}`, `{hora}`, `{link}`). "Chegou" e "Não veio" não geram mensagem.

**Grupos grandes:** acima do limite de Reservas → Ajustes ("Grupo grande: acima de", padrão 8), o cliente reserva pelo site normalmente, mas a reserva chega **pendente**. Ele recebe "pedido recebido" e, quando a equipe confirma, a confirmação. Acima de 40 pessoas o site sugere falar com a equipe.

## Como funciona por dentro

- `lib/whatsapp/evolution.ts`: cliente da Evolution v2 (instância, QR Code, código de pareamento, envio).
- `lib/whatsapp/mensagens.ts`: configuração, modelos e troca das variáveis (puro, usado também na prévia do painel).
- `lib/whatsapp/avisos.ts`: decide o que mandar a cada evento (`avisarReserva`) e a rodada de lembretes (`enviarLembretes`).
- Os avisos rodam dentro de `after()` (Next), depois da resposta: o cliente não espera o WhatsApp, e **uma falha no envio nunca desfaz a reserva**. Tudo fica registrado na tabela `whatsapp_envios` (histórico no painel).
- Configuração em `configuracoes`, chave `whatsapp`. A última rodada dos lembretes fica na chave `whatsapp_lembretes`.
- Lembretes: `GET /api/whatsapp/lembretes`, protegida pelo `CRON_SECRET`. Um índice único impede dois lembretes para a mesma reserva; se a reserva muda de horário, o lembrete pode sair de novo. Reservas feitas há menos de 2 horas não recebem lembrete (acabaram de receber a confirmação). Falhas são tentadas de novo até 3 vezes.
- O link das mensagens usa `SITE_URL` ou, sem ela, o domínio de produção da Vercel (`VERCEL_PROJECT_PRODUCTION_URL`). O `site.url` (`rizzrestaurante.com.br`) ainda não responde.

## Configurar (uma vez)

### 1. A Evolution na VPS

- Endereço: **`https://evo.rizz.genext.group`** (Evolution v2.3.7). Abrindo no navegador, aparece um JSON de boas-vindas com `"version": "2.3.7"`.
- A chave global (`AUTHENTICATION_API_KEY`) está em `/srv/projects/rizz/evolution.env` na VPS (e no Bitwarden). Não cole em chat; ela vai direto para a Vercel e para o `.env.local`.

### 2. Variáveis na Vercel (Production e Preview) e no `.env.local`

| Variável | Valor |
|---|---|
| `EVOLUTION_API_URL` | `https://evo.rizz.genext.group` |
| `EVOLUTION_API_KEY` | a `AUTHENTICATION_API_KEY` |
| `EVOLUTION_INSTANCIA` | opcional; padrão `rizz`. Se já existe uma instância criada para o restaurante, ponha o nome dela |
| `CRON_SECRET` | uma senha longa e aleatória (ex.: `openssl rand -hex 32`) |
| `SITE_URL` | opcional; ex.: `https://rizz-pinhal.vercel.app`. Quando o domínio próprio estiver ligado, troque por ele |

Depois de criar as variáveis, publique de novo para elas valerem.

### 3. Banco

Antes de publicar o código: `! npm run db:setup` (cria a tabela `whatsapp_envios`; o banco é o de produção).

### 4. Conectar o número

Painel → **WhatsApp** → **Gerar QR Code** e escanear com o celular do restaurante (WhatsApp → Aparelhos conectados → Conectar um aparelho). Sem o celular por perto, use "Código pelo número". A tela detecta a conexão sozinha. Depois, envie uma **mensagem de teste** e ligue **Enviar mensagens automáticas**.

### 5. Agendador dos lembretes

**Em uso: cron na VPS** (`/etc/cron.d/rizz-lembretes`, a cada 10 min; script e detalhes em `projects/rizz/` do `genext-group/vps-infra`). As outras opções ficam como alternativa.

Algo precisa chamar `/api/whatsapp/lembretes` a cada 10–15 minutos, com o cabeçalho `Authorization: Bearer <CRON_SECRET>`. O painel mostra "Funcionando" quando a última chamada tem menos de 1 hora. Opções:

- **cron na VPS** (a mesma máquina da Evolution), com `crontab -e`:

  ```
  */10 * * * * curl -fsS -H "Authorization: Bearer SEU_CRON_SECRET" https://rizz-pinhal.vercel.app/api/whatsapp/lembretes > /dev/null
  ```

- **cron-job.org** (gratuito): URL acima, a cada 10 minutos, com o cabeçalho `Authorization`.
- **Vercel Cron**: só serve se o time estiver no plano Pro (no Hobby a Vercel aceita no máximo uma execução por dia, o que não serve para lembrete de poucas horas). Nesse caso, um `vercel.json` com `"crons": [{ "path": "/api/whatsapp/lembretes", "schedule": "*/10 * * * *" }]`; a Vercel manda o `CRON_SECRET` sozinha.

## Problemas comuns

- **"A Evolution recusou a chave"**: `EVOLUTION_API_KEY` diferente da `AUTHENTICATION_API_KEY` do serviço.
- **"Não foi possível falar com a Evolution API"**: endereço errado, serviço parado na VPS (`bin/status`, `bin/logs rizz evolution-api`) ou DNS/certificado ainda não emitido.
- **QR Code não aparece ou o celular recusa**: costuma ser a versão do WhatsApp Web que a Evolution anuncia. Atualize a imagem da Evolution na VPS (runbook `atualizar-imagem.md` do vps-infra) (ou ajuste `CONFIG_SESSION_PHONE_VERSION`) e tente de novo.
- **"Esse número não tem WhatsApp"**: o cliente digitou um número sem WhatsApp. Aparece no histórico do painel.
- O número conectado **não deve** estar na lista de avisos da equipe: mensagem para si mesmo não toca.

## Próximo passo possível: atendimento com IA

Ainda não feito. A Evolution pode mandar as mensagens recebidas para um webhook do site (evento `MESSAGES_UPSERT`). Uma rota `/api/whatsapp/webhook` passaria a conversa ao Claude, que identificaria pedidos de reserva e responderia com o link de `/reservas`; o resto continua com o atendente, no próprio celular.
