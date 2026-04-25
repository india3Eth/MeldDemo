"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import type {
  Country,
  FiatCurrency,
  CryptoCurrency,
  PaymentMethod,
  Quote,
  SessionType,
  FiatCurrencyPurchaseLimit,
  CryptoCurrencySellLimit,
  ServiceProvider,
} from "@/lib/meld/types";
import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useCountries } from "@/hooks/use-countries";
import { useDefaults } from "@/hooks/use-defaults";
import { useCryptoCurrencies } from "@/hooks/use-crypto-currencies";
import { useFiatCurrencies } from "@/hooks/use-fiat-currencies";
import { usePaymentMethods } from "@/hooks/use-payment-methods";
import { usePurchaseLimits } from "@/hooks/use-purchase-limits";
import { useSellLimits } from "@/hooks/use-sell-limits";
import { useQuote } from "@/hooks/use-quote";
import { useSession } from "@/hooks/use-session";
import { useServiceProviders } from "@/hooks/use-service-providers";

// =============================================================================
// Widget Context — single source of truth for all widget state
// =============================================================================

type TransactionPhase = "idle" | "waiting" | "active";

interface WidgetState {
  mode: SessionType;
  setMode: (mode: SessionType) => void;

  selectedCountry: Country | null;
  setSelectedCountry: (c: Country) => void;
  selectedFiatCurrency: FiatCurrency | null;
  setSelectedFiatCurrency: (c: FiatCurrency) => void;
  selectedCrypto: CryptoCurrency | null;
  setSelectedCrypto: (c: CryptoCurrency) => void;
  selectedPaymentMethod: PaymentMethod | null;
  setSelectedPaymentMethod: (p: PaymentMethod) => void;
  selectedQuote: Quote | null;
  setSelectedQuote: (q: Quote) => void;

  amount: string;
  setAmount: (a: string) => void;
  walletAddress: string;
  setWalletAddress: (a: string) => void;

  countries: Country[];
  fiatCurrencies: FiatCurrency[];
  cryptoCurrencies: CryptoCurrency[];
  paymentMethods: PaymentMethod[];
  quotes: Quote[];
  purchaseLimits: FiatCurrencyPurchaseLimit[];
  sellLimits: CryptoCurrencySellLimit[];
  serviceProviderMap: Record<string, ServiceProvider>;

  isLoadingCountries: boolean;
  isLoadingCurrencies: boolean;
  isLoadingQuotes: boolean;
  isLoadingLimits: boolean;
  isLoadingRefinedLimits: boolean;
  isCreatingSession: boolean;
  quoteError: string | null;

  appError: { title: string; message: string } | null;
  pushError: (title: string, message: string) => void;
  clearError: () => void;

  handleBuyOrSell: () => Promise<void>;
  currentLimit: FiatCurrencyPurchaseLimit | CryptoCurrencySellLimit | null;
  limitUnavailable: boolean;

  txPhase: TransactionPhase;
  txStatus: string | null;
  txId: string | null;
  resetTransaction: () => void;
}

const WidgetContext = createContext<WidgetState | null>(null);

