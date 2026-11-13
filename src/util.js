// Funções utilitárias compartilhadas pelo build e pelos renderizadores.
// Só JavaScript nativo do Node, sem dependências externas.

"use strict";

const formatadorBRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function arredondar2(valor) {
  return Math.round((Number(valor) + Number.EPSILON) * 100) / 100;
}

// "Vestido Midi Canelado" -> "vestido-midi-canelado"
// NFD separa acentos em marcas combinantes (\p{M}), que são removidas.
function slugify(str) {
  return String(str == null ? "" : str)
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// 159.9 -> "R$ 159,90" (o Intl usa espaço não separável depois de "R$"; aqui vira espaço comum)
function formatarPreco(num) {
  return formatadorBRL.format(Number(num) || 0).replace(/\s/g, " ");
}

// Escapa texto para uso seguro dentro de HTML (conteúdo e atributos com aspas duplas).
function escapeHtml(str) {
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// linkWhats(config, "Olá!") -> "https://wa.me/5511999998888?text=Ol%C3%A1!"
function linkWhats(config, mensagem) {
  const numero = String((config && config.whatsapp) || "").replace(/\D/g, "");
  return "https://wa.me/" + numero + "?text=" + encodeURIComponent(mensagem == null ? "" : String(mensagem));
}

// urlAbsoluta(config, "/p/vestido/") -> "https://suamarca.vercel.app/p/vestido/"
// URLs já absolutas (http/https) são devolvidas como estão.
function urlAbsoluta(config, caminho) {
  const rel = String(caminho == null ? "" : caminho);
  if (/^https?:\/\//i.test(rel)) return rel;
  const base = String((config && config.dominio) || "").trim().replace(/\/+$/, "");
  return base + "/" + rel.replace(/^\/+/, "");
}

// precoPix({ pagamento: { pixDesconto: 10 } }, 159.9) -> 143.91
function precoPix(config, preco) {
  const desconto = Number(config && config.pagamento && config.pagamento.pixDesconto) || 0;
  return arredondar2(Number(preco) * (1 - desconto / 100));
}

// parcela({ pagamento: { parcelas: 3 } }, 159.9) -> { vezes: 3, valor: 53.3 }
function parcela(config, preco) {
  const vezes = Math.max(1, parseInt(config && config.pagamento && config.pagamento.parcelas, 10) || 1);
  return { vezes, valor: arredondar2(Number(preco) / vezes) };
}

// Texto de busca: minúsculas e sem acento ("Pantalona Rosa" -> "pantalona rosa").
// Mesma regra em assets/js/app.js, para a busca ignorar acento e maiúscula.
function normalizarBusca(texto) {
  return String(texto == null ? "" : texto)
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

// Preço é opcional: null ou ausente mostra "Preço pelo WhatsApp" no lugar do valor.
function temPreco(produto) {
  return Boolean(produto) && typeof produto.preco === "number" && Number.isFinite(produto.preco) && produto.preco > 0;
}

// Marcadores das mensagens de WhatsApp (mesma regra em assets/js/app.js, que recalcula ao escolher o tamanho):
//   {produto} nome da peça
//   {cor}     ", cor Azul royal" (vazio sem cor)
//   {tamanho} ", tamanho M" ou ", tamanho a confirmar"
//   {preco}   " (R$ 159,90)" (vazio sem preço); "({preco})" de configs antigas vira {preco}
//   {link}    URL da peça; sem {link}, a URL entra numa linha no fim
function preencherMensagem(modelo, dados, url) {
  let texto = String(modelo || "").replace(/\s*\(\{preco\}\)/g, "{preco}");
  const trocas = [
    ["{produto}", dados.produto || ""],
    ["{cor}", dados.cor ? ", cor " + dados.cor : ""],
    ["{tamanho}", dados.tamanho ? ", tamanho " + dados.tamanho : ", tamanho a confirmar"],
    ["{preco}", dados.preco ? " (" + dados.preco + ")" : ""]
  ];
  for (const [marcador, valor] of trocas) texto = texto.split(marcador).join(valor);
  if (!url) return texto;
  return texto.includes("{link}") ? texto.split("{link}").join(url) : texto + "\n" + url;
}

module.exports = { slugify, formatarPreco, escapeHtml, linkWhats, urlAbsoluta, precoPix, parcela, temPreco, preencherMensagem, normalizarBusca };
