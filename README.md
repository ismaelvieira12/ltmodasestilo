# Catálogo da marca: Instagram + WhatsApp

Este projeto gera o site de catálogo da sua marca. A pessoa chega pelo anúncio ou pelo link na bio, vê as peças, escolhe o tamanho e toca em "Pedir no WhatsApp": a conversa abre com a mensagem pronta, já com o nome da peça, o tamanho, o preço e o link.

Você não precisa saber programar. Todo o conteúdo fica em três arquivos de texto na pasta `dados/` e nas fotos da pasta `img/`. Um comando gera o site inteiro e outro publica.

## Mapa de pastas

O que você edita:

```
dados/config.js      seus dados: marca, WhatsApp, Instagram, pixel, pagamento, frete, cores
dados/produtos.js    as peças: nome, preço, cor, tamanhos, fotos, vídeo
dados/conteudo.js    os textos: topo da home, sobre a marca, depoimentos, medidas, perguntas, trocas
img/                 suas fotos e vídeos
```

Itens marcados nos arquivos com `PREENCHA` ou `CONFIRA` ainda estão com valor provisório e precisam dos seus dados antes de publicar.

O que não precisa mexer:

```
src/                 modelos das páginas
assets/              visual (css) e comportamento (js)
scripts/             programa que gera as miniaturas das fotos (npm run fotos)
img/640/, img/828/   versões menores das fotos, geradas automaticamente. Não edite
build.js             o programa que monta o site a partir dos seus dados
package.json         atalhos dos comandos
vercel.json          instruções para a hospedagem
DESIGN.md            direção visual, para quem for mexer no design
dist/                site pronto, gerado automaticamente. Não edite: é apagado e refeito a cada build
```

Regras que valem para todos os textos, porque o build confere e para se encontrar problema:

- Escreva em português do Brasil, sem emoji.
- Não use travessão nem meio-traço (os traços compridos). Use vírgula, ponto, dois-pontos ou o hífen comum (-).
- Mantenha as aspas no início e no fim de cada texto e a vírgula no fim de cada linha, como nos exemplos que já estão nos arquivos. Para aspas dentro de um texto, use as simples ('assim').
- Não invente números, prazos ou depoimentos.
- Salve os arquivos sempre em UTF-8. Um editor de texto simples resolve (o VS Code é gratuito e já salva assim).

Antes de começar, você precisa ter o Node.js instalado no computador (versão 20 ou mais nova; o projeto foi testado com a 24). Baixe em https://nodejs.org e instale com as opções padrão.

---

## Passo 1: seus dados (dados/config.js)

Abra `dados/config.js` e preencha campo a campo. Tudo que ficar `""` (vazio) usa o padrão ou não aparece.

**Marca e contato**

- `marca`: nome da marca. Aparece no topo, no rodapé, na aba do navegador e quando o link é compartilhado. Obrigatório.
- `slogan`: frase curta, opcional. Aparece no rodapé e na descrição do link compartilhado.
- `dominio`: endereço do site publicado, começando com `https://` e sem barra no final. Ex: `"https://ltmodasestilo.com.br"`. Enquanto não tiver domínio próprio, use o endereço que a Vercel der (ex: `"https://ltmodasestilo.vercel.app"`). É usado nos links compartilhados, no sitemap e nos dados para o Google. Obrigatório.
- `whatsapp`: o número que recebe os pedidos, só dígitos, no formato 55 + DDD + número. Ex: `"5511999998888"` (13 dígitos com o nono dígito, 12 sem). Sem espaço, parênteses, traço ou "+". O build recusa qualquer outro formato.
- `instagram`: seu usuário sem o @. Ex: `"ltmodasestilo"`.
- `email`, `cnpj`, `cidade`: opcionais, aparecem no rodapé. Deixe `""` para não mostrar.

**Pixel da Meta**

- `pixelId`: só números, copiado do Gerenciador de Eventos (veja o Passo 7). Deixe `""` até criar o pixel. Com o campo vazio, nenhum script da Meta é carregado no site.

**Aviso, pagamento e frete**

- `aviso`: barra de aviso no topo de todas as páginas. Ex: `"10% de desconto no PIX · Frete grátis acima de R$ 199"`. Deixe `""` para esconder a barra.
- `pagamento`: condições mostradas junto do preço.
  - `pixDesconto`: porcentagem de desconto no PIX, de 0 a 99. Use `0` se não tiver desconto (a linha do PIX some).
  - `parcelas`: número máximo de parcelas no cartão (inteiro, no mínimo 1). Com `1`, a linha de parcelas some.
  - `semJuros`: `true` se as parcelas são sem juros, `false` se não.
- `frete`:
  - `gratisAcima`: valor em reais a partir do qual o frete é grátis. Use `null` se não tiver frete grátis.
  - `prazoTexto`: prazo de postagem mostrado na página da peça. Ex: `"Postamos em até 2 dias úteis"`. Use `""` para não mostrar.

