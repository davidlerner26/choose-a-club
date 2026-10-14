import type { ReactNode } from 'react';
import type { User } from 'firebase/auth';
import SidebarNav from '@/components/sidebar-nav/sidebar-nav.component';
import TopBar from '@/components/top-bar/top-bar.component';
import UserMenu from '@/components/user-menu/user-menu.component';
import type { Product } from '@/types';

export default function AppShell({
  username,
  isOwner,
  user,
  onProductFetched,
  onAddProduct,
  setIsLoading,
  children,
}: {
  username: string;
  isOwner: boolean;
  user: User | null;
  onProductFetched: (product: Product) => void;
  onAddProduct: () => void;
  setIsLoading: (isLoading: boolean) => void;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 lg:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <img className="w-8" src="/favicon.svg" alt="" />
          <div>
            <p className="font-heading text-base leading-tight font-semibold text-foreground">
              Choose a Club
            </p>
            <span className="block h-0.5 w-10 rounded-full bg-gradient-to-r from-primary to-accent-purple" />
          </div>
        </div>
        <SidebarNav username={username} isOwner={isOwner} />
        {user && (
          <div className="mt-auto border-t border-sidebar-border pt-3">
            <UserMenu variant="full" />
          </div>
        )}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col pb-16 lg:pb-0">
        <TopBar
          isOwner={isOwner}
          user={user}
          onProductFetched={onProductFetched}
          onAddProduct={onAddProduct}
          setIsLoading={setIsLoading}
          logo={<img className="w-7 lg:hidden" src="/favicon.svg" alt="Choose a Club" />}
        />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-sidebar-border bg-sidebar px-2 py-1 lg:hidden">
        <SidebarNav username={username} isOwner={isOwner} compact />
      </nav>
    </div>
  );
}
