"use client";

import { useMemo } from "react";
import { useFetch } from "@/lib/api/fetcher";
import type { PaymentMethod } from "@/lib/meld/types";

export function usePaymentMethods(
  countryCode: string | null,
  fiatCurrency: string | null,
  category: "CRYPTO_ONRAMP" | "CRYPTO_OFFRAMP",
  serviceProvider: string | null = null
) {
  const url = useMemo(() => {
    if (!countryCode) return null;
    const params = new URLSearchParams({
      countries: countryCode,
      accountFilter: "true",
      categories: category,
    });
    if (fiatCurrency) params.set("fiatCurrencies", fiatCurrency);
    if (serviceProvider) params.set("serviceProviders", serviceProvider);
    return `/api/meld/payment-methods?${params}`;
  }, [countryCode, fiatCurrency, category, serviceProvider]);

  return useFetch<PaymentMethod[]>(url);
}
