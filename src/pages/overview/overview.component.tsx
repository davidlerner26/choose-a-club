import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IconCheck, IconShoppingBag, IconTrendingDown } from '@tabler/icons-react';
import type { Icon } from '@tabler/icons-react';
import { Spinner } from '@/components/ui/spinner';
import { buttonVariants } from '@/components/ui/button';
import Products from '@/components/products/products.component';
import { useAuth } from '@/hooks/use-auth';
import { useLocale } from '@/hooks/use-locale';
import { useProfileOutlet } from '@/hooks/use-profile-outlet';

const OVERVIEW_LIMIT = 8;

function StatCard({
  icon: IconComponent,
  value,
  label,
}: {
  icon: Icon;
  value: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <IconComponent className="size-5" stroke={2} />
      </div>
      <div>
        <p className="text-lg leading-tight font-semibold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export default function OverviewPage() {
  const { t } = useTranslation();
  const { priceWithCurrency, path } = useLocale();
  const { user } = useAuth();
  const {
    profile,
    isOwner,
    products,
    isLoading,
    setIsLoading,
    refetchProducts,
    editProduct,
    revealedIds,
    requestReveal,
  } = useProfileOutlet();

  const wanted = useMemo(() => products.filter((item) => !item.bought), [products]);
  const dropping = useMemo(
    () => wanted.filter((item) => item.priceFrom && item.priceFrom > item.price),
    [wanted],
  );
  const bought = useMemo(() => products.filter((item) => item.bought), [products]);

  const recent = useMemo(
    () =>
      [...wanted]
        .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
        .slice(0, OVERVIEW_LIMIT),
    [wanted],
  );
  const recentIds = useMemo(() => recent.map((item) => item.id).join(','), [recent]);

  useEffect(() => {
    requestReveal(recent);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-request when the recent id set changes, not on every products/revealedIds write
  }, [recentIds]);

  const visibleRecent = recent.filter((item) => revealedIds.has(item.id));
  const isRefreshing = recent.some((item) => !revealedIds.has(item.id));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner className="text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            {t('nav.overview')}
          </h1>
          <p className="text-muted-foreground">{t('overview.subtitle')}</p>
        </div>
        <Link
          to={path(`/${profile.username}/wishlist`)}
          className={buttonVariants({ variant: 'outline' })}
        >
          {t('overview.seeAll')}
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          icon={IconShoppingBag}
          value={wanted.length}
          label={t('overview.stats.products', { count: wanted.length })}
        />
        <StatCard
          icon={IconTrendingDown}
          value={dropping.length}
          label={t('overview.stats.dropping', { count: dropping.length })}
        />
        <StatCard
          icon={IconCheck}
          value={bought.length}
          label={t('overview.stats.bought', { count: bought.length })}
        />
      </div>

      <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">
        {t('overview.recentlyAdded')}
      </h2>
      <Products
        priceWithCurrency={priceWithCurrency}
        updateProducts={refetchProducts}
        setIsLoading={setIsLoading}
        onEdit={editProduct}
        productsView={visibleRecent}
        isOwner={isOwner}
        profileUserId={profile.uid}
        currentUser={user}
        isRefreshingProducts={isRefreshing}
      />
    </div>
  );
}
