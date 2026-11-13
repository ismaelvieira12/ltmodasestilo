// ============================================================
//  TEXTOS DO SITE
//  Tudo que é texto fixo da home, da página de trocas e do rodapé
//  está aqui. Edite à vontade e rode "npm run build" para atualizar.
//  Mantenha aspas no início e no fim de cada texto. Para usar aspas
//  dentro de um texto, prefira as simples ('assim').
//
//  Blocos, na ordem em que aparecem na home:
//    barraTopo    - frases curtas da faixa preta fina no alto de todas as páginas
//    navegacao    - links do meio do topo (computador) e do menu (celular)
//    hero         - topo da home: título, frase, botão, 3 fotos que revezam e 3 destaques
//    categorias   - atalhos redondos (círculos) no cartão branco logo abaixo do topo
//    estilos      - "Compre por categoria": quatro fotos altas com o nome da categoria
//    paineis      - dois painéis bege lado a lado (conjuntos e vídeos)
//    colecao      - títulos da vitrine com todas as peças
//    beneficios   - faixa de vantagens em painel bege
//    novidades    - bloco "Receba as novidades" (botão de WhatsApp)
//    ambientes    - imagens de ambiente (Unsplash) usadas nos painéis e nas trocas
//    sobre        - seção sobre a marca
//    depoimentos  - o que clientes disseram ([] esconde a seção)
//    guiaMedidas  - como medir e tabela de tamanhos
//    faq          - perguntas frequentes
//    trocas       - resumo para a home e política completa (página /trocas/)
//    rodape       - frase do rodapé
// ============================================================

