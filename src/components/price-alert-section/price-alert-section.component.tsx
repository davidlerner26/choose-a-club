import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { IconBell, IconX } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  cancelPriceAlert,
  createPriceAlert,
  getActivePriceAlert,
} from '@/firebase/firebase';
import type { Currency } from '@/i18n/locales';
import type { PriceAlert } from '@/types';

export default function PriceAlertSection({
  uid,
  productId,
  currentPrice,
  currency,
  priceWithCurrency,
}: {
  uid: string;
  productId: string;
  currentPrice: number;
  currency?: Currency;
  priceWithCurrency: (price: number, sourceCurrency?: Currency) => string;
}) {
  const { t } = useTranslation();
  const [alert, setAlert] = useState<PriceAlert | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [targetPrice, setTargetPrice] = useState(currentPrice);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting state when the effect's dependencies (uid/productId) change, per https://react.dev/learn/synchronizing-with-effects#fetching-data
    setIsLoading(true);
    getActivePriceAlert(uid, productId).then((result) => {
      if (cancelled) return;
      setAlert(result);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [uid, productId]);

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      const created = await createPriceAlert({ productId, targetPrice, currency });
      setAlert(created);
      setIsFormOpen(false);
      toast.success(t('productDetail.toasts.created'));
    } catch (error) {
      console.error(error);
      toast.error(t('productDetail.toasts.createdError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!alert) return;
    setIsSubmitting(true);
    try {
      await cancelPriceAlert(alert.id);
      setAlert(null);
      toast.success(t('productDetail.toasts.cancelled'));
    } catch (error) {
      console.error(error);
      toast.error(t('productDetail.toasts.cancelledError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return null;

  if (alert) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-lg bg-accent px-3 py-2 text-sm text-accent-foreground">
        <span className="flex items-center gap-2">
          <IconBell className="size-4 shrink-0" stroke={2} />
          {t('productDetail.activeAlert', {
            price: priceWithCurrency(alert.targetPrice, alert.currency),
          })}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={isSubmitting}
          onClick={handleCancel}
          aria-label={t('productDetail.cancelAlert')}
        >
          <IconX className="size-4" stroke={2} />
        </Button>
      </div>
    );
  }

  if (isFormOpen) {
    return (
      <div className="flex items-center gap-2 rounded-lg border bg-card p-2">
        <Input
          type="number"
          step="0.01"
          min={0}
          autoFocus
          aria-label={t('productDetail.targetPriceLabel')}
          value={targetPrice}
          onChange={(e) => setTargetPrice(Number(e.target.value))}
        />
        <Button
          size="sm"
          disabled={isSubmitting || !(targetPrice > 0)}
          onClick={handleCreate}
        >
          {t('productDetail.confirmAlert')}
        </Button>
      </div>
    );
  }

  return (
    <Button className="w-full" onClick={() => setIsFormOpen(true)}>
      <IconBell stroke={2} />
      {t('productDetail.createAlert')}
    </Button>
  );
}
