# Rizz Cucina & Vino — entrega (v2)

Site institucional mobile-first. Next.js 16 (App Router) + TypeScript +
Tailwind v4, com sistema de scroll animado GSAP + Lenis.

```bash
npm run dev     # http://localhost:3000
npm run build   # build de produção
```

---

## Dados reais do restaurante

Conferidos no perfil do Google Meu Negócio e em fontes públicas (set/2026),
já aplicados em `lib/site.ts`:

| Campo | Valor |
| --- | --- |
| Endereço | R. Cel. Joaquim Vergueiro, 87 — Centro, **Espírito Santo do Pinhal/SP**, 13990-000 |
| Telefone | (19) 3661-5503 |
| WhatsApp | o mesmo número (`wa.me/551936615503`, publicado pelo restaurante) |
| Coordenadas | -22.191997, -46.747634 |
| Nota | 4,6 · 763 avaliações |
| Faixa de preço | R$ 60–160 por pessoa |
| Instagram | @rizzcucinaevino |
| Facebook | /rizzrestaurante |

A cidade estava errada antes: eu havia deduzido "Ribeirão Preto" a partir do
mapa. É **Espírito Santo do Pinhal**.

### Sobre "as últimas 20 avaliações 5 estrelas em tempo real"

Não é possível pela API pública. A referência da Places API (New) diz, com
todas as letras: *"A maximum of 5 reviews can be returned"* — ordenadas por
relevância, sem filtro por nota e sem paginação.

O que foi entregue (`lib/google-reviews.ts`):

- **nota média e total reais e completos** — esses campos não têm limite, então
  os 4,6 / 763 exibidos são do perfil inteiro;
- **até 5 depoimentos**, filtrados para 5 estrelas, revalidando a cada hora;
- sem chave configurada, o site mostra a nota real e manda ler no Google —
  **nunca texto inventado**.

Para passar de 5 só há dois caminhos: a **Google Business Profile API** (lista
tudo com paginação, mas exige OAuth do dono do perfil e liberação do Google),
ou serviços que raspam o Google — que violam os termos e quebram sem aviso.
Se quiser as 20, o caminho é o primeiro, e depende de autorização do dono.

## ⚠️ Pendências antes de publicar

| O quê | Onde | Situação |
| --- | --- | --- |
| ~~Endereço, telefone, WhatsApp~~ | `lib/site.ts` | ✅ Resolvido — dados reais do perfil do Google (tabela acima) |
| ~~Depoimentos fictícios~~ | `data/reviews.ts` | ✅ Resolvido — textos inventados removidos |
| Chave da API do Google | `.env` | `GOOGLE_PLACES_API_KEY` + `GOOGLE_PLACE_ID`. Sem elas, o site mostra a nota real e manda ler no Google. Ver `.env.example`. |
| URL de produção | `lib/site.ts` → `url` | Ainda um domínio suposto |
| Preço do menu executivo | `data/executivo.ts` | **R$ 75,90** (cardápio impresso) × **R$ 72,90** (post de dez/2025). Adotei 75,90. **Confirmar.** |
| Preço do Brownie Artesanal | `data/menu.ts` | Sem preço na peça impressa → exibe "sob consulta" |
| Carta de vinhos (PDF/link) | `lib/site.ts` → `cartaVinhosUrl` | `null`; a página troca de estado sozinha quando preenchido |
| Horários | `lib/hours.ts` | Transcritos da peça do restaurante. Um agregador de turismo lista segunda-feira aberta; **conferir** com a casa. |

O mapa usa as **coordenadas exatas** (-22.191997, -46.747634), não uma busca
por nome — não depende de o Google acertar o estabelecimento.

### Sobre as avaliações

Não há mais nada inventado no site. `data/reviews.ts` guarda só o retrato real
do perfil (4,6 · 763, conferido em 16/09/2026) e a lista de depoimentos está
**vazia de propósito**: enquanto a chave da API não existir, o site mostra a
nota verdadeira e manda ler os textos no Google.

Com isso, o `aggregateRating` no JSON-LD passou a ser legítimo — ele estava
fora enquanto os números eram fictícios, porque nota agregada inventada vira
desinformação na busca.

---

## O que mudou da v1 para a v2

| Problema da v1 | Correção |
| --- | --- |
| Logo desenhado à mão em SVG, com o garfo ao contrário | Arquivos reais da marca (`assets/marca/`), via `next/image` |
| Paleta estimada a olho | **Amostrada do arquivo**: vinho `#70012A`, âmbar `#E8890C` |
| Direção dark genérica | Direção das peças impressas: creme, vinho e ouro |
| Fraunces (serifada "soft") | **Cormorant Garamond**, títulos em itálico — um grau mais delicada que a Didone do logo, sem competir com ela |
| Movimento raso (fade + 2 parallax) | 16 cenas atreladas ao scroll (abaixo) |
| Sem imagens geradas | 3 imagens via Higgsfield |
| Sem referências | Awwwards fine-dining + Ballena (HM) |

