import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, MenuContent, MenuItem, MenuTrigger } from '@/components/ui/menu';
import { IconLogout2, IconUser } from '@tabler/icons-react';
import { useAuth } from '@/hooks/use-auth';
import { useOwnProfile } from '@/hooks/use-own-profile';
import { useLocale } from '@/hooks/use-locale';
import { signOutUser } from '@/firebase/firebase';
import { cn, initials } from '@/lib/utils';

export default function UserMenu({
  variant = 'icon',
}: {
  variant?: 'icon' | 'full';
}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { profile } = useOwnProfile(user);
  const { path } = useLocale();

  return (
    <Menu>
      <MenuTrigger
        render={
          <button
            className={cn(
              'cursor-pointer rounded-full border-none bg-transparent p-0 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
              variant === 'full' &&
                'flex w-full items-center gap-2.5 rounded-lg p-2 hover:bg-accent/60',
            )}
          />
        }
      >
        <Avatar>
          <AvatarImage
            src={user?.photoURL ?? undefined}
            alt={user?.displayName ?? ''}
          />
          <AvatarFallback>{initials(user?.displayName)}</AvatarFallback>
        </Avatar>
        {variant === 'full' && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {user?.displayName}
            </p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
        )}
      </MenuTrigger>
      <MenuContent>
        {profile && (
          <MenuItem render={<Link to={path(`/${profile.username}`)} />}>
            <IconUser />
            {t('userMenu.viewProfile')}
          </MenuItem>
        )}
        <MenuItem onClick={() => signOutUser()}>
          <IconLogout2 />
          {t('userMenu.logout')}
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}
