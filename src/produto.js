// Página de uma peça: migalhas, galeria com scroll-snap (celular) e miniaturas (desktop),
// vídeo da peça como segundo item da galeria, bloco de compra com tamanho que entra na
// mensagem do WhatsApp, descrição, detalhes, medidas da peça, relacionadas e barra fixa no celular.
// Assinatura do contrato: renderProduto(ctx, produto) -> string
// Injeta window.PRODUTO = { slug, nome, cor, preco (ou null), tamanhos, ... } para o app.js montar a mensagem.

"use strict";

const layout = require("./layout.js");

const { ROTULOS, ICONES, TAMANHOS, MENSAGEM_ESGOTADO_PADRAO, jsonSeguro, mensagemSemPreco } = layout;
const { botaoWhats, cartao, corDaPeca, tabela, segmentos, migalhas, altFoto, imagem, preloadImagem, srcLeve, infoImagem, textoComMarca, botaoFavorito } = layout.componentes;

const SIZES_VITRINE = "(min-width: 1280px) 296px, (min-width: 1024px) 23vw, 44vw";

// Garantias logo abaixo do CTA: só o que a loja faz sempre, com link quando houver onde ir.
function garantiasHtml(ctx, p) {
  const itens = [
    [ICONES.whatsappLinha(24), "Atendimento pelo WhatsApp", "Tire dúvidas antes de pedir", ""],
    ehTexto(p.video) ? [ICONES.video(24), "Vídeo da peça", ROTULOS.verVideo, "#video"] : null,
    [ICONES.troca(24), "Trocas pelo WhatsApp", ROTULOS.politica, "/trocas/"]
  ].filter(Boolean);
  return `<ul class="garantias">
${itens.map(([icone, titulo, apoio, href]) => `      <li>${icone}<span><strong>${titulo}</strong>${href ? `<a class="link link--pequeno" href="${href}"${href === "#video" ? " data-ver-video" : ""}>${apoio}</a>` : `<span>${apoio}</span>`}</span></li>`).join("\n")}
    </ul>`;
}

// Linha sob a tabela geral quando a peça não tem medidas próprias.
const LEGENDA_TABELA_CORPO = "Medidas do corpo, não da peça. Compare com as suas.";

// Limite da meta description (o Google corta perto de 155 a 160 caracteres).
const LIMITE_DESCRICAO = 155;

// Nomes das medidas como aparecem no cabeçalho da tabela (caixa normal, sem abreviar).
const NOMES_MEDIDAS = {
  busto: "Busto",
  cintura: "Cintura",
  quadril: "Quadril",
  comprimento: "Comprimento",
  gancho: "Gancho",
  manga: "Manga",
  ombro: "Ombro",
  largura: "Largura"
};

function ehTexto(v) {
  return typeof v === "string" && v.trim() !== "";
}

function nomeMedida(chave) {
  if (NOMES_MEDIDAS[chave]) return NOMES_MEDIDAS[chave];
  const limpo = String(chave).replace(/[_-]+/g, " ");
  return limpo.charAt(0).toUpperCase() + limpo.slice(1);
}

function listaEsgotados(p) {
  return Array.isArray(p.esgotados) ? p.esgotados.map(String) : [];
}

function todosEsgotados(p) {
  const esgotados = listaEsgotados(p);
  return p.tamanhos.length > 0 && p.tamanhos.every((t) => esgotados.includes(String(t)));
}

// Marcadores {produto}{cor}{tamanho}{preco}{link}: regra em util.preencherMensagem,
// espelhada em assets/js/app.js (que recalcula o href quando o tamanho muda).
// O HTML sai com "tamanho a confirmar", para o link funcionar sem JS.
// Modelo: esgotado > sem preço (mensagemProdutoSemPreco, pergunta o valor) > mensagemProduto.
function modeloMensagem(config, p, util) {
  if (todosEsgotados(p)) return ehTexto(config.mensagemEsgotado) ? config.mensagemEsgotado : MENSAGEM_ESGOTADO_PADRAO;
  if (!util.temPreco(p)) return mensagemSemPreco(config);
  return config.mensagemProduto;
}

function montarMensagem(config, p, tamanho, urlPeca, util) {
  const modelo = modeloMensagem(config, p, util);
  return util.preencherMensagem(modelo, {
    produto: p.nome,
    cor: ehTexto(p.cor) ? p.cor.trim() : "",
    tamanho,
    preco: util.temPreco(p) ? util.formatarPreco(p.preco) : ""
  }, urlPeca);
}

