// netlify/functions/extrair.js
// Recebe ?url=<link do produto> e devolve { nome, preco, precoDe, imagem, marca, loja, disponivel }
// Estratégia: 1) API pública VTEX (Farm, Animale, Shoulder e boa parte do varejo BR)
//             2) JSON-LD schema.org/Product
//             3) meta tags Open Graph

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

const HEADERS_NAVEGADOR = {
  'User-Agent': UA,
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
  'Cache-Control': 'no-cache',
};

function json(body, status = 200) {
  return {
    statusCode: status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    body: JSON.stringify(body),
  };
}

async function buscar(url, opts = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12000);
  try {
    return await fetch(url, {
      ...opts,
      redirect: 'follow',
      signal: ctrl.signal,
    });
  } finally {
    clearTimeout(t);
  }
}

function parsePreco(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === 'number') return v > 0 ? v : null;
  let s = String(v).replace(/[^\d.,]/g, '');
  if (!s) return null;
  const temVirgula = s.includes(',');
  const temPonto = s.includes('.');
  if (temVirgula && temPonto) {
    s =
      s.lastIndexOf(',') > s.lastIndexOf('.')
        ? s.replace(/\./g, '').replace(',', '.')
        : s.replace(/,/g, '');
  } else if (temVirgula) {
    s = s.replace(',', '.');
  }
  const n = parseFloat(s);
  return isNaN(n) || n <= 0 ? null : n;
}

function absolutizar(src, base) {
  if (!src) return null;
  try {
    return new URL(src, base).href;
  } catch {
    return null;
  }
}

// ---------- categorias ----------
// Cada loja nomeia do seu jeito ("Vestido", "Vestidos", "Dresses"), e ainda
// mistura categoria comercial ("bazar farm"). Aqui traduzimos para as abas do site.
const REGRAS_CATEGORIA = [
  ['Vestidos', ['vestido', 'chemise', 'tubinho']],
  ['Saias', ['saia']],
  [
    'Calcas',
    [
      'calca',
      'jeans',
      'short',
      'bermuda',
      'legging',
      'pantalona',
      'pantacourt',
    ],
  ],
  [
    'Casacos',
    [
      'casaco',
      'jaqueta',
      'blazer',
      'cardiga',
      'sobretudo',
      'parka',
      'trench',
      'colete',
      'kimono',
    ],
  ],
  [
    'Blusas',
    [
      'blusa',
      'camisa',
      'camiseta',
      'cropped',
      'regata',
      'body',
      'moletom',
      'trico',
      'sueter',
      'tops?\\b',
    ],
  ],
  [
    'Sapatos',
    [
      'sapato',
      'tenis',
      'sandalia',
      'bota',
      'rasteira',
      'mule',
      'chinelo',
      'sapatilha',
      'calcado',
      'salto',
    ],
  ],
  [
    'Bolsas',
    ['bolsa', 'mochila', 'clutch', 'carteira', 'necessaire', 'pochete'],
  ],
  [
    'Acessorios',
    [
      'acessorio',
      'colar',
      'brinco',
      'anel',
      'pulseira',
      'cinto',
      'lenco',
      'chapeu',
      'oculos',
      'bijou',
      'echarpe',
      'presilha',
      'meia',
    ],
  ],
  ['Perucas', ['peruca', 'aplique', 'cabelo']],
  ['Brinquedos', ['brinquedo', 'pelucia', 'boneca']],
  ['Jogos', ['jogo', 'quebra-cabeca', 'tabuleiro']],
];

// nomes com acento, como aparecem nas abas do site
const ROTULOS = { Calcas: 'Calças', Acessorios: 'Acessórios' };

