// netlify/functions/lib/ai-extract.js
// Fallback de IA: quando VTEX/JSON-LD/Open Graph não encontram o produto,
// manda um resumo compacto do HTML já buscado (sem novo fetch) pro Claude
// Haiku extrair os mesmos campos.

import Anthropic from '@anthropic-ai/sdk';
import { CATEGORIAS_VALIDAS, classificar } from './categorias.js';

const MODELO = 'claude-haiku-4-5-20251001';
const TIMEOUT_MS = 3500;
const MOEDAS_VALIDAS = ['BRL', 'USD', 'GBP', 'EUR'];

function truncar(s, max) {
  if (!s) return '';
  return s.length > max ? s.slice(0, max) : s;
}

function extrairTitulo(html) {
  const m = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  return m ? m[1].replace(/\s+/g, ' ').trim() : null;
}

// pega só as meta tags com chance de ter dado de produto (preço, moeda,
// categoria, disponibilidade), não só as 4 fixas que lerMetas() já usa
function extrairMetasRelevantes(html) {
  const chaveRelevante =
    /^(og:|twitter:|product:|itemprop|description$|price|currency)/i;
  const metas = {};
  const re = /<meta\s+([^>]+?)\/?>/gi;
  let m;
  let total = 0;
  while ((m = re.exec(html)) !== null && total < 1500) {
    const bruto = m[1];
    const chave = /(?:property|name|itemprop)\s*=\s*["']([^"']+)["']/i.exec(
      bruto,
    );
    const valor = /content\s*=\s*["']([^"']*)["']/i.exec(bruto);
    if (!chave || !valor) continue;
    const k = chave[1].toLowerCase();
    if (!chaveRelevante.test(k)) continue;
    const v = truncar(valor[1], 300);
    metas[k] = v;
    total += k.length + v.length;
  }
  return metas;
}

// blocos JSON-LD brutos, mesmo sem @type Product/ProductGroup reconhecido —
// às vezes o dado do produto está num nó que lerJsonLd() não sabe navegar
function extrairJsonLdBruto(html) {
  const re =
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const blocos = [];
  let m;
  while ((m = re.exec(html)) !== null && blocos.length < 3) {
    blocos.push(truncar(m[1].trim(), 2000));
  }
  return blocos;
}

// último recurso: texto visível da página, pra lojas sem OG nem JSON-LD
function extrairTextoVisivel(html) {
  const texto = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<header[\s\S]*?<\/header>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
  return truncar(texto, 4000);
}

function montarContexto(html, base) {
  return {
    url: base,
    titulo: extrairTitulo(html),
    metas: extrairMetasRelevantes(html),
    jsonLd: extrairJsonLdBruto(html),
    textoVisivel: extrairTextoVisivel(html),
  };
}

const TOOL = {
  name: 'reportar_produto',
  description:
    'Reporta os dados do produto encontrados EXCLUSIVAMENTE no conteúdo fornecido. ' +
    'Nunca invente valores ausentes — use null quando não tiver certeza. A URL da ' +
    'imagem deve ser copiada literalmente do conteúdo fornecido (metas, JSON-LD ou ' +
    'texto visível), nunca construída ou adivinhada.',
  input_schema: {
    type: 'object',
    properties: {
      nome: { type: ['string', 'null'], description: 'Nome/título do produto' },
      marca: { type: ['string', 'null'] },
      categoria: {
        type: 'string',
        enum: CATEGORIAS_VALIDAS,
        description: 'Categoria do produto, escolhida entre as opções dadas',
      },
      categoriaLoja: {
        type: ['string', 'null'],
        description: 'Categoria como a própria loja nomeia, se houver',
      },
      preco: {
        type: ['number', 'null'],
        description: 'Preço atual, número puro sem símbolo de moeda',
      },
      precoDe: {
        type: ['number', 'null'],
        description: 'Preço "de"/riscado, se houver',
      },
      imagem: {
        type: ['string', 'null'],
        description:
          'URL absoluta da imagem principal do produto, copiada literalmente do conteúdo',
      },
      disponivel: { type: ['boolean', 'null'] },
      moeda: {
        type: ['string', 'null'],
        enum: [...MOEDAS_VALIDAS, null],
        description: 'Moeda em que o preço é exibido',
      },
    },
    required: [
      'nome',
      'marca',
      'categoria',
      'categoriaLoja',
      'preco',
      'precoDe',
      'imagem',
      'disponivel',
      'moeda',
    ],
  },
};

function urlValida(s) {
  if (!s) return false;
  try {
    const u = new URL(s);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function precoValido(v) {
  return typeof v === 'number' && isFinite(v) && v > 0 ? v : null;
}

export async function tentarIA(html, base) {
  if (!process.env.ANTHROPIC_API_KEY) return null;

  try {
    const client = new Anthropic();
    const contexto = montarContexto(html, base);

    const resp = await client.messages.create(
      {
        model: MODELO,
        max_tokens: 1024,
        system:
          'Você extrai dados estruturados de páginas de produto de e-commerce a ' +
          'partir de meta tags, JSON-LD e texto visível fornecidos. Responda só com ' +
          'o que está literalmente no conteúdo — nunca invente nome, preço, imagem ' +
          'ou disponibilidade.',
        tools: [TOOL],
        tool_choice: { type: 'tool', name: 'reportar_produto' },
        messages: [{ role: 'user', content: JSON.stringify(contexto) }],
      },
      { timeout: TIMEOUT_MS },
    );

    const bloco = resp.content.find((b) => b.type === 'tool_use');
    if (!bloco) return null;

    const dados = bloco.input || {};
    const imagem = urlValida(dados.imagem) ? dados.imagem : null;
    if (!dados.nome && !imagem) return null;

    const categoria = CATEGORIAS_VALIDAS.includes(dados.categoria)
      ? dados.categoria
      : classificar(dados.categoriaLoja, dados.nome);

    return {
      nome: dados.nome || null,
      marca: dados.marca || null,
      categoria,
      categoriaLoja: dados.categoriaLoja || null,
      preco: precoValido(dados.preco),
      precoDe: precoValido(dados.precoDe),
      imagem,
      disponivel: typeof dados.disponivel === 'boolean' ? dados.disponivel : true,
      moeda: MOEDAS_VALIDAS.includes(dados.moeda) ? dados.moeda : null,
      fonte: 'ai',
    };
  } catch {
    return null;
  }
}
