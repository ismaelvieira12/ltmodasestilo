// ============================================================
//  CONFIGURAÇÃO DA MARCA E DA CAMPANHA
//  Este é o arquivo principal para colocar os seus dados.
//  Depois de editar, rode "npm run build" para gerar o site em dist/.
//  As peças ficam em dados/produtos.js e os textos em dados/conteudo.js.
//  Itens marcados com PREENCHA ou CONFIRA precisam dos seus dados reais
//  antes de publicar.
// ============================================================

module.exports = {

  // Nome da marca (aparece no topo, no rodapé, na aba do navegador e nos links compartilhados)
  marca: "ltmodasestilo",

  // Linha pequena embaixo do nome da marca, no topo e no rodapé (aparece em letras maiúsculas).
  // Deixe "" para não mostrar.
  subtituloMarca: "Moda feminina",

  // Frase curta opcional (rodapé e descrição ao compartilhar). Deixe "" para não usar.
  slogan: "",

  // Endereço do site publicado, SEM barra no final. Ex: "https://ltmodasestilo.com.br"
  // Usado nos links compartilhados, no sitemap e nos dados para o Google.
  // CONFIRA depois de publicar: troque pelo endereço que a Vercel ou o seu domínio mostrar.
  // No GitHub Pages não precisa mexer: a publicação usa sozinha o endereço do Pages
  // (https://ismaelvieira12.github.io/ltmodasestilo), com a subpasta.
  dominio: "https://ltmodasestilo.vercel.app",

  // WhatsApp que recebe os pedidos: (85) 99818-4090.
  // Formato: só números, com 55 + DDD + número.
  whatsapp: "5585998184090",

  // Usuário do Instagram, sem o @
  instagram: "ltmodasestilo",

  // Dados opcionais do rodapé. Deixe "" para não mostrar.
  email: "",
  cnpj: "",
  cidade: "",

  // ID do Pixel da Meta (Gerenciador de Eventos). Deixe "" até criar o pixel.
  // Com o ID preenchido, o site registra PageView, ViewContent (página da peça)
  // e Contact (clique em qualquer botão de WhatsApp).
  pixelId: "",

  // Barra de aviso no topo de todas as páginas. Deixe "" para esconder.
  // Use só condições que a loja realmente oferece. Ex: "Frete grátis acima de R$ 199"
  aviso: "",

  // Condições de pagamento mostradas junto do preço.
  //   pixDesconto: porcentagem de desconto no PIX (0 = não mostra desconto)
  //   parcelas: número máximo de parcelas no cartão (1 = não mostra parcelas)
  //   semJuros: true se as parcelas são sem juros
  // CONFIRA: deixei tudo desligado até você informar as condições reais.
  pagamento: { pixDesconto: 0, parcelas: 1, semJuros: false },

  // Frete.
  //   gratisAcima: valor em reais a partir do qual o frete é grátis (null = não mostra)
  //   prazoTexto: prazo de postagem mostrado na página da peça ("" = não mostra)
  //               Ex: "Postamos em até 2 dias úteis"
  frete: { gratisAcima: null, prazoTexto: "" },

  // Mensagem enviada pelos botões gerais de WhatsApp (topo e rodapé)
  mensagemGeral: "Olá! Vim pelo site e quero fazer um pedido.",

  // Mensagem enviada pelo botão da página de cada peça.
  //   {produto} vira o nome da peça
  //   {cor}     vira ", cor Azul royal" (fica vazio se a peça não tiver cor)
  //   {tamanho} vira ", tamanho M" quando a pessoa escolhe um tamanho
  //             e ", tamanho a confirmar" quando ainda não escolheu
  //   {preco}   vira " (R$ 159,90)" (fica vazio enquanto a peça estiver sem preço)
  // O endereço da página da peça é acrescentado no fim da mensagem automaticamente.
  mensagemProduto: "Olá! Tenho interesse na peça {produto}{cor}{tamanho}{preco}. Ainda tem disponível?",

  // Mensagem do botão da peça enquanto ela estiver SEM preço (preco: null em produtos.js).
  // Usa os mesmos marcadores {produto}, {cor} e {tamanho}; o endereço da peça vai no fim.
  // Assim que a peça ganhar preço, o site volta a usar a mensagemProduto acima.
  // Apague a linha para usar este mesmo texto, que é o padrão do site.
  mensagemProdutoSemPreco: "Olá! Quero saber o valor da peça {produto}{cor}{tamanho}. Ainda tem disponível?",

  // Mensagem do link "Pedir ajuda com o tamanho", no guia de medidas da home.
  // A pessoa completa as medidas antes de enviar.
  // Apague a linha para usar este mesmo texto, que é o padrão do site.
  mensagemMedidas: "Olá! Quero ajuda para escolher o tamanho. Minhas medidas são: busto , cintura , quadril .",

  // Mensagem do botão "Falar sobre uma troca", no fim da página de trocas (/trocas/).
  // A pessoa completa com o número do pedido antes de enviar.
  // Apague a linha para usar este mesmo texto, que é o padrão do site.
  mensagemTrocas: "Olá! Preciso de ajuda com uma troca ou devolução. Número do pedido: ",

  // Mensagem do botão "Quero receber novidades" (bloco "Receba as novidades" da home e rodapé).
  // Apague a linha para usar este mesmo texto, que é o padrão do site.
  mensagemNovidades: "Olá! Quero receber as novidades da ltmodasestilo.",

  // Mensagem do botão "Enviar favoritas no WhatsApp", no painel de favoritos (coração).
  //   {pecas} vira a lista das peças salvas, uma por linha: "- Nome (cor): endereço"
  //   \n quebra a linha na mensagem.
  // Apague a linha para usar este mesmo texto, que é o padrão do site.
  mensagemFavoritas: "Olá! Gostei destas peças:\n{pecas}\nPodem me ajudar?",

  // Identidade visual. Tudo que ficar "" usa o padrão do site.
  //   logo: caminho do arquivo dentro da pasta img/. Ex: "img/logo.svg" ou "img/logo.png".
  //         Vazio: o nome da marca aparece em texto.
  //   favicon: ícone da aba do navegador. Ex: "img/favicon.png". Vazio: gerado com a inicial da marca.
  //   corAcento: cor dos botões de WhatsApp, em hexadecimal. Ex: "#1f704c"
  //              Se a cor não tiver contraste com o texto do botão, o build escurece e avisa.
  //   corFundo: cor de fundo das páginas. Ex: "#f7f7f5"
  //   corTinta: cor dos textos. Ex: "#1a1a1a"
  //   fonteTitulo / fonteTexto: nome da família no Google Fonts. Ex: "Outfit", "Inter"
  // Identidade da ltmodasestilo (explicada no DESIGN.md, seção 0), a partir da referência
  // "AERIS" escolhida pela dona em 17/11/2026:
  //   fundo branco quase puro e tinta quase preta; o cinza claro das fotos e dos painéis e o
  //   branco dos cartões saem do fundo sozinhos, no build. A cor fica por conta das roupas;
  //   verde-folha só nos botões de WhatsApp, o mesmo verde da planta que aparece em todas as fotos;
  //   títulos numa sem serifa geométrica (Jost), em caixa alta nas seções, e texto numa sem
  //   serifa limpa (Instrument Sans).
  // Para voltar ao visual anterior: corFundo "#f6f4f0", corTinta "#151413" e
  // fonteTitulo "DM Serif Display".
  identidade: {
    logo: "",
    favicon: "",
    corAcento: "#1e6b43",
    corFundo: "#fbfbfa",
    corTinta: "#161616",
    fonteTitulo: "Jost",
    fonteTexto: "Instrument Sans"
  }
};
