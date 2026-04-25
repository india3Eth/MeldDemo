"use client";

import { useFetch } from "@/lib/api/fetcher";
import type { CryptoCurrencySellLimit } from "@/lib/meld/types";

export function useSellLimits(
  countryCode: string | null,
  serviceProvider: string | null = null,
  cryptoCurrency: string | null = null,
  paymentMethodType: string | null = null
) {
  return useFetch<CryptoCurrencySellLimit[]>(
    countryCode
      ? `/api/meld/limits/sell?countries=${countryCode}&accountFilter=true&categories=CRYPTO_OFFRAMP${serviceProvider ? `&serviceProviders=${serviceProvider}` : ""}${cryptoCurrency ? `&cryptoCurrencies=${cryptoCurrency}` : ""}${paymentMethodType ? `&paymentMethodTypes=${paymentMethodType}` : ""}`
      : null
  );
}
