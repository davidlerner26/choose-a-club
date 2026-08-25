import { extractProduct } from '@/components/api/api';
import { updateProduct } from '@/firebase/firebase';
import type { Product } from '@/types';

export async function refreshProduct(product: Product): Promise<Product> {
  try {
    const fetched = await extractProduct(product.link);
    if ('manual' in fetched) return product;

    return {
      ...product,
      name: fetched.name || product.name,
      store: fetched.store || product.store,
      category: fetched.categoria || product.category,
      url: fetched.imagem || product.url,
      price: fetched.price || product.price,
      priceFrom: fetched.precoDe ?? product.priceFrom,
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
    refreshed.name !== original.name ||
    refreshed.store !== original.store ||
    refreshed.category !== original.category ||
    refreshed.url !== original.url;
  if (!changed) return;

  try {
    await updateProduct(refreshed.id, {
      price: refreshed.price,
      priceFrom: refreshed.priceFrom,
      available: refreshed.available,
      name: refreshed.name,
      store: refreshed.store,
      category: refreshed.category,
      url: refreshed.url,
    });
  } catch (error) {
    console.error(error);
  }
}
