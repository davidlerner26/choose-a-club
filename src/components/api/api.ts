export const extractProduct = async (link: string) => {
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
