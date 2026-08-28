export type LocaleCode = 'pt-BR' | 'en_us' | 'en_gb' | 'en_eu';

export type LocaleConfig = {
  code: LocaleCode;
  language: 'pt-BR' | 'en';
  currency: 'BRL' | 'USD' | 'GBP' | 'EUR';
  currencySymbol: string;
  numberLocale: string;
  urlPrefix: string | null;
};

export const LOCALES: Record<LocaleCode, LocaleConfig> = {
  'pt-BR': {
    code: 'pt-BR',
    language: 'pt-BR',
    currency: 'BRL',
    currencySymbol: 'R$',
    numberLocale: 'pt-BR',
    urlPrefix: null,
  },
  en_us: {
    code: 'en_us',
    language: 'en',
    currency: 'USD',
    currencySymbol: '$',
    numberLocale: 'en-US',
    urlPrefix: 'en_us',
  },
  en_gb: {
    code: 'en_gb',
    language: 'en',
    currency: 'GBP',
    currencySymbol: '£',
    numberLocale: 'en-GB',
    urlPrefix: 'en_gb',
  },
  en_eu: {
    code: 'en_eu',
    language: 'en',
    currency: 'EUR',
    currencySymbol: '€',
    numberLocale: 'en-IE',
    urlPrefix: 'en_eu',
  },
};

export const DEFAULT_LOCALE: LocaleCode = 'pt-BR';

// todos os locales com prefixo de URL (tudo exceto o default pt-BR)
export const PREFIXED_LOCALE_CODES: LocaleCode[] = ['en_us', 'en_gb', 'en_eu'];
