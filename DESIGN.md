---
name: AERIS, edição ltmodasestilo
description: Loja de moda feminina no estilo da referência "AERIS" escolhida pela dona em 17/11/2026. Banner de tela cheia com o cabeçalho transparente por cima, coleção com abas, mosaico de quatro quadros, fundo branco quase puro, títulos numa sem serifa geométrica em caixa alta espaçada, tinta quase preta nos botões e no rodapé, e um único acento verde-folha reservado ao WhatsApp. A cor vem das roupas. Compra pelo WhatsApp, sem carrinho.
colors:
  fundo: "#fbfbfa"
  superficie: "#f7f7f5"
  painel: "#f2f2f1"
  cartao: "#fefefe"
  linha: "#e0e0df"
  borda: "#898988"
  tinta: "#161616"
  tinta-suave: "#5b5b5a"
  acento: "#1e6b43"
  acento-forte: "#1c5a3a"
  texto-botao: "#fbfbfa"
  escuro: "#161616"
  escuro-linha: "#444444"
  sobre-escuro: "#fbfbfa"
  sobre-escuro-suave: "#b2b2b1"
  veu-forte: "rgba(22, 22, 22, 0.82)"
typography:
  wordmark:
    fontFamily: IBM Plex Sans
    fontSize: 22px celular, 26px desktop
    fontWeight: 600
    letterSpacing: -0.02em
  marca-sub:
    fontFamily: Instrument Sans
    fontSize: 8px celular, 9px desktop
    fontWeight: 600
    letterSpacing: 0.34em
    textTransform: uppercase
  headline-display:
    fontFamily: Jost
    fontSize: clamp(30px, 1.25rem + 2.6vw, 68px)
    fontWeight: 500
    lineHeight: 1.04
    letterSpacing: 0.01em
    textTransform: uppercase
  headline-secao-home:
    fontFamily: Jost
    fontSize: clamp(20px, 1.05rem + 0.7vw, 26px)
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: 0.08em
    textTransform: uppercase
  headline-lg:
    fontFamily: Jost
    fontSize: clamp(24px, 1.2rem + 1vw, 34px)
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: -0.005em
  label-sm:
    fontFamily: Instrument Sans
    fontSize: 12px
    fontWeight: 600
    letterSpacing: 0.16em
    textTransform: uppercase
  body-md:
    fontFamily: Instrument Sans
    fontSize: 16px celular, 17px desktop
    fontWeight: 400
    lineHeight: 1.6
rounded:
  controle: 4px
  superficie: 4px
  cartao: 10px
  circulo: 50%
spacing:
  secao-celular: 48px
  secao-desktop: 64px
  gutter-celular: 16px
  gutter-desktop: 24px
components:
  botao-whatsapp:
    backgroundColor: "{colors.acento}"
    textColor: "{colors.texto-botao}"
    rounded: "{rounded.controle}"
  botao-preto:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.fundo}"
    rounded: "{rounded.controle}"
  faixa-escura-mosaico:
    backgroundColor: "{colors.escuro}"
    textColor: "{colors.sobre-escuro}"
    rounded: "{rounded.superficie}"
  painel-claro:
    backgroundColor: "{colors.painel}"
    rounded: "{rounded.superficie}"
  foto-peca:
    backgroundColor: "{colors.superficie}"
    rounded: "{rounded.superficie}"
    size: 3:4, object-position 50% 20%
  coracao:
    backgroundColor: "{colors.cartao}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.circulo}"
---

# DESIGN.md: direção "AERIS" (17/11/2026)

## 0. Direção atual: AERIS

A dona mandou três referências de lojas de moda (LUMEN, AERIS e FORMA), escolheu a segunda ("layout 2") e gerou duas fotos próprias para o banner: `img/banner-pagina-web.jpg` (16:9, computador) e `img/banner-mobile.jpg` (9:16, celular), uma modelo de conjunto vermelho numa sala clara com parede bege lisa. Esta seção vale por cima das seções 1 a 8 abaixo, que descrevem a direção anterior ("Referência") e continuam valendo no que não for citado aqui.

Leitura: reformulação visual da vitrine de uma marca de moda feminina, para quem chega pelo Instagram, quase sempre no celular, com a linguagem editorial e limpa da AERIS (foto de tela cheia, sem serifa em caixa alta, muito branco). Conteúdo, endereços, âncoras e caminho de compra foram mantidos. Dials: variação 6, movimento 4, densidade 4.

O que mudou:

