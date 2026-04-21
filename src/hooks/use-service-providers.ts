"use client";

import { useFetch } from "@/lib/api/fetcher";
import type { ServiceProvider } from "@/lib/meld/types";

export function useServiceProviders(
  category: "CRYPTO_ONRAMP" | "CRYPTO_OFFRAMP"
) {
  return useFetch<ServiceProvider[]>(
    `/api/meld/service-providers?accountFilter=true&categories=${category}`
  );
}
