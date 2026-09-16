# Rizz — Plano de reconstrução (v2)

Documento de trabalho. O que mudou, por quê, e o que vai ser construído.

---

## 1. O que estava errado na v1

| Problema | Causa | Correção |
| --- | --- | --- |
| Logo inventado | Desenhei um wordmark em SVG sem ter o arquivo real | Usar os PNG/WebP reais (`assets/marca/`) |
| Garfo ao contrário | Supus pontas para cima; o real tem pontas **para baixo** e ponto em cima | Logo real resolve |
| Paleta aproximada | Cores "derivadas" das peças a olho | Amostradas do arquivo: vinho **#70012A**, âmbar **#E8890C** |
| Direção dark | Escolhi fundo quase preto | As peças da marca são **creme + vinho + ouro**. Inverter para claro/editorial |
| Tipografia errada | Fraunces (serifada "soft") | O logo é uma **Didone** de alto contraste → Bodoni Moda |
| Pouco scroll | Só `Reveal` + 2 parallax | Sistema completo de cenas com ScrollTrigger (§5) |
| Sem imagens geradas | Não explorei | Higgsfield autenticado, 203 créditos |
| Sem referências | Não pesquisei | Awwwards fine-dining + Ballena (§3) |

## 2. Dados corrigidos (das peças reais)

- Menu executivo: **R$ 75,90** no cardápio impresso (o post de dez/2025 dizia 72,90 — adotar 75,90, é a peça mais recente)
- Risotos são listados **sem** o prefixo "Risoto de" → "À Carbonara", "Açafrão Espanhol com…"
- "(Acompanha Pão Italiano)" em Burrata ×2, Carpaccio, Creme de Batata
- Salada Rizz leva "Lâminas de Amêndoas"
- Brownie Artesanal realmente **não tem preço** na peça
- Selos VPJ/Duroc Pork são **por item**, não globais
- Carta de vinhos tem **QR Code** na peça
- Preços no cardápio aparecem **sem "R$"**, alinhados à direita — copiar isso

## 3. Referências

- **Ballena | Fine Dining** (Awwwards HM) — paleta `#C2644F` + `#F8F2E5`; tags: Luxury, Menu-Horizontal, Storytelling, Microinteractions
- **Qissa – A Tale of Food**, **Le Saint Georges**, **Tabela**, **Palazzo Sogni** (Awwwards hotel/restaurant)
- **Amrit Palace** — "Restaurant Menu (Scroll)", gsap + scroll

Leitura: fine dining premiado = **fundo claro de papel, tipografia display enorme, muito respiro, foto tratada como obra, e movimento ligado ao scroll** — não efeito gratuito.

## 4. Sistema de design

**Cores** (amostradas do logo real)
```
--vinho        #70012A   marca, títulos sobre creme
--vinho-fundo  #4A0018   blocos escuros
--noite        #2B0710   hero, footer
--ambar        #E8890C   marca, acentos
--ouro         #C9A227   filetes, ornamentos
--creme        #FDF1E5   papel — superfície principal
--creme-2      #F6E7D6
--tinta        #3A1219   texto sobre creme
--verde        #1F5C44   selo vegetariano
```

**Tipografia**
- Display: **Bodoni Moda** — Didone real, casa com o logo
- UI/corpo: **Jost** — geométrica, como a do cardápio impresso

**Ornamentos**
- Garfos cruzados em ouro entre seções (recriar em SVG como na peça)
- Filete dourado sob cada título de categoria

## 5. Cenas de scroll (ScrollTrigger)

O pedido central. Cada uma é uma cena real, não um fade.

| # | Cena | Técnica |
| --- | --- | --- |
| 1 | Barra de progresso dourada no topo | scrub global, `scaleX` |
| 2 | Hero cinematográfico | `pin` + `scrub`: vídeo sai de moldura pequena para full-bleed, logo escala e some |
| 3 | Marquee reativa | velocidade e **direção** ligadas à velocidade do scroll |
| 4 | Manifesto | seção `pin`, três frases trocando por `scrub` |
| 5 | Prato-assinatura | `pin` + `clip-path` inset abrindo + parallax interno + selo girando por progresso |
| 6 | Destaques | **galeria horizontal pinned**, com parallax horizontal dentro de cada card |
| 7 | Mosaico (vídeo) | `clip-path` expandindo do centro por scrub |
| 8 | Troca de tema | fundo da página migra de vinho→creme→vinho conforme a seção entra |
| 9 | Títulos | `SplitText` por linha **com scrub**, não só on-enter |
| 10 | Filetes | `scaleX` 0→1 por scrub |
| 11 | Contadores | números scrubbed |
| 12 | Footer | logo gigante revelando por máscara |
| 13 | Header | esconde/revela + troca de tom |
| 14 | Cardápio | scroll-spy com indicador animado entre categorias |
| 15 | Linhas do cardápio | `ScrollTrigger.batch` com stagger |
| 16 | Parallax universal | toda foto tem camada interna a 1.15 transladando |

**Regras mantidas da v1** (foram acertadas, não mexer): Lenis único dono da rolagem só em desktop/ponteiro fino, GSAP só de `@/lib/gsap`, `useGSAP` sempre, `fromTo` nunca `from`, ramo `prefers-reduced-motion`, `sticky` preferido a `pin` quando serve, `x`/`y` junto de `xPercent`/`yPercent`, blur com os dois extremos.

## 6. Imagens a gerar (Higgsfield — 203 créditos)

Só o que não existe em foto e serve à narrativa:
1. ~~Textura de papel creme~~ — **descartada**: saiu um campo chapado, sem
   ganho visual sobre a cor CSS. Não valia 2K de download.
2. Still de trufa negra em fundo escuro → usada no Manifesto ✓
3. Still de açafrão com arroz carnaroli → usada no Manifesto ✓
4. Marca de taça de vinho → textura sutil em Avaliações ✓

Guardrail do PRD: imagens no máximo 2K. Consumo: ~9 créditos.

## 7. Ordem de execução

1. Tokens + fontes + `globals.css`
2. Componentes de marca (logo real, ornamento de garfos)
3. Infra de motion nova (`useParallax`, `useScrubReveal`, `ScrollProgress`, `ThemeShift`)
4. Home: hero → manifesto → assinatura → destaques → mosaico → executivo → avaliações → visite
5. Cardápio com scroll-spy
6. Demais páginas
7. Geração de imagens
8. Build → verificação visual mobile/desktop → iterar
