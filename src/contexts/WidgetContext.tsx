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
  isCreatingSession: boolean;
  quoteError: string | null;
  sessionError: string | null;

  handleBuyOrSell: () => Promise<void>;
  currentLimit: FiatCurrencyPurchaseLimit | CryptoCurrencySellLimit | null;
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

export function WidgetProvider({ children }: { children: ReactNode }) {
  // ── Core state ───────────────────────────────────────────────────────
  const [mode, setMode] = useState<SessionType>("BUY");
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedFiatCurrency, setSelectedFiatCurrency] = useState<FiatCurrency | null>(null);
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoCurrency | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Track whether user has manually edited the amount — if so, don't auto-set from limit default
  const userEditedAmount = useRef(false);

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
    setSessionError(null);
    setAmount("");
    userEditedAmount.current = false;
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
  const { data: purchaseLimits } = usePurchaseLimits(countryCode, quoteProviders, fiatCode);
  const { data: sellLimits } = useSellLimits(countryCode, quoteProviders, cryptoCode);

  // ── Session creation ─────────────────────────────────────────────────
  const { createSession, isLoading: isCreatingSession } = useSession();

  // Fix #1 + #3: Surface session errors and popup-blocked state
  const handleBuyOrSell = useCallback(async () => {
    if (!selectedQuote || !selectedCountry || !selectedFiatCurrency || !selectedCrypto) return;
    setSessionError(null);

    const isBuy = mode === "BUY";
    const redirectUrl = typeof window !== "undefined"
      ? `${window.location.origin}/transaction-complete`
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
      externalCustomerId: `demo-user-${Date.now()}`,
      externalSessionId: `demo-session-${Date.now()}`,
    });

    if (!session) {
      setSessionError("Failed to create session. Please try again.");
      return;
    }

    if (!session.serviceProviderWidgetUrl) {
      setSessionError("Provider did not return a widget URL. Try a different provider.");
      return;
    }

    const popup = window.open(
      session.serviceProviderWidgetUrl,
      "meld-widget",
      "width=450,height=700,scrollbars=yes,resizable=yes"
    );

    if (!popup) {
      setSessionError(
        `Popup was blocked. Allow popups and try again, or open the provider directly.`
      );
    }
  }, [
    mode, selectedQuote, selectedCountry, selectedFiatCurrency,
    selectedCrypto, selectedPaymentMethod, amount, walletAddress, createSession,
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
  const currentLimit = useMemo<FiatCurrencyPurchaseLimit | CryptoCurrencySellLimit | null>(() => {
    if (mode === "BUY" && purchaseLimits?.length && selectedFiatCurrency) {
      const limit = purchaseLimits.find((l) => l.currencyCode === selectedFiatCurrency.currencyCode);
      if (!limit) return null;
      const providerLimits = quotes
        .map((q) => limit.serviceProviderDetails?.[q.serviceProvider])
        .filter((l): l is NonNullable<typeof l> => !!l);
      if (providerLimits.length > 0) {
        return {
          ...limit,
          minimumAmount: Math.min(...providerLimits.map((l) => l.minimumAmount)),
          maximumAmount: Math.max(...providerLimits.map((l) => l.maximumAmount)),
        };
      }
      return limit;
    }
    if (mode === "SELL" && sellLimits?.length && selectedCrypto) {
      const limit = sellLimits.find((l) => l.currencyCode === selectedCrypto.currencyCode);
      if (!limit) return null;
      const providerLimits = quotes
        .map((q) => limit.serviceProviderDetails?.[q.serviceProvider])
        .filter((l): l is NonNullable<typeof l> => !!l);
      if (providerLimits.length > 0) {
        return {
          ...limit,
          minimumAmount: Math.min(...providerLimits.map((l) => l.minimumAmount)),
          maximumAmount: Math.max(...providerLimits.map((l) => l.maximumAmount)),
        };
      }
      return limit;
    }
    return null;
  }, [mode, purchaseLimits, sellLimits, selectedFiatCurrency, selectedCrypto, quotes]);

  // ── Auto-set amount from limit defaultAmount ────────────────────────
  useEffect(() => {
    if (!userEditedAmount.current && currentLimit?.defaultAmount) {
      setAmount(String(currentLimit.defaultAmount));
    }
  }, [currentLimit]);

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
      isCreatingSession,
      quoteError,
      sessionError,
      handleBuyOrSell,
      currentLimit,
    }),
    [
      mode, selectedCountry, selectedFiatCurrency, selectedCrypto,
      selectedPaymentMethod, selectedQuote, amount, walletAddress,
      countries, fiatCurrencies, cryptoCurrencies, paymentMethods,
      quotes, purchaseLimits, sellLimits, serviceProviderMap,
      isLoadingCountries, loadingFiat, loadingCrypto, loadingPayments,
      isLoadingQuotes, isCreatingSession, quoteError, sessionError,
      handleBuyOrSell, handleSetAmount, currentLimit,
    ]
  );

  return (
    <WidgetContext.Provider value={value}>
      {children}
    </WidgetContext.Provider>
  );
}
