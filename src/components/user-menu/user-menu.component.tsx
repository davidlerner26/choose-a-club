import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, MenuContent, MenuItem, MenuTrigger } from '@/components/ui/menu';
import { IconLogout2 } from '@tabler/icons-react';
import { useAuth } from '@/hooks/use-auth';
import { signOutUser } from '@/firebase/firebase';

function initials(name?: string | null) {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export default function UserMenu() {
  const { user } = useAuth();

  return (
    <Menu>
      <MenuTrigger
        render={
          <button className="cursor-pointer rounded-full border-none bg-transparent p-0 outline-none focus-visible:ring-3 focus-visible:ring-ring/50" />
        }
      >
        <Avatar>
          <AvatarImage
            src={user?.photoURL ?? undefined}
            alt={user?.displayName ?? ''}
          />
          <AvatarFallback>{initials(user?.displayName)}</AvatarFallback>
        </Avatar>
      </MenuTrigger>
      <MenuContent>
        <MenuItem onClick={() => signOutUser()}>
          <IconLogout2 />
          Sair
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}