function semAcento(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

// pega o nível mais específico do caminho de categorias da loja
function categoriaBruta(caminhos) {
  if (!Array.isArray(caminhos) || !caminhos.length) return null;
  const maisFundo = caminhos
    .map((c) => String(c).split('/').filter(Boolean))
    .sort((a, b) => b.length - a.length)[0];
  return maisFundo && maisFundo.length ? maisFundo[maisFundo.length - 1] : null;
}

// classifica pela categoria da loja; se não bater, tenta pelo nome do produto
function classificar(...textos) {
  for (const texto of textos) {
    const t = semAcento(texto);
    if (!t) continue;
    for (const [destino, chaves] of REGRAS_CATEGORIA) {
      if (chaves.some((k) => new RegExp('\\b' + k).test(t))) {
        return ROTULOS[destino] || destino;
      }
    }
  }
  return 'Outros';
}

// ---------- 1) VTEX ----------
// URL de produto VTEX termina em /{slug}/p
// escolhe o seller com estoque; senão o padrão da loja
function escolherOferta(item) {
  const sellers = (item && item.sellers) || [];
  const comEstoque = sellers.find(
    (s) => ((s.commertialOffer || {}).AvailableQuantity || 0) > 0,
  );
  const escolhido =
    comEstoque || sellers.find((s) => s.sellerDefault) || sellers[0] || {};
  return escolhido.commertialOffer || {};
}

// nome da variação do item (tamanho, na maioria das lojas de roupa)
function variacao(item) {
  const chave = ((item || {}).variations || [])[0];
  return chave ? (item[chave] || [])[0] || null : null;
}

async function tentarVtex(alvo) {
  const u = new URL(alvo);
  const partes = u.pathname.split('/').filter(Boolean);
  const iP = partes.lastIndexOf('p');
  if (iP < 1) return null;
  const slug = partes[iP - 1];

  const api = `${u.origin}/api/catalog_system/pub/products/search/${encodeURIComponent(slug)}/p`;
  let r;
  try {
    r = await buscar(api, {
      headers: { ...HEADERS_NAVEGADOR, Accept: 'application/json' },
    });
  } catch {
    return null;
  }
  if (!r.ok) return null;

  let dados;
  try {
    dados = await r.json();
  } catch {
    return null;
  }
  if (!Array.isArray(dados) || !dados.length) return null;

  const p = dados[0];
  const itens = p.items || [];

  // ATENÇÃO: em loja de roupa os "items" são TAMANHOS, não cores.
  // items[0] costuma ser o menor tamanho — e frequentemente o que esgotou primeiro.
  const skuAlvo =
    u.searchParams.get('idsku') ||
    u.searchParams.get('skuId') ||
    u.searchParams.get('sku');

  const comEstoque = itens.filter(
    (i) => (escolherOferta(i).AvailableQuantity || 0) > 0,
  );

  // 1) o tamanho exato do link; 2) qualquer um com estoque; 3) o primeiro
  const item =
    (skuAlvo && itens.find((i) => String(i.itemId) === String(skuAlvo))) ||
    comEstoque[0] ||
    itens[0] ||
    {};

  let oferta = escolherOferta(item);
  // se o tamanho escolhido não tem preço, pega o preço de qualquer outro
  if (!oferta.Price) {
    const comPreco = itens.map(escolherOferta).find((o) => o.Price);
    if (comPreco) oferta = comPreco;
  }

  const imagem = ((item.images || [])[0] || {}).imageUrl || null;
  const bruta = categoriaBruta(p.categories);

  return {
    nome: p.productName || null,
    marca: p.brand || null,
    categoria: classificar(bruta, p.productName),
    categoriaLoja: bruta,
    preco: parsePreco(oferta.Price),
    precoDe: parsePreco(oferta.ListPrice),
    imagem: imagem
      ? imagem.replace(/(\/ids\/\d+)(-[^/?]*)?/, '$1-800-1200')
      : null,
    // disponibilidade do PRODUTO: basta um tamanho com estoque
    disponivel: comEstoque.length > 0,
    tamanho: skuAlvo ? variacao(item) : null,
    tamanhosDisponiveis: comEstoque.map(variacao).filter(Boolean),
    fonte: 'vtex',
  };
}

// ---------- 2) JSON-LD ----------
function acharProduto(no, vistos = new Set()) {
  if (!no || typeof no !== 'object' || vistos.has(no)) return null;
  vistos.add(no);
  if (Array.isArray(no)) {
    for (const x of no) {
      const r = acharProduto(x, vistos);
      if (r) return r;
    }
    return null;
  }
  const tipo = no['@type'];
  const ehProduto = Array.isArray(tipo)
    ? tipo.some((t) => String(t).toLowerCase() === 'product')
    : String(tipo || '').toLowerCase() === 'product';
  if (ehProduto) return no;
  for (const k of ['@graph', 'mainEntity', 'itemListElement', 'hasVariant']) {
    const r = acharProduto(no[k], vistos);
    if (r) return r;
  }
  return null;
}

function lerJsonLd(html, base) {
  const re =
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    let obj;
    try {
      obj = JSON.parse(m[1].trim());
    } catch {
      continue;
    }
    const p = acharProduto(obj);
    if (!p) continue;

    const ofertas = Array.isArray(p.offers) ? p.offers[0] : p.offers || {};
    let img = p.image;
    if (Array.isArray(img)) img = img[0];
    if (img && typeof img === 'object') img = img.url || img.contentUrl;

    const disp = String(ofertas.availability || '').toLowerCase();

    return {
      nome: typeof p.name === 'string' ? p.name : null,
      marca: typeof p.brand === 'string' ? p.brand : p.brand?.name || null,
      categoria: classificar(p.category, p.name),
      categoriaLoja: typeof p.category === 'string' ? p.category : null,
      preco: parsePreco(ofertas.price ?? ofertas.lowPrice),
      precoDe: null,
      imagem: absolutizar(img, base),
      disponivel: disp
        ? !disp.includes('outofstock') && !disp.includes('soldout')
        : true,
      fonte: 'json-ld',
    };
  }
  return null;
}

