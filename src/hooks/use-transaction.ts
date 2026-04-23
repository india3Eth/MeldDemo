"use client";

import { useFetch } from "@/lib/api/fetcher";
import type { Transaction } from "@/lib/meld/types";

export function useTransaction(txId: string | null) {
  const url = txId ? `/api/meld/transactions/${encodeURIComponent(txId)}` : null;
  return useFetch<Transaction>(url);
}
