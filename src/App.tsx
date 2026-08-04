import { useState } from 'react';
import type { Product } from './types';
import AddProductDialog from './components/add-product-dialog.component';

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

  const [products, setProducts] = useState<Product[]>([]);

  const selectCategory = (category: string) => {
    if (category === selectedCategory) return;
    setSelectedCategory(category);
  };

  const [selectedCategory, setSelectedCategory] = useState(categories[0]);

  return (
    <>
      <h3>wishlist pessoal</h3>
      <div className="flex items-center justify-between">
        <h1>Guarda-Roupa Futuro</h1>
        <div className="flex items-center gap-1">
          <div>
            <p>{products?.length} peças desejadas</p>
            <p>
              R${products?.reduce((acc, product) => acc + product.price, 0)},00
            </p>
          </div>
          <div>
            <AddProductDialog
              categories={categories}
              setProducts={setProducts}
            />
          </div>
        </div>
      </div>

      <div>
        <ul className="flex gap-2">
          {categories.map((category) => (
            <li
              key={category}
              onClick={() => selectCategory(category)}
              className={`rounded-md bg-gray-950/5 px-2.5 py-1.5 text-sm font-semibold text-gray-900 ${selectedCategory === category ? 'bg-red-500 text-white' : ''}`}
            >
              {category}
            </li>
          ))}
        </ul>
      </div>

      <div>
        {products?.length > 0 && (
          <ul>
            {products?.map(({ id, name, price, link, store, category }) => (
              <li key={id}>
                <p>
                  {store} · {category}
                </p>
                <p>{name}</p>
                <p>{price ? 'R$ ' + price + ',00' : 'preço a conferir'}</p>
                <div>
                  <a href={link} target="blank" className="text-underline">
                    ver na loja
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
