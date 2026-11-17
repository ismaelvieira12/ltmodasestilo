// Comportamento do catálogo, sem dependências.
// Tudo aqui é opcional: sem JS, os links de WhatsApp já saem prontos do build,
// a galeria rola com snap nativo, o FAQ abre com <details> e as seções nascem visíveis.
//
// Blocos: 1 utm/ref, 2 mensagens e links de WhatsApp, 3 Pixel da Meta, 4 tamanho,
// 5 barra fixa do CTA, 6 faixas com indicador, 7 galeria do desktop, 8 menu do celular,
// 9 revelação suave, 10 imagens, 11 coleção (busca, filtro, mostrar mais, prefetch, fotos do topo),
// 12 blocos de informação, 13 vídeo da peça, 14 faixa de vídeos da home, 15 favoritos.
// Sintaxe até ES2017 (WebViews Android antigas): sem optional chaining nem nullish coalescing.

// A classe js libera os estilos que dependem de script (revelação, fade de imagem) e esconde o que
// só funciona com script (botão Menu, dica de tamanho). Ela já vem de um script de uma linha no <head>,
// para nada mudar de lugar quando este arquivo carregar; aqui fica de reforço.
// A classe app avisa o CSS de que este arquivo rodou (desliga a rede de segurança da revelação).
document.documentElement.classList.add("js", "app");

