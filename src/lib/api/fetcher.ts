"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// =============================================================================
// Client-Side Fetch Primitives
// =============================================================================
// Foundation for all data-fetching hooks. Provides loading/error/data states
// with abort-controller cleanup on unmount or URL change.
// =============================================================================

export interface FetchResult<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  refetch: () => void;
}

// ---------------------------------------------------------------------------
// GET — auto-fetches when url is non-null
// ---------------------------------------------------------------------------

export function useFetch<T>(url: string | null): FetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (!url) {
      abortRef.current?.abort();
      setData(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || `HTTP ${res.status}`);
      }
      const json = (await res.json()) as T;
      if (!controller.signal.aborted) setData(json);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      if (!controller.signal.aborted) {
        setData(null);
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    } finally {
      if (!controller.signal.aborted) setIsLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
    return () => abortRef.current?.abort();
  }, [fetchData]);

  return { data, error, isLoading, refetch: fetchData };
}

// ---------------------------------------------------------------------------
// POST — auto-fetches when body is non-null
// ---------------------------------------------------------------------------

export function usePost<T, B>(
  url: string,
  body: B | null
): FetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (!body) {
      abortRef.current?.abort();
      setData(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const json = (await res.json()) as T;
      if (!controller.signal.aborted) setData(json);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      if (!controller.signal.aborted) {
        setData(null);
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    } finally {
      if (!controller.signal.aborted) setIsLoading(false);
    }
  }, [url, body]);

  useEffect(() => {
    fetchData();
    return () => abortRef.current?.abort();
  }, [fetchData]);

  return { data, error, isLoading, refetch: fetchData };
}
