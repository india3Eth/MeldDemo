"use client";

import { useFetch } from "@/lib/api/fetcher";
import type { FiatCurrency } from "@/lib/meld/types";

export function useFiatCurrencies(
  countryCode: string | null,
  category: "CRYPTO_ONRAMP" | "CRYPTO_OFFRAMP",
  serviceProvider: string | null = null
) {
  return useFetch<FiatCurrency[]>(
    countryCode
      ? `/api/meld/fiat-currencies?countries=${countryCode}&accountFilter=true&categories=${category}${serviceProvider ? `&serviceProviders=${serviceProvider}` : ""}`
      : null
  );
}
