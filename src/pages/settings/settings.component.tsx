import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IconLogout2 } from '@tabler/icons-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button, buttonVariants } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useLocale } from '@/hooks/use-locale';
import { useProfileOutlet } from '@/hooks/use-profile-outlet';
import { signOutUser } from '@/firebase/firebase';
import { LOCALES } from '@/i18n/locales';

function initials(name?: string | null) {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { profile } = useProfileOutlet();
  const { path } = useLocale();

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          {t('nav.settings')}
        </h1>
        <p className="text-muted-foreground">{t('settings.subtitle')}</p>
      </div>

      <section className="mb-6 rounded-xl border bg-card p-5">
        <h2 className="mb-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {t('settings.account')}
        </h2>
        <div className="flex items-center gap-3">
          <Avatar className="size-12">
            <AvatarImage
              src={user?.photoURL ?? undefined}
              alt={user?.displayName ?? ''}
            />
            <AvatarFallback>{initials(user?.displayName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">
              {user?.displayName ?? profile.displayName}
            </p>
            <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <Button variant="outline" className="mt-5" onClick={() => signOutUser()}>
          <IconLogout2 stroke={2} />
          {t('settings.signOut')}
        </Button>
      </section>

      <section className="mb-6 rounded-xl border bg-card p-5">
        <h2 className="mb-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {t('settings.publicProfile')}
        </h2>
        <Link
          to={path(`/${profile.username}`)}
          className={buttonVariants({ variant: 'outline' })}
        >
          {t('settings.viewProfile')}
        </Link>
      </section>

      <section className="rounded-xl border bg-card p-5">
        <h2 className="mb-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {t('settings.languages')}
        </h2>
        <div className="flex flex-wrap gap-2">
          {Object.values(LOCALES).map((locale) => (
            <a
              key={locale.code}
              href={`${locale.urlPrefix ? `/${locale.urlPrefix}` : ''}/${profile.username}`}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              {locale.numberLocale} · {locale.currencySymbol}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
