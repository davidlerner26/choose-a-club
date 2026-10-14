import { useEffect, useMemo, useState } from 'react';
import { Link, Outlet, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AppShell from '@/components/app-shell/app-shell.component';
import AddProductDialog from '@/components/add-product-dialog/add-product-dialog.component';
import { Spinner } from '@/components/ui/spinner';
import {
  createCategory,
  getAllProducts,
  getUserByUsername,
  getUserCategories,
} from '@/firebase/firebase';
import { useAuth } from '@/hooks/use-auth';
import { useLocale } from '@/hooks/use-locale';
import { useProductReveal } from '@/hooks/use-product-reveal';
import type { ProfileOutletContextValue } from '@/hooks/use-profile-outlet';
import type { Category, Product, UserProfile } from '@/types';

export default function ProfileLayout({ ownProfile }: { ownProfile: UserProfile | null }) {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { path } = useLocale();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [open, setOpen] = useState<boolean>(false);
  const [id, setId] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | undefined>();
  const [prefillCategory, setPrefillCategory] = useState<string | undefined>();

  const isOwner = !!user && !!profile && user.uid === profile.uid;

  const { revealedIds, requestReveal, refreshProducts, resetRevealed } = useProductReveal({
    isOwner,
    setProducts,
  });

  const categoryNames = useMemo(() => categories.map((c) => c.name), [categories]);

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

  const updateProducts = async (uid: string) => {
    setIsLoading(true);
    const response = await getAllProducts(uid);
    setProducts(response);
    setIsLoading(false);
  };

  useEffect(() => {
    if (!profile) return;
    let cancelled = false;
    async function fetchProducts() {
      setIsLoading(true);
      const response = await getAllProducts(profile!.uid);
      if (cancelled) return;
      setProducts(response);
      resetRevealed();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only refetch when the profile itself changes, not on every resetRevealed/products write
  }, [profile]);

  const addCategory = async (name: string) => {
    const newCategory = await createCategory(name);
    setCategories((prev) => [...prev, newCategory]);
    return newCategory;
  };

  const openAddDialog = (category?: string) => {
    setId(null);
    setProduct(undefined);
    setPrefillCategory(category);
    setOpen(true);
  };

  const editProduct = (productId: string) => {
    setId(productId);
    setOpen(true);
  };

  const resetDialog = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setId(null);
      setProduct(undefined);
      setPrefillCategory(undefined);
    }
  };

  if (isProfileLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Spinner className="text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="font-heading text-2xl font-semibold text-primary">
          {t('profile.notFoundTitle')}
        </h1>
        <p className="text-muted-foreground">{t('profile.notFoundText')}</p>
        <Link to={path('/')} className="text-primary underline">
          {t('profile.backHome')}
        </Link>
      </main>
    );
  }

  const outletContext: ProfileOutletContextValue = {
    profile,
    isOwner,
    products,
    categories,
    isLoading,
    setIsLoading,
    refetchProducts: () => updateProducts(profile.uid),
    addCategory,
    openAddDialog,
    editProduct,
    isDialogOpen: open,
    revealedIds,
    requestReveal,
    refreshProducts,
  };

  return (
    <AppShell
      username={ownProfile?.username ?? profile.username}
      isOwner={isOwner}
      user={user}
      onProductFetched={(fetched) => {
        setId(null);
        setProduct(fetched);
        setOpen(true);
      }}
      onAddProduct={() => openAddDialog()}
      setIsLoading={setIsLoading}
    >
      <Outlet context={outletContext} />
      {open && (
        <AddProductDialog
          categories={categoryNames}
          onAddCategory={addCategory}
          open={open}
          setOpen={resetDialog}
          id={id}
          setId={setId}
          updateProducts={() => updateProducts(profile.uid)}
          product={product}
          setProduct={setProduct}
          selectedCategory={prefillCategory}
        />
      )}
    </AppShell>
  );
}
