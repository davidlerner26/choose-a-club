import { useEffect, useState } from 'react';
import type { Product } from './types';
import AddProductDialog from './components/add-product-dialog/add-product-dialog.component';
import { Button } from '@/components/ui/button';
import { IconPlus, IconRefresh } from '@tabler/icons-react';
import './App.css';
import { getAllProducts } from './firebase/firebase';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import Categories from './components/categories/categories.component';
import Options from './components/options/options.component';
import Products from './components/products/products.component';

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
  const [link, setLink] = useState('');
  const [product, setProduct] = useState<Product>();

  const selectOption = (bought: boolean, productList: Product[] = products) => {
    setOptionSelected(bought);
    setProductsView(productList.filter((product) => product.bought === bought));
  };

  const refreshProducts = async () => {
    await updateProducts();
    selectCategory(selectedCategory);
  };

  const updateProducts = async () => {
    setIsLoading(true);
    const response = await getAllProducts();
    setProducts(response);
    selectOption(false, response);
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
      category === 'Tudo'
        ? products
        : products.filter((product) => product.category === category),
    );
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

  const search = async () => {
    if (link) {
      setIsLoading(true);
      const response = await extrairPeca(link);
      if (response) {
        const product: Product = {
          id: crypto.randomUUID(),
          name: response.name,
          store: response.marca,
          price: response.price,
          url: response.imagem,
          link: response.link,
          category: response.categoria,
        };
        setProduct(product);
        setOpen(true);
      }
      setIsLoading(false);
    } else {
      focusInput();
    }
  };

  async function extrairPeca(link: string) {
    const r = await fetch(
      '/.netlify/functions/extrair?url=' + encodeURIComponent(link),
    );
    const d = await r.json();

    if (d.erro) {
      // fallback: abre o formulário manual já com o que deu pra pegar
      return { manual: true, link, loja: d.loja, motivo: d.erro };
    }

    return {
      id: crypto.randomUUID(),
      name: d.nome,
      marca: d.marca,
      price: d.preco,
      precoDe: d.precoDe,
      imagem: d.imagem,
      store: d.loja,
      link: d.link,
      disponivel: d.disponivel,
      adicionadoEm: new Date().toISOString(),
      verificadoEm: new Date().toISOString(),
      categoria: d.categoria,
    };
  }

  return isLoading ? (
    <div className="flex items-center justify-center w-screen h-screen">
      <Spinner className="text-primary" />
    </div>
  ) : (
    <main className="m-auto max-w-6xl mt-8 px-4 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b">
        <div className="flex items-center gap-2.5">
          <img className="w-10" src="favicon.svg" />
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-primary">
            The Bambina's Club
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex flex-col items-end rounded-lg bg-accent px-4 py-2 self-start sm:self-auto">
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
          <div className="flex flex-wrap gap-3">
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
                product={product}
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Categories
          selectedCategory={selectedCategory}
          selectCategory={selectCategory}
          categories={categories}
        />

        <Options selectOption={selectOption} optionSelected={optionSelected} />
      </div>

      <hr className="mt-8 mb-8" />

      <div className="flex gap-3 items-center mb-6">
        <Input
          id="link"
          name="link"
          placeholder="Cole o link da peça aqui"
          onChange={(value) => setLink(value.target.value)}
        />
        <Button
          size="lg"
          className="bg-red-700 hover:bg-red-800"
          onClick={() => search()}
        >
          Adicionar
        </Button>
      </div>

      <Products
        priceWithCurrency={priceWithCurrency}
        updateProducts={updateProducts}
        setIsLoading={setIsLoading}
        setId={setId}
        setOpen={setOpen}
        productsView={productsView}
      />
    </main>
  );
}
