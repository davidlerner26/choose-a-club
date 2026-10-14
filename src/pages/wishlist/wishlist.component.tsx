import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconChevronLeft, IconChevronRight, IconRefresh } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import Categories from '@/components/categories/categories.component';
import Options from '@/components/options/options.component';
import Products from '@/components/products/products.component';
import SearchField from '@/components/search-field/search-field.component';
import SortSelect from '@/components/sort-select/sort-select.component';
import { useAuth } from '@/hooks/use-auth';
import { useLocale } from '@/hooks/use-locale';
import { useProfileOutlet } from '@/hooks/use-profile-outlet';
import { ALL_CATEGORIES } from '@/lib/constants';
import type { SortOption } from '@/types';

const PAGE_SIZE = 20;

export default function WishlistPage() {
  const { t } = useTranslation();
  const { priceWithCurrency } = useLocale();
  const { user } = useAuth();
  const {
    profile,
    isOwner,
    products,
    categories,
    isLoading,
    setIsLoading,
    refetchProducts,
    editProduct,
    revealedIds,
    requestReveal,
    refreshProducts,
  } = useProfileOutlet();

  const [optionSelected, setOptionSelected] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [page, setPage] = useState<number>(1);
  const [lastFilterKey, setLastFilterKey] = useState<string>('');

  const categoryNames = useMemo(() => categories.map((c) => c.name), [categories]);

  const productsView = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = products.filter((product) => {
      if (product.bought !== optionSelected) return false;
      if (selectedCategory !== ALL_CATEGORIES && product.category !== selectedCategory)
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

  const totalPages = Math.max(1, Math.ceil(productsView.length / PAGE_SIZE));
  if (page > totalPages) {
    setPage(totalPages);
  }

  const pagedProductsView = useMemo(
    () => productsView.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [productsView, page],
  );

  const pagedProductIds = useMemo(
    () => pagedProductsView.map((item) => item.id).join(','),
    [pagedProductsView],
  );

  const isRefreshingPage = pagedProductsView.some((item) => !revealedIds.has(item.id));

  const visibleProductsView = pagedProductsView.filter((item) => revealedIds.has(item.id));

  useEffect(() => {
    requestReveal(pagedProductsView);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-request when the current page's id set changes, not on every products/revealedIds write
  }, [pagedProductIds]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner className="text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          {isOwner
            ? t('nav.wishlist')
            : t('wishlist.visitorTitle', { name: profile.displayName })}
        </h1>
        {isOwner && <p className="text-muted-foreground">{t('overview.subtitle')}</p>}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Categories
          selectedCategory={selectedCategory}
          selectCategory={setSelectedCategory}
          categories={
            categoryNames.length ? [ALL_CATEGORIES, ...categoryNames] : categoryNames
          }
        />
        <Options selectOption={setOptionSelected} optionSelected={optionSelected} />
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchField searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          <SortSelect sortBy={sortBy} setSortBy={setSortBy} />
        </div>
        <Button
          variant="outline"
          disabled={isRefreshingPage}
          onClick={() => refreshProducts(pagedProductsView)}
        >
          <IconRefresh
            data-icon="inline-start"
            className={isRefreshingPage ? 'animate-spin' : ''}
          />
          {t('profile.refresh')}
        </Button>
      </div>

      <div className="mt-6">
        <Products
          priceWithCurrency={priceWithCurrency}
          updateProducts={refetchProducts}
          setIsLoading={setIsLoading}
          onEdit={editProduct}
          productsView={visibleProductsView}
          isOwner={isOwner}
          profileUserId={profile.uid}
          currentUser={user}
          isRefreshingProducts={isRefreshingPage}
        />
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            <IconChevronLeft stroke={2} />
          </Button>
          <p className="text-sm text-muted-foreground">
            {t('profile.page', { page, totalPages })}
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
    </div>
  );
}
