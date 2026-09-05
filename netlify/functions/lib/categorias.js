// netlify/functions/lib/categorias.js
// Cada loja nomeia do seu jeito ("Vestido", "Vestidos", "Dresses"), e ainda
// mistura categoria comercial ("bazar farm"). Aqui traduzimos para as abas do site.
export const REGRAS_CATEGORIA = [
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
export const ROTULOS = { Calcas: 'Calças', Acessorios: 'Acessórios' };

export function semAcento(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

// pega o nível mais específico do caminho de categorias da loja
export function categoriaBruta(caminhos) {
  if (!Array.isArray(caminhos) || !caminhos.length) return null;
  const maisFundo = caminhos
    .map((c) => String(c).split('/').filter(Boolean))
    .sort((a, b) => b.length - a.length)[0];
  return maisFundo && maisFundo.length ? maisFundo[maisFundo.length - 1] : null;
}

// classifica pela categoria da loja; se não bater, tenta pelo nome do produto
export function classificar(...textos) {
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

// lista final de rótulos que a IA pode escolher (mesma taxonomia das abas do site)
export const CATEGORIAS_VALIDAS = [
  ...REGRAS_CATEGORIA.map(([destino]) => ROTULOS[destino] || destino),
  'Outros',
];
