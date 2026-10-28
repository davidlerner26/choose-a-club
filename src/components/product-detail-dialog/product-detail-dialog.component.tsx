import { useTranslation } from 'react-i18next';
import ProductImage from '@/components/product-image/product-image.component';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { IconCheck, IconEdit, IconExternalLink, IconX } from '@tabler/icons-react';
import PriceTrendChart from '@/components/price-trend-chart/price-trend-chart.component';
import PriceAlertSection from '@/components/price-alert-section/price-alert-section.component';
import { usePriceHistory } from '@/hooks/use-price-history';
import type { Currency } from '@/i18n/locales';
import type { Product } from '@/types';

export default function ProductDetailDialog({
  product,
  profileUserId,
  open,
  onOpenChange,
  priceWithCurrency,
  isOwner,
  onBuy,
  onEdit,
  onRemove,
}: {
  product: Product | null;
  profileUserId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  priceWithCurrency: (price: number, sourceCurrency?: Currency) => string;
  isOwner: boolean;
  onBuy: (product: Product) => void;
  onEdit: (id: string) => void;
  onRemove: (id: string, name: string) => void;
}) {
  const { t } = useTranslation();
  const history = usePriceHistory(profileUserId, product?.id);

  if (!product) return null;

  const { id, name, price, priceFrom, currency, link, store, category, url, bought, available } =
    product;
  const hasDrop = !!priceFrom && priceFrom > price;
  const percent = hasDrop ? Math.round(((priceFrom! - price) / priceFrom!) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">{name}</DialogTitle>
          <DialogDescription className="sr-only">{store}</DialogDescription>
        </DialogHeader>
        <ProductImage url={url} alt={name} className="h-56 w-full rounded-xl" />
        <div>
          <p className="truncate text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {store} · {category}
          </p>
          <p className="text-lg font-semibold">{name}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-2xl font-semibold text-primary">
            {price ? priceWithCurrency(price, currency) : t('products.priceUnknown')}
          </p>
          {hasDrop && (
            <>
              <p className="text-sm text-muted-foreground line-through">
                {priceWithCurrency(priceFrom!, currency)}
              </p>
              <Badge variant="success">-{percent}%</Badge>
            </>
          )}
          {available === false && !bought && (
            <Badge variant="destructive">{t('products.unavailable')}</Badge>
          )}
        </div>
        {hasDrop && (
          <div className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
            {t('productDetail.goodPriceDescription', { percent })}
          </div>
        )}
        {price > 0 && (
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              {t('productDetail.trend')}
            </p>
            <PriceTrendChart
              from={hasDrop ? priceFrom! : price}
              to={price}
              history={history}
            />
            {history.length >= 2 && (
              <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                <span>
                  {t('productDetail.lowest', {
                    price: priceWithCurrency(
                      Math.min(...history.map((point) => point.price)),
                      currency,
                    ),
                  })}
                </span>
                <span>
                  {t('productDetail.highest', {
                    price: priceWithCurrency(
                      Math.max(...history.map((point) => point.price)),
                      currency,
                    ),
                  })}
                </span>
              </div>
            )}
          </div>
        )}
        {isOwner && !bought && (
          <PriceAlertSection
            uid={profileUserId}
            productId={id}
            currentPrice={price}
            currency={currency}
            available={available}
            priceWithCurrency={priceWithCurrency}
          />
        )}
        <DialogFooter className="sm:justify-between">
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: 'outline' })}
          >
            {t('products.viewInStore')}
            <IconExternalLink stroke={2} />
          </a>
          {isOwner && !bought && (
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => onBuy(product)}>
                <IconCheck stroke={2} />
              </Button>
              <Button variant="outline" size="icon" onClick={() => onEdit(id)}>
                <IconEdit stroke={2} />
              </Button>
              <Button variant="outline" size="icon" onClick={() => onRemove(id, name)}>
                <IconX stroke={2} />
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
