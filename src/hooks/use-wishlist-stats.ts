import { useMemo } from 'react';
import type { Product } from '@/types';

export function useWishlistStats(products: Product[]) {
  return useMemo(() => {
    const wanted = products.filter((item) => !item.bought);
    const dropping = wanted.filter((item) => item.priceFrom && item.priceFrom > item.price);
    const bought = products.filter((item) => item.bought);
    return { wanted, dropping, bought };
  }, [products]);
}
