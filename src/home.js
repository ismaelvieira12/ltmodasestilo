// Home (seção 4 do DESIGN.md), na ordem:
//   topo dividido (texto, fotos que revezam e 3 destaques), categorias em círculos num cartão
//   branco, "Compre por categoria", dois painéis bege, coleção com busca e filtros, vídeos,
//   benefícios, "Receba as novidades", Sobre, depoimentos, guia de medidas, dúvidas e trocas.
//   Barra de topo, cabeçalho, rodapé e painel de favoritos vêm do layout.
// Assinatura do contrato: renderHome(ctx) -> string

"use strict";

const layout = require("./layout.js");

const { ROTULOS, ICONES, TAMANHOS } = layout;
const {
  botaoWhats, linkWhats, cartao, corDaPeca, tabela, segmentos, imagem, preloadImagem, altFoto,
  fotoMaisAlta, precoCurto, textoComMarca, arrobaInstagram, nenhumPreco, imagemAmbiente,
  fotoCirculo, categoriasDasPecas, hrefCategoria, temVideos
} = layout.componentes;

const MAXIMO_VISIVEL = 12;

// sizes dos layouts desta página (px reais de CSS, ver style.css)
const SIZES = {
  hero: "(min-width: 1024px) 48vw, 100vw",
  estilos: "(min-width: 1280px) 296px, (min-width: 1024px) 23vw, 46vw",
  painel: "(min-width: 1024px) 280px, 40vw",
  novidades: "(min-width: 1024px) 400px, 100vw",
  sobre: "(min-width: 1024px) 420px, 100vw"
};

const ICONES_BENEFICIO = { whatsapp: "whatsappLinha", video: "video", regua: "regua", troca: "troca", caminhao: "caminhao", cartao: "cartao", porcento: "porcento" };

function ehTexto(v) {
  return typeof v === "string" && v.trim() !== "";
}

function lista(v) {
  return Array.isArray(v) ? v : [];
}

function pecaDaFoto(ctx, caminho) {
  return ctx.produtos.find((o) => o.fotos.includes(caminho)) || null;
}

// Texto alternativo de uma foto da home: o nome e a cor da peça em que ela aparece, quando houver.
function altDaFoto(ctx, caminho) {
  const p = pecaDaFoto(ctx, caminho);
  return p ? altFoto(p) : `Peça da coleção ${ctx.config.marca}`;
}