- **Identidade** (`config.identidade`): fundo `#fbfbfa` (branco quase puro, no lugar do creme), tinta `#161616`, títulos em **Jost 500** no lugar da DM Serif Display. O cinza claro das fotos e dos painéis e o branco dos cartões continuam saindo do fundo no build. A cor da página vem das roupas: a interface fica em branco, cinza e preto, e o verde continua só no WhatsApp. Para voltar: `corFundo "#f6f4f0"`, `corTinta "#151413"`, `fonteTitulo "DM Serif Display"`.
- **Títulos**: na home, os h2 ficam em caixa alta com 0.08em de entreletra e tamanho contido (20 a 26px), como o "NOVINKI" da AERIS; nas outras páginas (peça, trocas, 404), caixa normal, porque lá há títulos longos. O nome da marca dentro de um título fica sempre na IBM Plex Sans e em minúsculas (na Jost o "l" é um traço reto e "ltmodasestilo" viraria "Itmodasestilo").
- **Cabeçalho**: na home ele fica transparente sobre o banner e ganha fundo e hairline assim que a página rola (`body.topo-solido`, posta pelo app.js com um IntersectionObserver numa sentinela no alto do banner) ou a busca abre. A tinta continua escura porque a parede do banner é clara. A partir de 1280px: navegação à esquerda, wordmark no centro exato, ícones e "Pedir no WhatsApp" à direita. De 1024 a 1279px e no celular, o arranjo anterior (não cabe tudo com o logo no centro).
- **Banner de tela cheia** (substitui o topo dividido, os destaques e o carrossel de 3 fotos): altura da tela menos a barra de topo, em `svh`. Tela deitada: foto 16:9, texto à esquerda centrado na altura, largura `min(40rem, 52vw)` para nunca encostar na modelo. Tela em pé: foto 9:16, texto em cima; no celular a frase e o "Ver vídeos" somem para o botão caber acima da cabeça da modelo (medido: em 375x667 o botão termina na linha do cabelo). Uma foto por orientação (`<picture>` com `media="(orientation: landscape)"`), cada uma com seu preload. Campos: `hero.foto`, `hero.fotoCelular` (novo); saíram `hero.fotos` e `hero.destaques` (o build recusa e explica).
- **Coleção logo abaixo do banner**: título "COLEÇÃO" centrado, a frase sobre preço e as abas de categoria em texto, com traço sob a ativa (as mesmas `chips` de antes, com outra aparência). 6 colunas a partir de 1280px, 3 de 640 a 1279px, 2 no celular. Mostra 6 peças e "Ver todas as peças"; abas e busca mostram todas. Sem JS, todas aparecem.
- **Mosaico** (`conteudo.mosaico`, substitui `categorias`, `estilos` e `paineis`): exatamente 4 quadros. Desktop: o 1º alto à esquerda (duas linhas), o 2º e o 3º em cima, e o 4º uma faixa larga escura com título, frase, botão claro e a foto à direita. Celular: o 1º inteiro, o 2º e o 3º lado a lado, a faixa inteira. Hoje: pantalona rosa, short azul, vestido vermelho e "Cada peça em vídeo" com o conjunto verde. O build confere se cada `filtro` é uma categoria real.
- **Vídeos**: título centrado; os controles ficam à direita na mesma linha no desktop e embaixo do título no celular.
- **Benefícios**: sem painel bege; quatro itens entre duas linhas finas.
- **Rótulos**: só o do banner. Os rótulos acima de cada seção saíram (a AERIS não usa e o excesso deixava o ritmo repetitivo).
- **Imagens**: a pasta `img/1280/` entrou nas miniaturas (`npm run fotos`), só para fotos mais largas que 1408px (o banner do computador). Os PNGs originais do banner ficam em `referencias/banners-originais/`, fora do site.

Ordem da home agora: barra de topo, cabeçalho (transparente), banner, coleção, mosaico, vídeos, benefícios, receba as novidades, sobre, depoimentos (só com depoimento real), guia de medidas, dúvidas, trocas, rodapé.

Contrastes da identidade nova (impressos pelo build): tinta sobre fundo 17,48:1; tinta suave sobre fundo 6,59:1, sobre superfície 6,34:1 e sobre painel 6,10:1; texto do botão sobre o verde 6,26:1; borda sobre fundo 3,40:1; texto secundário do rodapé 8,50:1. Texto do banner (tinta) sobre a parede bege da foto: acima de 10:1.

---

# Direção anterior: "Referência" (rodada 4)

Documento de referência para quem mexe em `src/`, `assets/css/style.css`, `assets/js/app.js`, `build.js` e nos campos de `dados/`. Substitui a direção "Vitrine" (rodada 3). A dona pediu "melhore ainda mais o site usando a imagem referência"; a imagem fica em `referencias/` (fora de `img/`, não vai ao ar) e é um modelo de loja de moda premium ("LUNORA Fashion"). Esta direção segue a estrutura e a estética dela, adaptadas aos dados reais da ltmodasestilo.

