import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getProductsPreview } from '@/firebase/firebase';
import { useLocale } from '@/hooks/use-locale';
import { initials } from '@/lib/utils';
import { isUsableImage } from '@/lib/is-usable-image';
import type { Product, UserProfile } from '@/types';

const PREVIEW_SLOTS = 6;

export default function ProfilePreviewCard({
  profile,
  isCurrentUser,
}: {
  profile: UserProfile;
  isCurrentUser: boolean;
}) {
  const { t } = useTranslation();
  const { path } = useLocale();
  const [counts, setCounts] = useState<{ wanted: number; bought: number } | null>(null);
  const [displayProducts, setDisplayProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const preview = await getProductsPreview(profile.uid);
      if (cancelled) return;
      setCounts({ wanted: preview.wantedCount, bought: preview.boughtCount });

      const usable = await Promise.all(
        preview.products.map((product) => isUsableImage(product.url)),
      );
      if (cancelled) return;
      setDisplayProducts(
        preview.products.filter((_, index) => usable[index]).slice(0, PREVIEW_SLOTS),
      );
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [profile.uid]);

  return (
    <Link
      to={path(`/${profile.username}`)}
      className="flex flex-col gap-3 rounded-xl border bg-card p-4 transition-shadow hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <Avatar className="size-12 shrink-0">
          <AvatarImage src={profile.photoURL ?? undefined} alt={profile.displayName} />
          <AvatarFallback>{initials(profile.displayName)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-foreground">
            {profile.displayName}
            {isCurrentUser && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                ({t('explore.you')})
              </span>
            )}
          </p>
          <p className="truncate text-sm text-muted-foreground">@{profile.username}</p>
        </div>
        {counts !== null && (
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
              {t('profile.productCount', { count: counts.wanted })}
              {t('profile.wanted')}
            </span>
            <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
              {t('profile.productCount', { count: counts.bought })}
              {t('profile.bought')}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-6 gap-1.5">
        {Array.from({ length: PREVIEW_SLOTS }).map((_, index) => {
          const product = displayProducts?.[index];
          return (
            <div
              key={product?.id ?? index}
              className={
                displayProducts === null
                  ? 'aspect-square animate-pulse rounded-md bg-muted'
                  : 'aspect-square rounded-md bg-muted'
              }
              style={
                product
                  ? {
                      background: `url(${product.url}) center center / contain no-repeat`,
                    }
                  : undefined
              }
            />
          );
        })}
      </div>
    </Link>
  );
}
