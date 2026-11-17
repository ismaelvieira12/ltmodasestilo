// Home (seção 4 do DESIGN.md), na ordem da referência "AERIS":
//   banner de tela cheia (foto do computador e foto do celular, texto escuro por cima),
//   coleção com abas de categoria e busca, mosaico de 4 quadros (categorias e vídeos), vídeos,
//   benefícios, "Receba as novidades", Sobre, depoimentos, guia de medidas, dúvidas e trocas.
//   Barra de topo, cabeçalho (transparente sobre o banner), rodapé e painel de favoritos vêm do layout.
// Assinatura do contrato: renderHome(ctx) -> string

"use strict";

const layout = require("./layout.js");
const imagens = require("./imagens.js");

const { ROTULOS, ICONES } = layout;
const {
  botaoWhats, linkWhats, cartao, corDaPeca, tabela, segmentos, imagem, infoImagem, altFoto,
  fotoMaisAlta, precoCurto, textoComMarca, arrobaInstagram, nenhumPreco, imagemAmbiente,
  categoriasDasPecas, hrefCategoria, temVideos
} = layout.componentes;

// Peças à vista antes de "Ver todas as peças": uma linha de 6 no computador largo, duas de 3
// no tablet e no computador menor, três de 2 no celular. As abas e a busca mostram todas.
const MAXIMO_VISIVEL = 6;

