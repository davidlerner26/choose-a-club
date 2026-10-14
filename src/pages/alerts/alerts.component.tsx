import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IconBellOff } from '@tabler/icons-react';
import { Spinner } from '@/components/ui/spinner';
import Products from '@/components/products/products.component';
import { useAuth } from '@/hooks/use-auth';
import { useLocale } from '@/hooks/use-locale';
import { useProfileOutlet } from '@/hooks/use-profile-outlet';

export default function AlertsPage() {
  const { t } = useTranslation();
  const { priceWithCurrency } = useLocale();
  const { user } = useAuth();
  const {
    profile,
    isOwner,
    products,
    isLoading,
    setIsLoading,
    refetchProducts,
    editProduct,
    revealedIds,
    requestReveal,
  } = useProfileOutlet();

  const dropped = useMemo(
    () =>
      products
        .filter(
          (item) =>
            !item.bought && item.priceFrom && item.priceFrom > item.price && item.available !== false,
        )
        .sort(
          (a, b) =>
            (b.priceFrom! - b.price) / b.priceFrom! - (a.priceFrom! - a.price) / a.priceFrom!,
        ),
    [products],
  );
  const droppedIds = useMemo(() => dropped.map((item) => item.id).join(','), [dropped]);

  useEffect(() => {
    requestReveal(dropped);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-request when the dropped id set changes, not on every products/revealedIds write
  }, [droppedIds]);

  const visibleDropped = dropped.filter((item) => revealedIds.has(item.id));
  const isRefreshing = dropped.some((item) => !revealedIds.has(item.id));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner className="text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          {t('nav.alerts')}
        </h1>
        <p className="text-muted-foreground">{t('alerts.subtitle')}</p>
      </div>

      {dropped.length === 0 && !isRefreshing ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-16 text-center">
          <IconBellOff className="text-muted-foreground" size={40} stroke={1.5} />
          <p className="text-lg font-semibold">{t('alerts.emptyTitle')}</p>
          <p className="max-w-sm text-muted-foreground">{t('alerts.emptySubtitle')}</p>
        </div>
      ) : (
        <Products
          priceWithCurrency={priceWithCurrency}
          updateProducts={refetchProducts}
          setIsLoading={setIsLoading}
          onEdit={editProduct}
          productsView={visibleDropped}
          isOwner={isOwner}
          profileUserId={profile.uid}
          currentUser={user}
          isRefreshingProducts={isRefreshing}
        />
      )}
    </div>
  );
}
