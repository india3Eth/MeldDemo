"use client";

import { useFetch } from "@/lib/api/fetcher";
import type { CryptoCurrency } from "@/lib/meld/types";

export function useCryptoCurrencies(
  countryCode: string | null,
  fiatCurrency: string | null,
  category: "CRYPTO_ONRAMP" | "CRYPTO_OFFRAMP",
  serviceProvider: string | null = null
) {
  return useFetch<CryptoCurrency[]>(
    countryCode
      ? `/api/meld/crypto-currencies?countries=${countryCode}&accountFilter=true&categories=${category}${fiatCurrency ? `&fiatCurrencies=${fiatCurrency}` : ""}${serviceProvider ? `&serviceProviders=${serviceProvider}` : ""}`
      : null
  );
}
