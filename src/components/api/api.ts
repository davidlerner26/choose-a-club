export type ExtractedProduct = {
  id: string;
  name: string;
  marca?: string;
  price?: number;
  precoDe?: number;
  imagem?: string;
  store?: string;
  link: string;
  disponivel?: boolean;
  adicionadoEm: string;
  verificadoEm: string;
  categoria?: string;
};

export type ExtractionFailure = {
  manual: true;
  link: string;
  loja?: string;
  motivo?: string;
};

export const extractProduct = async (
  link: string,
): Promise<ExtractedProduct | ExtractionFailure> => {
  const r = await fetch(
    '/.netlify/functions/extract?url=' + encodeURIComponent(link),
  );

  const d = await r.json();

  if (d.erro) {
    // fallback: abre o formulário manual já com o que deu pra pegar
    return { manual: true, link, loja: d.loja, motivo: d.erro };
  }

  return {
    id: crypto.randomUUID(),
    name: d.nome,
    marca: d.marca,
    price: d.preco,
    precoDe: d.precoDe,
    imagem: d.imagem,
    store: d.loja,
    link: d.link,
    disponivel: d.disponivel,
    adicionadoEm: new Date().toISOString(),
    verificadoEm: new Date().toISOString(),
    categoria: d.categoria,
  };
};
