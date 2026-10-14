import { useCallback, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { runWithConcurrency } from '@/lib/concurrency';
import { refreshProduct, persistRefreshedProduct } from '@/lib/refresh-product';
import type { Product } from '@/types';

// Confere preço/disponibilidade na loja (com concorrência limitada) só para
// os produtos pedidos e ainda não revelados nesta sessão — cada um aparece
// na tela conforme o refresh termina, em vez de travar a UI esperando todos.
export function useProductReveal({
  isOwner,
  setProducts,
}: {
  isOwner: boolean;
  setProducts: Dispatch<SetStateAction<Product[]>>;
}) {
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const inFlightIds = useRef<Set<string>>(new Set());
  // incrementado a cada reset (ex: troca de perfil) pra invalidar refreshes
  // em andamento da sessão anterior
  const sessionRef = useRef(0);

  const reveal = useCallback(
    (products: Product[]) => {
      const session = sessionRef.current;
      const pending = products.filter((item) => !inFlightIds.current.has(item.id));
      if (pending.length === 0) return;
      pending.forEach((item) => inFlightIds.current.add(item.id));

      runWithConcurrency(pending, 4, async (baseProduct) => {
        const refreshed = await refreshProduct(baseProduct);
        if (session !== sessionRef.current) return;
        if (isOwner) {
          await persistRefreshedProduct(refreshed, baseProduct);
        }
        if (session !== sessionRef.current) return;
        setProducts((prev) =>
          prev.map((item) => (item.id === refreshed.id ? refreshed : item)),
        );
        setRevealedIds((prev) => new Set(prev).add(refreshed.id));
        inFlightIds.current.delete(refreshed.id);
      });
    },
    [isOwner, setProducts],
  );

  // revelação inicial "preguiçosa": só busca os que ainda não foram
  // conferidos nesta sessão
  const requestReveal = useCallback(
    (products: Product[]) => {
      reveal(products.filter((item) => !revealedIds.has(item.id)));
    },
    [reveal, revealedIds],
  );

  // refresh manual: força a busca de novo pros produtos dados, mesmo que já
  // tivessem sido revelados antes
  const refreshProducts = useCallback(
    (products: Product[]) => {
      const ids = new Set(products.map((item) => item.id));
      setRevealedIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
      reveal(products);
    },
    [reveal],
  );

  const resetRevealed = useCallback(() => {
    sessionRef.current += 1;
    inFlightIds.current.clear();
    setRevealedIds(new Set());
  }, []);

  return { revealedIds, requestReveal, refreshProducts, resetRevealed };
}
