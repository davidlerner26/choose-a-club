import { useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { LocaleContext, type LocaleContextValue } from '@/hooks/use-locale';
import { LOCALES, type LocaleCode } from '@/i18n/locales';

export function LocaleProvider({
  locale,
  children,
}: {
  locale: LocaleCode;
  children: ReactNode;
}) {
  const { i18n } = useTranslation();
  const config = LOCALES[locale];

  useEffect(() => {
    i18n.changeLanguage(config.language);
  }, [config.language, i18n]);

  const value = useMemo<LocaleContextValue>(() => {
    const prefix = config.urlPrefix ? `/${config.urlPrefix}` : '';
    return {
      locale,
      currencySymbol: config.currencySymbol,
      numberLocale: config.numberLocale,
      priceWithCurrency: (price: number) =>
        new Intl.NumberFormat(config.numberLocale, {
          style: 'currency',
          currency: config.currency,
        }).format(price),
      formatPrice: (cents: number) =>
        (cents / 100).toLocaleString(config.numberLocale, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      path: (targetPath: string) =>
        targetPath === '/' ? prefix || '/' : `${prefix}${targetPath}`,
    };
  }, [locale, config]);

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}
