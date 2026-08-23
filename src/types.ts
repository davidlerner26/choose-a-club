export type Product = {
  id: string;
  name: string;
  price: number;
  priceFrom?: number;
  link: string;
  category: string;
  store: string;
  url: string;
  bought?: boolean;
  userId?: string;
  createdAt?: number;
};

export type Category = {
  id: string;
  name: string;
  userId?: string;
  createdAt?: number;
};

export type SortOption = 'recent' | 'price-asc' | 'price-desc';

export type Option = {
  value: string;
  selected: boolean;
  bought: boolean;
};

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
