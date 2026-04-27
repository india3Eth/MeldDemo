"use client";

import { useFetch } from "@/lib/api/fetcher";
import type { Country } from "@/lib/meld/types";

export function useCountries(category: "CRYPTO_ONRAMP" | "CRYPTO_OFFRAMP" | "CRYPTO_TRANSFER") {
  return useFetch<Country[]>(
    `/api/meld/countries?accountFilter=true&categories=${category}`
  );
}
