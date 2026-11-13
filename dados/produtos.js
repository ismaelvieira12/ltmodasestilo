// ============================================================
//  PEÇAS DO CATÁLOGO
//  Cada bloco { ... } é uma peça. Copie um bloco para adicionar,
//  apague para remover. A ordem aqui é a ordem na home.
//
//  Campos:
//    slug        - endereço da página da peça (/p/slug/). Só letras
//                  minúsculas, números e hífen, sem acento. Não repita.
//    sku         - código fixo da peça (usado pelo Pixel da Meta).
//                  Pode mudar o nome e o slug, mas NÃO mude o sku depois
//                  que os anúncios estiverem rodando.
//    categoria   - grupo da peça nos filtros da home. Use sempre um destes,
//                  escrito igual: "Conjuntos com short",
//                  "Conjuntos com pantalona" ou "Vestidos".
//                  Para criar uma categoria nova, basta escrever outro nome:
//                  ela aparece sozinha nos filtros da coleção.
//    nome        - nome da peça como aparece no site e no WhatsApp
//    preco       - preço atual, com ponto: 159.9
//                  PREENCHA: enquanto estiver null, o site mostra
//                  "Preço pelo WhatsApp" no lugar do valor.
//    precoAntigo - preço riscado (opcional, apague a linha se não tiver)
//    tag         - selo no card (opcional): "Novo", "Últimas peças"
//    destaque    - true para aparecer primeiro na home (opcional)
//    cor         - cor da peça (entra também na mensagem do WhatsApp)
//    corHex      - a mesma cor em código, para a bolinha colorida do card.
//                  Ex: "#489bfd". Os valores atuais foram medidos nas fotos.
//                  Opcional: sem ele, o card mostra só o nome da cor.
//    tamanhos    - lista de tamanhos à venda, na ordem de exibição
//    esgotados   - tamanhos sem estoque, ex: ["G"] (opcional)
//    fotos       - de 1 a 5 fotos da pasta img/; a primeira é a principal.
//                  Fotos em pé (3:4, ex: 1200x1600). Depois de adicionar
//                  fotos novas, rode "npm run fotos" para gerar as miniaturas.
//    video       - vídeo da peça na pasta img/ (opcional, .mp4 em pé)
//    descricao   - 2 a 3 frases sobre modelagem e uso
//    detalhes    - lista curta de características
//    composicao  - tecido, como está na etiqueta (opcional)
//    cuidados    - instruções de lavagem (opcional)
//    modelo      - referência de quem está na foto (opcional),
//                  ex: "A modelo veste M e tem 1,65 m"
//    medidas     - medidas por tamanho, em cm (opcional)
// ============================================================

