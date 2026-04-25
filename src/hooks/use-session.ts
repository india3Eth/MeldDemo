"use client";

import { useState, useCallback } from "react";
import type {
  WidgetSessionRequest,
  WidgetSessionResponse,
} from "@/lib/meld/types";

interface UseSessionResult {
  session: WidgetSessionResponse | null;
  isLoading: boolean;
  error: string | null;
  createSession: (body: WidgetSessionRequest) => Promise<{ data: WidgetSessionResponse | null; error: string | null }>;
}

export function useSession(): UseSessionResult {
  const [session, setSession] = useState<WidgetSessionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSession = useCallback(
    async (body: WidgetSessionRequest): Promise<{ data: WidgetSessionResponse | null; error: string | null }> => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/meld/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const text = await res.text();
          const message = text || `HTTP ${res.status}`;
          setError(message);
          return { data: null, error: message };
        }
        const data = (await res.json()) as WidgetSessionResponse;
        setSession(data);
        return { data, error: null };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        return { data: null, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { session, isLoading, error, createSession };
}
