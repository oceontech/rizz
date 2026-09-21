-- ─────────────────────────────────────────────────────────────
-- Rizz Cucina & Vino — schema do painel administrativo
-- Idempotente: pode rodar de novo sem perder dados.
-- ─────────────────────────────────────────────────────────────

create table if not exists admin_usuarios (
  id           serial primary key,
  nome         text not null,
  email        text not null unique,
  senha_hash   text not null,
  criado_em    timestamptz not null default now(),
  ultimo_login timestamptz
);

-- Cardápio ----------------------------------------------------

create table if not exists categorias (
  id        text primary key,
  nome      text not null,
  slug      text not null unique,
  descricao text,
  ordem     int  not null default 0,
  visivel   boolean not null default true
);

create table if not exists itens (
  id            text primary key,
  categoria_id  text not null references categorias(id) on delete cascade,
  nome          text not null,
  descricao     text,
  preco         numeric(10,2),
  badges        text[] not null default '{}',
  vpj           boolean not null default false,
  img           text,
  foto_url      text,
  grupo         text,
  disponivel    boolean not null default true,
  visivel       boolean not null default true,
  ordem         int not null default 0,
  atualizado_em timestamptz not null default now()
);
create index if not exists itens_categoria_idx on itens (categoria_id, ordem);

-- Menu executivo ----------------------------------------------

create table if not exists executivo_config (
  id                    int primary key default 1 check (id = 1),
  ativo                 boolean not null default true,
  preco_completo        numeric(10,2) not null default 0,
  condicoes_confirmadas boolean not null default false,
  dias                  text not null default 'Segunda a sexta',
  horario               text not null default '11h às 14h30',
  chamada               text not null default ''
);

create table if not exists executivo_itens (
  id         text primary key,
  secao      text not null check (secao in ('entradas','pratos','sobremesas')),
  nome       text not null,
  preco      numeric(10,2) not null default 0,
  selo       text check (selo in ('vpj','duroc')),
  img        text,
  disponivel boolean not null default true,
  ordem      int not null default 0
);

-- Reservas ----------------------------------------------------

create table if not exists reservas (
  id         serial primary key,
  nome       text not null,
  telefone   text,
  pessoas    int  not null default 2,
  data       date,
  hora       text,
  obs        text,
  status     text not null default 'pendente'
             check (status in ('pendente','confirmada','concluida','cancelada')),
  origem     text not null default 'site' check (origem in ('site','painel')),
  criado_em  timestamptz not null default now()
);
create index if not exists reservas_data_idx on reservas (data, hora);

-- Promoções / pop-up -------------------------------------------

create table if not exists promocoes (
  id            serial primary key,
  titulo        text not null,
  subtitulo     text,
  texto         text,
  imagem_url    text,
  cupom         text,
  cta_texto     text,
  cta_url       text,
  inicio        date,
  fim           date,
  ativo         boolean not null default false,
  paginas       text not null default 'todas'
                check (paginas in ('todas','home','cardapio','reservas')),
  frequencia    text not null default 'sessao'
                check (frequencia in ('sempre','sessao','dia')),
  atraso_seg    int not null default 4,
  estilo        text not null default 'vinho' check (estilo in ('vinho','creme','noite')),
  visualizacoes int not null default 0,
  cliques       int not null default 0,
  criado_em     timestamptz not null default now()
);

-- Fidelidade --------------------------------------------------

create table if not exists clientes (
  id             serial primary key,
  nome           text not null,
  telefone       text not null unique,
  email          text,
  aniversario    date,
  selos          int not null default 0,
  total_visitas  int not null default 0,
  resgates       int not null default 0,
  aceita_contato boolean not null default true,
  obs            text,
  origem         text not null default 'painel' check (origem in ('site','painel')),
  ultima_visita  timestamptz,
  criado_em      timestamptz not null default now()
);

create table if not exists fidelidade_eventos (
  id         serial primary key,
  cliente_id int not null references clientes(id) on delete cascade,
  tipo       text not null check (tipo in ('visita','resgate','ajuste')),
  quantidade int not null default 1,
  nota       text,
  criado_em  timestamptz not null default now()
);
create index if not exists fidelidade_eventos_cliente_idx on fidelidade_eventos (cliente_id, criado_em desc);

-- Configurações (chave → JSON) ---------------------------------

create table if not exists configuracoes (
  chave         text primary key,
  valor         jsonb not null,
  atualizado_em timestamptz not null default now()
);