(function () {
  "use strict";

  var cfg = window.CONFIG_CLIENTE || {};
  // Subpasta do site quando publicado fora da raiz (ex: GitHub Pages em "/ltmodasestilo"); "" na raiz.
  var BASE = String(cfg.base || "").replace(/\/+$/, "");
  var produto = window.PRODUTO || null;
  var reduzMovimento = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var desktop = function () { return window.matchMedia && window.matchMedia("(min-width: 1024px)").matches; };
  var temIO = "IntersectionObserver" in window;
  var economizaDados = Boolean(navigator.connection && navigator.connection.saveData);
  // Vídeo toca sozinho (mudo) só sem prefers-reduced-motion e sem economia de dados.
  var autoplayLiberado = !reduzMovimento && !economizaDados && temIO;
  // Funções que reavaliam quem toca (blocos 13 e 14), chamadas pela galeria e pela troca de aba.
  var avaliadoresVideo = [];
  var avaliadoresFaixa = [];

  var formatador = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  function formatarPreco(n) { return formatador.format(Number(n) || 0).replace(/\s/g, " "); }

  function todos(seletor, raiz) { return Array.prototype.slice.call((raiz || document).querySelectorAll(seletor)); }

  // ---------- 1. Origem do anúncio (utm_campaign ou utm_source), guardada na sessão ----------
  var ref = "";
  try {
    var qs = new URLSearchParams(location.search);
    ref = qs.get("utm_campaign") || qs.get("utm_source") || "";
    if (ref) sessionStorage.setItem("ref", ref);
    else ref = sessionStorage.getItem("ref") || "";
  } catch (e) { /* sem suporte, segue sem ref */ }
  ref = String(ref).replace(/[\r\n]+/g, " ").trim().slice(0, 80);

  // ---------- 2. Mensagens e links de WhatsApp ----------
  // semOrigem: a mensagem de troca termina em "Número do pedido: " para a pessoa completar;
  // a linha do anúncio depois dela atrapalharia (e troca não é conversão de anúncio).
  function linkWhats(mensagem, semOrigem) {
    var numero = String(cfg.whatsapp || "").replace(/\D/g, "");
    var texto = mensagem + (ref && !semOrigem ? "\n(vi pelo anúncio: " + ref + ")" : "");
    return "https://wa.me/" + numero + "?text=" + encodeURIComponent(texto);
  }

  function tamanhoEscolhido() {
    var marcado = document.querySelector('input[name="tamanho"]:checked');
    return marcado ? marcado.value : "";
  }

  // Mesma regra de util.preencherMensagem (src/util.js):
  //   {cor} ", cor Azul royal" ou vazio; {tamanho} ", tamanho M" ou ", tamanho a confirmar";
  //   {preco} " (R$ 159,90)" ou vazio sem preço ("({preco})" antigo vira {preco});
  //   {link} recebe a URL da peça; sem {link}, a URL entra numa linha no fim.
  function preencherMensagem(modelo, dados, url) {
    var texto = String(modelo || "").replace(/\s*\(\{preco\}\)/g, "{preco}");
    var trocas = [
      ["{produto}", dados.produto || ""],
      ["{cor}", dados.cor ? ", cor " + dados.cor : ""],
      ["{tamanho}", dados.tamanho ? ", tamanho " + dados.tamanho : ", tamanho a confirmar"],
      ["{preco}", dados.preco ? " (" + dados.preco + ")" : ""]
    ];
    trocas.forEach(function (t) { texto = texto.split(t[0]).join(t[1]); });
    if (!url) return texto;
    return texto.indexOf("{link}") >= 0 ? texto.split("{link}").join(url) : texto + "\n" + url;
  }

  function temPreco() {
    return Boolean(produto) && typeof produto.preco === "number" && produto.preco > 0;
  }

  // Mesma ordem de src/produto.js: esgotado, sem preço (pergunta o valor), mensagem da peça.
  function modeloProduto() {
    if (produto.esgotado && cfg.mensagemEsgotado) return cfg.mensagemEsgotado;
    if (!temPreco() && cfg.mensagemProdutoSemPreco) return cfg.mensagemProdutoSemPreco;
    return cfg.mensagemProduto || "";
  }

  function mensagemProduto() {
    var modelo = modeloProduto();
    return preencherMensagem(modelo, {
      produto: produto.nome,
      cor: produto.cor || "",
      tamanho: tamanhoEscolhido(),
      preco: temPreco() ? formatarPreco(produto.preco) : ""
    }, produto.url || location.href.split("#")[0]);
  }

  // data-whats="trocas" usa a mensagem de troca; "medidas", a de ajuda com o tamanho;
  // "novidades", a de novidades; os demais, a geral. "busca" e "favoritas" são montadas
  // pelos blocos 11 e 15 (com o termo buscado e com a lista de favoritas).
  function mensagemDoLink(el) {
    var tipo = el.getAttribute("data-whats");
    if (tipo === "trocas" && cfg.mensagemTrocas) return cfg.mensagemTrocas;
    if (tipo === "medidas" && cfg.mensagemMedidas) return cfg.mensagemMedidas;
    if (tipo === "novidades" && cfg.mensagemNovidades) return cfg.mensagemNovidades;
    return cfg.mensagemGeral;
  }

  function atualizarLinks() {
    todos("[data-whats]").forEach(function (el) {
      var tipo = el.getAttribute("data-whats");
      if (tipo === "busca" || tipo === "favoritas") return;
      var mensagem = mensagemDoLink(el);
      if (mensagem) el.href = linkWhats(mensagem, el.getAttribute("data-whats") === "trocas");
    });
    if (produto) {
      var href = linkWhats(mensagemProduto());
      todos("[data-whats-produto]").forEach(function (el) { el.href = href; });
    }
  }
  atualizarLinks();

  // ---------- 3. Pixel da Meta (só com pixelId preenchido) ----------
  // Sem preço, value e currency ficam de fora (a Meta trataria value: null como erro).
  function dadosPixelProduto(extra) {
    var dados = {
      content_ids: [produto.sku || produto.slug],
      content_name: produto.nome,
      content_type: "product"
    };
    if (temPreco()) {
      dados.value = produto.preco;
      dados.currency = "BRL";
    }
    Object.keys(extra || {}).forEach(function (k) { dados[k] = extra[k]; });
    return dados;
  }

  if (cfg.pixelId) {
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,"script","https://connect.facebook.net/en_US/fbevents.js");
    /* eslint-enable */
    window.fbq("init", String(cfg.pixelId));
    window.fbq("track", "PageView");
    if (produto) window.fbq("track", "ViewContent", dadosPixelProduto());
  }

  function registrar(evento, dados) {
    if (typeof window.fbq === "function") window.fbq("track", evento, dados || {});
  }

  // Primeiro toque no botão da barra fixa sem tamanho escolhido: em vez de abrir o WhatsApp com
  // "tamanho a confirmar", leva até os chips, foca o primeiro disponível e avisa "Escolha o tamanho".
  // O segundo toque segue normal. Sem JS, o href já pronto funciona como sempre.
  function pedirTamanhoAntes(alvo, ev) {
    if (!produto || produto.esgotado || tamanhoEscolhido()) return false;
    var barraFixa = alvo.closest("[data-barra-fixa]");
    var primeiroChip = document.querySelector('input[name="tamanho"]:not(:disabled)');
    if (!barraFixa || barraFixa.hasAttribute("data-avisado") || !primeiroChip) return false;
    ev.preventDefault();
    barraFixa.setAttribute("data-avisado", "");
    var grupo = document.querySelector("[data-tamanhos]");
    if (grupo) {
      grupo.classList.add("tamanhos--aviso");
      grupo.scrollIntoView({ block: "center", behavior: reduzMovimento ? "auto" : "smooth" });
    }
    try { primeiroChip.focus({ preventScroll: true }); } catch (e) { primeiroChip.focus(); }
    var aviso = document.querySelector("[data-aviso-tamanho]");
    if (aviso) aviso.textContent = "Escolha o tamanho";
    return true;
  }

  // Clique em qualquer botão de WhatsApp: evento Contact e rótulo "Abrindo o WhatsApp" por 1,5 s.
  var NOMES_CONTATO = { trocas: "whatsapp_trocas", medidas: "whatsapp_medidas", busca: "whatsapp_busca", novidades: "whatsapp_novidades", favoritas: "whatsapp_favoritas" };
  document.addEventListener("click", function (ev) {
    var alvo = ev.target.closest ? ev.target.closest("[data-whats], [data-whats-produto]") : null;
    if (!alvo) return;
    if (alvo.hasAttribute("data-whats-produto") && pedirTamanhoAntes(alvo, ev)) return;

    if (alvo.hasAttribute("data-whats-produto") && produto) {
      registrar("Contact", dadosPixelProduto({ tamanho: tamanhoEscolhido() || "a confirmar" }));
    } else {
      registrar("Contact", { content_name: NOMES_CONTATO[alvo.getAttribute("data-whats")] || "whatsapp_geral" });
    }

    var rotulo = alvo.querySelector("[data-rotulo]");
    if (rotulo && !alvo.classList.contains("abrindo")) {
      var original = rotulo.textContent;
      alvo.classList.add("abrindo");
      rotulo.textContent = "Abrindo o WhatsApp";
      setTimeout(function () {
        rotulo.textContent = original;
        alvo.classList.remove("abrindo");
      }, 1500);
    }
  });

  // ---------- 4. Tamanho escolhido entra na mensagem, na legenda e na barra fixa ----------
  var radios = todos('input[name="tamanho"]');
  if (radios.length) {
    var legendaEscolha = document.querySelector("[data-tamanho-escolhido]");
    var dica = document.querySelector("[data-dica-tamanho]");
    var barraTamanho = document.querySelector("[data-barra-tamanho]");
    var avisoTamanho = document.querySelector("[data-aviso-tamanho]");
    var grupoTamanhos = document.querySelector("[data-tamanhos]");

    function aoTrocarTamanho() {
      var tamanho = tamanhoEscolhido();
      radios.forEach(function (r) {
        var chip = r.closest(".chip");
        if (chip) chip.classList.toggle("chip--ativo", r.checked);
      });
      if (legendaEscolha) legendaEscolha.textContent = tamanho ? ": " + tamanho : "";
      if (dica) dica.hidden = Boolean(tamanho);
      if (barraTamanho && tamanho) barraTamanho.textContent = "Tamanho: " + tamanho;
      if (tamanho && avisoTamanho) avisoTamanho.textContent = "";
      if (tamanho && grupoTamanhos) grupoTamanhos.classList.remove("tamanhos--aviso");
      atualizarLinks();
    }

    var temHas = false;
    try { temHas = window.CSS && CSS.supports && CSS.supports("selector(:has(a))"); } catch (e) { /* sem suporte */ }
    radios.forEach(function (r) {
      r.addEventListener("change", aoTrocarTamanho);
      if (temHas) return;
      // Anel de foco no chip para navegadores sem :has().
      r.addEventListener("focus", function () { var c = r.closest(".chip"); if (c) c.classList.add("chip--foco"); });
      r.addEventListener("blur", function () { var c = r.closest(".chip"); if (c) c.classList.remove("chip--foco"); });
    });
    aoTrocarTamanho();
  }

  // Âncora para um <details> fechado (ex: "Guia de medidas" no desktop) abre o bloco antes de rolar.
  document.addEventListener("click", function (ev) {
    var a = ev.target.closest ? ev.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var alvo = document.getElementById(a.getAttribute("href").slice(1));
    if (alvo && alvo.tagName === "DETAILS") alvo.open = true;
  });

  // ---------- 5. Barra fixa do CTA: aparece só quando o botão do corpo sai da tela ----------
  var barra = document.querySelector("[data-barra-fixa]");
  var ctaInline = document.querySelector("[data-cta-inline]");
  if (barra && ctaInline && temIO) {
    // Com a barra à vista, o ícone de WhatsApp do topo some (visibility, sem mudar nada de lugar):
    // nunca dois botões iguais na tela.
    var observadorCta = new IntersectionObserver(function (entradas) {
      var visivelInline = entradas[entradas.length - 1].isIntersecting;
      var mostrar = !visivelInline && !desktop();
      barra.classList.toggle("visivel", mostrar);
      barra.setAttribute("aria-hidden", mostrar ? "false" : "true");
      if ("inert" in barra) barra.inert = !mostrar;
      document.body.classList.toggle("barra-visivel", mostrar);
    }, { threshold: 0 });
    observadorCta.observe(ctaInline);
  }

  // ---------- 6. Faixas com scroll-snap e indicador de segmentos ----------
  todos("[data-faixa]").forEach(function (faixa) {
    var indicador = faixa.id ? document.querySelector('[data-segmentos="' + faixa.id + '"]') : null;
    if (!indicador || !temIO) return;
    var itens = Array.prototype.slice.call(faixa.children);
    var pontos = Array.prototype.slice.call(indicador.children);
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (!en.isIntersecting) return;
        var i = itens.indexOf(en.target);
        pontos.forEach(function (p, j) { p.classList.toggle("ativo", j === i); });
      });
    }, { root: faixa, threshold: 0.6 });
    itens.forEach(function (li) { observador.observe(li); });
  });

  // ---------- 7. Galeria da peça: miniaturas (desktop), foto ampliada e atalho para o vídeo ----------
  var galeria = document.querySelector("[data-galeria]");
  if (galeria) {
    var faixaGaleria = galeria.querySelector(".galeria-faixa");
    var fotos = faixaGaleria ? Array.prototype.slice.call(faixaGaleria.children) : [];
    var miniaturas = todos("[data-miniatura]", galeria);
    var dialogo = document.querySelector("[data-galeria-dialog]");
    var imagemDialogo = dialogo ? dialogo.querySelector("img") : null;

    // Os itens seguem a ordem das miniaturas (foto principal, vídeo, demais fotos).
    function ativarFoto(indice) {
      fotos.forEach(function (li, i) { li.classList.toggle("ativa", i === indice); });
      miniaturas.forEach(function (b, i) { b.setAttribute("aria-pressed", i === indice ? "true" : "false"); });
      avaliarVideos();
    }

    miniaturas.forEach(function (botao, i) {
      botao.addEventListener("click", function () { ativarFoto(i); });
      botao.addEventListener("keydown", function (ev) {
        var passo = 0;
        if (ev.key === "ArrowDown" || ev.key === "ArrowRight") passo = 1;
        if (ev.key === "ArrowUp" || ev.key === "ArrowLeft") passo = -1;
        if (!passo) return;
        ev.preventDefault();
        var proximo = (i + passo + miniaturas.length) % miniaturas.length;
        miniaturas[proximo].focus();
        ativarFoto(proximo);
      });
    });

    // Foto ampliada (celular e desktop). Cada foto vira um botão acessível pelo teclado
    // (Enter ou Espaço); ao fechar, o foco volta para a foto de origem.
    if (dialogo && imagemDialogo && typeof dialogo.showModal === "function" && faixaGaleria) {
      var fotosAmpliaveis = todos("li:not([data-video]) img", faixaGaleria);
      var origemFoco = null;
      fotosAmpliaveis.forEach(function (img, i) {
        img.setAttribute("tabindex", "0");
        img.setAttribute("role", "button");
        img.setAttribute("aria-label", fotosAmpliaveis.length > 1 ? "Ampliar a foto " + (i + 1) + " de " + fotosAmpliaveis.length : "Ampliar a foto");
      });
      function ampliar(img) {
        origemFoco = img;
        imagemDialogo.src = img.currentSrc || img.src;
        imagemDialogo.alt = img.alt;
        dialogo.showModal();
      }
      faixaGaleria.addEventListener("click", function (ev) {
        var img = ev.target.closest ? ev.target.closest("img[role='button']") : null;
        if (img) ampliar(img);
      });
      faixaGaleria.addEventListener("keydown", function (ev) {
        var img = ev.target.closest ? ev.target.closest("img[role='button']") : null;
        if (!img || (ev.key !== "Enter" && ev.key !== " ")) return;
        ev.preventDefault();
        ampliar(img);
      });
      dialogo.addEventListener("click", function (ev) {
        if (ev.target === dialogo || (ev.target.closest && ev.target.closest("[data-fechar-dialog]"))) dialogo.close();
      });
      dialogo.addEventListener("close", function () {
        if (!origemFoco) return;
        try { origemFoco.focus({ preventScroll: true }); } catch (e) { origemFoco.focus(); }
        origemFoco = null;
      });
    }

    // Atalho para o vídeo: os cards da faixa da home chegam com #video, e o link "Ver o vídeo"
    // (celular) pula para o slide. No celular a faixa rola na horizontal; no desktop, o vídeo vira o item ativo.
    var indiceVideo = -1;
    fotos.forEach(function (li, i) { if (li.hasAttribute("data-video")) indiceVideo = i; });
    function irParaVideo(suave) {
      if (indiceVideo < 0 || !faixaGaleria) return;
      if (desktop()) {
        ativarFoto(indiceVideo);
        return;
      }
      var destino = indiceVideo * faixaGaleria.clientWidth;
      if (suave && !reduzMovimento && "scrollBehavior" in document.documentElement.style) {
        faixaGaleria.scrollTo({ left: destino, behavior: "smooth" });
      } else {
        faixaGaleria.scrollLeft = destino;
      }
    }
    if (location.hash === "#video") irParaVideo(false);
    // Links "Ver o vídeo" (sob a galeria e nas garantias): sobem até a galeria se preciso
    // e mostram o vídeo (slide no celular, miniatura ativa no desktop).
    todos("[data-ver-video]").forEach(function (link) {
      link.addEventListener("click", function (ev) {
        ev.preventDefault();
        var topoGaleria = galeria.getBoundingClientRect().top;
        if (topoGaleria < 0 || topoGaleria > window.innerHeight * 0.5) {
          galeria.scrollIntoView({ block: "start", behavior: reduzMovimento ? "auto" : "smooth" });
        }
        irParaVideo(true);
      });
    });
  }

  // ---------- 8. Menu do celular (dialog em tela cheia) ----------
  var menu = document.getElementById("menu");
  var botaoMenu = document.querySelector("[data-abrir-menu]");
  if (menu && botaoMenu && typeof menu.showModal === "function") {
    botaoMenu.addEventListener("click", function () {
      menu.showModal();
      botaoMenu.setAttribute("aria-expanded", "true");
      var primeiro = menu.querySelector(".menu-nav a");
      if (primeiro) primeiro.focus();
    });
    menu.addEventListener("close", function () {
      botaoMenu.setAttribute("aria-expanded", "false");
      botaoMenu.focus();
    });
    todos("[data-fechar-menu]", menu).forEach(function (b) { b.addEventListener("click", function () { menu.close(); }); });
    todos("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.close(); }); });
  } else if (botaoMenu) {
    botaoMenu.hidden = true;
  }

  // ---------- 9. Revelação suave (uma vez, só sem prefers-reduced-motion) ----------
  var alvosRevelar = todos("[data-revelar]");
  if (alvosRevelar.length) {
    if (temIO && !reduzMovimento) {
      todos("[data-revelar-lote]").forEach(function (lote) {
        todos("[data-revelar]", lote).forEach(function (el, i) {
          el.style.setProperty("--atraso", ((i % 6) * 60) + "ms");
        });
      });
      var observadorRevelar = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (en) {
          if (!en.isIntersecting) return;
          en.target.classList.add("revelado");
          observadorRevelar.unobserve(en.target);
        });
      }, { threshold: 0.15, rootMargin: "0px 0px -5% 0px" });
      alvosRevelar.forEach(function (el) { observadorRevelar.observe(el); });
      // Segurança: se o observador não disparar (WebView antiga), nada fica invisível.
      setTimeout(function () {
        alvosRevelar.forEach(function (el) { el.classList.add("revelado"); });
        observadorRevelar.disconnect();
      }, 4000);
    } else {
      alvosRevelar.forEach(function (el) { el.classList.add("revelado"); });
    }
  }

  // ---------- 10. Imagens: fade ao carregar e placeholder quando falham ----------
  function marcarImagem(img) {
    function ok() { img.classList.add("carregada"); }
    function falhou() {
      img.classList.add("carregada");
      var caixa = img.closest ? img.closest("[data-foto]") : null;
      if (caixa) caixa.classList.add("foto--vazia");
    }
    if (img.complete && img.naturalWidth > 0) ok();
    else if (img.complete && img.getAttribute("src")) falhou();
    else {
      img.addEventListener("load", ok, { once: true });
      img.addEventListener("error", falhou, { once: true });
    }
  }
  todos("img[data-fade]").forEach(marcarImagem);
  // Fotos sem fade (hero, primeira da peça) também ganham o placeholder se falharem.
  todos("[data-foto] img:not([data-fade])").forEach(function (img) {
    function falhou() { var caixa = img.closest("[data-foto]"); if (caixa) caixa.classList.add("foto--vazia"); }
    if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) falhou();
    else img.addEventListener("error", falhou, { once: true });
  });

  // ---------- 11. Coleção: busca, filtros, mostrar mais, cards e carrosséis ----------
  // Busca sem acento e sem maiúscula por nome, cor e categoria (data-busca já sai normalizado
  // do build). Todas as palavras precisam aparecer. Na home, filtra a grade na própria página;
  // fora dela, leva a /?busca=termo#colecao. A categoria vem dos chips, dos círculos, do mosaico
  // e da linha de categorias (?categoria=slug). Uma busca nova zera a categoria e vice-versa.
  function normalizar(texto) {
    var t = String(texto == null ? "" : texto);
    if (t.normalize) t = t.normalize("NFD").replace(/[̀-ͯ]/g, "");
    return t.toLowerCase().replace(/\s+/g, " ").trim();
  }

  var gradeColecao = document.getElementById("grade-colecao");
  var ehHome = Boolean(gradeColecao);
  var itensColecao = gradeColecao ? todos("[data-busca]", gradeColecao) : [];
  var chipsFiltro = todos("[data-filtro]");
  var statusBusca = document.querySelector("[data-busca-status]");
  var botaoLimpar = document.querySelector("[data-busca-limpar]");
  var blocoVazio = document.querySelector("[data-busca-vazia]");
  var termoVazio = document.querySelector("[data-busca-termo]");
  var linkVazio = blocoVazio ? blocoVazio.querySelector("[data-whats]") : null;
  var botaoMais = document.querySelector("[data-mostrar-mais]");
  var formBusca = document.querySelector("[data-busca-form]");
  var campoBusca = document.querySelector("[data-busca-campo]");
  var botaoAbrirBusca = document.querySelector("[data-abrir-busca]");
  var filtroCategoria = "";
  var termoBusca = "";
  var mostrouTudo = false;

  function frasePecas(n) { return n === 1 ? "1 peça" : n + " peças"; }

  function aplicarFiltros() {
    var termos = normalizar(termoBusca).split(" ").filter(Boolean);
    var filtrando = Boolean(filtroCategoria) || termos.length > 0;
    var visiveis = 0;
    itensColecao.forEach(function (li) {
      var texto = li.getAttribute("data-busca") || "";
      var okCategoria = !filtroCategoria || li.getAttribute("data-categoria") === filtroCategoria;
      var okBusca = termos.every(function (t) { return texto.indexOf(t) >= 0; });
      var alem = li.hasAttribute("data-alem") && !mostrouTudo && !filtrando;
      var mostra = okCategoria && okBusca && !alem;
      li.hidden = !mostra;
      if (mostra) {
        visiveis++;
        li.classList.add("revelado");
      }
    });
    chipsFiltro.forEach(function (b) {
      var ativo = (b.getAttribute("data-filtro") || "") === filtroCategoria;
      b.classList.toggle("chip--ativo", ativo);
      b.setAttribute("aria-pressed", ativo ? "true" : "false");
      // No celular a fila de chips rola de lado: traz o chip ativo para dentro da tela
      // (mexe só na fila, sem rolar a página).
      var fila = b.parentNode;
      if (ativo && fila && fila.scrollWidth > fila.clientWidth) {
        var rc = b.getBoundingClientRect();
        var rf = fila.getBoundingClientRect();
        if (rc.left < rf.left || rc.right > rf.right) fila.scrollLeft += rc.left - rf.left - 16;
      }
    });
    var rotulo = termoBusca || filtroCategoria;
    if (statusBusca) {
      statusBusca.textContent = !filtrando ? "" : (visiveis
        ? frasePecas(visiveis) + (termos.length ? " para “" + termoBusca + "”" : " em " + filtroCategoria)
        : "Nenhuma peça encontrada para “" + rotulo + "”");
      // Com zero peças, o bloco vazio já mostra a frase: o status fica só para o leitor de tela.
      statusBusca.classList.toggle("vo", filtrando && visiveis === 0);
    }
    if (botaoLimpar) botaoLimpar.hidden = !termos.length;
    if (blocoVazio) {
      blocoVazio.hidden = !filtrando || visiveis > 0;
      if (termoVazio) termoVazio.textContent = "“" + rotulo + "”";
      if (linkVazio && cfg.mensagemBusca) linkVazio.href = linkWhats(cfg.mensagemBusca.split("{termo}").join(rotulo));
    }
    if (botaoMais) botaoMais.hidden = filtrando || mostrouTudo;
  }

  function atualizarEndereco() {
    if (!ehHome || !window.history || !history.replaceState) return;
    var partes = [];
    if (termoBusca) partes.push("busca=" + encodeURIComponent(termoBusca));
    var chip = chipsFiltro.filter(function (b) { return (b.getAttribute("data-filtro") || "") === filtroCategoria; })[0];
    if (filtroCategoria && chip) partes.push("categoria=" + chip.getAttribute("data-slug"));
    history.replaceState(null, "", BASE + "/" + (partes.length ? "?" + partes.join("&") : "") + location.hash);
  }

  function rolarParaColecao() {
    var alvo = document.getElementById("colecao");
    if (alvo) alvo.scrollIntoView({ behavior: reduzMovimento ? "auto" : "smooth", block: "start" });
  }

  function buscar(termo, rolar) {
    termoBusca = String(termo || "").trim();
    filtroCategoria = "";
    if (campoBusca && campoBusca.value !== termoBusca) campoBusca.value = termoBusca;
    aplicarFiltros();
    atualizarEndereco();
    if (rolar) rolarParaColecao();
  }

  function filtrarCategoria(nome, rolar) {
    filtroCategoria = nome || "";
    termoBusca = "";
    if (campoBusca) campoBusca.value = "";
    aplicarFiltros();
    atualizarEndereco();
    if (rolar) rolarParaColecao();
  }

  function categoriaPorSlug(slug) {
    var chip = chipsFiltro.filter(function (b) { return b.getAttribute("data-slug") === slug; })[0];
    return chip ? chip.getAttribute("data-filtro") || "" : "";
  }

  chipsFiltro.forEach(function (botao) {
    botao.addEventListener("click", function () { filtrarCategoria(botao.getAttribute("data-filtro") || "", false); });
  });

  if (botaoMais) {
    botaoMais.addEventListener("click", function () {
      mostrouTudo = true;
      aplicarFiltros();
    });
  }
  if (botaoLimpar) {
    botaoLimpar.addEventListener("click", function () {
      buscar("", false);
      if (campoBusca) campoBusca.focus();
    });
  }

  // Busca do cabeçalho: na home filtra na hora (enquanto digita) e rola ao enviar.
  if (formBusca && campoBusca) {
    formBusca.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var termo = campoBusca.value.trim();
      if (!ehHome) {
        location.href = BASE + "/?busca=" + encodeURIComponent(termo) + "#colecao";
        return;
      }
      buscar(termo, true);
      campoBusca.blur();
    });
    if (ehHome) {
      var esperaBusca = null;
      campoBusca.addEventListener("input", function () {
        clearTimeout(esperaBusca);
        esperaBusca = setTimeout(function () { buscar(campoBusca.value, false); }, 200);
      });
    }
  }

  // A lupa abre e fecha a linha da busca logo abaixo do cabeçalho; Esc no campo fecha e
  // devolve o foco à lupa.
  var linhaBusca = formBusca ? formBusca.closest(".topo-busca") : null;
  function abrirBusca(aberta) {
    if (!formBusca) return;
    formBusca.classList.toggle("busca--aberta", aberta);
    if (linhaBusca) linhaBusca.classList.toggle("topo-busca--aberta", aberta);
    if (botaoAbrirBusca) botaoAbrirBusca.setAttribute("aria-expanded", aberta ? "true" : "false");
  }
  if (botaoAbrirBusca && formBusca) {
    botaoAbrirBusca.addEventListener("click", function () {
      var aberta = !formBusca.classList.contains("busca--aberta");
      abrirBusca(aberta);
      if (aberta && campoBusca) campoBusca.focus();
    });
    if (campoBusca) {
      campoBusca.addEventListener("keydown", function (ev) {
        if (ev.key !== "Escape") return;
        abrirBusca(false);
        botaoAbrirBusca.focus();
      });
    }
  }

  // Links que filtram a coleção (círculos, mosaico, categorias, banner "/?busca=..."):
  // na home, aplicam o filtro sem recarregar; nas outras páginas, seguem para a home.
  document.addEventListener("click", function (ev) {
    if (!ehHome) return;
    var a = ev.target.closest ? ev.target.closest("a[href]") : null;
    if (!a) return;
    var href = a.getAttribute("href") || "";
    if (href.indexOf(BASE + "/?") !== 0 || href.indexOf("#colecao") < 0) return;
    var params;
    try { params = new URLSearchParams(href.slice(BASE.length + 2).split("#")[0]); } catch (e) { return; }
    ev.preventDefault();
    if (params.get("busca") !== null) buscar(params.get("busca"), true);
    else filtrarCategoria(categoriaPorSlug(params.get("categoria") || ""), true);
  });

  // Ao abrir a home com ?busca= ou ?categoria=, o filtro já vem aplicado.
  if (ehHome) {
    try {
      var paramsIniciais = new URLSearchParams(location.search);
      var buscaInicial = paramsIniciais.get("busca");
      var categoriaInicial = paramsIniciais.get("categoria");
      if (buscaInicial) {
        buscar(buscaInicial, false);
        abrirBusca(true);
      } else if (categoriaInicial) {
        filtrarCategoria(categoriaPorSlug(categoriaInicial), false);
      }
      if ((buscaInicial || categoriaInicial) && location.hash === "#colecao") {
        setTimeout(function () {
          var alvo = document.getElementById("colecao");
          if (alvo) alvo.scrollIntoView({ block: "start" });
        }, 0);
      }
    } catch (e) { /* sem URLSearchParams: segue sem filtro */ }
  }

  // Segunda foto do card (troca no hover): sai do build sem src. Só aparelhos com hover a carregam,
  // no primeiro pointerenter do card; no celular ela nunca é baixada.
  var temHover = window.matchMedia && window.matchMedia("(hover: hover)").matches;
  if (temHover) {
    todos(".cartao-link").forEach(function (link) {
      var segunda = link.querySelector("img.cartao-foto-2[data-src]");
      if (!segunda) return;
      link.addEventListener("pointerenter", function () {
        if (segunda.getAttribute("src")) return;
        segunda.addEventListener("load", function () { segunda.classList.add("carregada"); }, { once: true });
        var conjunto = segunda.getAttribute("data-srcset");
        if (conjunto) segunda.setAttribute("srcset", conjunto);
        segunda.setAttribute("src", segunda.getAttribute("data-src"));
      });
    });
  }

  if (!economizaDados) {
    var prefetchados = {};
    function prefetch(ev) {
      var link = ev.currentTarget;
      var href = (link.getAttribute("href") || "").split("#")[0];
      if (!href || prefetchados[href]) return;
      prefetchados[href] = true;
      var el = document.createElement("link");
      el.rel = "prefetch";
      el.href = href;
      document.head.appendChild(el);
    }
    todos(".cartao-link, .video-card-link").forEach(function (a) {
      a.addEventListener("pointerenter", prefetch, { passive: true });
      a.addEventListener("touchstart", prefetch, { passive: true });
    });
  }

  // Carrosséis de vitrine (Novidades, "Você também pode gostar"): setas no desktop com mouse.
  todos("[data-carrossel]").forEach(function (c) {
    var faixa = c.querySelector("[data-carrossel-faixa]");
    var itens = faixa ? Array.prototype.slice.call(faixa.children) : [];
    if (!temIO || itens.length < 2) return;
    ligarSetas(faixa, itens, c.querySelector("[data-carrossel-anterior]"), c.querySelector("[data-carrossel-proxima]"));
  });

  // ---------- 11b. Fotos do topo (carrossel) ----------
  // Troca sozinho a cada 6 s, só sem movimento reduzido; pausa com o mouse em cima, com o foco
  // dentro, com a aba escondida e pelo botão de pausa. A numeração 01, 02, 03 leva a qualquer
  // foto; no celular, arrastar também (scroll-snap). A foto atual vem de um IntersectionObserver.
  function iniciarBanner(raiz) {
    var faixa = raiz.querySelector("[data-banner-faixa]");
    var slides = todos("[data-banner-slide]", raiz);
    var controles = raiz.querySelector("[data-banner-controles]");
    if (!faixa || slides.length < 2 || !controles || !temIO) return;
    controles.hidden = false;
    var pontos = todos("[data-banner-ponto]", controles);
    var pausa = controles.querySelector("[data-banner-pausa]");
    var INTERVALO = 6000;
    var atual = 0;
    var tocando = !reduzMovimento;
    var mouseEmCima = false;
    var focoDentro = false;
    var relogio = null;

    function irPara(indice, suave) {
      var n = (indice + slides.length) % slides.length;
      var destino = n * faixa.clientWidth;
      if (suave && !reduzMovimento && "scrollBehavior" in document.documentElement.style) {
        faixa.scrollTo({ left: destino, behavior: "smooth" });
      } else {
        faixa.scrollLeft = destino;
      }
    }

    function agendar() {
      clearTimeout(relogio);
      if (!tocando || mouseEmCima || focoDentro || document.hidden) return;
      relogio = setTimeout(function () { irPara(atual + 1, true); }, INTERVALO);
    }

    function atualizarPausa() {
      if (!pausa) return;
      pausa.setAttribute("data-estado", tocando ? "tocando" : "pausado");
      pausa.setAttribute("aria-label", tocando ? "Pausar fotos" : "Tocar fotos");
    }

    var observadorSlides = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (en.intersectionRatio < 0.6) return;
        atual = slides.indexOf(en.target);
        pontos.forEach(function (p, i) {
          if (i === atual) p.setAttribute("aria-current", "true");
          else p.removeAttribute("aria-current");
        });
      });
      agendar();
    }, { root: faixa, threshold: [0, 0.6, 1] });
    slides.forEach(function (s) { observadorSlides.observe(s); });

    pontos.forEach(function (p, i) { p.addEventListener("click", function () { irPara(i, true); }); });
    var anterior = controles.querySelector("[data-banner-anterior]");
    var proximo = controles.querySelector("[data-banner-proximo]");
    if (anterior) anterior.addEventListener("click", function () { irPara(atual - 1, true); });
    if (proximo) proximo.addEventListener("click", function () { irPara(atual + 1, true); });
    if (pausa) {
      pausa.addEventListener("click", function () {
        tocando = !tocando;
        atualizarPausa();
        agendar();
      });
    }
    raiz.addEventListener("pointerenter", function (ev) { if (ev.pointerType === "mouse") { mouseEmCima = true; agendar(); } });
    raiz.addEventListener("pointerleave", function (ev) { if (ev.pointerType === "mouse") { mouseEmCima = false; agendar(); } });
    raiz.addEventListener("focusin", function () { focoDentro = true; agendar(); });
    raiz.addEventListener("focusout", function (ev) {
      if (ev.relatedTarget && raiz.contains(ev.relatedTarget)) return;
      focoDentro = false;
      agendar();
    });
    document.addEventListener("visibilitychange", agendar);
    atualizarPausa();
    agendar();
  }
  var banner = document.querySelector("[data-banner]");
  if (banner) iniciarBanner(banner);

  // ---------- 11c. Barra de topo: no celular, uma frase por vez ----------
  // A cada 4 s, só sem movimento reduzido; pausa com o mouse em cima ou foco dentro.
  // No desktop as frases ficam lado a lado e nada reveza.
  var barraTopo = document.querySelector("[data-barra-topo]");
  if (barraTopo && !reduzMovimento) {
    var frases = todos("li", barraTopo);
    var fraseAtual = 0;
    var barraParada = false;
    if (frases.length > 1) {
      setInterval(function () {
        if (barraParada || desktop() || document.hidden) return;
        frases[fraseAtual].classList.remove("ativa");
        fraseAtual = (fraseAtual + 1) % frases.length;
        frases[fraseAtual].classList.add("ativa");
      }, 4000);
      barraTopo.addEventListener("pointerenter", function () { barraParada = true; });
      barraTopo.addEventListener("pointerleave", function () { barraParada = false; });
      barraTopo.addEventListener("focusin", function () { barraParada = true; });
      barraTopo.addEventListener("focusout", function () { barraParada = false; });
    }
  }

  // ---------- 12. Blocos de informação da peça: abertos no celular, fechados no desktop ----------
  if (desktop()) {
    todos("details[data-fechar-desktop]").forEach(function (d) { d.open = false; });
  }
  // Chegada por link com hash para um <details> (ex: "Como comprar" do rodapé, #duvida-1): abre.
  if (location.hash.length > 1) {
    var alvoHash = document.getElementById(location.hash.slice(1));
    if (alvoHash && alvoHash.tagName === "DETAILS") alvoHash.open = true;
  }

  // ---------- 13. Vídeo da peça: toca mudo só com o slide visível, um vídeo por vez ----------
  // Visível = 60% do slide na tela (IntersectionObserver) e, no desktop, item ativo da galeria.
  // Com prefers-reduced-motion ou economia de dados, nada toca sozinho: aparece o botão de play.
  function avaliarVideos() {
    avaliadoresVideo.forEach(function (avaliar) { avaliar(); });
  }

  // Ao começar um vídeo, qualquer outro da página para (o evento play não borbulha: captura).
  document.addEventListener("play", function (ev) {
    todos("video").forEach(function (v) { if (v !== ev.target && !v.paused) v.pause(); });
  }, true);

  function tocar(video) {
    var promessa;
    try { promessa = video.play(); } catch (e) { return; }
    if (!promessa || typeof promessa.catch !== "function") return;
    promessa.catch(function () {
      // O navegador recusou tocar com som sem um toque: volta para mudo e tenta de novo.
      if (video.muted) return;
      video.muted = true;
      var novaTentativa = video.play();
      if (novaTentativa && typeof novaTentativa.catch === "function") novaTentativa.catch(function () {});
    });
  }

  function iniciarVideoDaPeca(slide) {
    var video = slide.querySelector("video");
    if (!video) return;
    var botaoPlay = slide.querySelector("[data-video-play]");
    var botaoPausar = slide.querySelector("[data-video-pausar]");
    var botaoSom = slide.querySelector("[data-video-som]");
    var visivel = false;
    var liberado = autoplayLiberado;
    var pausadoPelaPessoa = false;

    video.removeAttribute("controls");
    video.muted = true;
    slide.classList.add("video--pronto");
    // Pôster = a foto principal na versão que o srcset já escolheu (mesmo arquivo, sem novo download).
    var fotoPrincipal = document.querySelector(".galeria-faixa li:first-child img");
    if (fotoPrincipal && !video.getAttribute("poster")) video.poster = fotoPrincipal.currentSrc || fotoPrincipal.src;

    function atualizarEstado() {
      var tocando = !video.paused && !video.ended;
      slide.classList.toggle("video--tocando", tocando);
      slide.classList.toggle("video--parado", !tocando && (!liberado || pausadoPelaPessoa));
    }

    function atualizarSom() {
      slide.classList.toggle("video--com-som", !video.muted);
      if (botaoSom) botaoSom.setAttribute("aria-label", video.muted ? "Ligar o som" : "Desligar o som");
    }

    function avaliar() {
      var ativo = !desktop() || slide.classList.contains("ativa");
      if (visivel && ativo && liberado && !pausadoPelaPessoa) {
        if (video.paused) tocar(video);
      } else if (!video.paused) {
        video.pause();
      }
      atualizarEstado();
    }
    avaliadoresVideo.push(avaliar);

    video.addEventListener("play", atualizarEstado);
    video.addEventListener("pause", atualizarEstado);
    video.addEventListener("volumechange", atualizarSom);

    if (botaoPlay) {
      botaoPlay.addEventListener("click", function () {
        liberado = true;
        pausadoPelaPessoa = false;
        tocar(video);
        atualizarEstado();
        if (botaoPausar) botaoPausar.focus();
      });
    }
    if (botaoPausar) {
      botaoPausar.addEventListener("click", function () {
        pausadoPelaPessoa = true;
        video.pause();
        atualizarEstado();
        if (botaoPlay) botaoPlay.focus();
      });
    }
    if (botaoSom) {
      botaoSom.addEventListener("click", function () {
        video.muted = !video.muted;
        if (!video.muted && video.paused) {
          liberado = true;
          pausadoPelaPessoa = false;
          tocar(video);
        }
        atualizarEstado();
      });
    }

    if (temIO) {
      new IntersectionObserver(function (entradas) {
        visivel = entradas[entradas.length - 1].intersectionRatio >= 0.6;
        avaliar();
      }, { threshold: [0, 0.6, 1] }).observe(slide);
    }
    atualizarEstado();
    atualizarSom();
  }

  todos("[data-video]").forEach(iniciarVideoDaPeca);

  // ---------- 14. Faixa de vídeos da home: só o card mais visível toca, mudo ----------
  // O vídeo recebe src só quando o card vira o escolhido (nada é baixado antes).
  // Em tela de toque (sem hover ou ponteiro grosso), nada toca só por rolar a página: a faixa
  // espera o primeiro gesto dentro dela (rolagem horizontal, toque ou "Tocar vídeos").
  // Antes disso ficam as fotos com um play discreto. No desktop, toca o card mais visível
  // e o card sob o ponteiro tem prioridade. O botão pausa ou retoma a faixa.
  var telaDeToque = Boolean(window.matchMedia && window.matchMedia("(hover: none), (pointer: coarse)").matches);

  function iniciarFaixaVideos(faixa) {
    var cards = todos("[data-video-card]", faixa);
    var razoes = cards.map(function () { return 0; });
    var liberado = autoplayLiberado && !telaDeToque;
    var preferido = -1;
    var alternar = document.querySelector("[data-videos-alternar]");
    var rotuloAlternar = alternar ? alternar.querySelector("[data-videos-rotulo]") : null;

    function videoDo(card) { return card.querySelector("video"); }

    function carregar(video) {
      if (video.getAttribute("src")) return;
      video.muted = true;
      video.setAttribute("src", video.getAttribute("data-src"));
    }

    function escolhido() {
      if (!liberado || document.hidden) return -1;
      if (preferido >= 0 && razoes[preferido] >= 0.5) return preferido;
      var melhor = -1;
      var maior = 0.5;
      razoes.forEach(function (r, i) { if (r > maior + 0.001) { maior = r; melhor = i; } });
      return melhor;
    }

    function escolher() {
      var atual = escolhido();
      cards.forEach(function (card, i) {
        var video = videoDo(card);
        if (i === atual) {
          carregar(video);
          if (video.paused) tocar(video);
        } else if (!video.paused) {
          video.pause();
        }
      });
    }
    avaliadoresFaixa.push(escolher);

    cards.forEach(function (card, i) {
      var video = videoDo(card);
      var midia = card.querySelector(".video-card-midia");
      var progresso = card.querySelector("[data-video-progresso]");
      var anterior = 0;
      video.addEventListener("playing", function () {
        if (midia) midia.classList.add("com-video");
        card.classList.add("video-card--tocando");
      });
      video.addEventListener("pause", function () { card.classList.remove("video-card--tocando"); });
      // Linha de progresso sob o card, como nos stories; volta a zero sem transição a cada loop.
      video.addEventListener("timeupdate", function () {
        if (!progresso || !video.duration) return;
        var razao = video.currentTime / video.duration;
        progresso.style.transition = razao < anterior ? "none" : "";
        anterior = razao;
        progresso.style.transform = "scaleX(" + razao.toFixed(3) + ")";
      });
      card.addEventListener("pointerenter", function (ev) {
        if (ev.pointerType !== "mouse") return;
        preferido = i;
        escolher();
      });
      card.addEventListener("pointerleave", function (ev) {
        if (ev.pointerType !== "mouse") return;
        preferido = -1;
        escolher();
      });
      card.addEventListener("focusin", function () { preferido = i; escolher(); });
      card.addEventListener("focusout", function () { preferido = -1; escolher(); });
    });

    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        var i = cards.indexOf(en.target);
        if (i >= 0) razoes[i] = en.isIntersecting ? en.intersectionRatio : 0;
      });
      escolher();
    }, { threshold: [0, 0.25, 0.5, 0.75, 1] });
    cards.forEach(function (card) { observador.observe(card); });

    function atualizarAlternar() {
      if (!alternar) return;
      alternar.hidden = false;
      alternar.setAttribute("data-estado", liberado ? "tocando" : "pausado");
      if (rotuloAlternar) rotuloAlternar.textContent = liberado ? "Pausar vídeos" : "Tocar vídeos";
    }
    if (alternar) {
      alternar.addEventListener("click", function () {
        liberado = !liberado;
        atualizarAlternar();
        escolher();
      });
    }
    atualizarAlternar();

    if (telaDeToque && autoplayLiberado) esperarGesto(faixa, cards, function () {
      if (liberado) return;
      liberado = true;
      atualizarAlternar();
      escolher();
    });

    ligarSetas(faixa, cards, document.querySelector("[data-videos-anterior]"), document.querySelector("[data-videos-proximo]"));
  }

  // Primeiro gesto dentro da faixa, sem listener de scroll:
  //   rolagem horizontal = um IntersectionObserver com a própria faixa como root. A rolagem vertical
  //   da página não muda a área visível dos cards dentro da faixa; só a horizontal muda. Para girar
  //   o celular (os cards mudam de largura) não contar como gesto, a posição horizontal da faixa
  //   (scrollLeft) também precisa ter mudado desde a primeira leitura;
  //   toque = pointerdown e pointerup no mesmo lugar (menos de 10px de deslocamento).
  function esperarGesto(faixa, cards, aoGesto) {
    var posicaoInicial = faixa.scrollLeft;
    var feito = false;
    function disparar() {
      if (feito) return;
      feito = true;
      observadorFaixa.disconnect();
      aoGesto();
    }
    var observadorFaixa = new IntersectionObserver(function () {
      if (Math.abs(faixa.scrollLeft - posicaoInicial) > 10) disparar();
    }, { root: faixa, threshold: [0, 0.25, 0.5, 0.75, 1] });
    cards.forEach(function (card) { observadorFaixa.observe(card); });

    var inicio = null;
    faixa.addEventListener("pointerdown", function (ev) { inicio = { x: ev.clientX, y: ev.clientY }; }, { passive: true });
    faixa.addEventListener("pointerup", function (ev) {
      if (inicio && Math.abs(ev.clientX - inicio.x) < 10 && Math.abs(ev.clientY - inicio.y) < 10) disparar();
      inicio = null;
    }, { passive: true });
  }

  // Setas do desktop (faixa de vídeos e vitrines): rolam a faixa e ficam desativadas quando a
  // ponta já está à vista. O CSS só as mostra com mouse e a partir de 1024px.
  function ligarSetas(faixa, cards, anterior, proximo) {
    if (!anterior || !proximo || cards.length < 2) return;
    anterior.hidden = false;
    proximo.hidden = false;

    function rolar(sentido) {
      var passo = faixa.clientWidth * 0.8 * sentido;
      if ("scrollBehavior" in document.documentElement.style) {
        faixa.scrollBy({ left: passo, behavior: reduzMovimento ? "auto" : "smooth" });
      } else {
        faixa.scrollLeft += passo;
      }
    }
    anterior.addEventListener("click", function () { rolar(-1); });
    proximo.addEventListener("click", function () { rolar(1); });

    var primeiro = cards[0];
    var pontas = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        var botao = en.target === primeiro ? anterior : proximo;
        botao.disabled = en.intersectionRatio >= 0.95;
      });
      // Com todas as peças à vista (ex.: 4 relacionadas no desktop), as setas não têm o que fazer.
      var tudoCabe = anterior.disabled && proximo.disabled;
      anterior.hidden = tudoCabe;
      proximo.hidden = tudoCabe;
    }, { root: faixa, threshold: [0, 0.95, 1] });
    pontas.observe(primeiro);
    pontas.observe(cards[cards.length - 1]);
  }

  var faixaVideos = document.querySelector("[data-videos]");
  if (faixaVideos && temIO) iniciarFaixaVideos(faixaVideos);

  // Desktop e celular trocam a regra de "visível"; aba escondida pausa tudo.
  var consultaDesktop = window.matchMedia ? window.matchMedia("(min-width: 1024px)") : null;
  if (consultaDesktop) {
    if (consultaDesktop.addEventListener) consultaDesktop.addEventListener("change", avaliarVideos);
    else if (consultaDesktop.addListener) consultaDesktop.addListener(avaliarVideos);
  }
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      todos("video").forEach(function (v) { if (!v.paused) v.pause(); });
      return;
    }
    avaliarVideos();
    avaliadoresFaixa.forEach(function (escolher) { escolher(); });
  });

  // ---------- 15. Favoritos (coração) ----------
  // O coração dos cards e da página da peça guarda o slug no aparelho (localStorage, com
  // try/catch: sem ele, a lista vale só para a página aberta). O coração do topo mostra o
  // contador e abre o painel (dialog modal: foco preso, Esc fecha, o foco volta ao coração do
  // topo). No painel, "Enviar favoritas no WhatsApp" leva a lista com nome, cor e endereço de
  // cada peça. Favoritar não dispara evento do Pixel. Sem JS, corações e painel não aparecem.
  var CHAVE_FAVORITOS = "ltm-favoritos";
  var pecasPorSlug = {};
  (window.PECAS || []).forEach(function (p) { pecasPorSlug[p.slug] = p; });
  var favoritosEmMemoria = [];

  function lerFavoritos() {
    var lista = favoritosEmMemoria;
    try {
      var salvo = localStorage.getItem(CHAVE_FAVORITOS);
      if (salvo !== null) lista = JSON.parse(salvo);
    } catch (e) { /* sem localStorage: fica a lista da memória */ }
    if (!Array.isArray(lista)) lista = [];
    return lista.filter(function (slug, i) {
      return typeof slug === "string" && pecasPorSlug[slug] && lista.indexOf(slug) === i;
    });
  }

  function gravarFavoritos(lista) {
    favoritosEmMemoria = lista.slice();
    try { localStorage.setItem(CHAVE_FAVORITOS, JSON.stringify(lista)); } catch (e) { /* segue só na memória */ }
  }

  var painelFavoritos = document.querySelector("[data-favoritos]");
  var botaoFavoritosTopo = document.querySelector("[data-abrir-favoritos]");
  var contadorFavoritos = document.querySelector("[data-favoritos-contador]");
  var listaFavoritos = painelFavoritos ? painelFavoritos.querySelector("[data-favoritos-lista]") : null;
  var vazioFavoritos = painelFavoritos ? painelFavoritos.querySelector("[data-favoritos-vazio]") : null;
  var baseFavoritos = painelFavoritos ? painelFavoritos.querySelector("[data-favoritos-base]") : null;
  var enviarFavoritas = baseFavoritos ? baseFavoritos.querySelector('[data-whats="favoritas"]') : null;
  var modeloFavorito = painelFavoritos ? painelFavoritos.querySelector("[data-favorito-modelo]") : null;
  var rotuloTopoFavoritos = botaoFavoritosTopo ? botaoFavoritosTopo.getAttribute("aria-label") : "Favoritos";

  // Uma peça por linha, "- Nome (cor): endereço", no lugar de {pecas}.
  function mensagemFavoritas(lista) {
    var itens = lista.map(function (slug) {
      var p = pecasPorSlug[slug];
      return "- " + p.nome + (p.cor ? " (" + p.cor + ")" : "") + ": " + p.url;
    }).join("\n");
    return String(cfg.mensagemFavoritas || "{pecas}").split("{pecas}").join(itens);
  }

  function itemFavorito(slug) {
    var p = pecasPorSlug[slug];
    var item = modeloFavorito.content.firstElementChild.cloneNode(true);
    item.querySelector(".favorito-link").setAttribute("href", BASE + "/p/" + slug + "/");
    var img = item.querySelector("img");
    img.setAttribute("src", p.foto);
    img.setAttribute("width", p.largura);
    img.setAttribute("height", p.altura);
    item.querySelector(".favorito-nome").textContent = p.nome;
    var cor = item.querySelector(".favorito-cor");
    if (!p.cor) cor.parentNode.removeChild(cor);
    else {
      item.querySelector(".favorito-cor-nome").textContent = p.cor;
      var bolinha = cor.querySelector(".bolinha");
      if (p.corHex) bolinha.style.backgroundColor = p.corHex;
      else bolinha.parentNode.removeChild(bolinha);
    }
    var remover = item.querySelector("[data-remover-favorito]");
    remover.setAttribute("data-remover-favorito", slug);
    remover.setAttribute("aria-label", "Remover dos favoritos: " + p.nome);
    return item;
  }

  function montarPainel(lista) {
    if (!listaFavoritos || !modeloFavorito || !("content" in modeloFavorito)) return;
    listaFavoritos.innerHTML = "";
    lista.forEach(function (slug) { listaFavoritos.appendChild(itemFavorito(slug)); });
    listaFavoritos.hidden = !lista.length;
    if (vazioFavoritos) vazioFavoritos.hidden = lista.length > 0;
    if (baseFavoritos) baseFavoritos.hidden = !lista.length;
    if (enviarFavoritas && lista.length) enviarFavoritas.href = linkWhats(mensagemFavoritas(lista));
  }

  function atualizarFavoritos() {
    var lista = lerFavoritos();
    todos("[data-favorito]").forEach(function (b) {
      b.setAttribute("aria-pressed", lista.indexOf(b.getAttribute("data-favorito")) >= 0 ? "true" : "false");
    });
    if (contadorFavoritos) {
      contadorFavoritos.textContent = lista.length ? String(lista.length) : "";
      contadorFavoritos.hidden = !lista.length;
    }
    if (botaoFavoritosTopo) {
      botaoFavoritosTopo.setAttribute("aria-label", lista.length
        ? rotuloTopoFavoritos + ", " + (lista.length === 1 ? "1 peça" : lista.length + " peças")
        : rotuloTopoFavoritos);
    }
    if (painelFavoritos && painelFavoritos.open) montarPainel(lista);
    return lista;
  }

  function alternarFavorito(slug) {
    var lista = lerFavoritos();
    var i = lista.indexOf(slug);
    if (i >= 0) lista.splice(i, 1);
    else lista.push(slug);
    gravarFavoritos(lista);
    return atualizarFavoritos();
  }

  document.addEventListener("click", function (ev) {
    var coracao = ev.target.closest ? ev.target.closest("[data-favorito]") : null;
    if (coracao) {
      var salvos = alternarFavorito(coracao.getAttribute("data-favorito"));
      coracao.classList.remove("pulso");
      if (salvos.indexOf(coracao.getAttribute("data-favorito")) >= 0) {
        void coracao.offsetWidth;
        coracao.classList.add("pulso");
      }
      return;
    }
    var remover = ev.target.closest ? ev.target.closest("[data-remover-favorito]") : null;
    if (!remover) return;
    // Ao remover, o foco vai para o próximo item (ou o anterior; sem nenhum, para o Fechar).
    var item = remover.closest("li");
    var vizinho = item && (item.nextElementSibling || item.previousElementSibling);
    var slugVizinho = vizinho ? vizinho.querySelector("[data-remover-favorito]").getAttribute("data-remover-favorito") : "";
    alternarFavorito(remover.getAttribute("data-remover-favorito"));
    var alvo = slugVizinho && listaFavoritos ? listaFavoritos.querySelector('[data-remover-favorito="' + slugVizinho + '"]') : null;
    if (!alvo && painelFavoritos) alvo = painelFavoritos.querySelector("[data-fechar-favoritos]");
    if (alvo) alvo.focus();
  });

  if (painelFavoritos && botaoFavoritosTopo && typeof painelFavoritos.showModal === "function") {
    botaoFavoritosTopo.addEventListener("click", function () {
      montarPainel(lerFavoritos());
      painelFavoritos.showModal();
      var fechar = painelFavoritos.querySelector("[data-fechar-favoritos]");
      if (fechar) fechar.focus();
    });
    painelFavoritos.addEventListener("click", function (ev) {
      if (ev.target === painelFavoritos || (ev.target.closest && ev.target.closest("[data-fechar-favoritos]"))) painelFavoritos.close();
    });
    painelFavoritos.addEventListener("close", function () { botaoFavoritosTopo.focus(); });
    // Tab e Shift+Tab giram dentro do painel (o dialog modal já deixa o resto da página inerte;
    // aqui o foco também não sai para a barra do navegador).
    painelFavoritos.addEventListener("keydown", function (ev) {
      if (ev.key !== "Tab") return;
      var focaveis = todos("a[href], button:not([disabled])", painelFavoritos).filter(function (el) { return el.offsetParent !== null; });
      if (!focaveis.length) return;
      var primeiro = focaveis[0];
      var ultimo = focaveis[focaveis.length - 1];
      if (ev.shiftKey && document.activeElement === primeiro) {
        ev.preventDefault();
        ultimo.focus();
      } else if (!ev.shiftKey && document.activeElement === ultimo) {
        ev.preventDefault();
        primeiro.focus();
      }
    });
  } else if (botaoFavoritosTopo) {
    botaoFavoritosTopo.hidden = true;
  }

  // Outra aba mudou a lista: corações e contador acompanham.
  window.addEventListener("storage", function (ev) {
    if (ev.key === CHAVE_FAVORITOS) atualizarFavoritos();
  });
  atualizarFavoritos();
})();
