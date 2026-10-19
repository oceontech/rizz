# Reservas online

Em produção desde 19/10/2026 (commit `38c48d6`). Pendências em [`ESTADO.md`](ESTADO.md).

## Como funciona

**Não há mapa de mesas.** Cada turno (almoço e jantar) tem um limite de pessoas no salão ao mesmo tempo. Cada reserva ocupa lugares durante a permanência média, a partir do horário de chegada. A mesa é um campo livre que a equipe preenche (aceita junções como `12+13`).

- Os turnos saem de `lib/hours.ts`: dia fechado não tem reserva, e cada turno vai do início até o fim menos `ultimoAntesDoFim`, de `intervalo` em `intervalo` minutos.
- Lugares livres num horário = lotação do turno − maior ocupação entre a chegada e o fim da permanência, conferida a cada 15 min, contando só o mesmo turno (`livresEm` em `lib/reservas/regras.ts`).
- Ocupam lugar os status `pendente`, `confirmada` e `concluida` ("Chegou" no painel). Não ocupam: `cancelada` e `nao_compareceu` ("Não veio").
- **Bloqueios** (tabela `reserva_bloqueios`) fecham um dia ou turno (`lotacao` nula) ou reduzem a lotação (`lotacao` = número). `turno` nulo = o dia inteiro. Vale o menor valor.

## Configuração (painel → Reservas → Ajustes)

Fica como JSON na tabela `configuracoes`, chave `reservas`. Padrões em `RESERVAS_PADRAO`:

| Campo | Padrão | O que faz |
|---|---|---|
| `ativo` | sim | Desligado, o site volta ao formulário de WhatsApp (`FormReservaWhatsApp`) e o link pessoal deixa de alterar |
| `confirmacaoAutomatica` | sim | Dentro da lotação, a reserva já nasce `confirmada`; senão, `pendente` |
| `lotacaoAlmoco` / `lotacaoJantar` | 60 / 60 | Pessoas no salão ao mesmo tempo |
| `intervalo` | 30 min | Entre os horários oferecidos (15, 20, 30 ou 60) |
| `permanencia` | 105 min | Quanto tempo a reserva ocupa os lugares; também é a duração do evento no `.ics` |
| `ultimoAntesDoFim` | 60 min | Último horário = fim do turno menos isto |
| `maxPessoasOnline` | 8 | Acima disto, o site manda para o WhatsApp |
| `antecedenciaMinima` | 60 min | Para reservar hoje |
| `diasAFrente` | 60 dias | Até quando o site aceita (conferido também no servidor) |

## Fluxo do cliente

1. `/reservas` (`components/reservas/ReservaOnline.tsx`): pessoas → dia → horário → dados (nome, WhatsApp, ocasião, observações). Os horários vêm de `GET /api/reservas/disponibilidade?data=AAAA-MM-DD`; os quase cheios (≤ 20% livres) ganham o aviso "últimos lugares".
2. `POST /api/reservas`: valida, confere a lotação, recusa uma segunda reserva do mesmo WhatsApp no mesmo dia, grava com um `codigo` aleatório (8 caracteres) e confere a lotação de novo (se lotou no meio, desfaz).
3. Redireciona para `/reservas/[codigo]?nova=1`, o **link pessoal**: dados da reserva, "Salvar na agenda" (`/api/reservas/[codigo]/ics`), "Como chegar", alterar e cancelar.
4. `PATCH /api/reservas/[codigo]` com `{ acao: "cancelar" }` ou `{ acao: "alterar", pessoas, data, hora }`. Só vale para `pendente`/`confirmada` antes do horário (`podeMexer`).

Proteção contra robôs: campo invisível `site` (precisa vir vazio).

## Painel (`/admin/reservas`)

- `GestorReservas`: lista e filtros; `VisaoDia`: o dia por turno, com barra de ocupação (pico do turno), campo de mesa que salva ao sair e ações rápidas (Chegou / Não veio); `AjustesReservas`: configuração e bloqueios; `compartilhado.tsx`: status, menu de ações (Editar, WhatsApp, Enviar confirmação, Copiar link, mudar status, Excluir) e a mensagem de confirmação.
- A equipe **pode passar da lotação**: o formulário só avisa (`lotacaoNoHorario`).
- Ao digitar o telefone, o painel busca o cliente na fidelidade e nas reservas antigas (nome, visitas, faltas) — `clientePorTelefone`.
- Server Actions em `lib/admin/reservas-actions.ts`.

## Banco

Em `scripts/schema.sql`: na tabela `reservas`, as colunas `codigo` (único), `ocasiao`, `mesa` e `atualizado_em`, e o status `nao_compareceu`; e a tabela `reserva_bloqueios`. `hora` é `text` no formato `HH:MM`.

## Como testar

O banco é o de produção (ver `AGENTS.md`). Use nome `TESTE ...` e um telefone fictício, uma data com expediente dentro de `diasAFrente`, e apague no fim:

```sql
delete from reservas where nome like 'TESTE%';
```
