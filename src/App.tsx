import { useState } from 'react';
import type { Product } from './types';
import AddProductDialog from './components/add-product-dialog.component';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  IconCheck,
  IconEdit,
  IconExternalLink,
  IconRefresh,
  IconX,
} from '@tabler/icons-react';
import { Card, CardContent, CardFooter } from './components/ui/card';
import './App.css';
import NoProductsFound from './components/no-products-found.component';

export default function App() {
  const [open, setOpen] = useState<boolean>(false);

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
  const options = [
    { value: 'Desejando', selected: false },
    { value: 'Já comprei', selected: false },
  ];

  const [products, setProducts] = useState<Product[]>([]);
  const [optionSelected, setOptionSelected] = useState<string>(
    options[0].value,
  );

  const selectCategory = (category: string) => {
    if (category === selectedCategory) return;
    setSelectedCategory(category);
    setProducts((products) =>
      products.filter((product) => product.category === category),
    );
  };

  const selectOption = (option: string) => {
    setOptionSelected(option);
  };

  const buyProduct = (id: string) => {
    removeProduct(id);
  };

  const editProduct = (id: string) => {
    console.log(id);
  };

  const removeProduct = (id: string) => {
    setProducts((products) => products.filter((product) => product.id !== id));
  };

  const firstLetterUppercase = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const productsWithChoosenCurrency = (currency: string) => {
    return products?.find((product) => product.currency === currency);
  };

  const priceWithCurrency = (price: number, currency: string) => {
    switch (currency) {
      case 'BRL':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(price);
      case 'USD':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(price);
      default:
        return price;
    }
  };

  const [selectedCategory, setSelectedCategory] = useState(categories[0]);

  return (
    <main className="m-auto max-w-6xl mt-8">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <img className="w-12" src="favicon.svg" />
          <h1 className="text-3xl">Bambina</h1>
        </div>
        <div className="flex items-center gap-4">
          <div>
            <p className="text-right">{products?.length} peças desejadas</p>
            <p className="text-right text-red-700">
              <span className="mr-4">
                {priceWithCurrency(
                  products?.reduce((acc, product) => {
                    if (product.currency === 'BRL') {
                      return acc + product.price;
                    }
                  }, 0),
                  'BRL',
                )}
              </span>
              <span>
                {productsWithChoosenCurrency('USD') &&
                  priceWithCurrency(
                    products?.reduce(
                      (acc, product) =>
                        product.currency === 'USD' ? acc + product.price : 0,
                      0,
                    ),
                    'USD',
                  )}
              </span>
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <IconRefresh data-icon="inline-start" />
              Atualizar
            </Button>
            <AddProductDialog
              categories={categories}
              setProducts={setProducts}
              open={open}
              setOpen={setOpen}
            />
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
              onClick={() => selectOption(option.value)}
              key={option.value}
              className={
                option.value === optionSelected ? 'underline text-red-700' : ''
              }
            >
              {option.value}
            </Button>
          ))}
        </div>
      </div>

      <hr className="mt-10 mb-10" />

      {/* <div className="flex gap-3 items-center mb-6">
        <Input
          id="link"
          name="link"
          placeholder="Cole o link da peça aqui - ela entra sozinha ✨"
        />
        <Button
          size="lg"
          className="bg-red-700 hover:bg-red-800"
          onClick={() => focusInput()}
        >
          Adicionar
        </Button>
      </div> */}

      <div>
        {products?.length > 0 ? (
          <ul className="grid grid-cols-4 gap-4">
            {products?.map(
              ({ id, name, price, link, store, category, url, currency }) => (
                <li key={id}>
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
                        {price
                          ? priceWithCurrency(price, currency)
                          : 'preço a conferir'}
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
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => buyProduct(id)}
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
                      </div>
                    </CardFooter>
                  </Card>
                </li>
              ),
            )}
          </ul>
        ) : (
          <NoProductsFound setOpen={setOpen} />
        )}
      </div>
    </main>
  );
}