function aspas(texto) {
  const t = String(texto).trim();
  const abre = String.fromCharCode(0x201c);
  const fecha = String.fromCharCode(0x201d);
  return abre + t.replace(/^["']+|["']+$/g, "") + fecha;
}

function rotulo(ctx, texto) {
  return ehTexto(texto) ? `<p class="rotulo">${textoComMarca(ctx, texto)}</p>` : "";
}

// Destino de um filtro: "colecao" (todas as peças), "videos" (faixa de vídeos) ou uma categoria.
function hrefFiltro(ctx, filtro) {
  if (filtro === "colecao") return "#colecao";
  if (filtro === "videos") return "#videos";
  return hrefCategoria(ctx, filtro);
}

// Ícone de um benefício ou destaque (Phosphor, ver layout.js).
function iconeBeneficio(nome, tamanho) {
  return ICONES[ICONES_BENEFICIO[nome] || "whatsappLinha"](tamanho);
}

// ---------- 4.1 Topo dividido ----------
// Texto à esquerda (rótulo, título, frase, "Ver a coleção" e "Ver vídeos") com 3 destaques;
// à direita, até 3 fotos de peças que revezam (carrossel com numeração vertical 01, 02, 03
// e pausa; só a primeira foto é o LCP, com preload). Cada foto leva à peça em que aparece.
// No celular: texto e botões primeiro, a foto logo abaixo (o rosto aparece na primeira tela)
// e os destaques depois da foto.
function secaoHero(ctx) {
  const { util } = ctx;
  const e = util.escapeHtml;
  const h = ctx.conteudo.hero;
  const fotos = [h.foto, ...lista(h.fotos)].slice(0, 3);
  const total = fotos.length;

  const slides = fotos.map((f, i) => {
    const p = pecaDaFoto(ctx, f);
    const img = imagem(ctx, f, { alt: altDaFoto(ctx, f), sizes: SIZES.hero, classe: "hero-foto", carregamento: i === 0 ? "prioridade" : "lazy" });
    const conteudoSlide = p ? `<a class="hero-slide-link" href="/p/${e(p.slug)}/">${img}</a>` : img;
    return `      <div class="hero-slide" role="group" aria-roledescription="slide" aria-label="${i + 1} de ${total}" data-banner-slide data-foto>
        ${conteudoSlide}
      </div>`;
  }).join("\n");

  const numeros = fotos.map((f, i) => `<button type="button" class="hero-numero" data-banner-ponto="${i}" aria-label="Foto ${i + 1} de ${total}"${i === 0 ? ' aria-current="true"' : ""}>${String(i + 1).padStart(2, "0")}</button>`).join("");
  const controles = total > 1
    ? `
    <div class="hero-controles" data-banner-controles hidden>
      ${numeros}
      <button type="button" class="hero-pausa" data-banner-pausa data-estado="tocando" aria-label="Pausar fotos">${ICONES.pause(14, ' class="icone-pausar"')}${ICONES.play(14, ' class="icone-tocar"')}</button>
    </div>`
    : "";

  const destaques = lista(h.destaques).map((d) => `<li>
        <span class="destaque-icone" aria-hidden="true">${iconeBeneficio(d.icone, 20)}</span>
        <span class="destaque-texto"><strong>${e(d.titulo)}</strong><span>${e(d.texto)}</span></span>
      </li>`).join("\n      ");

  return `<section class="hero" aria-labelledby="hero-titulo">
  <div class="hero-texto">
    ${rotulo(ctx, h.rotulo)}
    <h1 id="hero-titulo">${textoComMarca(ctx, h.titulo)}</h1>
    <p class="hero-frase">${textoComMarca(ctx, h.subtitulo)}</p>
    <div class="hero-acoes">
      <a class="btn btn--tinta" href="#colecao">${e(ehTexto(h.ctaTexto) ? h.ctaTexto : ROTULOS.catalogo)}${ICONES.seta(18)}</a>${temVideos(ctx) ? `
      <a class="link-play" href="#videos"><span class="link-play-circulo" aria-hidden="true">${ICONES.playFill(14)}</span>${ROTULOS.verVideos}</a>` : ""}
    </div>
  </div>
  <div class="hero-midia" data-banner aria-roledescription="carrossel" aria-label="Fotos da coleção">
    <div class="hero-faixa" data-banner-faixa>
${slides}
    </div>${controles}
  </div>${destaques ? `
  <ul class="hero-destaques">
      ${destaques}
  </ul>` : ""}
</section>`;
}

// ---------- 4.2 Categorias em círculos (cartão branco sobre a base do topo) ----------
// O último é o círculo preto "Vídeos", no lugar do "SALE" da referência.
function secaoCategorias(ctx) {
  const e = ctx.util.escapeHtml;
  const itens = lista(ctx.conteudo.categorias).filter((c) => c.filtro !== "videos" || temVideos(ctx));
  if (!itens.length) return "";
  const html = itens.map((c) => {
    if (c.filtro === "videos") {
      return `<li><a class="circulo circulo--destaque" href="#videos">
        <span class="circulo-foto" aria-hidden="true"><span class="circulo-texto">${e(c.nome)}</span></span>
        <span class="circulo-nome">${e(c.nome)}</span>
      </a></li>`;
    }
    return `<li><a class="circulo" href="${e(hrefFiltro(ctx, c.filtro))}">
        <span class="circulo-foto">${fotoCirculo(ctx, c.foto, c.rosto, c.zoom)}</span>
        <span class="circulo-nome">${e(c.nome)}</span>
      </a></li>`;
  }).join("\n      ");
  return `<nav class="categorias" aria-label="Categorias">
  <div class="container">
    <ul class="categorias-cartao">
      ${html}
    </ul>
  </div>
</nav>`;
}

// Cabeçalho de seção: rótulo, título serifado e, à direita, um link com seta (opcional).
function cabecaSecao(ctx, { id, rotuloTexto, titulo, link, extra = "" }) {
  const e = ctx.util.escapeHtml;
  return `<div class="cabeca-secao">
      <div class="cabeca-titulos">
        ${rotulo(ctx, rotuloTexto)}
        <h2 id="${id}">${textoComMarca(ctx, titulo)}</h2>${extra}
      </div>${link ? `
      <a class="link-seta" href="${e(link.href)}">${e(link.texto)}${ICONES.seta(16)}</a>` : ""}
    </div>`;
}

// ---------- 4.3 Compre por categoria ----------
function secaoEstilos(ctx) {
  const e = ctx.util.escapeHtml;
  const est = ctx.conteudo.estilos;
  const cards = est ? lista(est.cards).filter((m) => m.filtro !== "videos" || temVideos(ctx)) : [];
  if (!cards.length) return "";
  const html = cards.map((m) => {
    const ehVideo = m.filtro === "videos";
    return `<li><a class="estilo-card" href="${e(hrefFiltro(ctx, m.filtro))}" data-foto>
        ${imagem(ctx, m.foto, { alt: "", sizes: SIZES.estilos, classe: "estilo-foto" })}
        <span class="estilo-texto"><span class="estilo-titulo">${e(m.titulo)}</span><span class="estilo-link">${ehVideo ? ROTULOS.verVideos : ROTULOS.verPecas}${ICONES.seta(16)}</span></span>
      </a></li>`;
  }).join("\n      ");
  return `<section class="secao estilos" aria-labelledby="estilos-titulo">
  <div class="container">
    ${cabecaSecao(ctx, { id: "estilos-titulo", rotuloTexto: est.rotulo, titulo: est.titulo, link: { href: "#colecao", texto: ROTULOS.catalogo } })}
    <ul class="estilos-lista">
      ${html}
    </ul>
  </div>
</section>`;
}

// ---------- 4.4 Dois painéis bege ----------
// Imagem de ambiente nunca leva preço nem nome de peça por cima.
function midiaPainel(ctx, p) {
  if (ehTexto(p.foto)) return imagem(ctx, p.foto, { alt: altDaFoto(ctx, p.foto), sizes: SIZES.painel, classe: "painel-foto" });
  return imagemAmbiente(ctx, p.ambiente, { proporcao: [4, 5], larguras: [400, 640], sizes: SIZES.painel, classe: "painel-foto" });
}

function secaoPaineis(ctx) {
  const e = ctx.util.escapeHtml;
  const itens = lista(ctx.conteudo.paineis).filter((p) => p.link.trim() !== "#videos" || temVideos(ctx));
  if (!itens.length) return "";
  const html = itens.map((p) => `<li class="painel">
      <div class="painel-texto">
        ${rotulo(ctx, p.rotulo)}
        <h2 class="painel-titulo">${textoComMarca(ctx, p.titulo)}</h2>
        <a class="btn btn--tinta painel-botao" href="${e(p.link)}">${e(p.botao)}${ICONES.seta(18)}</a>
      </div>
      <div class="painel-midia" data-foto>
        ${midiaPainel(ctx, p)}
      </div>
    </li>`).join("\n    ");
  return `<section class="secao paineis" aria-label="Destaques da loja">
  <ul class="container paineis-lista">
    ${html}
  </ul>
</section>`;
}

// ---------- 4.5 Coleção (todas as peças, busca e filtros) ----------
// Colunas da grade no desktop: 3 (9 peças fecham 3 linhas sem peça sozinha).
function secaoColecao(ctx) {
  const { config, produtos, util, conteudo } = ctx;
  const e = util.escapeHtml;
  const categorias = categoriasDasPecas(ctx);
  const textos = conteudo.colecao || { rotulo: "Coleção", titulo: "Coleção" };

  const chips = categorias.length
    ? `<div class="chips chips--filtro" role="group" aria-label="Filtrar por categoria">
      <button type="button" class="chip chip--ativo" data-filtro="" data-slug="" aria-pressed="true">Todas</button>
      ${categorias.map((c) => `<button type="button" class="chip" data-filtro="${e(c)}" data-slug="${e(util.slugify(c))}" aria-pressed="false">${e(c)}</button>`).join("\n      ")}
    </div>`
    : "";

  const itens = produtos
    .map((p, i) => cartao(ctx, p, { revelar: true, filtravel: true, alem: i >= MAXIMO_VISIVEL, sizes: TAMANHOS.grade }))
    .join("\n");
  const avisoPreco = nenhumPreco(ctx) ? `\n        <p class="colecao-aviso">${ROTULOS.semPrecoColecao}</p>` : "";
  const maisPecas = produtos.length > MAXIMO_VISIVEL
    ? `<div class="colecao-mais">
      <button type="button" class="btn btn--secundario" data-mostrar-mais="grade-colecao">${ROTULOS.maisItens}</button>
    </div>`
    : "";
  const hrefGeral = util.linkWhats(config, config.mensagemGeral);

  return `<section class="secao colecao" id="colecao" aria-labelledby="colecao-titulo">
  <div class="container">
    <div class="colecao-cabeca">
      ${cabecaSecao(ctx, { id: "colecao-titulo", rotuloTexto: textos.rotulo, titulo: textos.titulo, extra: avisoPreco })}
      ${chips}
    </div>
    <div class="busca-resultado">
      <p class="busca-status" data-busca-status role="status"></p>
      <button type="button" class="link link--pequeno" data-busca-limpar hidden>Limpar busca</button>
    </div>
    <ul class="grade" id="grade-colecao" data-revelar-lote>
${itens}
    </ul>
    <div class="busca-vazia" data-busca-vazia hidden>
      <p>Nenhuma peça encontrada para <strong data-busca-termo></strong>.</p>
      ${linkWhats(ctx, { href: hrefGeral, tipo: "busca" })}
    </div>
    ${maisPecas}
  </div>
</section>`;
}

// ---------- 4.6 Vídeos (faixa de stories) ----------
// O vídeo só recebe src pelo app.js quando o card é o mais visível (e, no celular, só depois
// do primeiro gesto na faixa); antes disso fica a foto com um play discreto.
// O link leva ao vídeo da peça (#video), não à foto.
function cardVideo(ctx, p) {
  const e = ctx.util.escapeHtml;
  const src = "/" + p.video.replace(/^\/+/, "");
  const preco = precoCurto(ctx, p, "video-card-preco");
  return `      <li class="video-card" data-video-card>
        <a class="video-card-link" href="/p/${e(p.slug)}/#video">
          <span class="video-card-midia" data-foto>
            ${imagem(ctx, fotoMaisAlta(ctx, p), { sizes: TAMANHOS.video })}
            <video muted playsinline loop preload="none" data-src="${e(src)}" aria-hidden="true" tabindex="-1" disablepictureinpicture disableremoteplayback></video>
            <span class="video-card-play" aria-hidden="true">${ICONES.playFill(14)}</span>
          </span>
          <span class="video-card-progresso" aria-hidden="true"><span data-video-progresso></span></span>
          <span class="video-card-nome">${e(p.nome)}</span>
          ${corDaPeca(ctx, p, "video-card-cor", "span")}${preco ? `
          ${preco}` : ""}
        </a>
      </li>`;
}

function secaoVideos(ctx) {
  const comVideo = ctx.produtos.filter((p) => ehTexto(p.video));
  if (!comVideo.length) return "";
  const controles = `<div class="videos-controles">
        <button type="button" class="btn btn--secundario btn--compacto videos-alternar" data-videos-alternar data-estado="tocando" hidden>${ICONES.pause(18, ' class="icone-pausar"')}${ICONES.play(18, ' class="icone-tocar"')}<span data-videos-rotulo>Pausar vídeos</span></button>
        <button type="button" class="btn btn--secundario btn--icone videos-seta" data-videos-anterior aria-label="Vídeos anteriores" hidden>${ICONES.setaEsquerda(20)}</button>
        <button type="button" class="btn btn--secundario btn--icone videos-seta" data-videos-proximo aria-label="Próximos vídeos" hidden>${ICONES.setaDireita(20)}</button>
      </div>`;
  return `<section class="secao videos" id="videos" aria-labelledby="videos-titulo">
  <div class="container">
    <div class="cabeca-secao">
      <div class="cabeca-titulos">
        ${rotulo(ctx, "Vídeos")}
        <h2 id="videos-titulo">Peças em vídeo</h2>
      </div>
      ${controles}
    </div>
    <ul class="videos-faixa" data-videos>
${comVideo.map((p) => cardVideo(ctx, p)).join("\n")}
    </ul>
  </div>
</section>`;
}

// ---------- 4.7 Benefícios (painel bege com divisórias) ----------
// Os 4 de conteudo.beneficios e, só quando o config tiver a condição, frete grátis,
// parcelas sem juros e desconto no PIX.
function beneficiosDoConfig(ctx) {
  const { config, util } = ctx;
  const pg = config.pagamento || {};
  const frete = config.frete || {};
  const extras = [];
  if (typeof frete.gratisAcima === "number" && frete.gratisAcima > 0) {
    extras.push({ icone: "caminhao", titulo: `Frete grátis acima de ${util.formatarPreco(frete.gratisAcima)}`, texto: ehTexto(frete.prazoTexto) ? frete.prazoTexto : "", link: "" });
  }
  if (Number(pg.parcelas) > 1 && pg.semJuros === true) {
    extras.push({ icone: "cartao", titulo: `Até ${pg.parcelas}x sem juros`, texto: "No cartão", link: "" });
  }
  if (Number(pg.pixDesconto) > 0) {
    extras.push({ icone: "porcento", titulo: `${String(pg.pixDesconto).replace(".", ",")}% de desconto no PIX`, texto: "Pagando com PIX", link: "" });
  }
  return extras;
}

function secaoBeneficios(ctx) {
  const { config, util } = ctx;
  const e = util.escapeHtml;
  const itens = [...lista(ctx.conteudo.beneficios), ...beneficiosDoConfig(ctx)]
    .filter((b) => b.link !== "#videos" || temVideos(ctx));
  if (!itens.length) return "";
  const hrefMedidas = util.linkWhats(config, layout.mensagemMedidas(config));
  const html = itens.map((b) => {
    const corpo = `${iconeBeneficio(b.icone, 30)}<span class="beneficio-texto"><strong>${e(b.titulo)}</strong>${ehTexto(b.texto) ? `<span>${e(b.texto)}</span>` : ""}</span>`;
    if (b.link === "medidas") {
      return `<li><a class="beneficio beneficio--link" href="${e(hrefMedidas)}" target="_blank" rel="noopener" data-whats="medidas">${corpo}</a></li>`;
    }
    if (ehTexto(b.link)) return `<li><a class="beneficio beneficio--link" href="${e(b.link)}">${corpo}</a></li>`;
    return `<li><div class="beneficio">${corpo}</div></li>`;
  }).join("\n      ");
  return `<section class="secao beneficios" aria-label="Como funciona a compra">
  <div class="container">
    <ul class="beneficios-lista">
      ${html}
    </ul>
  </div>
</section>`;
}

// ---------- 4.8 Receba as novidades ----------
// No lugar do cadastro por e-mail da referência (não há servidor): um botão de WhatsApp com
// config.mensagemNovidades e o link para seguir no Instagram.
function secaoNovidades(ctx) {
  const { config, util } = ctx;
  const e = util.escapeHtml;
  const nv = ctx.conteudo.novidades;
  if (!nv || !ehTexto(nv.titulo)) return "";
  const href = util.linkWhats(config, layout.mensagemNovidades(config));
  const insta = ehTexto(config.instagram)
    ? `<a class="link receba-insta" href="https://instagram.com/${e(config.instagram)}" target="_blank" rel="noopener">${ICONES.instagram(18)}<span>${ROTULOS.seguir}</span></a>`
    : "";
  return `<section class="secao receba" aria-labelledby="receba-titulo">
  <div class="container">
    <div class="receba-painel">
      <figure class="receba-foto" data-foto>
        ${imagem(ctx, nv.foto, { alt: altDaFoto(ctx, nv.foto), sizes: SIZES.novidades })}
      </figure>
      <div class="receba-texto">
        ${rotulo(ctx, nv.rotulo)}
        <h2 id="receba-titulo">${textoComMarca(ctx, nv.titulo)}</h2>
        <p>${textoComMarca(ctx, nv.texto)}</p>
        <div class="receba-acoes">
          ${botaoWhats(ctx, { href, tipo: "novidades", rotulo: ROTULOS.novidades })}
          ${insta}
        </div>
      </div>
    </div>
  </div>
</section>`;
}

// ---------- 4.9 Sobre ----------
function secaoSobre(ctx) {
  const { config, conteudo, util } = ctx;
  const e = util.escapeHtml;
  const s = conteudo.sobre;
  const instagram = ehTexto(config.instagram)
    ? `<a class="link sobre-insta" href="https://instagram.com/${e(config.instagram)}" target="_blank" rel="noopener"><span>${arrobaInstagram(ctx)} no Instagram</span></a>`
    : "";
  const ambiente = ehTexto(s.ambiente)
    ? `<figure class="sobre-ambiente" data-foto>${imagemAmbiente(ctx, s.ambiente, { proporcao: [4, 3], larguras: [480, 800], sizes: "(min-width: 1024px) 300px, 64vw" })}</figure>`
    : "";
  return `<section class="secao sobre" id="sobre" aria-labelledby="sobre-titulo" data-revelar>
  <div class="container sobre-grade">
    <div class="sobre-texto">
      ${rotulo(ctx, "A loja")}
      <h2 id="sobre-titulo">${textoComMarca(ctx, s.titulo)}</h2>
      ${s.paragrafos.map((p) => `<p>${textoComMarca(ctx, p)}</p>`).join("\n      ")}
      ${ambiente}
      ${instagram}
    </div>
    <figure class="sobre-foto" data-foto>
      ${imagem(ctx, s.foto, { alt: altDaFoto(ctx, s.foto), sizes: SIZES.sobre })}
    </figure>
  </div>
</section>`;
}

// ---------- Depoimentos (só com depoimento real; hoje a lista está vazia) ----------
function secaoDepoimentos(ctx) {
  const { conteudo, util } = ctx;
  const e = util.escapeHtml;
  const itens = lista(conteudo.depoimentos).filter((d) => d && d.exemplo !== true).slice(0, 5);
  if (!itens.length) return "";

  const html = itens.map((d) => {
    const autor = ehTexto(d.cidade) ? `${e(d.nome)}<span>, ${e(d.cidade)}</span>` : e(d.nome);
    return `      <li data-revelar>
        <blockquote>
          <p>${e(aspas(d.texto))}</p>
          <footer>
            <span class="depo-autor">${autor}</span>${ehTexto(d.peca) ? `
            <span class="depo-peca">Comprou ${e(d.peca)}</span>` : ""}
          </footer>
        </blockquote>
      </li>`;
  }).join("\n");

  return `<section class="secao depoimentos" aria-labelledby="depoimentos-titulo">
  <div class="container">
    <h2 id="depoimentos-titulo">Quem já comprou</h2>
    <ul class="depos" id="faixa-depoimentos" data-faixa data-revelar-lote>
${html}
    </ul>
    ${segmentos("faixa-depoimentos", itens.length)}
  </div>
</section>`;
}

// ---------- 4.10 Guia de medidas ----------
function secaoMedidas(ctx) {
  const { config, conteudo, util } = ctx;
  const e = util.escapeHtml;
  const g = conteudo.guiaMedidas;
  const comoMedir = g.comoMedir
    .map((item) => `        <div class="medidas-par"><dt>${e(item.parte)}</dt><dd>${textoComMarca(ctx, item.instrucao)}</dd></div>`)
    .join("\n");
  const hrefAjuda = util.linkWhats(config, layout.mensagemMedidas(config));

  return `<section class="secao medidas" id="medidas" aria-labelledby="medidas-titulo" data-revelar>
  <div class="container medidas-grade">
    <div class="medidas-abre">
      ${rotulo(ctx, "Tamanhos")}
      <h2 id="medidas-titulo">Guia de medidas</h2>
      <p class="medidas-intro">${textoComMarca(ctx, g.intro)}</p>
      <p class="medidas-ajuda">${linkWhats(ctx, { href: hrefAjuda, rotulo: ROTULOS.ajudaTamanho, tipo: "medidas" })}</p>
      <div class="medidas-como">
        <h3>Como medir</h3>
        <dl>
${comoMedir}
        </dl>
      </div>
    </div>
    <div class="medidas-tabela">
      <h3>Medidas do corpo (cm)</h3>
      ${tabela(ctx, g.tabela.colunas, g.tabela.linhas)}
    </div>
  </div>
</section>`;
}

// ---------- 4.11 Dúvidas ----------
function itemFaq(ctx, item, indice) {
  return `      <details class="acordeao" id="duvida-${indice + 1}">
        <summary><span>${textoComMarca(ctx, item.pergunta)}</span>${ICONES.plus(16)}</summary>
        <div class="acordeao-corpo"><p>${textoComMarca(ctx, item.resposta)}</p></div>
      </details>`;
}

function secaoDuvidas(ctx) {
  const faq = ctx.conteudo.faq;
  const metade = Math.ceil(faq.length / 2);
  const colunaA = faq.slice(0, metade).map((it, i) => itemFaq(ctx, it, i)).join("\n");
  const colunaB = faq.slice(metade).map((it, i) => itemFaq(ctx, it, metade + i)).join("\n");

  return `<section class="secao duvidas" id="duvidas" aria-labelledby="duvidas-titulo" data-revelar>
  <div class="container">
    ${cabecaSecao(ctx, { id: "duvidas-titulo", rotuloTexto: "Ajuda", titulo: "Dúvidas frequentes" })}
    <div class="faq">
      <div class="faq-coluna">
${colunaA}
      </div>${colunaB ? `
      <div class="faq-coluna">
${colunaB}
      </div>` : ""}
    </div>
  </div>
</section>`;
}

// ---------- 4.12 Trocas (painel bege, imagem de ambiente no desktop) ----------
function secaoTrocas(ctx) {
  const t = ctx.conteudo.trocas;
  const ambiente = ehTexto(t.ambiente)
    ? `<figure class="trocas-ambiente" data-foto>${imagemAmbiente(ctx, t.ambiente, { proporcao: [4, 3], larguras: [480, 800], sizes: "380px" })}</figure>`
    : "";
  return `<section class="secao trocas" id="trocas" aria-labelledby="trocas-titulo">
  <div class="container">
    <div class="trocas-painel">
      <div class="trocas-texto">
        ${rotulo(ctx, "Trocas")}
        <h2 id="trocas-titulo">Trocas e devoluções</h2>
        <p>${textoComMarca(ctx, t.resumo)}</p>
        <a class="link-seta" href="/trocas/">${ROTULOS.politica}${ICONES.seta(16)}</a>
      </div>
      ${ambiente}
    </div>
  </div>
</section>`;
}

module.exports = function renderHome(ctx) {
  const { config, conteudo, util } = ctx;

  const corpo = [
    secaoHero(ctx),
    secaoCategorias(ctx),
    secaoEstilos(ctx),
    secaoPaineis(ctx),
    secaoColecao(ctx),
    secaoVideos(ctx),
    secaoBeneficios(ctx),
    secaoNovidades(ctx),
    secaoSobre(ctx),
    secaoDepoimentos(ctx),
    secaoMedidas(ctx),
    secaoDuvidas(ctx),
    secaoTrocas(ctx)
  ].filter(Boolean).join("\n\n");

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: config.marca,
      url: util.urlAbsoluta(config, "/"),
      ...(ehTexto(config.instagram) ? { sameAs: [`https://instagram.com/${config.instagram}`] } : {})
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: conteudo.faq.map((f) => ({
        "@type": "Question",
        name: f.pergunta,
        acceptedAnswer: { "@type": "Answer", text: f.resposta }
      }))
    }
  ];

  const descricao = ehTexto(config.slogan)
    ? `${config.slogan} ${conteudo.hero.subtitulo}`
    : conteudo.hero.subtitulo;

  return layout({
    ctx,
    tituloCompleto: `${config.marca}: ${conteudo.hero.titulo}`,
    descricao,
    caminho: "/",
    ogImagem: conteudo.hero.foto,
    preload: preloadImagem(ctx, conteudo.hero.foto, SIZES.hero),
    corpo,
    jsonLd,
    classeBody: "pagina-home"
  });
};
