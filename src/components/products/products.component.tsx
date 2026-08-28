import type { User } from 'firebase/auth';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import NoProductsFound from '../no-products-found/no-products-found.component';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  IconCheck,
  IconEdit,
  IconExternalLink,
  IconX,
} from '@tabler/icons-react';
import { deleteProduct, updateProduct } from '@/firebase/firebase';
import type { Product } from '@/types';
import Comments from '../comments/comments.component';

export default function Products({
  priceWithCurrency,
  updateProducts,
  setIsLoading,
  setId,
  setOpen,
  productsView,
  isOwner,
  profileUserId,
  currentUser,
  isRefreshingProducts,
}: {
  priceWithCurrency: (price: number) => string;
  updateProducts: () => Promise<void>;
  setIsLoading: (isLoading: boolean) => void;
  setId: (id: string) => void;
  setOpen: (open: boolean) => void;
  productsView: Product[];
  isOwner: boolean;
  profileUserId: string;
  currentUser: User | null;
  isRefreshingProducts: boolean;
}) {
  const { t } = useTranslation();

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
    setId(id);
    setOpen(true);
  };

  const removeProduct = async (id: string, name: string) => {
    setIsLoading(true);
    try {
      await deleteProduct(id);
      await updateProducts();
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
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent>
                    <div
                      className="h-64 sm:h-80 mb-3 rounded-lg bg-muted"
                      style={{
                        background: `url(${url}) center center / contain no-repeat`,
                      }}
                    ></div>
                    <p className="truncate text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      {store} · {category}
                    </p>
                    <p className="font-semibold text-lg truncate">
                      {firstLetterUppercase(name)}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-primary font-semibold">
                        {price
                          ? priceWithCurrency(price)
                          : t('products.priceUnknown')}
                      </p>
                      {priceFrom && priceFrom > price && (
                        <p className="text-sm text-muted-foreground line-through">
                          {priceWithCurrency(priceFrom)}
                        </p>
                      )}
                      {available === false && (
                        <Badge variant="destructive">
                          {t('products.unavailable')}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="rounded-b-none">
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={buttonVariants({ variant: 'link' })}
                        >
                          {t('products.viewInStore')}
                          <IconExternalLink stroke={2} />
                        </a>
                      </div>
                      {isOwner && !bought && (
                        <div className="flex gap-2">
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
                    </div>
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
    </div>
  );
}
