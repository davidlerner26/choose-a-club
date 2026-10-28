import { useEffect, useState } from 'react';
import { getPriceHistory } from '@/firebase/firebase';
import type { PricePoint } from '@/types';

export function usePriceHistory(uid: string, productId: string | undefined) {
  const [state, setState] = useState<{ key: string; points: PricePoint[] } | null>(null);
  const key = `${uid}/${productId}`;

  useEffect(() => {
    if (!productId) return;
    let cancelled = false;
    getPriceHistory(uid, productId)
      .then((points) => {
        if (!cancelled) setState({ key, points });
      })
      .catch((error) => console.error(error));
    return () => {
      cancelled = true;
    };
  }, [uid, productId, key]);

  // descarta resultado de outro produto enquanto o novo carrega
  return state?.key === key ? state.points : [];
}
