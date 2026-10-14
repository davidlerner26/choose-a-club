const SAMPLE_SIZE = 12;
const WHITE_THRESHOLD = 248;
const BLANK_RATIO = 0.97;

function loadImage(url: string, crossOrigin?: 'anonymous'): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    if (crossOrigin) img.crossOrigin = crossOrigin;
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

// Usada pra filtrar fotos de produto ruins de previews (ex: cards da página
// de Explorar): descarta imagens que não carregam e as que são quase todas
// brancas/vazias (comum em fotos de produto mal recortadas).
export async function isUsableImage(url: string): Promise<boolean> {
  if (!url) return false;

  // confere que a imagem carrega de fato, do jeito que apareceria
  // normalmente na UI (sem modo CORS)
  const plain = await loadImage(url);
  if (!plain) return false;

  // só dá pra inspecionar os pixels (checar se é em branco) quando o
  // servidor permite CORS; quando não permite, não tem como saber — nesse
  // caso assume que a imagem está ok, já que ela carrega normalmente pra
  // quem usa o app
  const cors = await loadImage(url, 'anonymous');
  if (!cors) return true;

  try {
    const canvas = document.createElement('canvas');
    canvas.width = SAMPLE_SIZE;
    canvas.height = SAMPLE_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return true;
    ctx.drawImage(cors, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
    const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);

    let blankPixels = 0;
    const totalPixels = SAMPLE_SIZE * SAMPLE_SIZE;
    for (let i = 0; i < data.length; i += 4) {
      const isTransparent = data[i + 3] === 0;
      const isWhite =
        data[i] >= WHITE_THRESHOLD &&
        data[i + 1] >= WHITE_THRESHOLD &&
        data[i + 2] >= WHITE_THRESHOLD;
      if (isTransparent || isWhite) blankPixels++;
    }

    return blankPixels / totalPixels < BLANK_RATIO;
  } catch {
    // canvas "contaminado" (servidor não mandou header CORS permissivo
    // mesmo aceitando a requisição anônima) — mesma lógica: não dá pra
    // inspecionar, então assume que está ok
    return true;
  }
}