Marcação: **[novo]** não existia na Vitrine; **[mudou]** existia e foi alterado; sem marca, foi mantido. A seção 13 junta tudo numa tabela "Vitrine x Referência", e a seção 14 compara a referência com o que foi feito.

Regras que valem para o documento inteiro: português do Brasil, nenhum travessão ou meio-traço, nada inventado (preço, desconto, frete, prazo, avaliação, estrela, contador, "mais vendido", "coleção nova", depoimento), nenhum emoji. JS até ES2017; CSS sem `color-mix()`, sem cor relativa e sem `prefers-color-scheme`; UTF-8 sem BOM.

---

## 1. Overview

Leitura: loja de moda feminina para quem chega pelo Instagram e por anúncio da Meta, quase sempre no celular, com a linguagem premium e calma da referência (creme, bege, preto, serifa de alto contraste, muito respiro), e o caminho de compra de sempre (peça, tamanho, WhatsApp com a mensagem pronta). Dials: variação 6, movimento 5, densidade 4.

O que a referência trouxe e o site adotou: cabeçalho claro com navegação no meio; topo dividido com título serifado enorme, botão preto e "play" num círculo; numeração vertical 01, 02, 03 das fotos; círculos de categoria num cartão branco que sobe sobre a base do topo, o último preto; cards altos com véu e "Ver peças"; dois painéis bege lado a lado; vitrine de peças com coração; faixa de benefícios em painel bege com divisórias; bloco de cadastro (aqui, pelo WhatsApp); rodapé preto com colunas.

O que a referência tinha e o site NÃO copiou (não há dado verdadeiro por trás): estrelas e número de avaliações; "Up to 50% Off", "Limited time offer", "Spring Sale"; "Free shipping on orders over $99", "30-day returns", "Secure payment 100% protected", "24/7 support"; "10% off your first order"; "Best sellers"; campo de e-mail (não há servidor); coração decorativo (aqui ele funciona, seção 9).

---

## 2. Colors **[mudou]**

| Token | Hex | Como sai | Uso |
|---|---|---|---|
| `--cor-fundo` | `#f6f4f0` | entrada `identidade.corFundo` | fundo creme de todas as páginas, texto dos botões |
| `--cor-superficie` **[mudou]** | `#f2f0eb` | o fundo 4,5 pontos mais escuro, com o tom reforçado em 30% | bege claro sob as fotos de peça, cabeçalho de tabela |
| `--cor-painel` **[novo]** | `#efebe5` | o fundo 9 pontos mais escuro, com o tom reforçado em 60% | painéis bege (promoções, benefícios, novidades, trocas), círculos de categoria |
| `--cor-cartao` **[novo]** | `#fdfdfc` | o fundo levado 80% ao branco (nunca `#fff`) | cartão das categorias, cartão da tabela, coração, painel de números do topo, campo de busca |
| `--cor-linha` | `#dbd9d5` | 12% de tinta | hairlines |
| `--cor-borda` | `#868482` | 50% de tinta (sobe até 3:1) | borda de campos, chips e botões secundários |
| `--cor-tinta` **[mudou]** | `#151413` | entrada `identidade.corTinta` (quase preto, sem `#000`) | texto, botão preto, barra de topo, rodapé |
| `--cor-tinta-suave` | `#595755` | 70% de tinta (sobe até 4,5:1 sobre fundo, superfície e painel) | rótulos, frases de apoio, cor da peça |
| `--cor-acento` | `#1e6b43` | entrada `identidade.corAcento` | SOMENTE WhatsApp |
| `--cor-acento-forte` | `#1c5a39` | 20% de tinta | hover do WhatsApp |
| `--cor-escuro`, `--cor-escuro-linha`, `--cor-sobre-escuro`, `--cor-sobre-escuro-suave` | `#151413`, `#42413f`, `#f6f4f0`, `#aeaca9` | tinta; tinta com 20% de fundo; fundo; sobe até 4,5:1 | barra de topo e rodapé |
| `--cor-veu-forte`, `--cor-veu-zero` | tinta a 0,82 e a 0 | | degradê sob o texto dos cards de "Compre por categoria" |
| `--sombra-cartao` **[novo]** | `0 12px 40px` tinta a 0,08 | | cartão das categorias, cartão da tabela, painel de favoritos |

