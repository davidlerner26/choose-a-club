import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Product, SortOption } from './types';
import AddProductDialog from './components/add-product-dialog/add-product-dialog.component';
import { Button } from '@/components/ui/button';
import { IconPlus, IconRefresh } from '@tabler/icons-react';
import './App.css';
import { getAllProducts } from './firebase/firebase';
import { Spinner } from '@/components/ui/spinner';
import Categories from './components/categories/categories.component';
import Options from './components/options/options.component';
import Products from './components/products/products.component';
import UserMenu from './components/user-menu/user-menu.component';
import LoginPage from './components/login-page/login-page.component';
import { useAuth } from './hooks/use-auth';
import LinkField from './components/link-field/link-field.component';
import SearchField from './components/search-field/search-field.component';
import SortSelect from './components/sort-select/sort-select.component';

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

  const { user, isLoading: isAuthLoading } = useAuth();

  const [open, setOpen] = useState<boolean>(false);
  const [id, setId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [optionSelected, setOptionSelected] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [product, setProduct] = useState<Product>();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  const {
    register: registerLink,
    formState: { errors: linkErrors },
    getValues: getLinkValues,
  } = useForm<Product>();

  const selectOption = (bought: boolean) => {
    setOptionSelected(bought);
  };

  const selectCategory = (category: string) => {
    setSelectedCategory(category);
  };

  const refreshProducts = async () => {
    await updateProducts();
  };

  const updateProducts = async () => {
    setIsLoading(true);
    const response = await getAllProducts();
    setProducts(response);
    setIsLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    async function fetchProducts() {
      await updateProducts();
    }
    fetchProducts();
  }, [user]);

  const productsView = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = products.filter((product) => {
      if (product.bought !== optionSelected) return false;
      if (selectedCategory !== 'Tudo' && product.category !== selectedCategory)
        return false;
      if (query && !product.name.toLowerCase().includes(query)) return false;
      return true;
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'recent':
        default:
          return (b.createdAt ?? 0) - (a.createdAt ?? 0);
      }
    });
  }, [products, selectedCategory, optionSelected, searchQuery, sortBy]);

  const priceWithCurrency = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center w-screen h-screen">
        <Spinner className="text-primary" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return isLoading ? (
    <div className="flex items-center justify-center w-screen h-screen">
      <Spinner className="text-primary" />
    </div>
  ) : (
    <main className="m-auto max-w-6xl mt-8 px-4 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <img className="w-10" src="favicon.svg" />
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-primary">
              The Bambina's Club
            </h1>
          </div>
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
                setProduct={setProduct}
                selectedCategory={selectedCategory}
              />
            )}
            <UserMenu />
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

      <div className="mb-6 mt-6">
        <LinkField
          placeholder="Cole o link da peça aqui"
          register={registerLink}
          errors={linkErrors}
          getValues={getLinkValues}
          setIsLoading={setIsLoading}
          onProductFetched={(product) => {
            setProduct(product);
            setOpen(true);
          }}
          displayLabel={false}
        />
      </div>

      <hr className="mt-8 mb-8" />

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-4 mb-6">
        <SearchField
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <SortSelect sortBy={sortBy} setSortBy={setSortBy} />
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
