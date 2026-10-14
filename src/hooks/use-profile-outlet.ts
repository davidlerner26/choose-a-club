import { useOutletContext } from 'react-router-dom';
import type { Category, Product, UserProfile } from '@/types';

export type ProfileOutletContextValue = {
  profile: UserProfile;
  isOwner: boolean;
  products: Product[];
  categories: Category[];
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  refetchProducts: () => Promise<void>;
  addCategory: (name: string) => Promise<Category>;
  openAddDialog: (category?: string) => void;
  editProduct: (id: string) => void;
  // flag somente leitura: útil pra páginas que precisam reagir à abertura/
  // fechamento do diálogo de adicionar/editar produto (que vive no shell)
  isDialogOpen: boolean;
  revealedIds: Set<string>;
  requestReveal: (products: Product[]) => void;
  refreshProducts: (products: Product[]) => void;
};

export function useProfileOutlet() {
  return useOutletContext<ProfileOutletContextValue>();
}