"Tom reforçado" (`realcarTom` em `src/layout.js`): cada canal do fundo é escurecido e afastado da média dos três canais. Assim o bege nasce do creme (fica levemente quente, como os painéis da referência, `#f0ebe5` medido na imagem) e não do cinza; com um fundo neutro, o resultado é um cinza claro neutro. Removidos: `--cor-escuro-alto` (o cabeçalho deixou de ser escuro).

Contrastes (fórmula WCAG; os do build são impressos no terminal): tinta sobre fundo 16,75:1; tinta sobre cartão 18,08:1; tinta sobre painel 15,49:1; tinta suave sobre fundo 6,54:1, sobre superfície 6,30:1, sobre painel 6,06:1 e sobre cartão 7,07:1; texto do botão sobre o verde 5,90:1 e sobre o verde forte 7,47:1; fundo sobre tinta (botão preto, rodapé) 16,75:1; texto secundário do rodapé 8,15:1; borda sobre fundo 3,40:1, sobre cartão 3,66:1 e sobre painel 3,14:1; texto creme sobre o véu com uma foto branca atrás (pior caso) 9,72:1. O cartão branco sobre o creme (1,08:1) é separado pela sombra, não pela cor: é contêiner, não controle.

Exceção documentada: a skill de design proíbe por padrão o trio creme + latão + marrom-café. Aqui a paleta é creme + preto + bege (sem latão, sem marrom, sem dourado na interface), pedida pela dona com imagem de referência. O verde continua sendo o único acento e só aparece no WhatsApp. `theme-color` é a tinta, para a barra do navegador emendar com a barra de topo preta.

---

## 3. Typography **[mudou]**

**Títulos: DM Serif Display, peso 400** (Google Fonts, uma folha só, sem eixo). Por que ela: a referência usa uma serifa de transição com contraste alto, terminais em gota no "a" e no "y" e serifas finas, larga o bastante para títulos de duas linhas; a DM Serif Display tem esse desenho (é a versão de título da família DM, com contraste alto e entrelinha firme), pesa pouco (só o 400) e não é Fraunces nem Instrument Serif. A Bodoni Moda e a Playfair Display foram descartadas: a Bodoni tem hastes finas demais para telas de celular de entrada, e a Playfair é a serifa "de modelo" mais repetida. Medido no navegador, a DM Serif Display ocupa a mesma largura que a Georgia (razão 0,998 em seis títulos do site), então o fallback é `"DM Serif Display Fallback"` com `local(Georgia)` e `size-adjust: 100%`: a troca de fonte não muda quebra de linha. Como só existe o 400, `h1` e `h2` usam `font-weight: 400` (pedir 500 faria o navegador engrossar a letra).

**Texto: Instrument Sans** (400, 500, 600), mantida: é uma sem serifa limpa como a da referência e já tinha fallback medido.

**Nome da marca: IBM Plex Sans 600**, mantido no wordmark, na assinatura do rodapé e nos textos em sem serifa (o "l" de cauda evita a leitura "Itmodasstio"). **[mudou]** Dentro de títulos serifados, o nome segue a serifa (na DM Serif Display o "l" tem serifa só de um lado e não se confunde com o "I"; a sem serifa no meio do título destoava).

Escala:

| Papel | Celular | Desktop | Família |
|---|---|---|---|
| h1 do topo | 40px | até 72px | DM Serif 400, line-height 1.04 |
| h2 de seção | 30px | 44px | DM Serif 400, line-height 1.08 |
| h1 da peça | 32px | 42px | DM Serif 400 |
| Título de painel | 24px | 34px | DM Serif 400 |
| Rótulo **[novo]** | 12px | 12px | Instrument 600, caixa alta, 0.16em, tinta suave |
| Linha da marca **[novo]** | 8px | 9px | Instrument 600, caixa alta, 0.34em |
| Corpo | 16px | 17px | Instrument 400 |
| Nome no card | 14px | 15px | Instrument 500 |
| Botão | 15px | 15px | Instrument 600 |

Rótulos (`.rotulo`): a dona escolheu uma referência que usa rótulos acima de quase todo título ("NEW COLLECTION", "SHOP BY CATEGORY"), então eles estão autorizados aqui, com texto verdadeiro: "Conjuntos e vestidos", "Compre por categoria", "Conjuntos", "Veja no corpo", "Coleção", "Vídeos", "Pelo WhatsApp", "A loja", "Tamanhos", "Ajuda", "Trocas", "Mais peças", "Política da loja", "Erro 404". Em tinta suave (6,5:1), nunca no cinza claro da imagem.

---

## 4. Layout

