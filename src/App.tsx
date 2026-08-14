import { useEffect, useState } from 'react';
import type { Product } from './types';
import AddProductDialog from './components/add-product-dialog.component';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  IconCheck,
  IconEdit,
  IconExternalLink,
  IconPlus,
  IconRefresh,
  IconX,
} from '@tabler/icons-react';
import { Card, CardContent, CardFooter } from './components/ui/card';
import './App.css';
import NoProductsFound from './components/no-products-found.component';
import {
  deleteProduct,
  getAllProducts,
  updateProduct,
} from './firebase/firebase';
import { Spinner } from '@/components/ui/spinner';

export type Option = {
  value: string;
  selected: boolean;
  bought: boolean;
};

export default function App() {
  const options: Option[] = [
    { value: 'Desejando', selected: false, bought: false },
    { value: 'Já comprei', selected: false, bought: true },
  ];

  const categories = [
    'Tudo',
    'Blusas',
    'Calças',
    'Vestidos',
    'Saias',
    'Casacos',
    'Sapatos',
    'Bolsas',
    'Acessórios',
    'Brinquedos',
    'Jogos',
    'Perucas',
    'Outros',
    'Roupas de verão',
    'Roupas de festa',
  ];

  const [open, setOpen] = useState<boolean>(false);
  const [id, setId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsView, setProductsView] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [optionSelected, setOptionSelected] = useState<boolean>();
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);

  const selectOption = (option: Option, productList: Product[] = products) => {
    setOptionSelected(option.bought);
    setProductsView(
      productList.filter((product) => product.bought === option.bought),
    );
  };

  const refreshProducts = async () => {
    await updateProducts();
    selectCategory(selectedCategory);
  };

  const updateProducts = async () => {
    setIsLoading(true);
    const response = await getAllProducts();
    setProducts(response);
    selectOption(options[0], response);
    setIsLoading(false);
  };

  useEffect(() => {
    async function fetchProducts() {
      await updateProducts();
    }
    fetchProducts();
  }, []);

  const selectCategory = (category: string) => {
    if (category === selectedCategory) return;
    setSelectedCategory(category);
    setProductsView(
      selectedCategory
        ? products.filter((product) => product.category === category)
        : products,
    );
  };

  const buyProduct = async ({
    id,
    name,
    price,
    link,
    store,
    category,
    url,
  }) => {
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

  const firstLetterUppercase = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const priceWithCurrency = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  // const focusInput = () => {
  //   const input = document.getElementById('link');
  //   input?.focus();
  // };

  return isLoading ? (
    <div className="flex items-center justify-center w-screen h-screen">
      <Spinner className="text-primary" />
    </div>
  ) : (
    <main className="m-auto max-w-6xl mt-8 px-4 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b">
        <div className="flex items-center gap-2.5">
          <img className="w-10" src="favicon.svg" />
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-primary">
            Bambina
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end rounded-lg bg-accent px-4 py-2">
            <p className="text-sm text-accent-foreground">
              {productsView?.length}{' '}
              {productsView?.length === 1 ? 'peça' : 'peças'}
              {optionSelected ? ' compradas' : ' desejadas'}
            </p>
            <p className="text-lg font-semibold text-primary">
              {priceWithCurrency(
                productsView?.reduce((acc, product) => {
                  return acc + product.price;
                }, 0),
              )}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => refreshProducts()}>
              <IconRefresh data-icon="inline-start" />
              Atualizar
            </Button>
            <Button size="lg" onClick={() => setOpen(true)}>
              <IconPlus></IconPlus>
              Adicionar produto
            </Button>
            {open && (
              <AddProductDialog
                categories={categories}
                open={open}
                setOpen={setOpen}
                id={id}
                setId={setId}
                updateProducts={updateProducts}
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge
              variant={selectedCategory === category ? 'default' : 'outline'}
              key={category}
              onClick={() => selectCategory(category)}
              className="cursor-pointer select-none transition-colors hover:bg-accent hover:text-accent-foreground data-[selected=true]:hover:bg-primary/90"
              data-selected={selectedCategory === category}
            >
              {category}
            </Badge>
          ))}
        </div>
        <div className="flex gap-1 rounded-full bg-muted p-1">
          {options.map((option) => (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => selectOption(option)}
              key={option.value}
              className={
                option.bought === optionSelected
                  ? 'rounded-full bg-card text-primary shadow-sm hover:bg-card'
                  : 'rounded-full text-muted-foreground hover:bg-transparent'
              }
            >
              {option.value}
            </Button>
          ))}
        </div>
      </div>

      <hr className="mt-8 mb-8" />

      {/* <div className="flex gap-3 items-center mb-6">
        <Input id="link" name="link" placeholder="Cole o link da peça aqui" />
        <Button
          size="lg"
          className="bg-red-700 hover:bg-red-800"
          onClick={() => focusInput()}
        >
          Adicionar
        </Button>
      </div> */}

      <div>
        {productsView?.length > 0 ? (
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {productsView?.map(
              ({ id, name, price, link, store, category, url, bought }) => (
                <li key={id} title={name}>
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardContent>
                      <div
                        className="h-80 mb-3 rounded-lg bg-muted"
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
                        {!bought && (
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
                  </Card>
                </li>
              ),
            )}
          </ul>
        ) : (
          <NoProductsFound />
        )}
      </div>
    </main>
  );
}