// Meta description: preço (se houver), primeira frase da descrição e "Peça pelo WhatsApp.",
// com a frase encurtada no limite de uma palavra quando o total passar do limite.
function primeiraFrase(texto) {
  const limpo = String(texto).replace(/\s+/g, " ").trim();
  const achado = limpo.match(/^.*?[.!?](?=\s|$)/);
  return achado ? achado[0] : limpo;
}

function cortarEmPalavra(texto, maximo) {
  if (texto.length <= maximo) return texto;
  const corte = texto.slice(0, Math.max(0, maximo - 3));
  const espaco = corte.lastIndexOf(" ");
  return (espaco > 0 ? corte.slice(0, espaco) : corte).replace(/[\s,;:.]+$/, "") + "...";
}

function descricaoMeta(p, util) {
  const preco = util.temPreco(p) ? `${util.formatarPreco(p.preco)}.` : "";
  const fim = "Peça pelo WhatsApp.";
  const fixo = [preco, fim].filter(Boolean).join(" ").length;
  const frase = cortarEmPalavra(primeiraFrase(p.descricao), LIMITE_DESCRICAO - fixo - 2);
  return [preco, frase, fim].filter(Boolean).join(" ");
}

function relacionadas(produtos, p) {
  const outras = produtos.filter((o) => o.slug !== p.slug);
  const mesmaCategoria = ehTexto(p.categoria) ? outras.filter((o) => o.categoria === p.categoria) : [];
  const restantes = outras.filter((o) => !mesmaCategoria.includes(o));
  return [...mesmaCategoria, ...restantes].slice(0, 4);
}

// Slide do vídeo: nada é baixado antes do play (preload="none"). O pôster é a foto principal,
// mas não vai no HTML: um poster="foto cheia" baixava a versão grande junto com a do srcset
// (duas cópias da mesma foto disputando o LCP). O app.js usa a versão que a galeria já escolheu.
// Sem JS ficam os controles nativos; com JS, o app.js troca por play, pausa e som próprios
// e toca sozinho (mudo) só enquanto o slide estiver visível.
function slideVideo(ctx, p) {
  const e = ctx.util.escapeHtml;
  const src = "/" + p.video.replace(/^\/+/, "");
  return `      <li class="galeria-video" id="video" data-foto data-video>
        <video src="${e(src)}" muted playsinline loop preload="none" controls disablepictureinpicture aria-label="Vídeo: ${e(altFoto(p))}"></video>
        <button type="button" class="video-play" data-video-play aria-label="Tocar o vídeo">${ICONES.playFill(28)}</button>
        <div class="video-controles">
          <button type="button" class="video-botao" data-video-pausar aria-label="Pausar o vídeo">${ICONES.pause(20)}</button>
          <button type="button" class="video-botao" data-video-som aria-label="Ligar o som">${ICONES.somDesligado(20, ' class="icone-mudo"')}${ICONES.somLigado(20, ' class="icone-som"')}</button>
        </div>
      </li>`;
}

// Itens da galeria na ordem de exibição: foto principal, vídeo (se houver) e as demais fotos.
function itensGaleria(p) {
  const fotos = p.fotos.slice(0, 5).map((caminho, i) => ({ tipo: "foto", caminho, numero: i + 1 }));
  if (ehTexto(p.video)) fotos.splice(1, 0, { tipo: "video" });
  return fotos;
}

function miniaturaHtml(ctx, p, item, indice, totalFotos) {
  const e = ctx.util.escapeHtml;
  const pressionado = indice === 0 ? "true" : "false";
  if (item.tipo === "video") {
    return `      <button type="button" class="miniatura-video" aria-pressed="${pressionado}" aria-label="Vídeo da peça" data-miniatura="${indice}"><img src="${e(srcLeve(ctx, p.fotos[0]))}" alt="" width="56" height="75" loading="lazy" decoding="async">${ICONES.playFill(16)}</button>`;
  }
  const rotulo = totalFotos > 1 ? `Foto ${item.numero} de ${totalFotos}` : "Foto da peça";
  return `      <button type="button" aria-pressed="${pressionado}" aria-label="${rotulo}" data-miniatura="${indice}"><img src="${e(srcLeve(ctx, item.caminho))}" alt="" width="56" height="75" loading="lazy" decoding="async"></button>`;
}

