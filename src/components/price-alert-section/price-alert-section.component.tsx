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
import { cn } from '@/lib/utils';
import type { PriceAlert, PriceAlertMode } from '@/types';

type Option = 'p10' | 'p20' | 'custom' | 'lowest' | 'restock';

const PERCENT: Record<'p10' | 'p20', number> = { p10: 10, p20: 20 };

export default function PriceAlertSection({
  uid,
  productId,
  currentPrice,
  currency,
  available,
  priceWithCurrency,
}: {
  uid: string;
  productId: string;
  currentPrice: number;
  currency?: Currency;
  available?: boolean;
  priceWithCurrency: (price: number, sourceCurrency?: Currency) => string;
}) {
  const { t } = useTranslation();
  const [alert, setAlert] = useState<PriceAlert | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [targetPrice, setTargetPrice] = useState(currentPrice);
  const [option, setOption] = useState<Option>('p10');
  const [repeat, setRepeat] = useState(false);
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
      const mode: PriceAlertMode =
        option === 'lowest' ? 'lowest' : option === 'restock' ? 'restock' : 'target';
      const target =
        option === 'p10' || option === 'p20'
          ? Math.round(currentPrice * (1 - PERCENT[option] / 100) * 100) / 100
          : option === 'custom'
            ? targetPrice
            : currentPrice;
      const created = await createPriceAlert({
        productId,
        targetPrice: target,
        currency,
        mode,
        repeat: repeat && mode !== 'restock',
      });
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
          {alert.mode === 'lowest'
            ? t('productDetail.activeAlertLowest')
            : alert.mode === 'restock'
              ? t('productDetail.activeAlertRestock')
              : t('productDetail.activeAlert', {
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
    const options: { value: Option; label: string }[] = [
      ...(available === false
        ? [{ value: 'restock' as const, label: t('productDetail.options.restock') }]
        : []),
      { value: 'p10', label: t('productDetail.options.percent', { percent: 10 }) },
      { value: 'p20', label: t('productDetail.options.percent', { percent: 20 }) },
      { value: 'lowest', label: t('productDetail.options.lowest') },
      { value: 'custom', label: t('productDetail.options.custom') },
    ];
    const previewPrice =
      option === 'p10' || option === 'p20'
        ? Math.round(currentPrice * (1 - PERCENT[option] / 100) * 100) / 100
        : null;

    return (
      <div className="flex flex-col gap-3 rounded-lg border bg-card p-3">
        <div className="flex flex-wrap gap-2">
          {options.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setOption(item.value)}
              className={cn(
                'cursor-pointer rounded-full border px-3 py-1 text-sm transition-colors',
                option === item.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'bg-background hover:bg-accent',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        {previewPrice !== null && (
          <p className="text-sm text-muted-foreground">
            {t('productDetail.options.preview', {
              price: priceWithCurrency(previewPrice, currency),
            })}
          </p>
        )}
        {option === 'custom' && (
          <Input
            type="number"
            step="0.01"
            min={0}
            autoFocus
            aria-label={t('productDetail.targetPriceLabel')}
            value={targetPrice}
            onChange={(e) => setTargetPrice(Number(e.target.value))}
          />
        )}
        {option !== 'restock' && (
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={repeat}
              onChange={(e) => setRepeat(e.target.checked)}
              className="size-4 accent-primary"
            />
            {t('productDetail.options.repeat')}
          </label>
        )}
        <div className="flex gap-2">
          <Button
            className="flex-1"
            size="sm"
            disabled={isSubmitting || (option === 'custom' && !(targetPrice > 0))}
            onClick={handleCreate}
          >
            {t('productDetail.confirmAlert')}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setIsFormOpen(false)}>
            {t('common.cancel')}
          </Button>
        </div>
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