Hoje o aviso, o desconto no PIX, as parcelas e o frete grátis estão desligados, porque são condições comerciais que só você pode definir. Ligue os que a loja realmente oferece. Confira se o que está em `aviso` combina com `pagamento` e `frete`: o aviso é texto livre, o site não faz essa conta por você.

**Mensagens do WhatsApp**

- `mensagemGeral`: mensagem dos botões gerais (topo, rodapé, home e página de trocas). Obrigatória. Na página de uma peça, até os botões do topo e do rodapé levam a mensagem da peça.
- `mensagemProduto`: mensagem do botão da página de cada peça. Obrigatória e precisa conter `{produto}`. Os códigos entre chaves são trocados na hora:
  - `{produto}` vira o nome da peça.
  - `{cor}` vira ", cor Azul royal" (fica vazio se a peça não tiver `cor`).
  - `{tamanho}` vira ", tamanho M" quando a pessoa escolheu um tamanho, ou ", tamanho a confirmar" quando não escolheu.
  - `{preco}` vira " (R$ 159,90)", com o espaço e os parênteses. Fica vazio enquanto a peça estiver sem preço.
  - `{link}` vira o endereço da página da peça. Se você não usar `{link}`, o endereço entra sozinho na última linha da mensagem.
- `mensagemProdutoSemPreco`: mensagem do botão da peça enquanto ela estiver sem preço. Mesmos códigos de `mensagemProduto`, menos `{preco}`. Hoje: "Olá! Quero saber o valor da peça {produto}{cor}{tamanho}. Ainda tem disponível?". Quando a peça ganha preço, o site passa sozinho a usar `mensagemProduto`.
- `mensagemMedidas`: mensagem do link "Pedir ajuda com o tamanho", no guia de medidas. Já vem com os espaços para a cliente escrever busto, cintura e quadril.
- `mensagemTrocas`: mensagem do botão "Falar sobre uma troca", no fim da página de trocas. Os outros botões dessa página usam `mensagemGeral`, porque quem lê a política em geral ainda vai comprar.
- `mensagemNovidades`: mensagem do botão "Quero receber novidades" (bloco de novidades e rodapé).
- `mensagemFavoritas`: mensagem do botão "Enviar favoritas no WhatsApp", no painel do coração. Precisa conter `{pecas}`, que vira a lista das peças salvas, uma por linha, com cor e link. `\n` quebra a linha.

**Favoritos (o coração).** Em cada peça há um coração. A cliente salva as que gostou, abre o coração do topo e envia a lista inteira de uma vez pelo WhatsApp. As favoritas ficam guardadas só no aparelho dela (celular ou computador); o site não guarda nada e você não vê essas listas até ela enviar.
- `mensagemEsgotado`: opcional. Mensagem do botão "Avisar quando voltar", usada quando todos os tamanhos de uma peça estão esgotados (veja o Passo 2). Se não existir no arquivo, o site usa: "Olá! A peça {produto} está esgotada no site. Pode me avisar quando voltar?". Para usar, acrescente a linha `mensagemEsgotado: "seu texto com {produto}",` logo abaixo de `mensagemProduto`.

Exemplo do que chega no seu WhatsApp com a mensagem padrão, peça "Conjunto Cropped e Short com Faixa", cor Azul royal, tamanho M escolhido, preço R$ 159,90:

```
Olá! Tenho interesse na peça Conjunto Cropped e Short com Faixa, cor Azul royal, tamanho M (R$ 159,90). Ainda tem disponível?
https://ltmodasestilo.vercel.app/p/conjunto-cropped-short-faixa-azul/
```

**Outros campos opcionais do rodapé** (acrescente a linha se quiser usar): `horario: "Atendimento de segunda a sexta, das 9h às 18h",` mostra uma linha de horário; `politicaPrivacidade: "https://..."` mostra um link "Política de privacidade" apontando para uma página que você já tenha. O site não gera essa página.

**Identidade visual** (bloco `identidade`)