- Container de 1280px, gutter 16/24px, breakpoints 640, 1024 e 1280.
- **[mudou]** Entre seções: 48px no celular e 64px no desktop (a referência é mais densa que a Vitrine, que usava 64/96).
- Topo dividido no desktop: grade 52/48 sem container; o texto alinha com a borda esquerda do container por cálculo (a coluna tem 52% da página, então a margem do container é a coluna dividida por 1,04 menos 640px, `max(gutter, ...)`), e a foto vai até a borda direita da janela. Altura `clamp(560px, 100vh - 150px, 680px)`.
- Cartão das categorias: `margin-top: -88px` no desktop, por cima da base do topo (z-index 2).
- Coleção: 2 colunas no celular, 3 no desktop (9 peças fecham 3 linhas sem peça sozinha).
- Topo fixo: 64px no celular, 76px no desktop, usado no `scroll-margin-top` de toda âncora.

## 5. Elevation & Depth **[mudou]**

Sombras só onde há sobreposição real: `--sombra-cartao` no cartão das categorias (que sobe sobre o topo), no cartão da tabela de medidas e no painel de favoritos; `--sombra-fixa` na barra fixa e no menu. Profundidade no resto vem de camadas de cor (creme, bege claro, bege, branco, preto), não de sombra. Véu escuro só sob texto em foto. Sem desfoque de fundo, sem degradê decorativo.

## 6. Shapes **[mudou]**

4px em botões, campos, fotos, cards e painéis; 10px no cartão branco das categorias e no da tabela; 50% em círculos (categorias, play do "Ver vídeos", coração, contador, pílula dos números, ícones dos destaques e dos ícones sociais). Chips de filtro em pílula (22px). Na Vitrine eram 2px e 0.

---

## 7. Components

### 7.1 Barra de topo
Mantida: faixa preta fina, frases verdadeiras, revezando no celular e lado a lado no desktop.

### 7.2 Cabeçalho **[mudou]**
Claro (`--cor-fundo`), sticky, hairline embaixo. Wordmark com "MODA FEMININA" embaixo (`config.subtituloMarca`, campo novo). Desktop: navegação no meio (`conteudo.navegacao`: Coleção, Conjuntos, Vestidos, Vídeos, Medidas, Trocas), à direita lupa, coração de favoritos com contador, Instagram (a partir de 1280px) e "Pedir no WhatsApp". Celular: menu, wordmark, lupa, coração e o ícone verde do WhatsApp. Sublinhado que cresce da esquerda no hover da navegação.

### 7.3 Busca **[mudou]**
Mesma lógica (nome, cor e categoria, sem acento; estado vazio com "Pedir no WhatsApp"), agora numa linha abaixo do cabeçalho que abre pela lupa nos dois tamanhos (Esc fecha e devolve o foco). Campo branco com borda (3,66:1). Sem JS, a linha fica sempre aberta e é um form GET.

### 7.4 Topo dividido **[novo]**
Rótulo, h1 serifado em duas linhas, frase, botão preto "Ver a coleção" com seta e o link "Ver vídeos" com play num círculo (o "Watch Lookbook" da referência). Três destaques em linha com ícone num círculo bege, título e apoio (`hero.destaques`), separados por divisórias. À direita, até 3 fotos de peças que revezam (`hero.foto` + `hero.fotos`); cada foto leva à peça em que aparece; numeração vertical 01, 02, 03 (botões de 44px com `aria-current`, rótulo "Foto 2 de 3") e pausa, numa pílula branca. Autoplay de 6 s só sem movimento reduzido, parando com o mouse em cima, com foco dentro e com a aba escondida. Só a primeira foto é o LCP, com preload e `fetchpriority`.

Celular: texto e botões primeiro, foto 4:5 logo abaixo, destaques depois da foto (três colunas, só o título). Por quê: em 375x812 o botão termina perto de 375px e o rosto da modelo aparece entre 470 e 560px, ou seja, a primeira tela tem a chamada, o botão e o rosto; com a foto em cima, o botão cairia abaixo da dobra (4:5 de 375px já são 469px de foto), e com o texto sobre a foto o título serifado enorme perderia legibilidade e esconderia a roupa. A pílula dos números fica no canto inferior direito da foto, longe do rosto.

### 7.5 Categorias em círculos **[mudou]**
Cartão branco com sombra suave, cantos de 10px. Círculos com fundo bege e o recorte de rosto e tronco calculado no build (`fotoCirculo`): Coleção, Conjuntos com short, Conjuntos com pantalona, Vestidos. O último é preto com "VÍDEOS" em creme (o "SALE" da referência), levando à faixa de vídeos. Desktop: o cartão sobe 88px sobre o topo. Celular: faixa com rolagem lateral.

