import type { Currency } from '@/i18n/locales';

export type Product = {
  id: string;
  name: string;
  price: number;
  priceFrom?: number;
  // ausente = produto antigo, salvo antes de existir esse campo — trate
  // como BRL (é a moeda que sempre foi usada até aqui).
  currency?: Currency;
  link: string;
  category: string;
  store: string;
  url: string;
  bought?: boolean;
  available?: boolean;
  createdAt?: number;
};

export type Category = {
  id: string;
  name: string;
  createdAt?: number;
};

export type SortOption = 'recent' | 'price-asc' | 'price-desc';

export type UserProfile = {
  uid: string;
  username: string;
  displayName: string;
  photoURL?: string;
  createdAt?: number;
};

export type Comment = {
  id: string;
  productId: string;
  profileUserId: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  text: string;
  createdAt: number;
};

// target: avisa quando o preço chegar em targetPrice; lowest: avisa quando
// bater o menor preço já visto; restock: avisa quando voltar ao estoque
export type PriceAlertMode = 'target' | 'lowest' | 'restock';

export type PricePoint = {
  price: number;
  currency?: Currency;
  at: number;
};

export type AppNotification = {
  id: string;
  type: 'price-drop' | 'restock';
  productId: string;
  productName: string;
  productUrl: string;
  price: number;
  previousPrice: number | null;
  currency?: Currency;
  read: boolean;
  createdAt: number;
};

export type PriceAlert = {
  id: string;
  uid: string;
  productId: string;
  mode?: PriceAlertMode;
  // mantém o alerta ativo depois de disparar (avisa de novo se cair mais)
  repeat?: boolean;
  lastNotifiedPrice?: number | null;
  targetPrice: number;
  currency?: Currency;
  email: string;
  active: boolean;
  createdAt: number;
  notifiedAt: number | null;
};
