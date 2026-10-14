import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  IconBell,
  IconCompass,
  IconHome2,
  IconHeart,
  IconSettings,
} from '@tabler/icons-react';
import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { segment: '', icon: IconHome2, label: 'nav.overview' },
  { segment: 'wishlist', icon: IconHeart, label: 'nav.wishlist' },
  { segment: 'alertas', icon: IconBell, label: 'nav.alerts' },
  { segment: 'explorar', icon: IconCompass, label: 'nav.explore' },
  { segment: 'configuracoes', icon: IconSettings, label: 'nav.settings' },
] as const;

export default function SidebarNav({
  username,
  compact = false,
}: {
  username: string;
  compact?: boolean;
}) {
  const { t } = useTranslation();
  const { path } = useLocale();
  const base = path(`/${username}`);

  return (
    <nav className={cn(compact ? 'flex items-center justify-around' : 'flex flex-col gap-1')}>
      {NAV_ITEMS.map(({ segment, icon: Icon, label }) => (
        <NavLink
          key={segment}
          to={segment ? `${base}/${segment}` : base}
          end
          className={({ isActive }) =>
            cn(
              'flex items-center rounded-lg text-sm font-medium transition-colors',
              compact
                ? 'flex-col gap-1 px-3 py-1.5 text-[0.65rem]'
                : 'gap-3 px-3 py-2',
              isActive
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
            )
          }
        >
          <Icon className="size-5" stroke={2} />
          <span>{t(label)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
