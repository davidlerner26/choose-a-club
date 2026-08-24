import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import type { Category, Product, SortOption, UserProfile } from '@/types';
import AddProductDialog from '@/components/add-product-dialog/add-product-dialog.component';
import { Button, buttonVariants } from '@/components/ui/button';
import { IconPlus, IconRefresh } from '@tabler/icons-react';
import {
  createCategory,
  getAllProducts,
  getUserByUsername,
  getUserCategories,
} from '@/firebase/firebase';
import { Spinner } from '@/components/ui/spinner';
import Categories from '@/components/categories/categories.component';
import Options from '@/components/options/options.component';
import Products from '@/components/products/products.component';
import UserMenu from '@/components/user-menu/user-menu.component';
import { useAuth } from '@/hooks/use-auth';
import LinkField from '@/components/link-field/link-field.component';
import SearchField from '@/components/search-field/search-field.component';
import SortSelect from '@/components/sort-select/sort-select.component';

const TUDO = 'Tudo';

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const [open, setOpen] = useState<boolean>(false);
  const [id, setId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [optionSelected, setOptionSelected] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(TUDO);
  const [product, setProduct] = useState<Product>();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  const isOwner = !!user && !!profile && user.uid === profile.uid;

  const categoryNames = useMemo(
    () => categories.map((category) => category.name),
    [categories],
  );

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

  const updateProducts = async (uid: string) => {
    setIsLoading(true);
    const response = await getAllProducts(uid);
    setProducts(response);
    setIsLoading(false);
  };

  const addCategory = async (name: string) => {
    const newCategory = await createCategory(name);
    setCategories((prev) => [...prev, newCategory]);
    return newCategory;
  };

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting state when the effect's dependency (username) changes, per https://react.dev/learn/synchronizing-with-effects#fetching-data
    setIsProfileLoading(true);
    setProfile(null);
    if (!username) return;
    getUserByUsername(username).then((result) => {
      if (cancelled) return;
      setProfile(result);
      setIsProfileLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [username]);

  useEffect(() => {
    if (!profile) return;
    async function fetchProducts() {
      await updateProducts(profile!.uid);
    }
    async function fetchCategories() {
      const response = await getUserCategories(profile!.uid);
      setCategories(response);
    }
    fetchProducts();
    fetchCategories();
  }, [profile]);

  const productsView = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = products.filter((product) => {
      if (product.bought !== optionSelected) return false;
      if (selectedCategory !== TUDO && product.category !== selectedCategory)
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

  if (isProfileLoading) {
    return (
      <div className="flex items-center justify-center w-screen h-screen">
        <Spinner className="text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="font-heading text-2xl font-semibold text-primary">
          Perfil não encontrado
        </h1>
        <p className="text-muted-foreground">
          Não existe nenhum usuário com esse nome.
        </p>
        <Link to="/" className="text-primary underline">
          Voltar para o início
        </Link>
      </main>
    );
  }

  return isLoading ? (
    <div className="flex items-center justify-center w-screen h-screen">
      <Spinner className="text-primary" />
    </div>
  ) : (
    <main className="m-auto max-w-7xl mt-8 px-4 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <img className="w-10" src="favicon.svg" />
            <div>
              <h1 className="font-heading text-3xl font-semibold tracking-tight text-primary">
                Choose a Club
              </h1>
              <p className="text-lg text-muted-foreground">
                @{profile.username}
              </p>
            </div>
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
            <Button
              variant="outline"
              onClick={() => updateProducts(profile.uid)}
            >
              <IconRefresh data-icon="inline-start" />
              Atualizar
            </Button>
            {isOwner && (
              <>
                <Button size="lg" onClick={() => setOpen(true)}>
                  <IconPlus></IconPlus>
                  Adicionar produto
                </Button>
                {open && (
                  <AddProductDialog
                    categories={categoryNames}
                    onAddCategory={addCategory}
                    open={open}
                    setOpen={setOpen}
                    id={id}
                    setId={setId}
                    updateProducts={() => updateProducts(profile.uid)}
                    product={product}
                    setProduct={setProduct}
                    selectedCategory={selectedCategory}
                  />
                )}
              </>
            )}
            {user ? (
              <UserMenu />
            ) : (
              <Link to="/" className={buttonVariants({ size: 'lg' })}>
                Entrar
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Categories
          selectedCategory={selectedCategory}
          selectCategory={selectCategory}
          categories={
            categoryNames.length ? [TUDO, ...categoryNames] : categoryNames
          }
        />

        <Options selectOption={selectOption} optionSelected={optionSelected} />
      </div>

      {isOwner && (
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
      )}

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
        updateProducts={() => updateProducts(profile.uid)}
        setIsLoading={setIsLoading}
        setId={setId}
        setOpen={setOpen}
        productsView={productsView}
        isOwner={isOwner}
        profileUserId={profile.uid}
        currentUser={user}
      />
    </main>
  );
}