- `logo`: caminho do arquivo dentro de `img/`. Ex: `"img/logo.svg"` ou `"img/logo.png"`. Aparece no topo e no rodapé, com 24 a 28 px de altura. Vazio: o nome da marca aparece em texto. O arquivo precisa existir, senão o build para.
- `favicon`: ícone da aba do navegador, arquivo `.svg`, `.png` ou `.ico` em `img/`. Vazio: o build gera um ícone com a inicial da marca sobre a cor de acento.
- `corAcento`: cor dos botões de WhatsApp, em hexadecimal. Ex: `"#0e7a41"`. Vazio: verde padrão.
- `corFundo`: cor de fundo das páginas. Ex: `"#ffffff"`.
- `corTinta`: cor dos textos. Ex: `"#1a1a1a"`.
- `fonteTitulo` e `fonteTexto`: nome exato da família no Google Fonts (https://fonts.google.com). Hoje: `"Jost"` nos títulos (uma sem serifa geométrica, em caixa alta nas seções da home, como na referência AERIS) e `"Instrument Sans"` nos textos. Para voltar ao visual anterior, use `"DM Serif Display"` nos títulos, `corFundo: "#f6f4f0"` e `corTinta: "#151413"`. O site carrega a fonte direto do Google. O nome da marca no topo e no rodapé usa outra fonte, de propósito: nela o "l" de ltmodasestilo tem uma curvinha embaixo e não se confunde com "I".
- `subtituloMarca` (fora do bloco `identidade`, perto de `marca`): a linha pequena embaixo do nome da marca no topo e no rodapé. Hoje: "Moda feminina".

Sobre as cores: o build calcula o contraste. Se o texto do botão não ficar legível sobre `corAcento`, o build escurece o acento sozinho e avisa no terminal qual cor usou. As cores finais e os contrastes aparecem no terminal a cada build. O fundo precisa ser mais claro que a tinta (o site não tem tema escuro).

---

## Passo 2: as peças (dados/produtos.js)

O arquivo é uma lista de blocos `{ ... }`, um por peça, separados por vírgula. Para cadastrar uma peça nova, copie um bloco inteiro (da abertura `{` ao fechamento `},`), cole antes do `];` final e troque os valores. Para remover, apague o bloco. A ordem no arquivo é a ordem na home; peças com `destaque: true` aparecem antes das outras. A home mostra 6 peças e um botão "Ver todas as peças" para o resto.

Campos de cada peça:

- `slug`: o endereço da página da peça, que fica em `/p/slug/`. Só letras minúsculas, números e hífen, sem acento e sem espaço. Ex: `"vestido-ombro-so-drapeado-vermelho"`. Não repita entre peças. Se você apagar a linha, o build cria o slug a partir do nome (e, se dois nomes derem o mesmo slug, acrescenta "-2" e avisa). Depois de publicar, evite mudar o slug: o link antigo deixa de funcionar.
- `nome`: nome como aparece no site e na mensagem do WhatsApp. Obrigatório.
- `preco`: preço atual, número com ponto, sem R$. Ex: `159.9`. Enquanto estiver `null`, o site mostra "Preço pelo WhatsApp" no lugar do valor e o build lista essas peças no fim, como lembrete. Hoje todas as peças estão assim: preencha antes de ligar os anúncios, porque preço visível converte mais.
- `precoAntigo`: preço riscado, opcional. Apague a linha se não tiver. Precisa ser maior que `preco`, senão o build avisa. Só funciona se a peça tiver `preco`.
- `tag`: selo curto no card, opcional. Ex: `"Novo"`, `"Últimas peças"`. Use só o que for verdade: "Mais vendido", por exemplo, só se a peça realmente vende mais.
- `destaque`: `true` para aparecer primeiro na home. Opcional.
- `cor`: cor da peça, texto livre. Entra na mensagem do WhatsApp e na busca.
- `corHex`: a mesma cor em código, para a bolinha colorida ao lado do nome da cor, na página da peça e no painel de favoritos (os cards da home não mostram a cor). Ex: `"#e63357"`. As cores atuais foram medidas nas suas fotos. Numa peça nova, use um conta-gotas de cores (qualquer editor de imagem tem) sobre o tecido na foto.
- `categoria`: grupo da peça. Hoje são três: `"Conjuntos com short"`, `"Conjuntos com pantalona"` e `"Vestidos"`. Ela alimenta as abas e a busca da coleção na home, os quadros do mosaico, o rótulo acima do nome na página da peça e a vitrine "Você também pode gostar". Escreva sempre igual (mesma grafia e maiúsculas) nas peças da mesma categoria. Uma categoria nova ganha aba sozinha; para ganhar um quadro com foto no mosaico, troque um dos quadros do `mosaico` no `conteudo.js`.
- `tamanhos`: lista com pelo menos um tamanho, na ordem de exibição. Ex: `["P", "M", "G", "GG"]` ou `["36", "38", "40", "42"]`. Obrigatório.
- `esgotados`: opcional. Lista dos tamanhos que acabaram, escritos exatamente como em `tamanhos`. Ex: `esgotados: ["P", "GG"],`. Esses tamanhos aparecem riscados e não podem ser escolhidos. Se todos os tamanhos estiverem na lista, o botão da peça vira "Avisar quando voltar" e usa `mensagemEsgotado`. Quando o tamanho voltar, tire da lista e publique de novo. Para esconder a peça de vez, remova o bloco.
- `fotos`: lista de 1 a 5 fotos; a primeira é a principal, aparece no card da home e é a imagem usada quando o link da peça é compartilhado. Use `"img/nome-do-arquivo.jpeg"` apontando para a pasta `img/`. Obrigatório. Depois de colocar fotos novas, rode `npm run fotos` (veja o Passo 4).
- `video`: vídeo da peça vestida, opcional. Ex: `"img/video-foto1.mp4"`. Aparece na galeria da página da peça, logo depois da foto principal, e na faixa de vídeos da home.
- `descricao`: 2 a 3 frases sobre caimento e uso. Obrigatório.
- `detalhes`: lista curta de características, opcional. Ex: `["Tecido com elastano", "Forro no busto"]`.
- `composicao`: tecido, como está na etiqueta. Opcional.
- `cuidados`: instruções de lavagem. Opcional.
- `modelo`: referência de quem está na foto, ex: `"A modelo veste M e tem 1,70 m"`. Opcional.
- `sku`: código seu para a peça, opcional. Serve só para identificar a peça nos eventos do pixel. Sem ele, o site usa o slug. As peças atuais usam `LT01` a `LT09`; não mude depois que os anúncios estiverem rodando.
- `medidas`: opcional. Um bloco por tamanho, com números em centímetros. Ex:

```
medidas: {
  P: { busto: 84, cintura: 64, quadril: 92, comprimento: 118 },
  M: { busto: 88, cintura: 68, quadril: 96, comprimento: 119 }
}
```

  Cada tamanho usado em `medidas` precisa existir em `tamanhos`. Os nomes das medidas são livres (busto, cintura, quadril, comprimento, gancho...), mas use os mesmos em todos os tamanhos da peça. Meça a peça de verdade: medida inventada vira troca.

O que o build recusa (ele para e mostra qual peça e qual campo): peça sem `nome`, sem `tamanhos`, sem `fotos` ou sem `descricao`; `preco` que não é número ou é zero (use `null` para "Preço pelo WhatsApp"); `preco` escrito com vírgula; `precoAntigo` em peça sem `preco`; foto ou vídeo apontando para arquivo que não existe em `img/`; tamanho em `medidas` que não está em `tamanhos`; medida que não é número; qualquer travessão nos textos; lista de produtos vazia.

O que o build só avisa (continua, mas confira): peças sem preço; mais de 5 fotos; `precoAntigo` menor ou igual a `preco`; slug repetido.

---

## Passo 3: os textos (dados/conteudo.js)

Abra `dados/conteudo.js`. Cada bloco tem um comentário explicando os campos. Os blocos, na ordem em que aparecem na home:

- `barraTopo`: as frases curtas da faixa preta no alto de todas as páginas (no celular revezam, uma por vez). Use só frases verdadeiras. O `aviso` do `config.js`, quando preenchido, entra como primeira frase.
- `navegacao`: os links do cabeçalho no computador e do menu no celular (Coleção, Conjuntos, Vestidos, Vídeos, Medidas, Trocas). Em telas largas eles ficam à esquerda, com o nome da marca no centro.
- `hero`: o banner de tela cheia, o primeiro bloco da home. A foto ocupa a tela inteira, o cabeçalho fica transparente por cima dela e o texto aparece em letra escura sobre a foto.
  - `rotulo`: a linha pequena em letras maiúsculas acima do título (hoje "Conjuntos e vestidos").
  - `titulo`: frase principal, curta (no máximo duas linhas no computador, umas 30 letras).
  - `subtitulo`: frase de apoio. O build avisa se passar de 20 palavras. No celular ela não aparece, para não cobrir a foto.
  - `foto`: a foto do computador, deitada (16:9), hoje `"img/banner-pagina-web.jpg"`. Obrigatória. O texto fica à esquerda, então a metade esquerda da foto precisa ser clara e lisa (parede, céu, fundo de estúdio), com a modelo à direita. Também é a imagem usada quando alguém compartilha o link da home ou da página de trocas.
  - `fotoCelular`: a foto do celular, em pé (9:16), hoje `"img/banner-mobile.jpg"`. O texto fica em cima, então o terço de cima da foto precisa ser claro e liso, com a modelo da metade para baixo. Deixe `""` para usar a foto do computador também no celular.
  - `ctaTexto`: texto do botão preto, padrão `"Ver a coleção"`. É o único botão do banner.
- `colecao`: o título da vitrine com todas as peças (hoje "Coleção"), logo abaixo do banner. Embaixo do título ficam as abas de categoria (Todas, Conjuntos com short...), que saem sozinhas das categorias das peças. A vitrine mostra 6 peças e o botão "Ver todas as peças"; as abas e a busca sempre mostram todas.
- `mosaico`: os quatro quadros com foto logo abaixo da coleção. O 1º é o quadro alto da esquerda, o 2º e o 3º ficam lado a lado em cima, e o 4º é a faixa larga escura embaixo deles, com uma frase e um botão. Cada quadro tem `titulo`, `filtro` (o nome de uma categoria, igual ao de `produtos.js`, ou `"videos"` para levar à faixa de vídeos), `foto` e, só no 4º, `texto`. Use sempre 4 quadros, ou `[]` para esconder o mosaico.
- `beneficios`: a faixa de vantagens com ícones, entre duas linhas finas. Os itens de frete grátis, parcelas e desconto no PIX aparecem sozinhos quando você preencher `frete` e `pagamento` no `config.js`; não escreva esses itens à mão.
- `novidades`: o bloco "Receba as novidades", com foto ao lado e o botão "Quero receber novidades", que abre o WhatsApp com a mensagem de `mensagemNovidades` do `config.js`. Quem mandar essa mensagem quer ser avisado de peças novas: guarde esses contatos numa etiqueta do WhatsApp Business ou numa lista de transmissão.
- `ambientes`: as imagens de clima usadas na faixa de trocas (roupas dobradas). Elas vêm do Unsplash, um banco de fotos com licença gratuita que permite uso comercial, e são carregadas direto de lá. Nunca use imagem de ambiente para mostrar uma peça à venda, para a cliente não confundir com o seu estoque. Para trocar, copie o endereço de outra foto gratuita do Unsplash (sem o `?` e o que vem depois).
- `sobre`: a seção sobre a marca. O texto atual só diz o que é verdade sem conhecer a sua história (atendimento pelo WhatsApp, peças em foto e vídeo); veja o comentário PERSONALIZE acima dele e conte quem está por trás da ltmodasestilo, de onde vocês são, como escolhem as peças. Campos: `titulo`, `paragrafos` (lista, pelo menos um) e `foto` (hoje `"img/foto7.jpeg"`, em pé). Evite datas e números que você não possa comprovar.
- `depoimentos`: lista de `{ nome, cidade, texto, peca }`. Está vazia, então a seção não aparece. Quando tiver depoimentos reais, com autorização de quem escreveu, acrescente um bloco por depoimento (pode usar só o primeiro nome e a inicial do sobrenome). Nunca publique depoimento inventado. A seção mostra no máximo 5.
- `guiaMedidas`: como medir e a tabela de tamanhos da marca.
  - `intro`: texto de abertura.
  - `comoMedir`: lista de `{ parte, instrucao }`.
  - `tabela`: `colunas` (lista de títulos, ex: `["Tamanho", "Busto", "Cintura", "Quadril"]`) e `linhas` (uma lista por linha, com a mesma quantidade de valores que as colunas, senão o build para). A tabela atual (P, M e G) é uma referência comum de mercado: troque pelas medidas reais das suas peças.
- `faq`: lista de `{ pergunta, resposta }`. O ideal são de 6 a 8 perguntas; fora disso o build avisa. Revise cada resposta: várias falam de prazo, frete e pagamento e precisam bater com a sua operação.
- `trocas`: a política de trocas. `resumo` é o parágrafo que aparece na home; `secoes` é a política completa, que vira a página `/trocas/`, uma lista de `{ titulo, paragrafos }`. Veja o comentário REVISE acima do bloco: os prazos de 7, 30 e 90 dias seguem o Código de Defesa do Consumidor para compra à distância, mas as regras de frete, reembolso e prazo de conferência são sugestões. Revise com seu contador ou advogado antes de publicar e deixe só o que você consegue cumprir.
- `rodape`: `texto`, uma frase curta no rodapé. Pode ficar `""`.

---

## Passo 4: as fotos (pasta img/)

1. Coloque as fotos e os vídeos na pasta `img/`: fotos em `.jpg`/`.jpeg` (ou `.png`), vídeos em `.mp4`. O build copia a pasta inteira para o site (arquivos `.txt` são ignorados).
2. Nomes sem espaço, acento ou maiúscula. Pode seguir o padrão que você já usa (`foto12.jpeg`, `foto12.1.jpeg`, `video-foto12.mp4`).
3. Proporções. O site mostra todas as fotos de peça no mesmo quadro em pé, na proporção 3:4 (a das suas fotos de 1200 x 1600):
   - Fotos 3:4 aparecem inteiras.
   - Fotos mais compridas, no formato de stories (9:16, como 900 x 1600), também funcionam: o site mantém a cabeça e corta um pouco da parte de baixo. Para a foto principal da peça, prefira uma 3:4 de corpo inteiro.
   - Sobre usa foto em pé 3:4.
   - O banner (hero) usa duas fotos próprias: uma deitada para o computador (16:9, como 1672 x 941) e uma em pé para o celular (9:16, como 941 x 1672). Prefira `.jpg`: um `.png` desse tamanho passa de 1 MB e deixa a primeira tela lenta. Os PNGs originais que você mandou estão guardados em `referencias/banners-originais/`, fora do site.
4. Mantenha fundo e luz parecidos em todas as fotos de peça, como nas atuais (o mesmo estúdio): a home é uma grade e a diferença entre uma foto e outra chama mais atenção que a roupa.
5. Miniaturas: depois de colocar ou trocar fotos, rode no terminal:

```bash
npm run fotos
```

   Ele cria versões menores em `img/640/`, `img/828/` e `img/1280/` (esta só para fotos bem largas, como o banner do computador), que o site usa no celular e nas miniaturas para carregar mais rápido. Fotos já convertidas são puladas. Funciona no Windows. Se esquecer, o site continua funcionando com as fotos originais, só fica mais pesado.
6. Vídeos: em pé (9:16), curtos (até uns 20 segundos) e leves (até uns 4 MB), em `.mp4`. Os vídeos que você mandou (478 x 850, cerca de 3 MB) estão no ponto certo. Vídeo gravado direto no iPhone pode vir em formato HEVC, que não toca em vários celulares Android: se for o caso, mande pelo WhatsApp para você mesma e use o arquivo que chegar, que vem convertido. O site só carrega o vídeo quando ele aparece na tela.
7. Depois de colocar os arquivos, aponte para eles: em `produtos.js`, nos campos `fotos` e `video` de cada peça; em `conteudo.js`, em `hero.foto`, `hero.fotoCelular`, `sobre.foto` e nas fotos do `mosaico`; em `config.js`, em `identidade.logo` e `identidade.favicon` se usar.
7. Compartilhamento: quando alguém manda o link de uma peça no WhatsApp ou no Instagram, a prévia usa a primeira foto da peça. O link da home e o da página de trocas usam a foto do hero. Não existe imagem separada para isso: cuide para que a primeira foto de cada peça seja a melhor.

Se uma foto ou vídeo apontado não existir em `img/`, o build para e diz qual peça e qual arquivo.

---

## Passo 5: testar no computador

1. Abra o terminal na pasta do projeto. No Windows: abra a pasta no Explorador de Arquivos, clique com o botão direito em um espaço vazio e escolha "Abrir no Terminal".
2. Rode:

```bash
npm run dev
```

3. O comando gera o site na pasta `dist/` e deixa disponível em http://localhost:3456. Abra esse endereço no navegador. Na primeira vez ele baixa um pequeno programa que serve os arquivos, então precisa de internet.
4. Teste como cliente: abra uma peça, escolha um tamanho, toque em "Pedir no WhatsApp" e confira a mensagem que abre. Veja a home, a página de trocas e um endereço errado (ex: http://localhost:3456/qualquer-coisa) para ver a página de "não encontrado".
5. Para parar, volte ao terminal e aperte Ctrl+C. Depois de qualquer mudança nos arquivos, rode `npm run dev` de novo: o site não atualiza sozinho.

Se quiser só gerar o site, sem abrir no navegador:

```bash
npm run build
```

Quando o build reclama, ele não gera o site e mostra uma lista que começa com "Erro no build. Corrija os pontos abaixo e rode de novo:". Cada linha diz o arquivo, a peça ou o campo e o que está errado. Faça assim:

1. Leia a mensagem até o fim. Ela já diz o que corrigir (ex: "Produto 3 ("Camisa"): preco deve ser um número maior que zero, com ponto decimal").
2. Abra o arquivo citado, vá no campo citado e corrija.
3. Rode o comando de novo até aparecer "Build concluído".

Mensagens que começam com "Não foi possível carregar produtos.js" (ou config.js, conteudo.js) quase sempre são uma aspa ou vírgula faltando ou sobrando: compare a linha mudada com a de cima. Linhas que começam com "Aviso:" não param o build, mas apontam coisas que vão parecer erradas no site. Resolva todas antes de publicar.

---

## Passo 6: publicar na Vercel

A hospedagem é na Vercel, que tem plano gratuito suficiente para este site.

Antes de publicar, confira o número de `whatsapp` no `config.js`: com o número de exemplo, quem tocar nos botões manda mensagem para um desconhecido.

1. Crie uma conta em https://vercel.com (pode entrar com conta do Google ou do GitHub).
2. Na pasta do projeto, conecte o computador à sua conta (só na primeira vez):

```bash
npx vercel login
```

   Ele pergunta como entrar (escolha com as setas e Enter, por exemplo "Continue with Google") e abre o navegador. Entre na sua conta e confirme. No terminal aparece uma mensagem de sucesso.
3. Publique no endereço definitivo:

```bash
npx vercel --prod
```

   Na primeira vez ele faz algumas perguntas. Responda assim:
   - "Set up and deploy?": Enter (sim).
   - "Which scope?": escolha a sua conta e Enter.
   - "Link to existing project?": n e Enter (não).
   - "What's your project's name?": `ltmodasestilo` e Enter.
   - "In which directory is your code located?": Enter (a pasta atual).
   - "Want to modify these settings?": n e Enter. As configurações certas já estão no `vercel.json`.
4. Espere terminar (um ou dois minutos). No fim ele mostra o endereço do site, algo como `https://ltmodasestilo.vercel.app` (se o nome já existir na Vercel, vem com um final diferente). É esse o link para compartilhar. Os links de "pré-visualização" que a Vercel às vezes mostra pedem login para abrir; use sempre o endereço da publicação com `--prod`.
5. Se o endereço for diferente de `https://ltmodasestilo.vercel.app`, copie o endereço para `dominio` no `config.js` (sem barra no final) e rode `npx vercel --prod` de novo, para que os links compartilhados e o sitemap fiquem certos.
6. A cada mudança (peça nova, preço, foto, texto), rode `npm run dev` para testar e depois `npx vercel --prod` para publicar. A Vercel roda o build sozinha a cada publicação, seguindo o `vercel.json`: se o build falhar lá, a publicação não acontece e a versão anterior continua no ar. O arquivo `.vercelignore` faz a Vercel não receber as pastas `dist/` e `referencias/`, que não precisam subir.

**Outro caminho: guardar o projeto no GitHub e publicar pela Vercel a partir dele.** O repositório é `https://github.com/ismaelvieira12/ltmodasestilo`.

1. Na pasta do projeto, só na primeira vez, rode um comando de cada vez:

```bash
git init
```

```bash
git add .
```

```bash
git commit -m "Site da ltmodasestilo"
```

```bash
git branch -M main
```

```bash
git remote add origin https://github.com/ismaelvieira12/ltmodasestilo.git
```

```bash
git push -u origin main
```

   No `git push`, abre uma janela para entrar no GitHub: entre pelo navegador e autorize. Avisos do tipo "LF will be replaced by CRLF" são normais. O `.gitignore` deixa de fora `dist/`, `referencias/` (a imagem de referência, que é de outra marca) e `.claude/`.
2. Na Vercel: Add New > Project > importe o repositório `ltmodasestilo` > Deploy. As configurações já vêm do `vercel.json`. Daqui para frente, cada envio ao GitHub publica o site sozinho.
3. Para enviar mudanças depois, rode um comando de cada vez:

```bash
git add .
```

```bash
git commit -m "Descreva a mudança"
```

```bash
git push
```

**Publicar pelo GitHub Pages (grátis, direto do repositório).** O site fica em `https://ismaelvieira12.github.io/ltmodasestilo/`. O arquivo `.github/workflows/pages.yml` faz o GitHub gerar e publicar o site sozinho a cada `git push`, já com o endereço certo (a subpasta `/ltmodasestilo` é ajustada automaticamente; o `dominio` do `config.js` continua valendo para o computador e para a Vercel).

1. No GitHub, abra o repositório e vá em Settings > Pages. Em "Build and deployment", no campo "Source", troque "Deploy from a branch" por **GitHub Actions**. Só o dono do repositório (conta `ismaelvieira12`) consegue mudar isso. No plano gratuito do GitHub, o repositório precisa ser público para usar o Pages (ele já é).
   Se o endereço mostra o texto deste README em vez do catálogo, é porque o "Source" ainda está em "Deploy from a branch": nesse modo o GitHub publica os arquivos do repositório como estão, e o site pronto (pasta `dist/`) nem é enviado.
2. Envie o projeto (os 3 comandos acima: `git add .`, `git commit -m "..."`, `git push`).
3. Na aba Actions do repositório aparece "Publicar no GitHub Pages" rodando. Em um ou dois minutos fica verde e o site está no ar. Se ficar vermelho, abra e veja a mensagem; se você tinha enviado antes de ativar o Pages, clique em "Re-run all jobs".
4. A cada `git push`, o site se atualiza sozinho.

Domínio próprio (recomendado para anúncios, porque o endereço aparece no anúncio e passa mais confiança):

1. Registre um domínio. Para `.com.br`, o registro é feito em https://registro.br.
2. Na Vercel, abra o projeto, vá em Settings > Domains, adicione o domínio e siga as instruções de DNS que a tela mostra (você configura isso no painel do registro.br). Pode levar algumas horas para propagar.
3. O HTTPS é automático.
4. Troque `dominio` no `config.js` para o endereço novo (ex: `"https://ltmodasestilo.com.br"`) e publique de novo com `npx vercel --prod`.

---

## Passo 7: Pixel da Meta

O pixel é o que permite à Meta saber quem visitou o site e quem clicou no WhatsApp, para otimizar os anúncios e montar públicos. Sem ele, o tráfego pago fica às cegas.

1. Acesse o Gerenciador de Eventos: https://business.facebook.com/events_manager
2. Clique em Conectar dados, escolha Web e siga até criar o pixel (conjunto de dados). Copie o ID, que é só números.
3. Cole o ID em `pixelId` no `config.js`, entre aspas. Ex: `pixelId: "123456789012345",`.
4. Rode `npm run build` para conferir que passou e publique com `npx vercel --prod`.
5. Confira com a extensão Meta Pixel Helper no Chrome (gratuita, da própria Meta). Abra o site publicado: deve aparecer `PageView`. Abra uma peça: deve aparecer também `ViewContent`. Clique em um botão de WhatsApp: deve aparecer `Contact`. Os mesmos eventos aparecem em "Testar eventos" no Gerenciador de Eventos.

Eventos que o site já dispara, sem precisar configurar nada:

- `PageView`: em todas as páginas.
- `ViewContent`: ao abrir a página de uma peça, com nome, preço e código da peça (o `sku`, ou o slug se não houver).
- `Contact`: em qualquer clique de botão de WhatsApp. Na página da peça vai com nome, preço, código e o tamanho escolhido; nos botões gerais vai marcado como "whatsapp_geral".

Na campanha, no Gerenciador de Anúncios, escolha o objetivo de conversão no site e otimize para o evento `Contact`. É esse evento que representa a pessoa que chegou a abrir a conversa com você.

---

## Passo 8: UTM nos anúncios

Para saber qual anúncio gerou cada conversa, use o link do site com uma marcação no final. Exemplo, para um anúncio de stories do lançamento:

```
https://ltmodasestilo.com.br/?utm_source=instagram&utm_campaign=lancamento-stories
```

O que acontece:

- O site lê `utm_campaign` (ou `utm_source`, se não houver campanha) e guarda durante a visita, mesmo que a pessoa navegue por várias peças antes de clicar.
- A mensagem do WhatsApp ganha uma última linha: `(vi pelo anúncio: lancamento-stories)`.

Regras práticas:

- Use um nome diferente para cada anúncio ou conjunto que você quer comparar: `lancamento-stories`, `lancamento-feed`, `remarketing-vestidos`.
- Só letras minúsculas, números e hífen, sem espaço nem acento. O texto aparece na mensagem, então mantenha curto (acima de 80 caracteres ele é cortado).
- Para mandar o anúncio direto para uma peça, use o endereço dela com a mesma marcação: `https://ltmodasestilo.com.br/p/vestido-ombro-so-drapeado-vermelho/?utm_campaign=vestido-stories`.
- Se o anúncio for o vídeo da peça, acrescente `#video` no fim do endereço: a página já abre no vídeo, continuando o que a pessoa estava vendo no Instagram. Ex: `https://ltmodasestilo.com.br/p/vestido-ombro-so-drapeado-vermelho/?utm_campaign=vestido-reels#video` (o `#video` sempre vai por último).
- Anote em uma planilha o que cada nome significa. Depois, basta ler as conversas para contar quantas vieram de cada anúncio.

---

## Passo 9: atendimento

A venda fecha no WhatsApp, então a página só faz metade do trabalho.

1. Use o WhatsApp Business (gratuito) no número de `config.whatsapp`. Nele você configura:
   - Mensagem de saudação automática para quem chama fora do horário.
   - Respostas rápidas para as perguntas que mais chegam: forma de pagamento, frete e prazo, troca, como medir. Aproveite os textos do FAQ e da página de trocas, que já estão escritos.
   - Etiquetas para organizar as conversas: novo pedido, aguardando pagamento, pago, enviado, troca.
2. A mensagem que chega já diz a peça, o tamanho (ou "tamanho a confirmar"), o preço, o link e de qual anúncio a pessoa veio. Responda confirmando estoque e mandando a chave PIX ou o link de pagamento.
3. Coloque o link do site na bio do Instagram. Se quiser medir a bio separado dos anúncios, use uma marcação própria: `https://ltmodasestilo.com.br/?utm_source=bio`.
4. Responda rápido. Quem clica em anúncio compara com outras lojas e esfria em poucos minutos.

---

## Checklist final antes de ligar os anúncios

- [ ] `config.js` com `whatsapp` (hoje (85) 99818-4090), `instagram` (hoje ltmodasestilo) e `dominio` conferidos, e nenhum `PREENCHA` ou `CONFIRA` sobrando.
- [ ] `aviso`, `pagamento` e `frete` ligados só com as condições que a loja pratica.
- [ ] Todas as peças com `preco` preenchido (nenhuma em "Preço pelo WhatsApp", a não ser que seja de propósito) e `tamanhos` conferidos.
- [ ] Peças sem estoque marcadas em `esgotados` ou removidas.
- [ ] `npm run fotos` rodado depois da última foto nova.
- [ ] Depoimentos só reais e autorizados, ou lista vazia. Nenhum depoimento inventado no ar.
- [ ] Texto do Sobre escrito por você; FAQ, guia de medidas e política de trocas revisados e condizentes com a sua operação.
- [ ] `npm run build` termina com "Build concluído" e sem linhas "Aviso:".
- [ ] Site publicado com `npx vercel --prod`, abrindo em HTTPS, no domínio que vai nos anúncios.
- [ ] Teste no seu próprio celular, pelo navegador interno do Instagram (mande o link para você mesma por mensagem direta e toque nele): a página abre rápido, o tamanho escolhido entra na mensagem, o WhatsApp abre com o texto certo.
- [ ] Pixel colado em `pixelId`, publicado e verificado com o Meta Pixel Helper (`PageView`, `ViewContent`, `Contact`).
- [ ] Campanha otimizada para o evento `Contact`.
- [ ] Links dos anúncios com `utm_campaign`, um nome por anúncio, anotados na planilha.
- [ ] Link na bio do Instagram atualizado.
- [ ] WhatsApp Business com saudação, respostas rápidas e etiquetas prontas.
