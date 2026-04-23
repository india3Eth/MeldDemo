"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface TransactionSummary {
  session_id: string;
  transaction_id: string | null;
  status: string;
  event_type: string;
  created_at: string;
}

// Fetch latest status per session for a given customer (wallet address)
export function useTransactions(customerId: string | null) {
  const [transactions, setTransactions] = useState<TransactionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!customerId) {
      setTransactions([]);
      return;
    }

    setIsLoading(true);

    supabase
      .from("transactions")
      .select("session_id, transaction_id, status, event_type, created_at")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!data) { setIsLoading(false); return; }

        // Keep only the latest row per session_id
        const map = new Map<string, TransactionSummary>();
        for (const row of data) {
          if (!map.has(row.session_id)) {
            map.set(row.session_id, row as TransactionSummary);
          }
        }

        setTransactions(Array.from(map.values()));
        setIsLoading(false);
      });
  }, [customerId]);

  return { transactions, isLoading };
}
