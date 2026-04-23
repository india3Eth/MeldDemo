"use client";

import { useFetch } from "@/lib/api/fetcher";
import type { TransactionSearchResponse } from "@/lib/meld/types";

export function useTransactionList(externalCustomerId: string | null) {
  const url = externalCustomerId
    ? `/api/meld/transactions?externalCustomerIds=${encodeURIComponent(externalCustomerId)}`
    : null;
  return useFetch<TransactionSearchResponse>(url);
}
