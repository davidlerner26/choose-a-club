import { useState } from 'react';
import ProductImage from '@/components/product-image/product-image.component';
import type { User } from 'firebase/auth';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import NoProductsFound from '../no-products-found/no-products-found.component';
import { Button } from '@/components/ui/button';
import { IconCheck, IconChevronRight, IconEdit, IconX } from '@tabler/icons-react';
import { deleteProduct, updateProduct } from '@/firebase/firebase';
import type { Currency } from '@/i18n/locales';
import type { Product } from '@/types';
import Comments from '../comments/comments.component';
import ProductDetailDialog from '../product-detail-dialog/product-detail-dialog.component';
import PriceTrendChart from '../price-trend-chart/price-trend-chart.component';
import PriceAlertSection from '../price-alert-section/price-alert-section.component';

export default function Products({
  priceWithCurrency,
  updateProducts,
  setIsLoading,
  onEdit,
  productsView,
  isOwner,
  profileUserId,
  currentUser,
  isRefreshingProducts,
}: {
  priceWithCurrency: (price: number, sourceCurrency?: Currency) => string;
  updateProducts: () => Promise<void>;
  setIsLoading: (isLoading: boolean) => void;
  onEdit: (id: string) => void;
  productsView: Product[];
  isOwner: boolean;
  profileUserId: string;
  currentUser: User | null;
  isRefreshingProducts: boolean;
}) {
  const { t } = useTranslation();
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  const firstLetterUppercase = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const buyProduct = async ({
    id,
    name,
    price,
    link,
    store,
    category,
    url,
  }: Product) => {
    setIsLoading(true);
    const product: Product = {
      id,
      name,
      price,
      link,
      store,
      category,
      url,
      bought: true,
    };
    try {
      await updateProduct(id, product);
      await updateProducts();
      setDetailProduct(null);
      toast.success(t('products.toasts.bought'));
    } catch (error) {
      console.error(error);
      toast.error(t('products.toasts.boughtError'), {
        description: name,
      });
      setIsLoading(false);
    }
  };

  const editProduct = (id: string) => {
    setDetailProduct(null);
    onEdit(id);
  };

  const removeProduct = async (id: string, name: string) => {
    setIsLoading(true);
    try {
      await deleteProduct(id);
      await updateProducts();
      setDetailProduct(null);
      toast.success(t('products.toasts.removed'));
    } catch (error) {
      console.error(error);
      toast.error(t('products.toasts.removedError'), { description: name });
      setIsLoading(false);
    }
  };

  return (
    <div>
      {productsView?.length > 0 ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {productsView?.map(
            ({
              id,
              name,
              price,
              priceFrom,
              currency,
              link,
              store,
              category,
              url,
              bought,
              available,
            }) => (
              <li
                key={id}
                title={name}
                className="animate-in slide-in-from-right fade-in duration-500 ease-out"
              >
                <Card className="h-full transition-shadow hover:shadow-lg hover:shadow-primary/5">
                  <CardContent>
                    <button
                      type="button"
                      onClick={() =>
                        setDetailProduct({
                          id,
                          name,
                          price,
                          priceFrom,
                          currency,
                          link,
                          store,
                          category,
                          url,
                          bought,
                          available,
                        })
                      }
                      className="relative mb-3 block h-64 w-full cursor-pointer rounded-xl bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:h-80"
                    >
                      <ProductImage
                        url={url}
                        alt={name}
                        className="absolute inset-0 rounded-xl"
                      />
                      {!!priceFrom && priceFrom > price && (
                        <Badge
                          variant="success"
                          className="absolute top-2 left-2"
                        >
                          -{Math.round(((priceFrom - price) / priceFrom) * 100)}%
                        </Badge>
                      )}
                    </button>
                    <p className="truncate text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      {store} · {category}
                    </p>
                    <p className="font-semibold text-lg truncate">
                      {firstLetterUppercase(name)}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-primary font-semibold">
                        {price
                          ? priceWithCurrency(price, currency)
                          : t('products.priceUnknown')}
                      </p>
                      {priceFrom && priceFrom > price && (
                        <p className="text-sm text-muted-foreground line-through">
                          {priceWithCurrency(priceFrom, currency)}
                        </p>
                      )}
                      {available === false && !bought && (
                        <Badge variant="destructive">
                          {t('products.unavailable')}
                        </Badge>
                      )}
                    </div>
                    {price > 0 && (
                      <PriceTrendChart
                        from={priceFrom && priceFrom > price ? priceFrom : price}
                        to={price}
                        className="mt-2 h-10"
                      />
                    )}
                    {isOwner && !bought && (
                      <div className="mt-3">
                        <PriceAlertSection
                          uid={profileUserId}
                          productId={id}
                          currentPrice={price}
                          currency={currency}
                          available={available}
                          priceWithCurrency={priceWithCurrency}
                        />
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex-col items-stretch gap-2 rounded-b-none">
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t('products.viewInStore')}
                      className="flex items-center justify-between rounded-md px-1 py-1 text-sm font-medium text-foreground transition-colors hover:text-primary"
                    >
                      <span className="truncate">{store}</span>
                      <IconChevronRight
                        className="size-4 shrink-0 text-muted-foreground"
                        stroke={2}
                      />
                    </a>
                    {isOwner && !bought && (
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            buyProduct({
                              id,
                              name,
                              price,
                              link,
                              store,
                              category,
                              url,
                            })
                          }
                        >
                          <IconCheck stroke={2} />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => editProduct(id)}
                        >
                          <IconEdit stroke={2} />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeProduct(id, name)}
                        >
                          <IconX stroke={2} />
                        </Button>
                      </div>
                    )}
                  </CardFooter>
                  <Comments
                    productId={id}
                    profileUserId={profileUserId}
                    currentUser={currentUser}
                    className="-mt-4"
                  />
                </Card>
              </li>
            ),
          )}
        </ul>
      ) : isRefreshingProducts ? null : (
        <NoProductsFound />
      )}
      <ProductDetailDialog
        product={detailProduct}
        profileUserId={profileUserId}
        open={!!detailProduct}
        onOpenChange={(open) => !open && setDetailProduct(null)}
        priceWithCurrency={priceWithCurrency}
        isOwner={isOwner}
        onBuy={buyProduct}
        onEdit={editProduct}
        onRemove={removeProduct}
      />
    </div>
  );
}
