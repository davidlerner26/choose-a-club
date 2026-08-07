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

  const editProduct = (id: string) => {};

  const removeProduct = (id: string) => {
    setProducts((products) => products.filter((product) => product.id !== id));
  };

  const [selectedCategory, setSelectedCategory] = useState(categories[0]);

  return (
    <main className="m-auto max-w-4xl mt-8">
      <p>wishlist pessoal</p>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-4xl">Guarda-Roupa Futuro</h1>
        <div className="flex items-center gap-4">
          <div>
            <p>{products?.length} peças desejadas</p>
            <p className="text-right text-red-700">
              R${products?.reduce((acc, product) => acc + product.price, 0)}
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
          <ul className="grid grid-cols-3 gap-4">
            {products?.map(({ id, name, price, link, store, category }) => (
              <li key={id}>
                <Card>
                  <CardContent>
                    <p>
                      {store} · {category}
                    </p>
                    <p className="font-bold">{name}</p>
                    <p className="text-red-700">
                      {price ? 'R$ ' + price + ',00' : 'preço a conferir'}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <a
                          href={link}
                          target="blank"
                          className={buttonVariants({ variant: 'link' })}
                        >
                          ver na loja
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
            ))}
          </ul>
        ) : (
          <div className="flex outline-2 outline-dashed w-full h-100 items-center text-center justify-center rounded-md">
            <div>
              <p>A arara está vazia</p>
              <p className="mt-2 mb-2 max-w-md">
                Viu uma peça que amou? É só colar o link da loja — o resto
                (nome, preço, foto) aparece sozinho.
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