export function useWidget(): WidgetState {
  const ctx = useContext(WidgetContext);
  if (!ctx) throw new Error("useWidget must be used within <WidgetProvider>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

const WAITING_STATUSES = new Set(["PENDING_CREATED", "PENDING", "TWO_FA_REQUIRED", "TWO_FA_PROVIDED"]);
const TERMINAL_STATUSES = new Set(["SETTLED", "FAILED", "DECLINED", "CANCELLED", "REFUNDED"]);
const POLL_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

export function WidgetProvider({ children }: { children: ReactNode }) {
  // ── Core state ───────────────────────────────────────────────────────
  const [mode, setMode] = useState<SessionType>("BUY");
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedFiatCurrency, setSelectedFiatCurrency] = useState<FiatCurrency | null>(null);
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoCurrency | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddressRaw] = useState("");
  const setWalletAddress = useCallback((addr: string) => {
    setWalletAddressRaw(addr.toLowerCase());
  }, []);

  // ── Centralized error state ─────────────────────────────────────────
  const [appError, setAppError] = useState<{ title: string; message: string } | null>(null);
  const prevQuoteError = useRef<string | null>(null);
  const pushError = useCallback((title: string, message: string) => {
    setAppError({ title, message });
  }, []);
  const clearError = useCallback(() => {
    setAppError(null);
    prevQuoteError.current = null;
  }, []);

  // Track whether user has manually edited the amount — if so, don't auto-set from limit default
  const userEditedAmount = useRef(false);

  // ── Transaction tracking (Supabase Realtime) ─────────────────────────
  const [txPhase, setTxPhase] = useState<TransactionPhase>("idle");
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  function unsubscribe() {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }

  function resetTransaction() {
    unsubscribe();
    setTxPhase("idle");
    setTxStatus(null);
    setTxId(null);
  }

  function subscribeToTransaction(sessionId: string) {
    unsubscribe();

    const timeoutId = setTimeout(() => {
      unsubscribe();
      setTxPhase("active"); // timeout → go to status page regardless
    }, POLL_TIMEOUT_MS);

    const handlePayload = (payload: { new: Record<string, unknown> }) => {
      const status = payload.new.status as string;
      const incomingTxId = payload.new.transaction_id as string | null;

      setTxStatus(status);
      if (incomingTxId) setTxId(incomingTxId);

      if (WAITING_STATUSES.has(status)) return; // stay on overlay

      if (status === "SETTLING") {
        // Dismiss overlay, show status page; keep subscription alive for terminal update
        setTxPhase("active");
        return;
      }

      if (TERMINAL_STATUSES.has(status)) {
        clearTimeout(timeoutId);
        unsubscribe();
        setTxPhase("active");
      }
    };

    const filter = { schema: "public", table: "transactions", filter: `session_id=eq.${sessionId}` };

    const channel = supabase
      .channel(`tx:${sessionId}`)
      .on("postgres_changes", { event: "INSERT", ...filter }, handlePayload)
      .on("postgres_changes", { event: "UPDATE", ...filter }, handlePayload)
      .subscribe();

    channelRef.current = channel;
  }

  // Wrap setAmount to mark user intent
  const handleSetAmount = useCallback((val: string) => {
    userEditedAmount.current = true;
    setAmount(val);
  }, []);

  // ── Fix #5: Reset mode-specific state on mode change ─────────────────
  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setSelectedCrypto(null);
    setSelectedPaymentMethod(null);
    setSelectedQuote(null);
    setWalletAddress("");
    setAppError(null);
    setAmount("");
    userEditedAmount.current = false;
    unsubscribe();
    setTxPhase("idle");
    setTxStatus(null);
    setTxId(null);
  }, [mode]);


  // ── API hooks (all go through /api/meld/* proxy) ────────────────────
  const countryCode = selectedCountry?.countryCode ?? null;
  const fiatCode = selectedFiatCurrency?.currencyCode ?? null;
  const category = mode === "BUY" ? "CRYPTO_ONRAMP" : "CRYPTO_OFFRAMP";
  const serviceProvider = selectedQuote?.serviceProvider ?? null;

  const { data: countries, isLoading: isLoadingCountries } = useCountries(category);
  const { data: defaults, isLoading: loadingDefaults } = useDefaults(countryCode, category);
  const { data: fiatCurrencies, isLoading: loadingFiat } = useFiatCurrencies(countryCode, category, serviceProvider);
  const { data: cryptoCurrencies, isLoading: loadingCrypto } = useCryptoCurrencies(countryCode, fiatCode, category, serviceProvider);
  const { data: paymentMethods, isLoading: loadingPayments } = usePaymentMethods(countryCode, fiatCode, category);

  // Fix #11: Fetch service providers for status badges
  const { data: serviceProviders } = useServiceProviders(category);
  const serviceProviderMap = useMemo<Record<string, ServiceProvider>>(() => {
    if (!serviceProviders?.length) return {};
    return Object.fromEntries(serviceProviders.map((sp) => [sp.serviceProvider, sp]));
  }, [serviceProviders]);

  // Quote params — uses debounced wallet to avoid fetching on every keystroke
  const quoteParams = useMemo(() => {
    if (!countryCode || !selectedFiatCurrency || !selectedCrypto) return null;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return null;

    const isBuy = mode === "BUY";
    return {
      countryCode,
      sourceCurrencyCode: isBuy
        ? selectedFiatCurrency.currencyCode
        : selectedCrypto.currencyCode,
      sourceAmount: numAmount,
      destinationCurrencyCode: isBuy
        ? selectedCrypto.currencyCode
        : selectedFiatCurrency.currencyCode,
      paymentMethodType: selectedPaymentMethod?.paymentMethod,
    };
  }, [mode, countryCode, selectedFiatCurrency, selectedCrypto, amount, selectedPaymentMethod]);

  const { data: quoteData, isLoading: isLoadingQuotes, error: quoteError } = useQuote(quoteParams);

  // Sort quotes by rampScore (highest first)
  const quotes = useMemo(() => {
    if (!quoteData?.quotes) return [];
    return [...quoteData.quotes].sort((a, b) => {
      const scoreA = a.rampIntelligence?.rampScore ?? a.customerScore ?? 0;
      const scoreB = b.rampIntelligence?.rampScore ?? b.customerScore ?? 0;
      return scoreB - scoreA;
    });
  }, [quoteData]);

  const quoteProviders = useMemo(
    () => (quotes.length ? quotes.map((q) => q.serviceProvider).join(",") : null),
    [quotes]
  );

  const cryptoCode = selectedCrypto?.currencyCode ?? null;
  // Base limits — no provider filter, stable, never disappears
  const { data: purchaseLimits, isLoading: isLoadingPurchaseLimits } = usePurchaseLimits(mode === "BUY" ? countryCode : null, null, fiatCode);
  const { data: sellLimits, isLoading: isLoadingSellLimits } = useSellLimits(mode === "SELL" ? countryCode : null, null, cryptoCode);
  const isLoadingLimits = mode === "BUY" ? isLoadingPurchaseLimits : isLoadingSellLimits;

  // Refined limits — scoped to selected provider + payment method (fires once a quote is selected)
  const selectedPaymentType = selectedPaymentMethod?.paymentMethod ?? null;
  const { data: refinedPurchaseLimits, isLoading: isLoadingRefinedPurchase } = usePurchaseLimits(
    mode === "BUY" && serviceProvider ? countryCode : null,
    serviceProvider,
    fiatCode,
    selectedPaymentType
  );
  const { data: refinedSellLimits, isLoading: isLoadingRefinedSell } = useSellLimits(
    mode === "SELL" && serviceProvider ? countryCode : null,
    serviceProvider,
    cryptoCode,
    selectedPaymentType
  );
  const isLoadingRefinedLimits = mode === "BUY" ? isLoadingRefinedPurchase : isLoadingRefinedSell;

  // ── Session creation ─────────────────────────────────────────────────
  const { createSession, isLoading: isCreatingSession } = useSession();

  // Fix #1 + #3: Surface session errors and popup-blocked state
  const handleBuyOrSell = useCallback(async () => {
    if (!selectedQuote || !selectedCountry || !selectedFiatCurrency || !selectedCrypto) return;
    setAppError(null);

    const isBuy = mode === "BUY";
    const redirectUrl = typeof window !== "undefined"
      ? `${window.location.origin}/transaction/success`
      : undefined;

    const session = await createSession({
      sessionType: mode,
      sessionData: {
        countryCode: selectedCountry.countryCode,
        sourceCurrencyCode: isBuy
          ? selectedFiatCurrency.currencyCode
          : selectedCrypto.currencyCode,
        sourceAmount: amount,
        destinationCurrencyCode: isBuy
          ? selectedCrypto.currencyCode
          : selectedFiatCurrency.currencyCode,
        serviceProvider: selectedQuote.serviceProvider,
        walletAddress: isBuy ? walletAddress : undefined,
        paymentMethodType: selectedPaymentMethod?.paymentMethod,
        redirectUrl,
        redirectFlow: mode === "SELL",
      },
      externalCustomerId: walletAddress || `demo-user-${Date.now()}`,
      externalSessionId: `demo-session-${crypto.randomUUID()}`,
    });

    if (!session) {
      pushError("Session Error", "Failed to create session. Please try again.");
      return;
    }

    if (!session.serviceProviderWidgetUrl) {
      pushError("Session Error", "Provider did not return a widget URL. Try a different provider.");
      return;
    }

    // Note: window.open with noopener always returns null — cannot use return value
    // to detect blocked popups. Open the tab and always proceed to show overlay.
    window.open(
      session.serviceProviderWidgetUrl,
      "_blank",
      "noopener,noreferrer"
    );

    // Subscribe to Realtime updates for this session
    setTxPhase("waiting");
    setTxStatus(null);
    subscribeToTransaction(session.externalSessionId);
  }, [
    mode, selectedQuote, selectedCountry, selectedFiatCurrency,
    selectedCrypto, selectedPaymentMethod, amount, walletAddress, createSession, pushError,
  ]);

  // ── Auto-select defaults ────────────────────────────────────────────

  useEffect(() => {
    if (countries?.length && !selectedCountry) {
      const us = countries.find((c) => c.countryCode === "US");
      setSelectedCountry(us ?? countries[0]);
    }
  }, [countries, selectedCountry]);

  useEffect(() => {
    if (selectedFiatCurrency) return;
    if (loadingFiat || loadingDefaults) return; // wait for fresh data
    if (!fiatCurrencies?.length) return;
    if (defaults?.length) {
      const defaultCode = defaults[0]?.defaultCurrencyCode;
      const found = fiatCurrencies.find((c) => c.currencyCode === defaultCode);
      setSelectedFiatCurrency(found ?? fiatCurrencies[0]);
    } else {
      setSelectedFiatCurrency(fiatCurrencies[0]);
    }
  }, [defaults, fiatCurrencies, selectedFiatCurrency, loadingFiat, loadingDefaults]);

  useEffect(() => {
    if (selectedCrypto) return;
    if (loadingCrypto) return; // wait for fresh data
    if (!cryptoCurrencies?.length) return;
    // Priority: USDC on ETH > USDT on ETH > USDC on any chain > USDT on any chain > first
    const usdcEth = cryptoCurrencies.find(
      (c) => c.currencyCode === "USDC" && c.chainCode === "ETH"
    );
    const usdtEth = cryptoCurrencies.find(
      (c) => c.currencyCode === "USDT" && c.chainCode === "ETH"
    );
    const usdcAny = cryptoCurrencies.find((c) => c.currencyCode === "USDC");
    const usdtAny = cryptoCurrencies.find((c) => c.currencyCode === "USDT");
    setSelectedCrypto(usdcEth ?? usdtEth ?? usdcAny ?? usdtAny ?? cryptoCurrencies[0]);
  }, [cryptoCurrencies, selectedCrypto, loadingCrypto]);

  useEffect(() => {
    if (selectedPaymentMethod) return;
    if (loadingPayments || loadingDefaults) return; // wait for fresh data
    if (!paymentMethods?.length) return;
    if (defaults?.length) {
      const defaultPM = defaults[0]?.defaultPaymentMethods?.[0];
      const found = paymentMethods.find((p) => p.paymentMethod === defaultPM);
      setSelectedPaymentMethod(found ?? paymentMethods[0]);
    } else {
      setSelectedPaymentMethod(paymentMethods[0]);
    }
  }, [defaults, paymentMethods, selectedPaymentMethod, loadingPayments, loadingDefaults]);

  useEffect(() => {
    if (!quotes.length) {
      setSelectedQuote(null);
      return;
    }
    setSelectedQuote((prev) => {
      if (prev) {
        const updated = quotes.find((q) => q.serviceProvider === prev.serviceProvider);
        if (updated) return updated;
      }
      return quotes[0];
    });
  }, [quotes]);

  // ── Current limit ───────────────────────────────────────────────────
  // When a provider is selected:
  //   - refined loading → show base (transition, don't flash)
  //   - refined loaded + has data → show refined
  //   - refined loaded + empty → null (unavailable for this combination)
  // When no provider selected: show base
  const currentLimit = useMemo<FiatCurrencyPurchaseLimit | CryptoCurrencySellLimit | null>(() => {
    if (mode === "BUY" && selectedFiatCurrency) {
      if (serviceProvider) {
        if (isLoadingRefinedLimits) {
          // Still fetching refined — show base as placeholder
          return purchaseLimits?.find((l) => l.currencyCode === selectedFiatCurrency.currencyCode) ?? null;
        }
        // Refined fetch done — use it or null (don't fall back to base)
        return refinedPurchaseLimits?.find((l) => l.currencyCode === selectedFiatCurrency.currencyCode) ?? null;
      }
      return purchaseLimits?.find((l) => l.currencyCode === selectedFiatCurrency.currencyCode) ?? null;
    }
    if (mode === "SELL" && selectedCrypto) {
      if (serviceProvider) {
        if (isLoadingRefinedLimits) {
          return sellLimits?.find((l) => l.currencyCode === selectedCrypto.currencyCode) ?? null;
        }
        return refinedSellLimits?.find((l) => l.currencyCode === selectedCrypto.currencyCode) ?? null;
      }
      return sellLimits?.find((l) => l.currencyCode === selectedCrypto.currencyCode) ?? null;
    }
    return null;
  }, [mode, purchaseLimits, sellLimits, refinedPurchaseLimits, refinedSellLimits,
      selectedFiatCurrency, selectedCrypto, serviceProvider, isLoadingRefinedLimits]);

  // True when provider is selected, refined fetch completed, but returned no limit for this currency
  const limitUnavailable = useMemo<boolean>(() => {
    if (!serviceProvider || isLoadingRefinedLimits) return false;
    if (mode === "BUY" && selectedFiatCurrency) {
      return !refinedPurchaseLimits?.find((l) => l.currencyCode === selectedFiatCurrency.currencyCode);
    }
    if (mode === "SELL" && selectedCrypto) {
      return !refinedSellLimits?.find((l) => l.currencyCode === selectedCrypto.currencyCode);
    }
    return false;
  }, [mode, refinedPurchaseLimits, refinedSellLimits, selectedFiatCurrency, selectedCrypto,
      serviceProvider, isLoadingRefinedLimits]);

  // ── Auto-set amount from limit defaultAmount ────────────────────────
  useEffect(() => {
    if (!userEditedAmount.current && currentLimit?.defaultAmount) {
      setAmount(String(currentLimit.defaultAmount));
    }
  }, [currentLimit]);

  // ── Push quote errors to centralized error state ───────────────────
  useEffect(() => {
    if (quoteError && quoteError !== prevQuoteError.current) {
      pushError("Quote Error", quoteError);
    }
    prevQuoteError.current = quoteError;
  }, [quoteError, pushError]);

  // ── Context value ───────────────────────────────────────────────────
  const value = useMemo<WidgetState>(
    () => ({
      mode, setMode,
      selectedCountry, setSelectedCountry,
      selectedFiatCurrency, setSelectedFiatCurrency,
      selectedCrypto, setSelectedCrypto,
      selectedPaymentMethod, setSelectedPaymentMethod,
      selectedQuote, setSelectedQuote,
      amount, setAmount: handleSetAmount,
      walletAddress, setWalletAddress,
      countries: countries ?? [],
      fiatCurrencies: fiatCurrencies ?? [],
      cryptoCurrencies: cryptoCurrencies ?? [],
      paymentMethods: paymentMethods ?? [],
      quotes,
      purchaseLimits: purchaseLimits ?? [],
      sellLimits: sellLimits ?? [],
      serviceProviderMap,
      isLoadingCountries,
      isLoadingCurrencies: loadingFiat || loadingCrypto || loadingPayments,
      isLoadingQuotes,
      isLoadingLimits,
      isLoadingRefinedLimits,
      isCreatingSession,
      quoteError,
      appError,
      pushError,
      clearError,
      handleBuyOrSell,
      currentLimit, limitUnavailable,
      txPhase,
      txStatus,
      txId,
      resetTransaction,
    }),
    [
      mode, selectedCountry, selectedFiatCurrency, selectedCrypto,
      selectedPaymentMethod, selectedQuote, amount, walletAddress,
      countries, fiatCurrencies, cryptoCurrencies, paymentMethods,
      quotes, purchaseLimits, sellLimits, serviceProviderMap,
      isLoadingCountries, loadingFiat, loadingCrypto, loadingPayments,
      isLoadingQuotes, isLoadingLimits, isLoadingRefinedLimits, isCreatingSession, quoteError,
      refinedPurchaseLimits, refinedSellLimits,
      appError, pushError, clearError,
      handleBuyOrSell, handleSetAmount, currentLimit, limitUnavailable,
      txPhase, txStatus, txId,
    ]
  );

  return (
    <WidgetContext.Provider value={value}>
      {children}
    </WidgetContext.Provider>
  );
}