module.exports = [
  {
    slug: "conjunto-cropped-short-faixa-azul",
    sku: "LT01",
    categoria: "Conjuntos com short",
    nome: "Conjunto Cropped e Short com Faixa",
    preco: null, // PREENCHA
    cor: "Azul royal",
    corHex: "#489bfd", // cor medida na foto (bolinha no card)
    tamanhos: ["P", "M", "G"], // CONFIRA os tamanhos disponíveis
    fotos: ["img/foto1.jpeg", "img/foto1.2.jpeg", "img/foto1.1.jpeg"],
    video: "img/video-foto1.mp4",
    descricao: "Cropped de manga longa com decote quadrado e babadinho, e costas abertas com laço. O short tem cintura alta, pregas na frente, bolsos e faixa para amarrar.",
    detalhes: [
      "Decote quadrado com babado",
      "Manga longa bufante com punho de elástico",
      "Costas abertas com laço",
      "Short de cintura alta com faixa e bolsos"
    ]
  },
  {
    slug: "conjunto-cropped-pantalona-corrente-pink",
    sku: "LT02",
    categoria: "Conjuntos com pantalona",
    nome: "Conjunto Cropped e Pantalona com Corrente",
    preco: null, // PREENCHA
    cor: "Rosa pink",
    corHex: "#e63357", // cor medida na foto (bolinha no card)
    tamanhos: ["P", "M", "G"], // CONFIRA os tamanhos disponíveis
    fotos: ["img/foto2.jpeg"],
    video: "img/video-foto2.mp4",
    descricao: "Cropped com decote coração franzido no centro e mangas amplas, que caem soltas. A pantalona tem cintura alta, pernas largas e corrente dourada no cós.",
    detalhes: [
      "Decote coração com franzido",
      "Mangas amplas e soltas",
      "Pantalona de cintura alta",
      "Corrente dourada no cós"
    ]
  },
  {
    slug: "conjunto-peplum-lacos-short-verde",
    sku: "LT03",
    categoria: "Conjuntos com short",
    nome: "Conjunto Peplum com Laços e Short",
    preco: null, // PREENCHA
    cor: "Verde",
    corHex: "#7bd590", // cor medida na foto (bolinha no card)
    tamanhos: ["P", "M", "G"], // CONFIRA os tamanhos disponíveis
    fotos: ["img/foto6.1.jpeg", "img/foto6.jpeg", "img/foto6.2.jpeg"],
    video: "img/video-foto6.mp4",
    descricao: "Blusa de alcinha com decote coração e peplum aberto na frente, com lacinhos na alça e na cintura. O short tem barra dobrada e laço na lateral, combinando com a blusa.",
    detalhes: [
      "Decote coração",
      "Alças com lacinho",
      "Peplum com abertura na frente",
      "Short com barra dobrada e laço lateral"
    ]
  },
  {
    slug: "vestido-ombro-so-drapeado-vermelho",
    sku: "LT04",
    categoria: "Vestidos",
    nome: "Vestido Ombro Só Drapeado",
    preco: null, // PREENCHA
    cor: "Vermelho",
    corHex: "#fe023b", // cor medida na foto (bolinha no card)
    tamanhos: ["P", "M", "G"], // CONFIRA os tamanhos disponíveis
    fotos: ["img/foto4.1.jpeg", "img/foto4.jpeg"],
    video: "img/video-foto4.mp4",
    descricao: "Vestido curto de um ombro só, ajustado ao corpo, com um drapeado largo que cobre o ombro e cai solto nas costas.",
    detalhes: [
      "Modelagem de um ombro só",
      "Drapeado largo no ombro",
      "Ajustado na cintura",
      "Comprimento curto"
    ]
  },
  {
    slug: "conjunto-tomara-que-caia-short-caramelo",
    sku: "LT05",
    categoria: "Conjuntos com short",
    nome: "Conjunto Tomara que Caia com Faixa e Short",
    preco: null, // PREENCHA
    cor: "Caramelo",
    corHex: "#d09c66", // cor medida na foto (bolinha no card)
    tamanhos: ["P", "M", "G"], // CONFIRA os tamanhos disponíveis
    fotos: ["img/foto10.jpeg", "img/foto5.jpeg"],
    video: "img/video-foto10.mp4",
    descricao: "Blusa tomara que caia com peplum e faixa para amarrar na cintura. O short é de cintura alta, com bolsos e barra dobrada.",
    detalhes: [
      "Blusa tomara que caia com peplum",
      "Faixa para amarrar na cintura",
      "Short de cintura alta com barra dobrada",
      "Bolsos na frente"
    ]
  },
  {
    slug: "conjunto-camisa-amarrar-short-preto",
    sku: "LT06",
    categoria: "Conjuntos com short",
    nome: "Conjunto Camisa de Amarrar e Short",
    preco: null, // PREENCHA
    cor: "Preto",
    corHex: "#30333b", // cor medida na foto (bolinha no card)
    tamanhos: ["P", "M", "G"], // CONFIRA os tamanhos disponíveis
    fotos: ["img/foto8.jpeg"],
    video: "img/video-foto8.mp4",
    descricao: "Camisa cropped de manga longa com amarração na frente e babado no ombro. O short é soltinho, com cós de elástico, cordão e barra arredondada nas laterais.",
    detalhes: [
      "Amarração na frente",
      "Babado no ombro",
      "Manga longa com punho franzido",
      "Short com elástico e cordão"
    ]
  },
  {
    slug: "conjunto-cropped-short-clochard-rosa",
    sku: "LT07",
    categoria: "Conjuntos com short",
    nome: "Conjunto Cropped e Short Clochard",
    preco: null, // PREENCHA
    cor: "Rosa claro",
    corHex: "#fce0e9", // cor medida na foto (bolinha no card)
    tamanhos: ["P", "M", "G"], // CONFIRA os tamanhos disponíveis
    fotos: ["img/foto7.1.jpeg", "img/foto7.jpeg"],
    video: "img/video-foto7.mp4",
    descricao: "Cropped de manga longa com decote quadrado e babadinho, e costas abertas com laço. O short clochard tem cintura alta com babado no cós e bolsos.",
    detalhes: [
      "Decote quadrado com babado",
      "Manga longa bufante com punho de elástico",
      "Costas abertas com laço",
      "Short clochard de cintura alta com bolsos"
    ]
  },
  {
    slug: "conjunto-cropped-alcinha-pantalona-branco",
    sku: "LT08",
    categoria: "Conjuntos com pantalona",
    nome: "Conjunto Cropped de Alcinha e Pantalona",
    preco: null, // PREENCHA
    cor: "Branco",
    corHex: "#e3e8eb", // cor medida na foto (bolinha no card)
    tamanhos: ["P", "M", "G"], // CONFIRA os tamanhos disponíveis
    fotos: ["img/foto9.jpeg", "img/foto3.jpeg"],
    video: "img/video-foto9.mp4",
    descricao: "Cropped de alças finas com decote coração e barra recortada. A pantalona tem cós alto com botões dourados, bolsos e pernas largas.",
    detalhes: [
      "Alças finas",
      "Decote coração com barra recortada",
      "Pantalona de cós alto com botões dourados",
      "Bolsos na frente"
    ]
  },
  {
    slug: "conjunto-cropped-bufante-pantalona-vermelho",
    sku: "LT09",
    categoria: "Conjuntos com pantalona",
    nome: "Conjunto Cropped Bufante e Pantalona",
    preco: null, // PREENCHA
    cor: "Vermelho",
    corHex: "#e41c32", // cor medida na foto (bolinha no card)
    tamanhos: ["P", "M", "G"], // CONFIRA os tamanhos disponíveis
    fotos: ["img/foto2.1.jpeg", "img/foto11.jpeg"],
    video: "img/video-foto3.mp4",
    descricao: "Cropped de manga curta bufante, com as costas abertas e amarração na cintura. A pantalona tem cós de elástico com cordão e vinco na frente da perna.",
    detalhes: [
      "Manga curta bufante",
      "Costas abertas com amarração",
      "Pantalona com cós de elástico e cordão",
      "Vinco na frente da perna"
    ]
  }
];
