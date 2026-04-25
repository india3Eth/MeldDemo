"use client";

import { useFetch } from "@/lib/api/fetcher";
import type { FiatCurrencyPurchaseLimit } from "@/lib/meld/types";

export function usePurchaseLimits(
  countryCode: string | null,
  serviceProvider: string | null = null,
  fiatCurrency: string | null = null,
  paymentMethodType: string | null = null
) {
  return useFetch<FiatCurrencyPurchaseLimit[]>(
    countryCode
      ? `/api/meld/limits/purchase?countries=${countryCode}&accountFilter=true&categories=CRYPTO_ONRAMP${serviceProvider ? `&serviceProviders=${serviceProvider}` : ""}${fiatCurrency ? `&fiatCurrencies=${fiatCurrency}` : ""}${paymentMethodType ? `&paymentMethodTypes=${paymentMethodType}` : ""}`
      : null
  );
}