function galeriaHtml(ctx, p) {
  const e = ctx.util.escapeHtml;
  const itens = itensGaleria(p);
  const totalFotos = itens.filter((it) => it.tipo === "foto").length;
  const alt = altFoto(p);
  const principal = infoImagem(ctx, p.fotos[0]);

  const miniaturas = itens.length > 1
    ? `<div class="galeria-miniaturas" role="group" aria-label="Fotos e vídeo da peça">
${itens.map((it, i) => miniaturaHtml(ctx, p, it, i, totalFotos)).join("\n")}
    </div>`
    : "";

  const slides = itens.map((it, i) => {
    if (it.tipo === "video") return slideVideo(ctx, p);
    const altItem = totalFotos > 1 ? `${alt}, foto ${it.numero} de ${totalFotos}` : alt;
    return `      <li${i === 0 ? ' class="ativa"' : ""} data-foto>
        ${imagem(ctx, it.caminho, { alt: altItem, sizes: TAMANHOS.galeria, carregamento: i === 0 ? "prioridade" : "lazy" })}
      </li>`;
  }).join("\n");

  // Linha sob a galeria no celular: segmentos à esquerda e, com vídeo, o link "Ver o vídeo" à direita
  // (fora da foto). Sem JS o link é uma âncora comum para o slide #video.
  const verVideo = ehTexto(p.video) ? `<a class="link link--pequeno galeria-ver-video" href="#video" data-ver-video>${ROTULOS.verVideo}</a>` : "";
  const rodapeGaleria = segmentos("faixa-galeria", itens.length) + verVideo;

  return `<div class="galeria" data-galeria>
    ${miniaturas}
    <ul class="galeria-faixa" id="faixa-galeria" data-faixa aria-label="Fotos e vídeo da peça">
${slides}
    </ul>${rodapeGaleria ? `
    <div class="galeria-rodape">
      ${rodapeGaleria}
    </div>` : ""}
  </div>
  <dialog class="galeria-dialog" data-galeria-dialog aria-label="Foto ampliada">
    <button type="button" class="btn btn--secundario btn--icone galeria-fechar" data-fechar-dialog aria-label="${ROTULOS.fechar}">${ICONES.x(18)}</button>
    <img alt="${e(alt)}" width="${principal.largura}" height="${principal.altura}" decoding="async">
  </dialog>`;
}

function precoHtml(ctx, p) {
  const { config, util } = ctx;
  const e = util.escapeHtml;
  if (!util.temPreco(p)) {
    return `<div class="preco-bloco">
        <p class="preco-consulta">${ROTULOS.semPreco}</p>
      </div>`;
  }
  const pg = config.pagamento || {};
  const temAntigo = typeof p.precoAntigo === "number" && p.precoAntigo > p.preco;
  const temPix = Number(pg.pixDesconto) > 0;
  const parc = util.parcela(config, p.preco);
  const temParcelas = parc.vezes > 1;

  return `<div class="preco-bloco">
        ${temAntigo ? `<p class="preco-antigo"><span class="vo">De </span><s>${e(util.formatarPreco(p.precoAntigo))}</s></p>` : ""}
        <p class="preco-atual">${temAntigo ? '<span class="vo">Por </span>' : ""}${e(util.formatarPreco(p.preco))}</p>
        ${temPix ? `<p class="preco-pix">${e(util.formatarPreco(util.precoPix(config, p.preco)))} no PIX</p>` : ""}
        ${temParcelas ? `<p class="preco-parcela">ou ${parc.vezes}x de ${e(util.formatarPreco(parc.valor))}${pg.semJuros ? " sem juros" : ""}</p>` : ""}
      </div>`;
}

// O "Guia de medidas" aponta sempre para a tabela desta página (#medidas-peca).
// O parágrafo de aviso (role="status") é preenchido pelo app.js quando a pessoa toca na
// barra fixa sem ter escolhido o tamanho.
function tamanhosHtml(ctx, p) {
  const e = ctx.util.escapeHtml;
  const esgotados = listaEsgotados(p);
  const chips = p.tamanhos.map((t) => {
    const tam = String(t);
    const esgotado = esgotados.includes(tam);
    return `          <label class="chip${esgotado ? " chip--esgotado" : ""}">
            <input type="radio" name="tamanho" value="${e(tam)}"${esgotado ? " disabled" : ""}>
            <span>${e(tam)}</span>${esgotado ? '<span class="vo"> (esgotado)</span>' : ""}
          </label>`;
  }).join("\n");

  return `<fieldset class="tamanhos" id="tamanhos" data-tamanhos>
        <legend class="tamanhos-legenda">Tamanho<span data-tamanho-escolhido></span></legend>
        <div class="chips">
${chips}
        </div>
        <p class="tamanhos-aviso" data-aviso-tamanho role="status" aria-live="polite"></p>
        <p class="tamanhos-dica">
          <span data-dica-tamanho>Escolha o tamanho para a mensagem já ir completa.</span>
          <a class="link link--pequeno" href="#medidas-peca">Guia de medidas</a>
        </p>
      </fieldset>`;
}

