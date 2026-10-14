import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { IconBellOff, IconX } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cancelPriceAlert, getActivePriceAlertsForUser } from '@/firebase/firebase';
import { useLocale } from '@/hooks/use-locale';
import { useProfileOutlet } from '@/hooks/use-profile-outlet';
import type { PriceAlert } from '@/types';

export default function AlertsPage() {
  const { t } = useTranslation();
  const { priceWithCurrency, path } = useLocale();
  const { profile, isOwner, products, isLoading: isProductsLoading } = useProfileOutlet();

  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting state when the effect's dependency (profile.uid) changes, per https://react.dev/learn/synchronizing-with-effects#fetching-data
    setIsLoading(true);
    getActivePriceAlertsForUser(profile.uid).then((result) => {
      if (cancelled) return;
      setAlerts(result);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [profile.uid]);

  const productsById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

  const handleCancel = async (alertId: string) => {
    try {
      await cancelPriceAlert(alertId);
      setAlerts((prev) => prev.filter((item) => item.id !== alertId));
      toast.success(t('productDetail.toasts.cancelled'));
    } catch (error) {
      console.error(error);
      toast.error(t('productDetail.toasts.cancelledError'));
    }
  };

  // alertas são pessoais — quem visita o perfil de outra pessoa não deve
  // ver (nem poder mexer em) uma tela de "seus alertas" que não são dela
  if (!isOwner) {
    return <Navigate to={path(`/${profile.username}/wishlist`)} replace />;
  }

  if (isLoading || isProductsLoading) {
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

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-16 text-center">
          <IconBellOff className="text-muted-foreground" size={40} stroke={1.5} />
          <p className="text-lg font-semibold">{t('alerts.emptyTitle')}</p>
          <p className="max-w-sm text-muted-foreground">{t('alerts.emptySubtitle')}</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {alerts.map((alert) => {
            const product = productsById.get(alert.productId);
            if (!product) return null;

            return (
              <li key={alert.id} className="flex gap-3 rounded-xl border bg-card p-4">
                <div
                  className="size-16 shrink-0 rounded-lg bg-muted"
                  style={{
                    background: `url(${product.url}) center center / contain no-repeat`,
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('alerts.currentLabel', {
                      price: priceWithCurrency(product.price, product.currency),
                    })}
                  </p>
                  <p className="text-sm font-medium text-primary">
                    {t('alerts.targetLabel', {
                      price: priceWithCurrency(alert.targetPrice, alert.currency),
                    })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleCancel(alert.id)}
                  aria-label={t('alerts.cancel')}
                >
                  <IconX className="size-4" stroke={2} />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
