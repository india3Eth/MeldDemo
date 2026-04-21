// =============================================================================
// Meld API Client — Server-Side Only
// =============================================================================
// This module is only used in Next.js API route handlers to proxy requests to
// the Meld API. It keeps the API key on the server and never exposes it to the
// browser.
//
// Usage:
//   import { meldClient } from "@/lib/meld/client";
//   const data = await meldClient.get("/service-providers/properties/countries");
// =============================================================================

import type {
  QuoteRequest,
  QuoteResponse,
  WidgetSessionRequest,
  WidgetSessionResponse,
} from "./types";

// ---------------------------------------------------------------------------
// Configuration (read from environment variables)
// ---------------------------------------------------------------------------

function getConfig() {
  const apiKey = process.env.MELD_API_KEY;
  const baseUrl = process.env.MELD_API_BASE_URL || "https://api-sb.meld.io";
  const apiVersion = process.env.MELD_API_VERSION || "2026-02-03";

  if (!apiKey) {
    throw new Error(
      "MELD_API_KEY is not set. Add it to your .env.local file."
    );
  }

  return { apiKey, baseUrl, apiVersion };
}

// ---------------------------------------------------------------------------
// Core request helper
// ---------------------------------------------------------------------------

interface RequestOptions {
  method?: "GET" | "POST";
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { apiKey, baseUrl, apiVersion } = getConfig();
  const { method = "GET", body, params } = options;

  // Build URL with query parameters
  const url = new URL(path, baseUrl);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const headers: Record<string, string> = {
    Authorization: `BASIC ${apiKey}`,
    "Meld-Version": apiVersion,
    "Content-Type": "application/json",
  };

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new MeldApiError(res.status, errorBody, path);
  }

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Error class
// ---------------------------------------------------------------------------

export class MeldApiError extends Error {
  constructor(
    public status: number,
    public body: string,
    public path: string
  ) {
    super(`Meld API error ${status} on ${path}: ${body}`);
    this.name = "MeldApiError";
  }
}

// ---------------------------------------------------------------------------
// Public API — grouped by domain
// ---------------------------------------------------------------------------

export const meldClient = {
  // ── Service Provider Properties ──────────────────────────────────────

  getCountries(params?: Record<string, string | number | boolean | undefined>) {
    return request<unknown>("/service-providers/properties/countries", { params });
  },

  getDefaultsByCountry(params?: Record<string, string | number | boolean | undefined>) {
    return request<unknown>("/service-providers/properties/defaults/by-country", { params });
  },

  getCryptoCurrencies(params?: Record<string, string | number | boolean | undefined>) {
    return request<unknown>("/service-providers/properties/crypto-currencies", { params });
  },

  getFiatCurrencies(params?: Record<string, string | number | boolean | undefined>) {
    return request<unknown>("/service-providers/properties/fiat-currencies", { params });
  },

  getPaymentMethods(params?: Record<string, string | number | boolean | undefined>) {
    return request<unknown>("/service-providers/properties/payment-methods", { params });
  },

  // ── Service Providers ────────────────────────────────────────────────

  getServiceProviders(params?: Record<string, string | number | boolean | undefined>) {
    return request<unknown>("/service-providers", { params });
  },

  // ── Limits ───────────────────────────────────────────────────────────

  getPurchaseLimits(params?: Record<string, string | number | boolean | undefined>) {
    return request<unknown>("/service-providers/limits/fiat-currency-purchases", { params });
  },

  getSellLimits(params?: Record<string, string | number | boolean | undefined>) {
    return request<unknown>("/service-providers/limits/crypto-currency-sells", { params });
  },

  // ── Quotes ───────────────────────────────────────────────────────────

  getQuote(body: QuoteRequest) {
    return request<QuoteResponse>("/payments/crypto/quote", {
      method: "POST",
      body,
    });
  },

  // ── Widget Session ───────────────────────────────────────────────────

  createWidgetSession(body: WidgetSessionRequest) {
    return request<WidgetSessionResponse>("/crypto/session/widget", {
      method: "POST",
      body,
    });
  },

  // ── Transactions ─────────────────────────────────────────────────────

  searchTransactions(params?: Record<string, string | number | boolean | undefined>) {
    return request<unknown>("/payments/transactions", { params });
  },

  getTransaction(id: string) {
    return request<unknown>(`/payments/transactions/${encodeURIComponent(id)}`);
  },

  getTransactionBySession(sessionId: string) {
    return request<unknown>(
      `/payments/transactions/sessions/${encodeURIComponent(sessionId)}`
    );
  },
};
