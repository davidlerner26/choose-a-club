import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import type { Category, Product, SortOption, UserProfile } from '@/types';
import AddProductDialog from '@/components/add-product-dialog/add-product-dialog.component';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
  IconRefresh,
} from '@tabler/icons-react';
import {
  createCategory,
  getAllProducts,
  getUserByUsername,
  getUserCategories,
} from '@/firebase/firebase';
import { refreshProduct, persistRefreshedProduct } from '@/lib/refresh-product';
import { runWithConcurrency } from '@/lib/concurrency';
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
const PAGE_SIZE = 20;

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
  // ids que já foram conferidos na loja (preço/disponibilidade) nesta sessão —
  // só essas aparecem na tela; o resto some/aparece com animação conforme a
  // página é visitada, pra não bater na API por produtos que talvez nunca
  // sejam vistos.
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [refreshTick, setRefreshTick] = useState<number>(0);
  const [optionSelected, setOptionSelected] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(TUDO);
  const [product, setProduct] = useState<Product>();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [page, setPage] = useState<number>(1);
  const [lastFilterKey, setLastFilterKey] = useState<string>('');
  const [categoryBeforeDialog, setCategoryBeforeDialog] =
    useState<string>(TUDO);
  const [wasDialogOpen, setWasDialogOpen] = useState<boolean>(false);

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
    let cancelled = false;
    async function fetchProducts() {
      setIsLoading(true);
      const response = await getAllProducts(profile!.uid);
      if (cancelled) return;
      setProducts(response);
      setRevealedIds(new Set());
      setIsLoading(false);
    }
    async function fetchCategories() {
      const response = await getUserCategories(profile!.uid);
      if (cancelled) return;
      setCategories(response);
    }
    fetchProducts();
    fetchCategories();
    return () => {
      cancelled = true;
    };
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

  const filterKey = `${selectedCategory}|${optionSelected}|${searchQuery}|${sortBy}`;
  if (filterKey !== lastFilterKey) {
    setLastFilterKey(filterKey);
    setPage(1);
  }

  // guarda a categoria filtrada quando o diálogo de adicionar/editar produto
  // abre, pra restaurar depois de salvar (em vez de trocar pra categoria do
  // produto que acabou de ser adicionado/editado)
  if (open !== wasDialogOpen) {
    setWasDialogOpen(open);
    if (open) {
      setCategoryBeforeDialog(selectedCategory);
    }
  }

  const totalPages = Math.max(1, Math.ceil(productsView.length / PAGE_SIZE));
  if (page > totalPages) {
    setPage(totalPages);
  }

  const pagedProductsView = useMemo(
    () => productsView.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [productsView, page],
  );

  // string estável com os ids da página atual — só muda quando a página
  // (ou os filtros) mudam, não a cada vez que um produto é atualizado
  const pagedProductIds = useMemo(
    () => pagedProductsView.map((item) => item.id).join(','),
    [pagedProductsView],
  );

  const isRefreshingPage = pagedProductsView.some(
    (item) => !revealedIds.has(item.id),
  );

  const visibleProductsView = pagedProductsView.filter((item) =>
    revealedIds.has(item.id),
  );

  // Confere preço/disponibilidade na loja só para os produtos da página
  // atual (com concorrência limitada), assim que ela é aberta pela primeira
  // vez — cada um aparece na tela (com animação) conforme o refresh termina.
  useEffect(() => {
    if (!profile) return;
    const ids = pagedProductIds ? pagedProductIds.split(',') : [];
    const pending = pagedProductsView.filter(
      (item) => ids.includes(item.id) && !revealedIds.has(item.id),
    );
    if (pending.length === 0) return;

    let cancelled = false;

    async function refreshPending() {
      await runWithConcurrency(pending, 4, async (baseProduct) => {
        const refreshed = await refreshProduct(baseProduct);
        if (cancelled) return;
        if (isOwner) {
          await persistRefreshedProduct(refreshed, baseProduct);
        }
        setProducts((prev) =>
          prev.map((item) => (item.id === refreshed.id ? refreshed : item)),
        );
        setRevealedIds((prev) => new Set(prev).add(refreshed.id));
      });
    }

    refreshPending();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só deve rodar quando a página/filtros mudam (pagedProductIds) ou um refresh manual é pedido (refreshTick), não a cada vez que revealedIds/products muda
  }, [pagedProductIds, profile, refreshTick]);

  const refreshCurrentPage = () => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      pagedProductsView.forEach((item) => next.delete(item.id));
      return next;
    });
    setRefreshTick((tick) => tick + 1);
  };

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
              disabled={isRefreshingPage}
              onClick={refreshCurrentPage}
            >
              <IconRefresh
                data-icon="inline-start"
                className={isRefreshingPage ? 'animate-spin' : ''}
              />
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
                    updateProducts={async () => {
                      await updateProducts(profile.uid);
                      setSelectedCategory(categoryBeforeDialog);
                    }}
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
        productsView={visibleProductsView}
        isOwner={isOwner}
        profileUserId={profile.uid}
        currentUser={user}
        isRefreshingProducts={isRefreshingPage}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button
            variant="outline"
            size="icon"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            <IconChevronLeft stroke={2} />
          </Button>
          <p className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </p>
          <Button
            variant="outline"
            size="icon"
            disabled={page >= totalPages}
            onClick={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
          >
            <IconChevronRight stroke={2} />
          </Button>
        </div>
      )}
    </main>
  );
}
