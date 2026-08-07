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
import { Input } from './components/ui/input';
import { Card, CardContent, CardFooter } from './components/ui/card';
import './App.css';

export default function App() {
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

  const MOCK_PRODUCTS: Product[] = [
    {
      id: '1',
      link: 'https://www.atelierclararosas.com.br/produtos/vestido-amelia-cafe-15abp/?utm_medium=paid&utm_source=ig&utm_id=120212309359630088&utm_content=120242137486610088&utm_term=120212309359650088&utm_campaign=120212309359630088&fbclid=PAdGRleATcFZRwZG9mAmZkaWQWULvp5rbi3jl2Qii7LUXu5rmkqzi5_2V4dG4DYWVtATAAYWRpZAGrMlVmT7oYc3J0YwZhcHBfaWQPMTI0MDI0NTc0Mjg3NDE0AAGnQjSgTDrMH-Tk9s2yolzNc8oNWiOp36P7GNUI7JXkLM7nOzRArg2gcQ_nDI4_aem_UNZQbRPGOEJzabCHDAllhw',
      name: 'veStido midi linho',
      price: 190,
      category: 'Vestidos',
      store: 'atelier clararosas',
      url: 'https://acdn-us.mitiendanube.com/stores/001/427/554/products/img_4230-9973e786b78b96b36917799225152557-480-0.webp',
      currency: 'BRL',
    },
    {
      id: '2',
      link: 'https://madmachines.com.br/products/ferrari-laferrari-aperta-escala-1-24?variant=43084403605704&country=BR&currency=BRL&utm_medium=product_sync&utm_source=google&utm_content=sag_organic&utm_campaign=sag_organic&utm_source=google&utm_campaign=21467072797&utm_medium=&utm_content=&utm_term=::&keyword=&device=c&network=x&gad_source=1&gad_campaignid=21456537969&gbraid=0AAAAAoXfQDaHNbFihSRUt1Jw-VRchtFK6&gclid=CjwKCAjwhNbTBhB4EiwAsFSg-lCVmACzyQCJ6uQbNigtoOBJJU2LWrT84Qnr0Nfya6wUqkDbmHttEBoCoRgQAvD_BwE',
      name: 'Ferrari LaFerrari Aperta (Escala 1:24)',
      price: 499,
      category: 'Brinquedos',
      store: 'madmachines',
      url: 'https://madmachines.com.br/cdn/shop/files/10_129e1022-4ae0-4848-ad03-a6bcbf714e2f.jpg?v=1703207976&width=1346',
      currency: 'BRL',
    },
    {
      id: '3',
      link: 'https://www.nintendo.com/pt-br/store/products/pokemon-pokopia-switch-2/',
      name: 'Pokémon™ Pokopia',
      price: 77,
      category: 'Jogos',
      store: 'nintendo',
      url: 'https://assets.nintendo.com/image/upload/ar_16:9,c_lpad,w_1240/b_white/f_auto/q_auto/store/software/switch2/70010000107421/ccb2d70f7ad6878b78d366898a0f0baf94a2d3350b76725c88b591453a797502',
      currency: 'BRL',
    },
    {
      id: '4',
      link: 'https://thelaurenashtyncollection.com/products/adele-full-volume',
      name: 'Adele Full Volume Topper',
      price: 1300,
      category: 'Perucas',
      store: 'thelaurenashtyncollection',
      url: 'https://thelaurenashtyncollection.com/cdn/shop/files/adele-full-volume-hair-topper-cover-image.png?v=1778947928&width=1946',
      currency: 'USD',
    },
  ];

  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [optionSelected, setOptionSelected] = useState<string>(
    options[0].value,
  );

  const selectCategory = (category: string) => {
    if (category === selectedCategory) return;
    setSelectedCategory(category);
    setProducts((products) => {
      return products.filter((product) => product.category === category);
    });
  };

  const selectOption = (option: string) => {
    setOptionSelected(option);
  };

  const focusInput = () => {
    document.getElementById('link')?.focus();
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
              {/* <span>
                {priceWithCurrency(
                  products?.reduce((acc, product) => {
                    if (product.currency === 'BRL') {
                      return acc + product.price;
                    }
                  }, 0),
                  'BRL',
                )}
              </span> */}
              <span>
                {priceWithCurrency(
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

      <div className="flex gap-3 items-center mb-6">
        <Input
          id="link"
          name="link"
          placeholder="Cole o link a peça aqui - ela entra sozinha ✨"
        />
        <Button
          size="lg"
          className="bg-red-700 hover:bg-red-800"
          onClick={() => focusInput()}
        >
          Adicionar
        </Button>
      </div>

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
          <div className="flex outline-2 outline-dashed w-full h-100 items-center text-center justify-center rounded-md">
            <div>
              <p>A arara está vazia</p>
              <p className="mt-2 mb-2 max-w-md">
                Viu uma peça que amou? É só colar o link da loja: o resto (nome,
                preço, foto) aparece sozinho.
              </p>
              <Button
                size="lg"
                className="bg-red-700 hover:bg-red-800"
                onClick={() => focusInput()}
              >
                Colar o primeiro link
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