### Correções de dados vindas das peças reais

- Risotos sem o prefixo "Risoto de" — a categoria já diz
- "(Acompanha pão italiano)" em Burrata ×2, Carpaccio e Creme de Batata
- Salada Rizz leva "lâminas de amêndoas"
- Selos VPJ / Duroc Pork são **por item**, não globais
- Preços no cardápio aparecem **sem "R$"**, como no impresso

---

## Cenas de scroll

| Cena | Técnica |
| --- | --- |
| Barra de progresso no topo | scrub global, `scaleX` |
| Hero cinematográfico | `sticky` + scrub: a moldura do vídeo abre até sangrar a tela; o logo recua |
| Marquee reativa | velocidade **e direção** ligadas à velocidade da rolagem |
| Manifesto | palco fixo, três frases + fotos trocando por scrub |
| Prato-assinatura | `clip-path` abrindo de faixa a retrato + parallax interno |
| Selo circular | giro conduzido pelo progresso da rolagem, não por loop de CSS |
| Destaques | **galeria horizontal com pin** no desktop; snap nativo no mobile |
| Mosaico | `clip-path` expandindo do centro |
| Executivo | folha creme subindo por cima do escuro |
| Títulos | `SplitText` por linha, com scrub |
| Filetes dourados | `scaleX` 0→1 por scrub |
| Contadores | números scrubbed |
| Rodapé | assinatura em cartaz revelada por máscara |
| Header | esconde/revela + troca de tom |
| Cardápio | scroll-spy com indicador + `ScrollTrigger.batch` nas linhas |
| Parallax universal | `components/motion/Parallax.tsx` |

**Regras do documento de arquitetura, mantidas:** Lenis é o único dono da
rolagem e só no desktop com ponteiro fino; GSAP importado só de `@/lib/gsap`;
`useGSAP` sempre; `fromTo` nunca `from`; ramo `prefers-reduced-motion` em toda
cena; `sticky` preferido a `pin`; `x`/`y` ao lado de `xPercent`/`yPercent`;
`blur()` com os dois extremos; nunca `scroll-behavior: smooth`.

`ScrollTrigger.config({ ignoreMobileResize: true })` evita que a barra de
endereço recolhendo no celular dispare refresh a cada rolagem.

---

## Imagens geradas (Higgsfield)

Geradas só onde não havia foto e a narrativa pedia: **trufa** e **açafrão com
arroz carnaroli** (usadas no Manifesto) e **marca de taça de vinho** (textura
sutil em Avaliações). Todas em 2K, respeitando o guardrail do PRD.

Uma quarta — textura de papel — foi gerada e **descartada**: saiu um campo
creme chapado, sem ganho visual sobre a cor CSS. Não valia 2K de download.

---

## Verificação

- `npm run build` e `npm run lint` limpos; 10 rotas, todas estáticas
- Varredura automatizada em Chromium (mobile 390×844 e desktop 1440×900):
  sem erros de console, sem overflow horizontal, vídeo tocando, filtro do
  cardápio reduzindo a lista, bottom nav só abaixo de 860px, landmarks de
  navegação com nomes distintos
- Passagem dedicada com `prefers-reduced-motion: reduce`
- Acentuação conferida no HTML servido

### Defeitos encontrados e corrigidos na verificação

1. **Todos os títulos em tamanho de corpo** — `text-[var(--text-display)]` é
   lido pelo Tailwind como cor, não tamanho. Trocado pelas utilitárias que o
   `@theme` gera (`text-display`, `text-titulo`).
2. **Frases do Manifesto sobrepostas** — a transição cruzava duas frases
   legíveis na mesma célula. Agora as janelas de entrada e saída são separadas.
3. **Manifesto ilegível em movimento reduzido** — os blocos empilhados ficavam
   todos visíveis. Agora `motion-reduce:` os devolve ao fluxo normal.
4. **Foto errada em "Visite"** — estava a página do cardápio no lugar do salão.
5. **Cards da galeria estourando a viewport** quando a seção prende.
6. Legenda que não batia com a foto; contraste do hero; rótulo de estrelas
   quebrando em duas linhas; dois `<nav>` com o mesmo nome acessível.

Numa **segunda passada**, revendo as telas de mobile que ainda não tinham sido
examinadas:

7. **Contradição de preço na mesma tela** — a arte do executivo vinda do
   Instagram traz "R$72,90" cravado na imagem, logo abaixo dos R$ 75,90 do
   site. A faixa de texto foi recortada; sobrou só a mesa.
8. **Manifesto quase vazio no mobile** — a foto era `hidden md:block`, então
   cada tela do palco de 300svh ficava com a coluna de texto sozinha. A foto
   agora aparece também no mobile.
