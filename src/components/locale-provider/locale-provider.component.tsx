import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { LocaleContext, type LocaleContextValue } from '@/hooks/use-locale';
import { LOCALES, type Currency, type LocaleCode } from '@/i18n/locales';
import { getRatesFromBRL } from '@/lib/exchange-rates';

// Cotação de 1 BRL em cada moeda suportada — usada como pivô pra converter
// entre duas moedas quaisquer (ex: um produto salvo em USD, visto por
// alguém em en_gb). Enquanto a cotação real ainda não chegou da API,
// assume 1:1 (fica certo assim que a resposta chega, o que é rápido).
const FALLBACK_RATES: Record<Currency, number> = {
  BRL: 1,
  USD: 1,
  GBP: 1,
  EUR: 1,
};

export function LocaleProvider({
  locale,
  children,
}: {
  locale: LocaleCode;
  children: ReactNode;
}) {
  const { i18n } = useTranslation();
  const config = LOCALES[locale];
  const [rates, setRates] = useState<Record<Currency, number>>(
    FALLBACK_RATES,
  );

  useEffect(() => {
    let cancelled = false;
    getRatesFromBRL()
      .then((result) => {
        if (!cancelled) setRates(result);
      })
      .catch((error) => {
        console.error(error);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    i18n.changeLanguage(config.language);
  }, [config.language, i18n]);

  const value = useMemo<LocaleContextValue>(() => {
    const prefix = config.urlPrefix ? `/${config.urlPrefix}` : '';

    const convertPrice = (price: number, sourceCurrency: Currency = 'BRL') => {
      if (sourceCurrency === config.currency) return price;
      const amountInBRL =
        sourceCurrency === 'BRL' ? price : price / rates[sourceCurrency];
      return config.currency === 'BRL'
        ? amountInBRL
        : amountInBRL * rates[config.currency];
    };

    return {
      locale,
      currency: config.currency,
      currencySymbol: config.currencySymbol,
      numberLocale: config.numberLocale,
      convertPrice,
      priceWithCurrency: (price: number, sourceCurrency: Currency = 'BRL') =>
        new Intl.NumberFormat(config.numberLocale, {
          style: 'currency',
          currency: config.currency,
        }).format(convertPrice(price, sourceCurrency)),
      formatPrice: (cents: number) =>
        (cents / 100).toLocaleString(config.numberLocale, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      path: (targetPath: string) =>
        targetPath === '/' ? prefix || '/' : `${prefix}${targetPath}`,
    };
  }, [locale, config, rates]);

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}
