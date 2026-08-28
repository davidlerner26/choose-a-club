import { createContext, useContext } from 'react';
import type { LocaleCode } from '@/i18n/locales';

export type LocaleContextValue = {
  locale: LocaleCode;
  currencySymbol: string;
  numberLocale: string;
  priceWithCurrency: (price: number) => string;
  formatPrice: (cents: number) => string;
  path: (path: string) => string;
};

export const LocaleContext = createContext<LocaleContextValue | null>(null);

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