function fatosHtml(ctx) {
  const { config, util } = ctx;
  const e = util.escapeHtml;
  const frete = config.frete || {};
  const linhas = [];
  if (ehTexto(frete.prazoTexto)) linhas.push(e(frete.prazoTexto));
  if (typeof frete.gratisAcima === "number" && frete.gratisAcima > 0) {
    linhas.push(`Frete grátis acima de ${e(util.formatarPreco(frete.gratisAcima))}`);
  }
  if (!linhas.length) return "";
  return `<ul class="compra-fatos">
${linhas.map((l) => `        <li>${l}</li>`).join("\n")}
      </ul>`;
}

function medidasTabela(ctx, p) {
  if (!p.medidas || typeof p.medidas !== "object") return null;
  const tamanhos = p.tamanhos.map(String).filter((t) => p.medidas[t] && typeof p.medidas[t] === "object");
  if (!tamanhos.length) return null;
  // As chaves variam por tipo de peça (busto, cintura, quadril, comprimento, gancho...).
  const chaves = [];
  for (const t of tamanhos) {
    for (const k of Object.keys(p.medidas[t])) if (!chaves.includes(k)) chaves.push(k);
  }
  if (!chaves.length) return null;
  const colunas = ["Tamanho", ...chaves.map(nomeMedida)];
  const linhas = tamanhos.map((t) => [t, ...chaves.map((k) => (p.medidas[t][k] === undefined ? "" : String(p.medidas[t][k])))]);
  return tabela(ctx, colunas, linhas, p.modelo);
}

function blocoInfo(id, titulo, conteudoHtml) {
  // Aberto por padrão (celular e sem JS); o app.js fecha a partir de 1024px.
  return `<details class="acordeao bloco-info" id="${id}" open data-fechar-desktop>
        <summary><span>${titulo}</span>${layout.ICONES.plus(16)}</summary>
        <div class="acordeao-corpo">
          ${conteudoHtml}
        </div>
      </details>`;
}

