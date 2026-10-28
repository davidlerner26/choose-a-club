import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { User } from 'firebase/auth';
import { IconPlus } from '@tabler/icons-react';
import { Button, buttonVariants } from '@/components/ui/button';
import LinkField from '@/components/link-field/link-field.component';
import NotificationBell from '@/components/notification-bell/notification-bell.component';
import UserMenu from '@/components/user-menu/user-menu.component';
import { useLocale } from '@/hooks/use-locale';
import type { Product } from '@/types';

export default function TopBar({
  isOwner,
  user,
  onProductFetched,
  onAddProduct,
  setIsLoading,
  logo,
}: {
  isOwner: boolean;
  user: User | null;
  onProductFetched: (product: Product) => void;
  onAddProduct: () => void;
  setIsLoading: (isLoading: boolean) => void;
  logo?: ReactNode;
}) {
  const { t } = useTranslation();
  const { path } = useLocale();
  const {
    register,
    formState: { errors },
    getValues,
  } = useForm<Product>();

  return (
    <header className="flex items-center gap-3 border-b bg-card/70 px-4 py-3 backdrop-blur-sm sm:px-6 lg:px-8">
      {logo}
      <div className="min-w-0 flex-1">
        {isOwner && (
          <div className="max-w-xl">
            <LinkField
              placeholder={t('profile.linkPlaceholder')}
              register={register}
              errors={errors}
              getValues={getValues}
              setIsLoading={setIsLoading}
              onProductFetched={onProductFetched}
              displayLabel={false}
            />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {isOwner && (
          <Button onClick={onAddProduct}>
            <IconPlus />
            <span className="hidden sm:inline">{t('profile.addProduct')}</span>
          </Button>
        )}
        {user && <NotificationBell uid={user.uid} />}
        {user ? (
          <div className="lg:hidden">
            <UserMenu />
          </div>
        ) : (
          <Link to={path('/')} className={buttonVariants()}>
            {t('common.login')}
          </Link>
        )}
      </div>
    </header>
  );
}