module.exports = {
  // Frases da faixa fina no alto de todas as páginas. No celular aparece
  // uma por vez, revezando; no computador ficam lado a lado.
  // Use só frases verdadeiras e curtas (até 5 palavras).
  // O "aviso" do config.js, quando preenchido, entra como primeira frase.
  barraTopo: [
    "Atendimento direto pelo WhatsApp",
    "Veja cada peça em vídeo",
    "Ajuda para escolher o tamanho"
  ],

  // Links do meio do topo (no computador) e do menu (no celular), na ordem.
  //   texto - o que aparece
  //   link  - para onde leva. Exemplos:
  //           "#colecao" (vitrine de peças), "#videos" (vídeos), "medidas" (guia de medidas;
  //           na página de uma peça, abre a tabela da própria peça), "/trocas/",
  //           "/?busca=conjunto#colecao" (mostra as peças com a palavra "conjunto"),
  //           "/?categoria=vestidos#colecao" (mostra só a categoria Vestidos)
  navegacao: [
    { texto: "Coleção", link: "#colecao" },
    { texto: "Conjuntos", link: "/?busca=conjunto#colecao" },
    { texto: "Vestidos", link: "/?categoria=vestidos#colecao" },
    { texto: "Vídeos", link: "#videos" },
    { texto: "Medidas", link: "medidas" },
    { texto: "Trocas", link: "/trocas/" }
  ],

  // Topo da home.
  //   rotulo    - palavra pequena acima do título (só o que for verdade; nada de "coleção nova")
  //   foto      - primeira foto (é a imagem que carrega primeiro e aparece ao compartilhar o site)
  //   fotos     - as outras fotos que revezam ao lado do texto (até 2). Cada foto leva à peça
  //               em que ela aparece.
  //   destaques - três frases curtas com ícone, embaixo do botão (título até 20 letras,
  //               apoio até 20 letras, para caberem numa linha no computador).
  //               icone: "whatsapp", "video", "regua" ou "troca"
  hero: {
    rotulo: "Conjuntos e vestidos",
    titulo: "Moda feminina em cores vivas",
    subtitulo: "Veja cada peça em vídeo, escolha o tamanho e fale com a gente no WhatsApp.",
    foto: "img/foto6.jpeg",
    fotos: ["img/foto1.2.jpeg", "img/foto4.jpeg"],
    ctaTexto: "Ver a coleção",
    destaques: [
      { icone: "whatsapp", titulo: "Atendimento", texto: "Direto pelo WhatsApp" },
      { icone: "video", titulo: "Vídeo de cada peça", texto: "Veja o caimento" },
      { icone: "regua", titulo: "Ajuda com o tamanho", texto: "Mande suas medidas" }
    ]
  },

  // Atalhos redondos no cartão branco abaixo do topo. Cada um tem:
  //   nome   - texto embaixo do círculo
  //   filtro - nome da categoria das peças (igual ao de produtos.js),
  //            ou "colecao" (todas as peças) ou "videos" (faixa de vídeos;
  //            este aparece como um círculo preto com a palavra VÍDEOS, sem foto)
  //   foto   - foto de peça da pasta img/
  //   rosto  - onde está o rosto na foto, em %: [da esquerda, de cima]
  //   zoom   - quanto aproximar (1 = foto inteira; 2.6 mostra rosto e tronco)
  categorias: [
    { nome: "Coleção", filtro: "colecao", foto: "img/foto7.1.jpeg", rosto: [43, 15], zoom: 2.6 },
    { nome: "Conjuntos com short", filtro: "Conjuntos com short", foto: "img/foto6.1.jpeg", rosto: [50, 18], zoom: 2.8 },
    { nome: "Conjuntos com pantalona", filtro: "Conjuntos com pantalona", foto: "img/foto9.jpeg", rosto: [44, 15], zoom: 2.6 },
    { nome: "Vestidos", filtro: "Vestidos", foto: "img/foto4.jpeg", rosto: [44, 19], zoom: 2.6 },
    { nome: "Vídeos", filtro: "videos" }
  ],

  // "Compre por categoria": quatro fotos altas com o nome por cima. O clique filtra a coleção.
  //   filtro: nome da categoria das peças (igual ao de produtos.js), ou "videos" (faixa de vídeos)
  estilos: {
    rotulo: "Compre por categoria",
    titulo: "Encontre seu estilo",
    cards: [
      { titulo: "Conjuntos com short", filtro: "Conjuntos com short", foto: "img/foto1.jpeg" },
      { titulo: "Conjuntos com pantalona", filtro: "Conjuntos com pantalona", foto: "img/foto2.jpeg" },
      { titulo: "Vestidos", filtro: "Vestidos", foto: "img/foto4.1.jpeg" },
      { titulo: "Peças em vídeo", filtro: "videos", foto: "img/foto8.jpeg" }
    ]
  },

  // Dois painéis bege lado a lado (um embaixo do outro no celular). Cada painel tem:
  //   rotulo, titulo - palavra pequena e título (2 linhas no máximo)
  //   botao, link    - texto do botão e para onde ele leva (mesmos exemplos da navegacao)
  //   foto           - foto de peça da pasta img/
  //   ambiente       - OU, no lugar da foto, o nome de uma imagem do bloco "ambientes".
  //                    Nunca coloque preço nem nome de peça sobre imagem de ambiente.
  paineis: [
    {
      rotulo: "Conjuntos",
      titulo: "Cores vivas para usar agora",
      botao: "Ver conjuntos",
      link: "/?busca=conjunto#colecao",
      foto: "img/foto1.1.jpeg"
    },
    {
      rotulo: "Veja no corpo",
      titulo: "Cada peça em vídeo",
      botao: "Ver vídeos",
      link: "#videos",
      ambiente: "parede"
    }
  ],

  // Títulos da vitrine com todas as peças (busca e filtros ficam nela).
  colecao: {
    rotulo: "Coleção",
    titulo: "Escolha a sua peça"
  },

  // Faixa de vantagens em painel bege. Só o que a loja cumpre sempre.
  //   icone: "whatsapp", "video", "regua" ou "troca"
  //   link:  "medidas" (abre o WhatsApp com a mensagem de medidas do
  //          config.js), um endereço do site como "/trocas/" ou "#videos",
  //          ou "" para não ter link.
  // Frete grátis, parcelas sem juros e desconto no PIX entram sozinhos
  // quando forem preenchidos no config.js.
  beneficios: [
    { icone: "whatsapp", titulo: "Compra pelo WhatsApp", texto: "Escolha aqui e finalize com a gente", link: "" },
    { icone: "video", titulo: "Vídeo de cada peça", texto: "Veja o caimento no corpo", link: "#videos" },
    { icone: "regua", titulo: "Ajuda com o tamanho", texto: "Mande suas medidas", link: "medidas" },
    { icone: "troca", titulo: "Trocas pelo WhatsApp", texto: "Veja como funciona", link: "/trocas/" }
  ],

  // Bloco "Receba as novidades": foto à esquerda e texto com o botão "Quero receber
  // novidades", que abre o WhatsApp com a mensagemNovidades do config.js.
  // Prometa só o que a loja vai fazer de verdade.
  novidades: {
    rotulo: "Pelo WhatsApp",
    titulo: "Receba as novidades",
    texto: "Mande um oi e a gente avisa quando chegarem peças novas.",
    foto: "img/foto10.jpeg"
  },

  // Imagens de ambiente do Unsplash (licença gratuita, uso comercial permitido).
  // Servem só de clima: nunca para mostrar uma peça à venda.
  //   url - endereço da foto no Unsplash, sem o "?" e o que vem depois
  //   alt - descrição da imagem para quem usa leitor de tela
  // O site pede o tamanho certo de cada uso sozinho.
  ambientes: {
    parede: {
      url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d",
      alt: "Blusas claras em cabides de madeira penduradas num galho, em parede branca"
    },
    pilha: {
      url: "https://images.unsplash.com/photo-1630329273801-8f629dba0a72",
      alt: "Pilha de roupas coloridas dobradas, apoiada numa mão"
    }
  },

  // PERSONALIZE: conte a história real da ltmodasestilo (quem está por trás,
  // de onde vocês são, como escolhem as peças). Evite datas e números que
  // não possa comprovar.
  sobre: {
    titulo: "Sobre a ltmodasestilo",
    paragrafos: [
      "A ltmodasestilo é moda feminina com atendimento direto pelo WhatsApp. Cada peça aparece aqui em foto e em vídeo, vestida, para você ver o caimento e o movimento antes de pedir.",
      "Ficou em dúvida sobre tamanho, cor ou como combinar? Chame a gente no WhatsApp que ajudamos você a escolher."
    ],
    foto: "img/foto7.jpeg",
    // Imagem de ambiente ao lado do texto (nome do bloco "ambientes" acima, ou "")
    ambiente: ""
  },

  // Depoimentos de clientes reais, com autorização. Enquanto a lista estiver
  // vazia, a seção não aparece no site. Formato de cada item:
  //   { nome: "Ana P.", cidade: "Fortaleza, CE", texto: "Até 3 linhas.", peca: "Nome da peça" }
  depoimentos: [],

  // CONFIRA: a tabela abaixo é uma referência comum de mercado.
  // Ajuste para as medidas reais das suas peças.
  guiaMedidas: {
    intro: "Meça o corpo com uma fita métrica, sem apertar e sem folga, e compare com a tabela. Ficou entre dois tamanhos? Mande suas medidas no WhatsApp que a gente ajuda a escolher.",
    comoMedir: [
      {
        parte: "Busto",
        instrucao: "Passe a fita na parte mais cheia do busto, por cima de um sutiã sem bojo, mantendo a fita reta nas costas."
      },
      {
        parte: "Cintura",
        instrucao: "Meça na parte mais fina do tronco, em geral um pouco acima do umbigo, com a barriga relaxada."
      },
      {
        parte: "Quadril",
        instrucao: "Passe a fita na parte mais larga do quadril e do bumbum, com os pés juntos."
      }
    ],
    tabela: {
      colunas: ["Tamanho", "Busto", "Cintura", "Quadril"],
      linhas: [
        ["P", "82-86", "62-66", "90-94"],
        ["M", "86-90", "66-70", "94-98"],
        ["G", "90-96", "70-76", "98-104"]
      ]
    }
  },

  faq: [
    {
      pergunta: "Como faço para comprar?",
      resposta: "Escolha a peça e o tamanho aqui no site e toque em Pedir no WhatsApp. A mensagem já vai com o nome da peça, a cor e o tamanho escolhido. A gente confirma se tem em estoque e combina o pagamento e o envio por ali mesmo."
    },
    {
      pergunta: "Quais são as formas de pagamento?",
      // CONFIRA: ajuste para as formas de pagamento que a loja aceita.
      resposta: "A forma de pagamento é combinada pelo WhatsApp, na hora de fechar o pedido. Depois de confirmar, enviamos os dados para pagamento por lá mesmo."
    },
    {
      pergunta: "Qual o prazo de entrega e quanto custa o frete?",
      resposta: "O frete é calculado pelo seu CEP na hora do pedido, e você sabe o valor antes de pagar. O prazo de entrega depende da sua região e do serviço escolhido."
    },
    {
      pergunta: "Como escolho o tamanho certo?",
      resposta: "Use o guia de medidas desta página e compare com as suas medidas. Os vídeos de cada peça ajudam a ver o caimento no corpo. Se ficar entre dois tamanhos, mande suas medidas no WhatsApp que a gente indica o melhor."
    },
    {
      pergunta: "E se o tamanho não servir?",
      resposta: "Trocamos por outro tamanho em até 30 dias depois de receber, como cortesia da loja, desde que a peça esteja sem uso, sem lavar e com a etiqueta. É só chamar no WhatsApp com o número do pedido. Os detalhes estão na política de trocas."
    },
    {
      pergunta: "A peça chegou com defeito. O que eu faço?",
      resposta: "Mande uma foto do defeito pelo WhatsApp, com o número do pedido. Se for defeito de fabricação, trocamos a peça ou devolvemos o valor, com o envio por nossa conta. O prazo para reclamar é de 90 dias a partir do recebimento."
    },
    {
      pergunta: "Como acompanho o meu pedido?",
      resposta: "Assim que postamos, enviamos o código de rastreio pelo WhatsApp. Com ele você acompanha a entrega no site dos Correios ou da transportadora. Se o prazo passar e a peça não chegar, fale com a gente que resolvemos."
    }
  ],

  // REVISE com seu contador ou advogado antes de publicar.
  // Os prazos de 7 dias (desistência, art. 49) e 90 dias (defeito, art. 26)
  // vêm do Código de Defesa do Consumidor. A troca por tamanho ou modelo em
  // 30 dias é cortesia da loja, assim como os prazos de conferência e de
  // reembolso e as regras de frete: ajuste conforme a sua operação.
  trocas: {
    // Imagem de ambiente da faixa de trocas na home (nome do bloco "ambientes", ou "")
    ambiente: "pilha",
    resumo: "Você tem 7 dias corridos depois de receber para desistir da compra, sem precisar explicar o motivo. Troca por outro tamanho é cortesia nossa e pode ser feita em até 30 dias, com a peça sem uso e com etiqueta. Peça com defeito de fabricação pode ser trocada ou reembolsada em até 90 dias. Tudo é resolvido pelo WhatsApp, com o número do pedido.",
    secoes: [
      {
        titulo: "Desistência da compra: 7 dias",
        paragrafos: [
          "Comprou e mudou de ideia? Pelo Código de Defesa do Consumidor, você pode desistir de uma compra feita à distância em até 7 dias corridos a partir do recebimento, sem precisar dizer o motivo.",
          "A peça precisa voltar como chegou: sem sinais de uso, sem lavar e sem alteração. Devolvemos o valor pago, incluindo o frete de envio, e o custo da devolução é por nossa conta."
        ]
      },
      {
        titulo: "Troca por tamanho ou modelo: 30 dias",
        paragrafos: [
          "A lei não obriga a troca de peça sem defeito. Mesmo assim, se a peça não serviu, trocamos por outro tamanho ou por outra peça em até 30 dias corridos a partir do recebimento, como cortesia da loja.",
          "A peça precisa estar sem uso, sem lavar, sem cheiro de perfume e com a etiqueta. Peças compradas em promoção seguem a mesma regra.",
          "Se a nova peça tiver valor maior, você paga a diferença. Se tiver valor menor, devolvemos a diferença ou deixamos como crédito para a próxima compra, como você preferir."
        ]
      },
      {
        titulo: "Peça com defeito: 90 dias",
        paragrafos: [
          "Se a peça chegar com defeito de fabricação, como costura aberta, botão faltando ou mancha de fábrica, você tem 90 dias a partir do recebimento para reclamar. Se o defeito só aparecer depois, como uma costura que abre na primeira lavagem feita conforme a etiqueta, o prazo conta a partir do dia em que você perceber.",
          "Mande fotos pelo WhatsApp. Confirmado o defeito, você escolhe entre receber uma peça igual, trocar por outra peça ou receber o valor de volta. O envio de ida e volta é por nossa conta.",
          "Danos causados pelo uso, por lavagem fora das instruções da etiqueta ou pelo desgaste natural não são considerados defeito."
        ]
      },
      {
        titulo: "Como solicitar",
        paragrafos: [
          "Chame no WhatsApp informando o número do pedido, a peça e o motivo: desistência, troca de tamanho ou defeito. Se for defeito, mande fotos.",
          "A gente responde com as instruções de envio e, quando o frete for por nossa conta, com o código de postagem. Embale a peça com cuidado, de preferência na embalagem original.",
          "Assim que a peça chegar aqui, conferimos em até 3 dias úteis e seguimos com a troca ou o reembolso."
        ]
      },
      {
        titulo: "Custos de envio",
        paragrafos: [
          "Desistência em 7 dias e defeito de fabricação: o frete de devolução e o do novo envio são por nossa conta.",
          "Troca por tamanho ou modelo: o frete de devolução é por sua conta e o envio da nova peça é por nossa conta na primeira troca. A partir da segunda troca do mesmo pedido, os dois fretes ficam por sua conta."
        ]
      },
      {
        titulo: "Reembolso",
        paragrafos: [
          "O reembolso é feito depois que a peça chega e é conferida. Pagamento por PIX: devolvemos na mesma chave em até 5 dias úteis. Pagamento no cartão: pedimos o estorno à operadora, e o valor aparece em até duas faturas seguintes, conforme a data de fechamento do seu cartão.",
          "Em caso de desistência, devolvemos o valor total, incluindo o frete pago."
        ]
      }
    ]
  },

  rodape: {
    texto: "Tire dúvidas de tamanho ou cor pelo WhatsApp antes de comprar."
  }
};
