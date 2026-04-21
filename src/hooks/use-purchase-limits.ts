"use client";

import { useFetch } from "@/lib/api/fetcher";
import type { FiatCurrencyPurchaseLimit } from "@/lib/meld/types";

export function usePurchaseLimits(
  countryCode: string | null,
  serviceProviders: string | null = null,
  fiatCurrency: string | null = null
) {
  return useFetch<FiatCurrencyPurchaseLimit[]>(
    countryCode
      ? `/api/meld/limits/purchase?countries=${countryCode}&accountFilter=true&categories=CRYPTO_ONRAMP${serviceProviders ? `&serviceProviders=${serviceProviders}` : ""}${fiatCurrency ? `&fiatCurrencies=${fiatCurrency}` : ""}`
      : null
  );
}
