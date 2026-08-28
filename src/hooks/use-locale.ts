import { createContext, useContext } from 'react';
import type { Currency, LocaleCode } from '@/i18n/locales';

export type LocaleContextValue = {
  locale: LocaleCode;
  currency: Currency;
  currencySymbol: string;
  numberLocale: string;
  // converte (se necessário) de sourceCurrency (BRL por padrão, já que é o
  // que os produtos antigos sempre usaram) pra moeda deste locale e formata
  priceWithCurrency: (price: number, sourceCurrency?: Currency) => string;
  convertPrice: (price: number, sourceCurrency?: Currency) => number;
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