### 7.6 Compre por categoria **[novo]** (substitui o mosaico)
Rótulo "Compre por categoria", título "Encontre seu estilo" e "Ver a coleção" com seta à direita. Quatro cards 4:5 com véu escuro embaixo, título em Instrument 600 e "Ver peças" com seta (no de vídeos, "Ver vídeos"): Conjuntos com short, Conjuntos com pantalona, Vestidos, Peças em vídeo (`conteudo.estilos`). Zoom de 4% na foto e seta que desliza no hover. Celular 2 x 2, desktop uma linha.

### 7.7 Dois painéis bege **[novo]** (substituem os slides 2 e 3 do banner)
Texto à esquerda (rótulo, título serifado em duas linhas, botão preto com seta) e imagem à direita até a borda do painel. A: "Conjuntos / Cores vivas para usar agora / Ver conjuntos" com foto de peça. B: "Veja no corpo / Cada peça em vídeo / Ver vídeos" com a imagem de ambiente "parede" (cabides), como a arara da referência. `conteudo.paineis`.

### 7.8 Card de peça **[mudou]**
Foto 3:4 sobre bege claro com cantos de 4px, selo "Vídeo", nome, bolinha de cor com o nome e linha de preço (com "Consulte os valores pelo WhatsApp." uma vez só quando ninguém tem preço). Coração no canto superior direito da foto, num círculo branco, como botão irmão do link (nunca dentro dele). Sem estrelas, sem "Ver peça" (o card inteiro é o link, como na referência).

### 7.9 Coleção **[mudou]** (junta "Novidades" e "Coleção", que repetiam as mesmas 9 peças)
Rótulo "Coleção", título "Escolha a sua peça" e, à direita no desktop, os chips em pílula. Busca, resultado e estado vazio como antes. Grade de 3 colunas no desktop. Sem "Ver tudo": todas as peças já estão na tela.

### 7.10 Vídeos
Faixa de stories mantida, com a mesma economia de dados (no celular, nada é baixado sem gesto na faixa). Cabeçalho no padrão novo (rótulo "Vídeos", título serifado) e cantos de 4px.

### 7.11 Benefícios **[mudou]**
Saiu de baixo do topo (o topo já tem 3 destaques). Painel bege com 4 itens separados por divisórias curtas: Compra pelo WhatsApp, Vídeo de cada peça, Ajuda com o tamanho, Trocas pelo WhatsApp. Frete, parcelas e PIX entram sozinhos pelo config.

### 7.12 Receba as novidades **[novo]** (no lugar do cadastro por e-mail e do banner de atendimento)
Painel bege com foto de peça à esquerda e, à direita, rótulo "Pelo WhatsApp", título "Receba as novidades", a frase "Mande um oi e a gente avisa quando chegarem peças novas.", o botão verde "Quero receber novidades" (mensagem `config.mensagemNovidades`, campo novo) e o link "Seguir no Instagram".

### 7.13 Sobre, Guia de medidas, Dúvidas e Trocas **[mudou]**
Mais enxutos: Sobre com texto à esquerda e retrato à direita; Guia de medidas com o texto e "Como medir" à esquerda e a tabela num cartão branco à direita; Dúvidas com cabeçalho no padrão novo; Trocas num painel bege com a imagem de ambiente "pilha" no desktop.

### 7.14 Rodapé **[mudou]**
Preto. À esquerda: wordmark creme com "MODA FEMININA", frase e ícones de Instagram e WhatsApp. Colunas Loja (Coleção, categorias, Vídeos), Atendimento (Pedir no WhatsApp, Guia de medidas, Trocas e devoluções, Dúvidas), Sobre (Sobre a ltmodasestilo, Instagram) e Fique por dentro (a frase e "Quero receber novidades"). Linha final só aparece com razão social, CNPJ ou política de privacidade preenchidos no config (a dona pediu para tirar o © e o crédito do Unsplash, que a licença não exige). Saiu a assinatura gigante (a referência não tem).

### 7.15 Painel de favoritos **[novo]** (seção 9)

### 7.16 Página da peça **[mudou]**
Fundo creme, galeria sobre bege claro (cantos de 4px no desktop), rótulo com a categoria, título serifado com o coração ao lado (botão de 44px com borda), bolinha de cor, preço, chips, CTA verde, garantias com ícones, acordeões e "Você também pode gostar" com o card novo. Barra fixa, regras de tamanho e mensagem, `#video`, Pixel e UTM iguais.

### 7.17 /trocas/ e 404 **[mudou]**
Rótulo, título serifado e seções separadas por hairline; a 404 mostra quatro peças no card novo.

