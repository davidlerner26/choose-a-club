import type { Currency } from '@/i18n/locales';

const CACHE_KEY = 'exchangeRatesBRL';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h — cotação não precisa ser em tempo real

type ForeignRates = Record<Exclude<Currency, 'BRL'>, number>;

type RatesCache = {
  fetchedAt: number;
  rates: ForeignRates;
};

let inMemoryCache: RatesCache | null = null;
let pendingFetch: Promise<ForeignRates> | null = null;

function readCache(): RatesCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RatesCache;
    if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(rates: ForeignRates) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ fetchedAt: Date.now(), rates }),
    );
  } catch {
    // modo privado / storage cheio — segue sem cache local, tudo bem
  }
}

// Cotação atual de 1 BRL em outras moedas (API do Banco Central Europeu,
// gratuita e sem necessidade de chave: https://frankfurter.dev).
async function getForeignRatesFromBRL(): Promise<ForeignRates> {
  if (inMemoryCache && Date.now() - inMemoryCache.fetchedAt < CACHE_TTL_MS) {
    return inMemoryCache.rates;
  }

  const cached = readCache();
  if (cached) {
    inMemoryCache = cached;
    return cached.rates;
  }

  if (!pendingFetch) {
    pendingFetch = fetch(
      'https://api.frankfurter.dev/v1/latest?base=BRL&symbols=USD,GBP,EUR',
    )
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((data: { rates: ForeignRates }) => {
        inMemoryCache = { fetchedAt: Date.now(), rates: data.rates };
        writeCache(data.rates);
        return data.rates;
      })
      .finally(() => {
        pendingFetch = null;
      });
  }

  return pendingFetch;
}

// Cotação de 1 BRL em todas as moedas suportadas, incluindo a própria BRL
// (sempre 1) — serve de pivô pra converter entre duas moedas quaisquer.
export async function getRatesFromBRL(): Promise<Record<Currency, number>> {
  const foreign = await getForeignRatesFromBRL();
  return { BRL: 1, ...foreign };
}

export async function convertAmount(
  amount: number,
  from: Currency,
  to: Currency,
): Promise<number> {
  if (from === to) return amount;
  const rates = await getRatesFromBRL();
  const amountInBRL = from === 'BRL' ? amount : amount / rates[from];
  return to === 'BRL' ? amountInBRL : amountInBRL * rates[to];
}
