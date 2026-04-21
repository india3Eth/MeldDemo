"use client";

import { useFetch } from "@/lib/api/fetcher";
import type { CryptoCurrencySellLimit } from "@/lib/meld/types";

export function useSellLimits(
  countryCode: string | null,
  serviceProviders: string | null = null,
  cryptoCurrency: string | null = null
) {
  return useFetch<CryptoCurrencySellLimit[]>(
    countryCode
      ? `/api/meld/limits/sell?countries=${countryCode}&accountFilter=true&categories=CRYPTO_OFFRAMP${serviceProviders ? `&serviceProviders=${serviceProviders}` : ""}${cryptoCurrency ? `&cryptoCurrencies=${cryptoCurrency}` : ""}`
      : null
  );
}
