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
import { Input } from './components/ui/input';
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
      products.filter((product) => product.category === category),
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

  const focusInput = () => {
    const input = document.getElementById('link');
    input?.focus();
  };

  return isLoading ? (
    <div className="flex items-center justify-center w-screen h-screen">
      <Spinner />
    </div>
  ) : (
    <main className="m-auto max-w-6xl mt-8">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <img className="w-12" src="favicon.svg" />
          <h1 className="text-3xl">Bambina</h1>
        </div>
        <div className="flex items-center gap-4">
          <div>
            <p className="text-right">
              {productsView?.length} peças
              {optionSelected ? ' compradas' : ' desejadas'}
            </p>
            <p className="text-right text-red-700">
              <span className="mr-4">
                {priceWithCurrency(
                  productsView?.reduce((acc, product) => {
                    return acc + product.price;
                  }, 0),
                )}
              </span>
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => updateProducts()}>
              <IconRefresh data-icon="inline-start" />
              Atualizar
            </Button>
            <Button
              size="lg"
              className="bg-red-700 hover:bg-red-800"
              onClick={() => setOpen(true)}
            >
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

      <div className="flex gap-4 items-center">
        <div className="flex gap-2 pr-4 border-r">
          {categories.map((category) => (
            <Badge
              variant={selectedCategory === category ? 'default' : 'outline'}
              key={category}
              onClick={() => selectCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
        <div className="flex">
          {options.map((option) => (
            <Button
              variant="link"
              size="xs"
              onClick={() => selectOption(option)}
              key={option.value}
              className={
                option.bought === optionSelected ? 'underline text-red-700' : ''
              }
            >
              {option.value}
            </Button>
          ))}
        </div>
      </div>

      <hr className="mt-10 mb-10" />

      <div className="flex gap-3 items-center mb-6">
        <Input id="link" name="link" placeholder="Cole o link da peça aqui" />
        <Button
          size="lg"
          className="bg-red-700 hover:bg-red-800"
          onClick={() => focusInput()}
        >
          Adicionar
        </Button>
      </div>

      <div>
        {productsView?.length > 0 ? (
          <ul className="grid grid-cols-4 gap-4">
            {productsView?.map(
              ({ id, name, price, link, store, category, url, bought }) => (
                <li key={id} title={name}>
                  <Card>
                    <CardContent>
                      <div
                        className="h-80 mb-3 rounded-md"
                        style={{
                          background: `url(${url}) center center / contain no-repeat`,
                        }}
                      ></div>
                      <p className="truncate">
                        {store.toUpperCase()} · {category.toUpperCase()}
                      </p>
                      <p className="font-bold text-lg truncate">
                        {firstLetterUppercase(name)}
                      </p>
                      <p className="text-red-700 text-lg">
                        {price ? priceWithCurrency(price) : 'preço a conferir'}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <a
                            href={link}
                            target="_blank"
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
          <NoProductsFound focusInput={focusInput} />
        )}
      </div>
    </main>
  );
}