module.exports = function renderProduto(ctx, produto) {
  const { config, produtos, util } = ctx;
  const e = util.escapeHtml;
  const p = produto;
  const caminho = `/p/${p.slug}/`;
  const urlPeca = util.urlAbsoluta(config, caminho);
  const sku = ehTexto(p.sku) ? p.sku : p.slug;
  const esgotado = todosEsgotados(p);

  const mensagem = montarMensagem(config, p, "", urlPeca, util);
  const hrefProduto = util.linkWhats(config, mensagem);
  const rotuloCta = esgotado ? ROTULOS.esgotado : ROTULOS.contato;

  // Medidas da peça quando existem; senão, a tabela geral do corpo (conteudo.guiaMedidas),
  // para o "Guia de medidas" não tirar a pessoa da página.
  const tabelaPeca = medidasTabela(ctx, p);
  const guia = ctx.conteudo.guiaMedidas;
  const blocoMedidas = tabelaPeca
    ? blocoInfo("medidas-peca", "Medidas da peça (cm)", tabelaPeca)
    : blocoInfo("medidas-peca", "Tabela de medidas (cm)", tabela(ctx, guia.tabela.colunas, guia.tabela.linhas, LEGENDA_TABELA_CORPO));
  const detalhes = Array.isArray(p.detalhes) && p.detalhes.length
    ? `<ul class="lista-hifen">${p.detalhes.slice(0, 5).map((d) => `<li>${textoComMarca(ctx, d)}</li>`).join("")}</ul>`
    : "";
  const composicao = [
    ehTexto(p.composicao) ? `<p><strong>Composição:</strong> ${e(p.composicao)}</p>` : "",
    ehTexto(p.cuidados) ? `<p>${e(p.cuidados)}</p>` : ""
  ].filter(Boolean).join("\n          ");

  const blocos = [
    detalhes ? blocoInfo("detalhes", "Detalhes", detalhes) : "",
    composicao ? blocoInfo("composicao", "Composição e cuidados", composicao) : "",
    blocoMedidas
  ].filter(Boolean).join("\n      ");

  // "Você também pode gostar": vitrine em carrossel com o card de varejo (até 8 peças).
  const outras = relacionadas(produtos, p);
  const relacionadasHtml = outras.length
    ? `<section class="secao relacionadas" aria-labelledby="relacionadas-titulo">
  <div class="container">
    <div class="cabeca-secao">
      <div class="cabeca-titulos">
        <p class="rotulo">Mais peças</p>
        <h2 id="relacionadas-titulo">Você também pode gostar</h2>
      </div>
      <a class="link-seta" href="/#colecao">${ROTULOS.catalogo}${ICONES.seta(16)}</a>
    </div>
    ${layout.carrossel("faixa-relacionadas", outras.map((o) => cartao(ctx, o, { sizes: SIZES_VITRINE, classeItem: "carrossel-item" })).join("\n"), "Você também pode gostar")}
  </div>
</section>`
    : "";
  const comPreco = util.temPreco(p);

  const corpo = `<div class="container">
  ${migalhas(ctx, [{ texto: "Início", href: "/" }, { texto: "Coleção", href: "/#colecao" }, { texto: p.nome }])}
</div>
<article class="container produto">
  ${galeriaHtml(ctx, p)}
  <div class="compra">
    <div class="compra-cabeca">
      ${ehTexto(p.categoria) ? `<p class="rotulo">${e(p.categoria)}</p>` : ""}
      <div class="compra-titulo">
        <h1>${e(p.nome)}</h1>
        ${botaoFavorito(ctx, p, "favorito--peca")}
      </div>
      ${ehTexto(p.tag) ? `<p class="compra-selo">${e(p.tag)}</p>` : ""}
      ${corDaPeca(ctx, p, "compra-cor")}
    </div>
    ${precoHtml(ctx, p)}
    ${tamanhosHtml(ctx, p)}
    <div class="compra-cta">
      ${botaoWhats(ctx, { href: hrefProduto, classe: "btn--largo", rotulo: rotuloCta, tipo: "produto", extra: "data-cta-inline" })}
    </div>
    ${garantiasHtml(ctx, p)}
    ${fatosHtml(ctx)}
    <div class="compra-descricao">
      <p>${textoComMarca(ctx, p.descricao)}</p>
    </div>
    <div class="compra-blocos">
      ${blocos}
    </div>
  </div>
</article>
${relacionadasHtml}
<div class="barra-fixa" data-barra-fixa>
  <div class="barra-info">
    <span class="barra-preco${comPreco ? "" : " barra-preco--consulta"}">${comPreco ? e(util.formatarPreco(p.preco)) : ROTULOS.semPreco}</span>
    <span class="barra-tamanho" data-barra-tamanho>${esgotado ? "Peça esgotada" : "Escolha o tamanho"}</span>
  </div>
  ${botaoWhats(ctx, { href: hrefProduto, classe: "barra-botao", rotulo: rotuloCta, tipo: "produto" })}
</div>
<script>window.PRODUTO = ${jsonSeguro({
    slug: p.slug,
    nome: p.nome,
    cor: ehTexto(p.cor) ? p.cor.trim() : "",
    preco: comPreco ? p.preco : null,
    tamanhos: p.tamanhos.map(String),
    sku,
    url: urlPeca,
    esgotado
  })};</script>`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: p.nome,
      image: p.fotos.map((f) => util.urlAbsoluta(config, f)),
      description: p.descricao,
      sku,
      brand: { "@type": "Brand", name: config.marca },
      ...(ehTexto(p.cor) ? { color: p.cor } : {}),
      ...(ehTexto(p.composicao) ? { material: p.composicao } : {}),
      // Sem preço não há Offer válida: o bloco some até a peça ter valor.
      ...(comPreco ? {
        offers: {
          "@type": "Offer",
          url: urlPeca,
          priceCurrency: "BRL",
          price: p.preco.toFixed(2),
          availability: esgotado ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
          itemCondition: "https://schema.org/NewCondition"
        }
      } : {})
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Início", item: util.urlAbsoluta(config, "/") },
        { "@type": "ListItem", position: 2, name: "Coleção", item: util.urlAbsoluta(config, "/#colecao") },
        { "@type": "ListItem", position: 3, name: p.nome, item: urlPeca }
      ]
    }
  ];

  return layout({
    ctx,
    titulo: p.nome,
    descricao: descricaoMeta(p, util),
    caminho,
    ogImagem: p.fotos[0],
    preload: preloadImagem(ctx, p.fotos[0], TAMANHOS.galeria),
    corpo,
    jsonLd,
    classeBody: "pagina-produto",
    whats: { href: hrefProduto, tipo: "produto" },
    ancoraMedidas: "#medidas-peca"
  });
};

module.exports.montarMensagem = montarMensagem;
