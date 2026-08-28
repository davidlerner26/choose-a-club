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