// ---------- 3) Open Graph ----------
function lerMetas(html, base) {
  const metas = {};
  const re = /<meta\s+([^>]+?)\/?>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const bruto = m[1];
    const chave = /(?:property|name|itemprop)\s*=\s*["']([^"']+)["']/i.exec(
      bruto,
    );
    const valor = /content\s*=\s*["']([^"']*)["']/i.exec(bruto);
    if (chave && valor) metas[chave[1].toLowerCase()] = valor[1];
  }

  const titulo =
    metas['og:title'] ||
    metas['twitter:title'] ||
    (/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html) || [])[1];

  const preco =
    metas['product:price:amount'] ||
    metas['og:price:amount'] ||
    metas['price'] ||
    metas['twitter:data1'];

  const img = metas['og:image'] || metas['twitter:image'] || metas['image'];
  if (!titulo && !img) return null;

  const disp = String(metas['product:availability'] || '').toLowerCase();

  return {
    nome: titulo ? titulo.replace(/\s+/g, ' ').trim() : null,
    marca: metas['og:site_name'] || null,
    categoria: classificar(metas['product:category'], titulo),
    categoriaLoja: metas['product:category'] || null,
    preco: parsePreco(preco),
    precoDe: null,
    imagem: absolutizar(img, base),
    disponivel: disp ? !disp.includes('out') : true,
    fonte: 'open-graph',
  };
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json({ ok: true });

  let alvo = (event.queryStringParameters || {}).url;
  if (!alvo) return json({ erro: 'Faltou o parâmetro ?url=' }, 400);

  let u;
  try {
    u = new URL(alvo);
    if (!/^https?:$/.test(u.protocol)) throw new Error();
  } catch {
    return json({ erro: 'Link inválido' }, 400);
  }

  const loja = u.hostname.replace(/^www\./, '');

  // limpa parâmetros de rastreamento (gclid, utm_*, gad_*) do link que vai ser salvo
  const limpa = new URL(u.href);
  for (const k of [...limpa.searchParams.keys()]) {
    if (/^(gclid|fbclid|gad_|utm_|_gl|srsltid|mc_|epik)/i.test(k))
      limpa.searchParams.delete(k);
  }
  alvo = limpa.href.replace(/\?$/, '');

  // 1) VTEX
  try {
    const vtex = await tentarVtex(alvo);
    if (vtex && vtex.nome) return json({ ...vtex, loja, link: alvo });
  } catch (e) {
    // segue para o HTML
  }

  // 2 e 3) HTML
  let html;
  try {
    const r = await buscar(alvo, { headers: HEADERS_NAVEGADOR });
    if (!r.ok) {
      return json(
        {
          erro: `A loja bloqueou a leitura (HTTP ${r.status}). Preencha manualmente.`,
          loja,
          link: alvo,
          bloqueado: true,
        },
        200,
      );
    }
    html = await r.text();
  } catch {
    return json(
      {
        erro: 'Não consegui abrir a página da loja.',
        loja,
        link: alvo,
        bloqueado: true,
      },
      200,
    );
  }

  const base = u.origin;
  const resultado = lerJsonLd(html, base) || lerMetas(html, base);

  if (!resultado || (!resultado.nome && !resultado.imagem)) {
    return json(
      {
        erro: 'Não encontrei os dados do produto nessa página.',
        loja,
        link: alvo,
        bloqueado: true,
      },
      200,
    );
  }

  // completa buracos com o Open Graph
  if (resultado.fonte === 'json-ld') {
    const og = lerMetas(html, base) || {};
    resultado.nome = resultado.nome || og.nome;
    resultado.imagem = resultado.imagem || og.imagem;
    resultado.preco = resultado.preco ?? og.preco;
  }

  return json({ ...resultado, loja, link: alvo });
};
