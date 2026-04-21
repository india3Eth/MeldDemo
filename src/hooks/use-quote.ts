"use client";

import { useMemo } from "react";
import { usePost } from "@/lib/api/fetcher";
import type { QuoteRequest, QuoteResponse } from "@/lib/meld/types";

export interface QuoteParams {
  countryCode: string;
  sourceCurrencyCode: string;
  sourceAmount: number;
  destinationCurrencyCode: string;
  paymentMethodType?: string;
  walletAddress?: string;
}

export function useQuote(params: QuoteParams | null) {
  const body = useMemo<QuoteRequest | null>(() => {
    if (!params || !params.sourceAmount || params.sourceAmount <= 0) return null;
    return {
      countryCode: params.countryCode,
      sourceCurrencyCode: params.sourceCurrencyCode,
      sourceAmount: params.sourceAmount,
      destinationCurrencyCode: params.destinationCurrencyCode,
      paymentMethodType: params.paymentMethodType,
      walletAddress: params.walletAddress,
    };
  }, [params]);

  return usePost<QuoteResponse, QuoteRequest>("/api/meld/quote", body);
}