9. **Marca de taça lendo como retângulo** — o arquivo gerado tem o papel creme
   embutido (é a foto de um cartão, não uma mancha recortada), então sobre o
   fundo escuro o blend clareava a caixa inteira. Ornamento removido; o asset
   segue disponível para um bloco claro.

Numa **terceira rodada**, a partir de apontamentos do cliente:

10. **Hero com o vídeo emoldurado** — a cena abria de um recorte recuado
    conforme a rolagem, mas na primeira dobra o que se via era uma tarja
    escura em volta do vídeo. Agora ele sangra desde o primeiro quadro, com
    degradê na base que dissolve na seção seguinte.
11. **Vão acima das abas do cardápio** — as abas tinham `top` fixo assumindo
    o header sempre presente; quando ele se recolhia sobrava um buraco do
    tamanho dele. O header agora publica a própria altura em
    `--altura-header`, que zera ao recolher, e as abas sobem junto.
12. **Texto do hero sobre a área mais clara do vídeo** — o véu só fechava nos
    18% finais e o bloco de conteúdo subia bem acima disso. Véu refeito,
    pesado na metade de baixo e leve em cima; os CTAs viraram compactos para
    caber lado a lado em 390px em vez de empilhar.

13. **Site travado atrás do preloader** — o `Preloader` mirava `[data-marca]`,
    mas o componente `Logo` não repassava props extras ao `<Image>`, então o
    atributo nunca chegava ao DOM. A timeline tentava animar `null` **depois**
    de já ter aplicado `overflow: hidden`, e a cortina nunca subia.
    O `Logo` agora encaminha as props, e — mais importante — o preloader
    ganhou quatro saídas de emergência. A mais externa é a que faltava: o
    preloader é **renderizado no servidor**, então chega ao navegador como uma
    camada opaca sobre tudo; se o JS não rodar (erro, extensão, bundle velho
    em cache), nenhum resgate escrito em JS o removeria. Por isso a saída
    externa é **CSS puro** (`[data-cortina]` + `@keyframes cortina-resgate`),
    que o JS desliga ao assumir o controle. As outras três: alvo ausente no
    DOM, erro ao montar a timeline, e um temporizador de 3,5s.
    Uma cortina que cobre a tela não pode depender de JavaScript para sair.

Numa **quarta rodada**, a partir de apontamentos do cliente:

14. **Logo do header sumindo no cardápio** — o gatilho de tom só ativa depois
    de 40px de rolagem, então no topo de qualquer página o header ficava
    transparente. Sobre o creme do cardápio, o logo branco desaparecia.
    O fundo transparente agora existe **só na home**, onde há o vídeo do hero
    por baixo para justificá-lo.
15. **Logo do rodapé gigante** — sangrava na largura toda e dominava o
    fechamento. Virou uma assinatura centralizada, discreta.
16. **Ornamento de garfos removido do site inteiro** — o desenho lia como um
    garfo solto, não como o par cruzado da peça impressa. Retirado dos nove
    lugares onde aparecia e o componente foi apagado; onde ele separava
    seções, entrou um filete dourado.
17. **Mosaico reescrito como cena de três tempos** — o vídeo abre de um
    recorte central até sangrar a tela, depois ganha desfoque e esmaece,
    revelando o conteúdo que esteve por baixo dele o tempo todo. Tudo
    atrelado à rolagem, num palco `sticky` de 300svh.
18. **Cortina presa por incompatibilidade de hidratação** — o preloader lia
    `sessionStorage` dentro de um `useState`, durante o render. Isso produz
    saídas diferentes no servidor (sempre `false`) e no cliente (`true` para
    quem já visitou): o React não removia o nó vindo do servidor, e o
    visitante que voltava ficava encarando a cortina até o resgate em CSS
    disparar, 4 segundos depois.
    O markup agora é **idêntico nos dois lados** e a decisão saiu do render
    para o efeito — sessão já vista apaga a cortina no primeiro quadro.
    Lição: nunca ramificar o que é renderizado a partir de estado que só
    existe no navegador.

A tipografia dos títulos passou de Bodoni Moda para **Cormorant Garamond em
itálico**, a pedido — mais delicada, e sem competir com a Didone do logo.

Há um teste de regressão para o item 13 em `scratchpad/preloader.mjs`: ele
abre o site em contexto novo (sem `sessionStorage`), espera o resgate e
verifica que a página **rola de fato** — não que a animação ficou bonita.

---

## Próximas fases

- **Fase 2 — CMS:** os tipos em `data/*.ts` espelham o modelo do PRD
  (`MenuCategory`, `MenuItem`, `ExecutiveMenu`, `OperatingHours`, `Review`,
  `SiteSettings`), então plugar banco é troca de origem, não refatoração.
- **Fase 3 —** Higgsfield no painel com guardrails de crédito, dashboard de
  métricas, importação do Google Reviews.
- **Fase 4 —** carta de vinhos dinâmica, i18n, plataforma de reservas.