### Rótulos de botão (um por intenção)
"Pedir no WhatsApp" (comprar ou falar), "Pedir ajuda com o tamanho", "Falar sobre uma troca", "Quero receber novidades" **[novo]**, "Enviar favoritas no WhatsApp" **[novo]**, "Ver a coleção" (topo, cabeçalho de "Compre por categoria", 404), "Ver vídeos" (topo e painel B), "Ver peças", "Ver conjuntos", "Seguir no Instagram". Duas sugestões do pedido foram unificadas por essa regra: "Ver todas as peças" virou "Ver a coleção" e "Ver os vídeos" virou "Ver vídeos".

---

## 8. Home, ordem das seções **[mudou]**

1. Barra de topo preta
2. Cabeçalho claro
3. Topo dividido (com os 3 destaques)
4. Categorias em círculos no cartão branco
5. Compre por categoria
6. Dois painéis bege
7. Coleção (busca e filtros)
8. Peças em vídeo
9. Benefícios em painel bege
10. Receba as novidades
11. Sobre
12. Depoimentos (só com depoimento real; hoje não sai)
13. Guia de medidas
14. Dúvidas
15. Trocas
16. Rodapé preto

A seção "Siga @ltmodasestilo" com 6 fotos saiu: a página ficava longa e o Instagram já aparece no cabeçalho, no bloco de novidades ("Seguir no Instagram"), no Sobre e no rodapé.

---

## 9. Favoritos **[novo]**

- Coração nos cards e ao lado do nome na página da peça: `<button aria-pressed>` com nome "Salvar nos favoritos: nome da peça". Vazio (contorno) ou cheio (salvo), sempre em tinta; pulsa uma vez ao salvar (sem movimento reduzido).
- Guardado no aparelho em `localStorage` (chave `ltm-favoritos`, lista de slugs), com try/catch: sem localStorage, a lista vale para a página aberta. Outras abas acompanham pelo evento `storage`.
- Coração do topo com contador (bolinha preta, `aria-hidden`; o número vai no nome do botão: "Favoritos, 2 peças"). Abre o painel.
- Painel: `<dialog>` modal (à direita no desktop, tela cheia no celular), foco no "Fechar" ao abrir, Tab e Shift+Tab giram dentro do painel, Esc fecha e o foco volta ao coração do topo; toque fora fecha. Lista com miniatura, nome, cor (bolinha) e link para a peça, e o botão "Remover dos favoritos: nome" (o foco vai para o próximo item). Estado vazio: "Toque no coração das peças para salvar aqui."
- "Enviar favoritas no WhatsApp" (verde) monta `config.mensagemFavoritas` (campo novo, padrão "Olá! Gostei destas peças: {pecas} Podem me ajudar?"), com `{pecas}` = "Nome (cor) endereço; Nome (cor) endereço", e a mesma linha "(vi pelo anúncio: X)" das outras mensagens. Embaixo, "As favoritas ficam salvas só neste aparelho."
- Favoritar não dispara evento do Pixel; só o clique em "Enviar favoritas no WhatsApp" registra `Contact` (`whatsapp_favoritas`), como qualquer botão de WhatsApp.
- Sem JS, corações e o botão do topo não aparecem. Os dados das peças vêm de `window.PECAS`, gerado no build.

## 10. Movimento

Mantido: só `transform` e `opacity`, nada de listener de scroll, `prefers-reduced-motion` zera tudo. Novos: entrada do texto do topo em sequência (70ms entre rótulo, título, frase e botões; a foto, que é o LCP, não anima); sublinhado da navegação; seta dos botões e links que desliza 3px; zoom de 4% nos cards de categoria; círculo que sobe 2px; painel de favoritos que entra pela direita; pulso do coração.

## 11. Dados: campos novos e mudados

`dados/config.js`: `identidade` (creme `#f6f4f0`, tinta `#151413`, verde `#1e6b43`, DM Serif Display e Instrument Sans), `subtituloMarca`, `mensagemNovidades`, `mensagemFavoritas` (precisa de `{pecas}`; o build avisa).

`dados/conteudo.js`: `navegacao` **[novo]**; `hero.rotulo`, `hero.fotos` (até 2) e `hero.destaques` **[novo]** (saiu `hero.fotosBanner`); `categorias` com filtro "colecao" e o círculo "videos" sem foto **[mudou]**; `estilos` **[novo]** (no lugar de `mosaico`); `paineis` **[novo]** (no lugar de `banners`); `colecao` **[novo]**; `novidades` **[novo]** (no lugar de `atendimento`); saiu `instagram.fotos`; `ambientes` só com os usados ("parede" e "pilha"). Todos validados em `validarVitrine` (`build.js`).