// sizes dos layouts desta página (px reais de CSS, ver style.css)
const SIZES = {
  hero: "100vw",
  colecao: "(min-width: 1280px) 200px, (min-width: 1024px) calc(33vw - 32px), (min-width: 640px) calc(33vw - 24px), calc(50vw - 22px)",
  mosaicoAlto: "(min-width: 1280px) 470px, (min-width: 1024px) 37vw, 100vw",
  mosaico: "(min-width: 1280px) 390px, (min-width: 1024px) 31vw, 50vw",
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

// Ícone de um benefício (Phosphor, ver layout.js).
function iconeBeneficio(nome, tamanho) {
  return ICONES[ICONES_BENEFICIO[nome] || "whatsappLinha"](tamanho);
}

// srcset de uma foto com as versões menores; sem versões, só a própria foto.
function conjuntoDe(info) {
  return imagens.srcset(info) || `${info.src} ${info.largura}w`;
}

// ---------- 4.1 Banner de tela cheia ----------
// Uma foto ocupa a tela inteira, por baixo do cabeçalho transparente. Computador (e qualquer
// tela deitada): a foto deitada, com o texto à esquerda sobre a parede. Celular (tela em pé):
// a foto em pé, com o texto em cima. As duas são o LCP da sua tela, com preload por orientação.
// O texto é escuro: as fotos precisam ter área clara e lisa onde ele fica.
// A sentinela no alto avisa o app.js quando a página rolou, para o cabeçalho ganhar fundo.
function secaoHero(ctx) {
  const e = ctx.util.escapeHtml;
  const h = ctx.conteudo.hero;
  const deitada = infoImagem(ctx, h.foto);
  const emPe = ehTexto(h.fotoCelular) ? infoImagem(ctx, h.fotoCelular) : null;
  const principal = emPe || deitada;
  const img = `<img class="hero-foto" src="${e(principal.src)}" srcset="${e(conjuntoDe(principal))}" sizes="${SIZES.hero}" width="${principal.largura}" height="${principal.altura}" alt="" fetchpriority="high" decoding="async">`;
  const midia = emPe
    ? `<picture>
      <source media="(orientation: landscape)" srcset="${e(conjuntoDe(deitada))}" sizes="${SIZES.hero}" width="${deitada.largura}" height="${deitada.altura}">
      ${img}
    </picture>`
    : img;
  const cta = ehTexto(h.ctaTexto) ? h.ctaTexto : ROTULOS.catalogo;

  return `<section class="hero" aria-labelledby="hero-titulo">
  <span class="hero-sentinela" data-topo-sentinela aria-hidden="true"></span>
  <div class="hero-midia">
    ${midia}
  </div>
  <div class="container hero-conteudo">
    <div class="hero-texto">
      ${rotulo(ctx, h.rotulo)}
      <h1 id="hero-titulo">${textoComMarca(ctx, h.titulo)}</h1>
      <p class="hero-frase">${textoComMarca(ctx, h.subtitulo)}</p>
      <div class="hero-acoes">
        <a class="btn btn--tinta" href="#colecao">${e(cta)}${ICONES.seta(18)}</a>${temVideos(ctx) ? `
        <a class="link-play" href="#videos"><span class="link-play-circulo" aria-hidden="true">${ICONES.playFill(14)}</span>${ROTULOS.verVideos}</a>` : ""}
      </div>
    </div>
  </div>
</section>`;
}

// Preload das fotos do banner, uma por orientação de tela (a mesma regra do <picture>).
function preloadsHero(ctx) {
  const h = ctx.conteudo.hero;
  const deitada = infoImagem(ctx, h.foto);
  const base = (info) => ({ href: info.src, srcset: conjuntoDe(info), sizes: SIZES.hero });
  if (!ehTexto(h.fotoCelular)) return [base(deitada)];
  return [
    { ...base(deitada), media: "(orientation: landscape)" },
    { ...base(infoImagem(ctx, h.fotoCelular)), media: "(orientation: portrait)" }
  ];
}

// ---------- 4.2 Coleção (todas as peças, abas de categoria e busca) ----------
// Título centrado e, embaixo, as abas (Todas e as categorias de produtos.js) sublinhadas.
// Grade: 6 colunas no computador largo, 3 no tablet e no computador menor, 2 no celular.
function secaoColecao(ctx) {
  const { config, produtos, util, conteudo } = ctx;
  const e = util.escapeHtml;
  const categorias = categoriasDasPecas(ctx);
  const textos = conteudo.colecao || { titulo: "Coleção" };

  const abas = categorias.length
    ? `<div class="chips chips--filtro chips--abas" role="group" aria-label="Filtrar por categoria">
        <button type="button" class="chip chip--ativo" data-filtro="" data-slug="" aria-pressed="true">Todas</button>
        ${categorias.map((c) => `<button type="button" class="chip" data-filtro="${e(c)}" data-slug="${e(util.slugify(c))}" aria-pressed="false">${e(c)}</button>`).join("\n        ")}
      </div>`
    : "";

  const itens = produtos
    .map((p, i) => cartao(ctx, p, { revelar: true, filtravel: true, alem: i >= MAXIMO_VISIVEL, sizes: SIZES.colecao }))
    .join("\n");
  const avisoPreco = nenhumPreco(ctx) ? `\n      <p class="colecao-aviso">${ROTULOS.semPrecoColecao}</p>` : "";
  const maisPecas = produtos.length > MAXIMO_VISIVEL
    ? `<div class="colecao-mais">
      <button type="button" class="btn btn--secundario" data-mostrar-mais="grade-colecao">${ROTULOS.maisItens}</button>
    </div>`
    : "";
  const hrefGeral = util.linkWhats(config, config.mensagemGeral);

  return `<section class="secao colecao" id="colecao" aria-labelledby="colecao-titulo">
  <div class="container">
    <div class="colecao-cabeca">
      <h2 id="colecao-titulo">${textoComMarca(ctx, textos.titulo)}</h2>${avisoPreco}
      ${abas}
    </div>
    <div class="busca-resultado">
      <p class="busca-status" data-busca-status role="status"></p>
      <button type="button" class="link link--pequeno" data-busca-limpar hidden>Limpar busca</button>
    </div>
    <ul class="grade grade--colecao" id="grade-colecao" data-revelar-lote>
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

// ---------- 4.3 Mosaico (4 quadros: três categorias e a faixa escura dos vídeos) ----------
// Computador: o 1º quadro alto à esquerda ocupa duas linhas; o 2º e o 3º ficam lado a lado em
// cima; o 4º é uma faixa larga escura embaixo deles, com texto e a foto à direita.
// Celular: o 1º inteiro, o 2º e o 3º lado a lado, a faixa inteira.
// Cada quadro é um link só. As categorias filtram a coleção (o app.js aplica sem recarregar).
function destinoQuadro(ctx, m) {
  if (m.filtro === "videos") {
    return temVideos(ctx) ? { href: "#videos", texto: ROTULOS.verVideos } : { href: "#colecao", texto: ROTULOS.catalogo };
  }
  return { href: hrefCategoria(ctx, m.filtro), texto: ROTULOS.verPecas };
}

function secaoMosaico(ctx) {
  const e = ctx.util.escapeHtml;
  const quadros = lista(ctx.conteudo.mosaico);
  if (quadros.length !== 4) return "";
  const [alto, primeiro, segundo, faixa] = quadros;

  const quadro = (m, classe, sizes) => {
    const d = destinoQuadro(ctx, m);
    return `<li class="mosaico-item ${classe}">
        <a class="mosaico-quadro" href="${e(d.href)}" data-foto>
          ${imagem(ctx, m.foto, { alt: "", sizes, classe: "mosaico-foto" })}
          <span class="mosaico-texto"><span class="mosaico-titulo">${e(m.titulo)}</span><span class="mosaico-link">${d.texto}${ICONES.seta(16)}</span></span>
        </a>
      </li>`;
  };

  const df = destinoQuadro(ctx, faixa);
  const largo = `<li class="mosaico-item mosaico-item--largo">
        <a class="mosaico-faixa" href="${e(df.href)}">
          <span class="mosaico-faixa-texto">
            <span class="mosaico-titulo">${e(faixa.titulo)}</span>${ehTexto(faixa.texto) ? `
            <span class="mosaico-frase">${textoComMarca(ctx, faixa.texto)}</span>` : ""}
            <span class="mosaico-botao">${df.texto}${ICONES.seta(16)}</span>
          </span>
          <span class="mosaico-faixa-midia" data-foto>${imagem(ctx, faixa.foto, { alt: "", sizes: SIZES.mosaico, classe: "mosaico-foto" })}</span>
        </a>
      </li>`;

  return `<section class="secao mosaico" aria-label="Categorias">
  <div class="container">
    <ul class="mosaico-grade">
      ${quadro(alto, "mosaico-item--alto", SIZES.mosaicoAlto)}
      ${quadro(primeiro, "mosaico-item--a", SIZES.mosaico)}
      ${quadro(segundo, "mosaico-item--b", SIZES.mosaico)}
      ${largo}
    </ul>
  </div>
</section>`;
}

// ---------- 4.4 Vídeos (faixa de stories) ----------
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
            ${imagem(ctx, fotoMaisAlta(ctx, p), { sizes: layout.TAMANHOS.video })}
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
    <div class="cabeca-centro">
      <h2 id="videos-titulo">Peças em vídeo</h2>
      ${controles}
    </div>
    <ul class="videos-faixa" data-videos>
${comVideo.map((p) => cardVideo(ctx, p)).join("\n")}
    </ul>
  </div>
</section>`;
}

// ---------- 4.5 Benefícios (faixa com ícones entre duas linhas finas) ----------
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
    const corpo = `${iconeBeneficio(b.icone, 28)}<span class="beneficio-texto"><strong>${e(b.titulo)}</strong>${ehTexto(b.texto) ? `<span>${e(b.texto)}</span>` : ""}</span>`;
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

// ---------- 4.6 Receba as novidades ----------
// No lugar do cadastro por e-mail (não há servidor): um botão de WhatsApp com
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

// ---------- 4.7 Sobre ----------
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

// ---------- 4.8 Guia de medidas ----------
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

// ---------- 4.9 Dúvidas ----------
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
    <h2 id="duvidas-titulo">Dúvidas frequentes</h2>
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

// ---------- 4.10 Trocas (painel cinza claro, imagem de ambiente no desktop) ----------
function secaoTrocas(ctx) {
  const t = ctx.conteudo.trocas;
  const ambiente = ehTexto(t.ambiente)
    ? `<figure class="trocas-ambiente" data-foto>${imagemAmbiente(ctx, t.ambiente, { proporcao: [4, 3], larguras: [480, 800], sizes: "380px" })}</figure>`
    : "";
  return `<section class="secao trocas" id="trocas" aria-labelledby="trocas-titulo">
  <div class="container">
    <div class="trocas-painel">
      <div class="trocas-texto">
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
    secaoColecao(ctx),
    secaoMosaico(ctx),
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
    preload: preloadsHero(ctx),
    corpo,
    jsonLd,
    classeBody: "pagina-home"
  });
};
