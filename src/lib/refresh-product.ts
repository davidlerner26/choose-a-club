import { toast } from 'sonner';
import { extractProduct } from '@/components/api/api';
import { updateProduct } from '@/firebase/firebase';
import type { Product } from '@/types';

// A loja pode bloquear a leitura ou simplesmente não ser suportada pelo
// scraper — isso é rotina num refresh em segundo plano, não um erro pro
// usuário: só mantém o que já está salvo no Firebase, sem toast.
export async function refreshProduct(product: Product): Promise<Product> {
  try {
    const fetched = await extractProduct(product.link);
    if ('manual' in fetched) {
      console.error(fetched.motivo, product.link);
      return product;
    }

    return {
      ...product,
      // a loja informa o preço em reais, então uma checagem bem-sucedida
      // sempre reflete o preço real em BRL, mesmo que o produto tivesse
      // sido salvo antes numa outra moeda
      price: fetched.price || product.price,
      priceFrom: fetched.precoDe ?? product.priceFrom,
      currency: 'BRL',
      available:
        typeof fetched.disponivel === 'boolean'
          ? fetched.disponivel
          : (product.available ?? true),
    };
  } catch (error) {
    console.error(error);
    return product;
  }
}

export async function persistRefreshedProduct(
  refreshed: Product,
  original: Product,
) {
  const changed =
    refreshed.price !== original.price ||
    refreshed.priceFrom !== original.priceFrom ||
    refreshed.available !== original.available ||
    refreshed.currency !== (original.currency ?? 'BRL');
  if (!changed) return;

  // Firestore's updateDoc() rejects explicit `undefined` values — omit
  // priceFrom entirely instead of sending it as undefined.
  const updates: Partial<Product> = {
    price: refreshed.price,
    currency: refreshed.currency,
    available: refreshed.available,
  };
  if (refreshed.priceFrom !== undefined) {
    updates.priceFrom = refreshed.priceFrom;
  }

  try {
    await updateProduct(refreshed.id, updates);
  } catch (error) {
    console.error(error);
    toast.error('Não consegui salvar a atualização de um produto', {
      id: 'persist-product-error',
      description: refreshed.name,
    });
  }
}
