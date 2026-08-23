import type { User } from 'firebase/auth';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
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
}) {
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
    await updateProduct(id, product);
    await updateProducts();
  };

  const editProduct = (id: string) => {
    setId(id);
    setOpen(true);
  };

  const removeProduct = async (id: string) => {
    setIsLoading(true);
    await deleteProduct(id);
    await updateProducts();
  };

  return (
    <div>
      {productsView?.length > 0 ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {productsView?.map(
            ({ id, name, price, link, store, category, url, bought }) => (
              <li key={id} title={name}>
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
                    <p className="text-primary font-semibold">
                      {price ? priceWithCurrency(price) : 'preço a conferir'}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={buttonVariants({ variant: 'link' })}
                        >
                          Ver na loja
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
                            onClick={() => removeProduct(id)}
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
                  />
                </Card>
              </li>
            ),
          )}
        </ul>
      ) : (
        <NoProductsFound />
      )}
    </div>
  );
}
