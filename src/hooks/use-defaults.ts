"use client";

import { useFetch } from "@/lib/api/fetcher";
import type { DefaultsPerCountry } from "@/lib/meld/types";

export function useDefaults(
  countryCode: string | null,
  category: "CRYPTO_ONRAMP" | "CRYPTO_OFFRAMP"
) {
  return useFetch<DefaultsPerCountry[]>(
    countryCode
      ? `/api/meld/defaults?countries=${countryCode}&accountFilter=true&categories=${category}`
      : null
  );
}