## 12. Do's and Don'ts

- Faça: verde só no WhatsApp; botão preto para as ações neutras; rótulos verdadeiros; nada sobre as fotos além de selo, coração e véu sob texto.
- Faça: confira que cada foto de peça tem rosto inteiro no recorte (3:4 com 50% 20%; nos círculos, `rosto` e `zoom`).
- Não faça: estrela, avaliação, desconto, frete ou prazo que não estejam no config; campo de e-mail; coração sem função; segundo acento de cor; `#000` ou `#fff` puros; sombra fora dos três cartões e da barra fixa.

---

## 13. Vitrine x Referência

| Tema | Vitrine (rodada 3) | Referência (esta direção) |
|---|---|---|
| Cabeçalho | grafite, busca larga no meio, linha de categorias embaixo | claro, wordmark com "MODA FEMININA", navegação no meio, lupa, favoritos, Instagram e WhatsApp |
| Primeira dobra | banner em carrossel de 3 slides com texto por slide | topo dividido: texto fixo e 3 destaques à esquerda, fotos que revezam à direita com 01, 02, 03 |
| Categorias | círculos soltos | círculos num cartão branco que sobe sobre o topo; o último preto |
| Seção de categorias | mosaico de 3 | "Compre por categoria": 4 cards com véu |
| Promoções | slides 2 e 3 do banner | dois painéis bege lado a lado |
| Vitrines | "Novidades" (carrossel) + "Coleção" (grade), as mesmas 9 peças | uma "Coleção" só, com busca e filtros |
| Card | botão "Ver peça", sem coração | coração funcional, sem botão, foto sobre bege claro |
| Benefícios | logo abaixo do banner | 3 destaques no topo + faixa de 4 em painel bege mais abaixo |
| Atendimento | banner com imagem de ambiente | "Receba as novidades" pelo WhatsApp |
| Instagram | seção com 6 fotos | saiu (link no topo, no bloco de novidades, no Sobre e no rodapé) |
| Rodapé | grafite com assinatura gigante | preto, marca com ícones sociais, 4 colunas, sem assinatura |
| Títulos | Bricolage Grotesque e títulos de vitrine em caixa alta | DM Serif Display 400 com rótulos pequenos em caixa alta |
| Cores | linho `#f2f0ed` e grafite `#232120` | creme `#f6f4f0`, bege `#efebe5`, branco `#fdfdfc`, tinta `#151413` |
| Cantos | 2px e 0 | 4px, 10px no cartão branco, 50% nos círculos |
| Sombra | só barra fixa e menu | também o cartão das categorias, o da tabela e o painel de favoritos |
| Espaço entre seções | 64 / 96px | 48 / 64px |
| Favoritos | não havia | coração, contador, painel e envio pelo WhatsApp |

## 14. Referência x site (o que ficou igual e o que foi adaptado)

Igual: a ordem das partes (topo dividido, cartão de categorias sobreposto, cards de categoria, dois painéis, vitrine com coração, faixa de benefícios, bloco de cadastro, rodapé preto de 4 colunas), a paleta creme, bege, branco e preto, a serifa de alto contraste com rótulos em caixa alta, o botão preto com seta, o play num círculo, a numeração vertical 01, 02, 03, o círculo preto no fim das categorias e os cantos pequenos.

Adaptado de propósito: barra de topo preta acima do cabeçalho (já existia e dá os avisos verdadeiros); cabeçalho fora da foto (no celular a foto atrás do menu esconderia o rosto); verde do WhatsApp no cabeçalho e nos botões de contato (a referência não tem acento); fotos de estúdio da loja no lugar de recortes de produto em fundo bege; vitrine em 3 colunas com 9 peças (a referência mostra 6 pequenas); "Receba as novidades" pelo WhatsApp no lugar do e-mail; benefícios, painéis e textos só com o que é verdade; coração que funciona; vídeos (a referência não tem) mantidos porque são o diferencial da loja.

## 15. Decisões herdadas

Continuam valendo: primeiro toque na barra fixa sem tamanho leva aos chips; tabela de medidas na própria peça (`#medidas-peca`); `mensagemProdutoSemPreco`; faixa de vídeos espera o gesto no celular; segunda foto do card só com hover; srcset 640/828/original; vídeo sem pôster no HTML; `#video` e "Ver o vídeo"; migalhas em uma linha; `size-adjust` nos fallbacks; /trocas/ com "Falar sobre uma troca" só no fim; `corHex` medido nas fotos; busca sem acento por nome, cor e categoria. Continuam fora, por decisão: auto-hospedar fontes, prévias de vídeo com ffmpeg e mapeamento de utm.
