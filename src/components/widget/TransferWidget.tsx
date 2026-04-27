"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useTheme } from "@/themes/ThemeProvider";
import { useCountries } from "@/hooks/use-countries";
import { useCryptoCurrencies } from "@/hooks/use-crypto-currencies";
import { useServiceProviders } from "@/hooks/use-service-providers";
import { useSession } from "@/hooks/use-session";
import { useWallet } from "@/hooks/use-wallet";
import type { WalletType } from "@/hooks/use-wallet";
import { BaseModal } from "@/components/modals/BaseModal";
import { TransactionHistoryModal } from "@/components/modals/TransactionHistoryModal";
import { ErrorModal } from "@/components/modals/ErrorModal";
import { PoweredByFooter } from "./PoweredByFooter";
import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { Country, CryptoCurrency, ServiceProvider } from "@/lib/meld/types";

// =============================================================================
// TransferWidget — self-contained crypto transfer widget
// Uses sessionType: "TRANSFER" — no fiat, no payment methods, no quotes.
// Flow: country → crypto → service provider → destination wallet → amount → submit
// =============================================================================

type TransferPhase = "idle" | "waiting" | "active";
type ModalType = "country" | "crypto" | "provider" | "history" | "error" | null;

const WAITING_STATUSES = new Set(["PENDING_CREATED", "PENDING", "TWO_FA_REQUIRED", "TWO_FA_PROVIDED"]);
const TERMINAL_STATUSES = new Set(["SETTLED", "FAILED", "DECLINED", "CANCELLED", "REFUNDED"]);
const POLL_TIMEOUT_MS = 10 * 60 * 1000;

const WAITING_STATUS_LABELS: Record<string, string> = {
  PENDING_CREATED: "Transaction created",
  PENDING:         "Awaiting provider confirmation",
  TWO_FA_REQUIRED: "Verification required in provider tab",
  TWO_FA_PROVIDED: "Verifying…",
};

function parseProxyErrorMessage(errorStr: string): string {
  try {
    const outer = JSON.parse(errorStr) as { error?: string };
    const inner = outer.error ?? errorStr;
    const jsonMatch = inner.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as { message?: string; errors?: string[] };
      if (parsed.message) {
        if (parsed.errors?.length) {
          return `${parsed.message}: ${parsed.errors.join("; ")}`;
        }
        return parsed.message;
      }
    }
    return inner;
  } catch {
    return errorStr;
  }
}

function validateAddress(address: string, chainCode?: string): boolean {
  if (!address) return true;
  const a = address.trim();
  switch (chainCode?.toUpperCase()) {
    case "ETH": case "MATIC": case "POLYGON": case "BSC":
    case "BNB": case "AVAX": case "ARB": case "OP": case "BASE":
      return /^0x[a-fA-F0-9]{40}$/.test(a);
    case "BTC":
      return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[ac-hj-np-z02-9]{6,87}$/.test(a);
    case "SOL":
      return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(a);
    default:
      return a.length >= 10;
  }
}

// Wallet icon — renders data URI / long URL as <img>, short string as emoji span
function WalletIcon({ icon, size }: { icon: string | undefined; size: number }) {
  if (!icon) return <span style={{ fontSize: size }}>🔗</span>;
  if (icon.length > 4) {
    return (
      <img
        src={icon}
        alt=""
        style={{ width: size, height: size, borderRadius: 4, flexShrink: 0, objectFit: "contain" }}
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
      />
    );
  }
  return <span style={{ fontSize: size, lineHeight: 1, flexShrink: 0 }}>{icon}</span>;
}

export function TransferWidget() {
  const { tokens } = useTheme();

  // ── Core state ────────────────────────────────────────────────────────
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoCurrency | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [destinationWallet, setDestinationWalletRaw] = useState("");
  const setDestinationWallet = useCallback((addr: string) => setDestinationWalletRaw(addr.toLowerCase()), []);
  const [amount, setAmount] = useState("");
  const [openModal, setOpenModal] = useState<ModalType>(null);

  // ── Inline error state ────────────────────────────────────────────────
  const [appError, setAppError] = useState<{ title: string; message: string } | null>(null);

  // ── Wallet connector ──────────────────────────────────────────────────
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const wallet = useWallet(setDestinationWallet, selectedCrypto?.chainCode);

  // Re-sync connected wallet address after crypto switch clears destinationWallet
  useEffect(() => {
    if (wallet.connected && !destinationWallet) {
      setDestinationWallet(wallet.connected.address);
    }
  }, [wallet.connected, destinationWallet, setDestinationWallet]);

  // Close wallet picker on outside click
  useEffect(() => {
    if (!pickerOpen) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [pickerOpen]);

  async function handleConnectClick() {
    if (wallet.availableWallets.length === 1) {
      await wallet.connectSpecific(wallet.availableWallets[0].type, selectedCrypto?.chainCode);
    } else {
      setPickerOpen((v) => !v);
    }
  }

  async function handlePickWallet(type: WalletType) {
    setPickerOpen(false);
    await wallet.connectSpecific(type, selectedCrypto?.chainCode);
  }

  // ── Transaction tracking ──────────────────────────────────────────────
  const [txPhase, setTxPhase] = useState<TransferPhase>("idle");
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // ── Search state for modals ───────────────────────────────────────────
  const [countrySearch, setCountrySearch] = useState("");
  const [cryptoSearch, setCryptoSearch] = useState("");
  const [cryptoChainFilter, setCryptoChainFilter] = useState("all");
  const [providerSearch, setProviderSearch] = useState("");

  const clientIpRef = useRef<string | null>(null);
  useEffect(() => {
    fetch("https://api.ipify.org/")
      .then((r) => r.text())
      .then((ip) => { clientIpRef.current = ip.trim(); })
      .catch(() => {});
  }, []);

  // ── API data ──────────────────────────────────────────────────────────
  const countryCode = selectedCountry?.countryCode ?? null;
  const { data: countries, isLoading: isLoadingCountries } = useCountries("CRYPTO_TRANSFER");
  const { data: cryptoCurrencies, isLoading: isLoadingCryptos } = useCryptoCurrencies(countryCode, null, "CRYPTO_TRANSFER", null);
  const { data: serviceProviders, isLoading: isLoadingProviders } = useServiceProviders("CRYPTO_TRANSFER");
  const { createSession, isLoading: isCreatingSession } = useSession();

  // ── Auto-select defaults ──────────────────────────────────────────────
  useEffect(() => {
    if (countries?.length && !selectedCountry) {
      const us = countries.find((c) => c.countryCode === "US");
      setSelectedCountry(us ?? countries[0]);
    }
  }, [countries, selectedCountry]);

  useEffect(() => {
    if (cryptoCurrencies?.length && !selectedCrypto) {
      const usdcEth = cryptoCurrencies.find((c) => c.currencyCode === "USDC" && c.chainCode === "ETH");
      const usdtEth = cryptoCurrencies.find((c) => c.currencyCode === "USDT" && c.chainCode === "ETH");
      const usdcAny = cryptoCurrencies.find((c) => c.currencyCode === "USDC");
      const usdtAny = cryptoCurrencies.find((c) => c.currencyCode === "USDT");
      setSelectedCrypto(usdcEth ?? usdtEth ?? usdcAny ?? usdtAny ?? cryptoCurrencies[0]);
    }
  }, [cryptoCurrencies, selectedCrypto]);

  useEffect(() => {
    if (serviceProviders?.length && !selectedProvider) {
      setSelectedProvider(serviceProviders[0]);
    }
  }, [serviceProviders, selectedProvider]);

  // ── Supabase Realtime ─────────────────────────────────────────────────
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
    const timeoutId = setTimeout(() => { unsubscribe(); setTxPhase("active"); }, POLL_TIMEOUT_MS);
    const handlePayload = (payload: { new: Record<string, unknown> }) => {
      const status = payload.new.status as string;
      const incomingTxId = payload.new.transaction_id as string | null;
      setTxStatus(status);
      if (incomingTxId) setTxId(incomingTxId);
      if (WAITING_STATUSES.has(status)) return;
      if (status === "SETTLING") { setTxPhase("active"); return; }
      if (TERMINAL_STATUSES.has(status)) { clearTimeout(timeoutId); unsubscribe(); setTxPhase("active"); }
    };
    const filter = { schema: "public", table: "transactions", filter: `session_id=eq.${sessionId}` };
    const channel = supabase
      .channel(`tx:${sessionId}`)
      .on("postgres_changes", { event: "INSERT", ...filter }, handlePayload)
      .on("postgres_changes", { event: "UPDATE", ...filter }, handlePayload)
      .subscribe();
    channelRef.current = channel;
  }

  // Listen for redirect signal from /transaction/success — popup closed, move to active
  useEffect(() => {
    let bc: BroadcastChannel | null = null;

    const handleRedirect = () => {
      setTxPhase("active");
    };

    try {
      bc = new BroadcastChannel("meld_sell_redirect");
      bc.onmessage = (e: MessageEvent<{ type: string }>) => {
        if (e.data?.type === "MELD_SELL_REDIRECT") handleRedirect();
      };
    } catch {
      const onStorage = (e: StorageEvent) => {
        if (e.key === "meld_sell_redirect" && e.newValue) handleRedirect();
      };
      window.addEventListener("storage", onStorage);
      return () => window.removeEventListener("storage", onStorage);
    }

    return () => { bc?.close(); };
  }, []); // mount only

  useEffect(() => {
    if (txPhase === "active") setOpenModal("history");
  }, [txPhase]);

  useEffect(() => {
    if (appError) setOpenModal("error");
  }, [appError]);

  // ── Session creation ──────────────────────────────────────────────────
  const handleTransfer = useCallback(async () => {
    if (!selectedCountry || !selectedCrypto || !selectedProvider) return;
    setAppError(null);
    const redirectUrl = typeof window !== "undefined"
      ? `${window.location.origin}/transaction/success`
      : undefined;
    const externalSessionId = `demo-session-${crypto.randomUUID()}`;

    const { data: session, error: sessionError } = await createSession({
      sessionType: "TRANSFER",
      sessionData: {
        countryCode: selectedCountry.countryCode,
        sourceCurrencyCodes: [selectedCrypto.currencyCode],
        sourceAmount: amount,
        serviceProvider: selectedProvider.serviceProvider,
        walletAddress: destinationWallet || undefined,
        redirectUrl,
        clientIpAddress: clientIpRef.current ?? undefined,
      },
      externalCustomerId: destinationWallet || `demo-user-${Date.now()}`,
      externalSessionId,
    });

    if (!session) {
      const msg = sessionError
        ? parseProxyErrorMessage(sessionError)
        : "Failed to create session. Please try again.";
      setAppError({ title: "Session Error", message: msg });
      return;
    }
    if (!session.serviceProviderWidgetUrl) {
      setAppError({ title: "Session Error", message: "Provider did not return a widget URL. Try a different provider." });
      return;
    }
    window.open(session.serviceProviderWidgetUrl, "_blank", "noopener,noreferrer");
    setTxPhase("waiting");
    setTxStatus(null);
    subscribeToTransaction(session.externalSessionId);
  }, [selectedCountry, selectedCrypto, selectedProvider, destinationWallet, amount, createSession]);

  // ── Derived validation ────────────────────────────────────────────────
  const numAmount = parseFloat(amount);
  const isEmpty = !destinationWallet.trim();
  const isAddressInvalid = !isEmpty && !validateAddress(destinationWallet, selectedCrypto?.chainCode);
  const isWalletConnected = wallet.connected !== null;
  const connectedWalletInfo = wallet.availableWallets.find((w) => w.type === wallet.connected?.type);

  const canSubmit =
    selectedCountry !== null &&
    selectedCrypto !== null &&
    selectedProvider !== null &&
    !isNaN(numAmount) &&
    numAmount > 0 &&
    !isAddressInvalid;

  // ── Filtered modal lists ──────────────────────────────────────────────
  const filteredCountries = useMemo(
    () => (countries ?? []).filter((c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.countryCode.toLowerCase().includes(countrySearch.toLowerCase())
    ),
    [countries, countrySearch]
  );

  const cryptoChains = useMemo(() => {
    const set = new Set((cryptoCurrencies ?? []).map((c) => c.chainName));
    return Array.from(set).sort();
  }, [cryptoCurrencies]);

  const filteredCryptos = useMemo(
    () => (cryptoCurrencies ?? []).filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(cryptoSearch.toLowerCase()) ||
        c.currencyCode.toLowerCase().includes(cryptoSearch.toLowerCase());
      const matchChain = cryptoChainFilter === "all" || c.chainName === cryptoChainFilter;
      return matchSearch && matchChain;
    }),
    [cryptoCurrencies, cryptoSearch, cryptoChainFilter]
  );

  const filteredProviders = useMemo(
    () => (serviceProviders ?? []).filter((p) =>
      p.name.toLowerCase().includes(providerSearch.toLowerCase())
    ),
    [serviceProviders, providerSearch]
  );

  const closeModal = () => {
    if (openModal === "error") setAppError(null);
    setOpenModal(null);
    setCountrySearch("");
    setCryptoSearch("");
    setCryptoChainFilter("all");
    setProviderSearch("");
  };

  // ── Render ────────────────────────────────────────────────────────────
  const walletBorderStyle = isAddressInvalid || isEmpty
    ? `1px solid ${tokens.errorColor}66`
    : tokens.inputBorder;

  return (
    <div
      className="relative w-full max-w-[420px]"
      style={{
        background: tokens.widgetBg,
        border: tokens.widgetBorder,
        borderRadius: tokens.widgetRadius,
        boxShadow: tokens.widgetShadow,
        backdropFilter: tokens.widgetBackdrop,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "32px" }}>

        {/* ── Header ── */}
        <div className="mb-6 flex items-center justify-between">
          <div
            className="flex h-11 w-11 items-center justify-center text-2xl font-bold"
            style={{
              background: tokens.accentBg,
              color: tokens.accentText,
              borderRadius: "12px",
              boxShadow: tokens.accentShadow,
            }}
          >
            ↔️
          </div>

          <div className="text-lg font-bold" style={{ color: tokens.textPrimary, textShadow: tokens.textShadow }}>
            Transfer
          </div>

          <button
            onClick={() => setOpenModal("country")}
            className="flex items-center gap-1.5 transition-all duration-200"
            style={{
              padding: "8px 12px",
              background: tokens.pillBg,
              border: tokens.pillBorder,
              borderRadius: tokens.pillRadius,
              boxShadow: tokens.pillShadow,
              cursor: "pointer",
            }}
          >
            {selectedCountry?.flagImageUrl ? (
              <img src={selectedCountry.flagImageUrl} alt={selectedCountry.name} className="h-5 w-7 rounded-sm object-cover" />
            ) : (
              <span className="text-xl">🌍</span>
            )}
            <span style={{ fontSize: "12px", color: tokens.textMuted }}>▼</span>
          </button>
        </div>

        {/* ── You send ── */}
        <div
          className="mb-4 rounded-2xl p-4"
          style={{ background: tokens.sectionBg, border: tokens.sectionBorder, boxShadow: tokens.sectionShadow }}
        >
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: tokens.textMuted }}>
            You send
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpenModal("crypto")}
              className="flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 transition-all duration-150"
              style={{
                background: tokens.pillBg,
                border: tokens.pillBorder,
                borderRadius: tokens.pillRadius,
                boxShadow: tokens.pillShadow,
                cursor: "pointer",
              }}
            >
              {selectedCrypto?.symbolImageUrl ? (
                <img src={selectedCrypto.symbolImageUrl} alt={selectedCrypto.currencyCode} className="h-6 w-6 rounded-full object-cover" />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                  style={{ background: tokens.hoverBg, color: tokens.textSecondary }}>
                  {selectedCrypto?.currencyCode?.charAt(0) ?? "?"}
                </div>
              )}
              <span className="text-sm font-semibold" style={{ color: tokens.textPrimary }}>
                {selectedCrypto?.currencyCode ?? (isLoadingCryptos ? "…" : "Select")}
              </span>
              <span style={{ fontSize: "11px", color: tokens.textMuted }}>▼</span>
            </button>

            <input
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                const v = e.target.value;
                if (/^(\d*\.?\d{0,8})?$/.test(v)) setAmount(v);
              }}
              className="min-w-0 flex-1 bg-transparent text-right text-2xl font-bold outline-none"
              style={{ color: tokens.textPrimary, caretColor: tokens.accentBg }}
            />
          </div>
          {selectedCrypto && (
            <div className="mt-2 text-xs" style={{ color: tokens.textMuted }}>
              {selectedCrypto.name} · {selectedCrypto.chainName}
            </div>
          )}
        </div>

        {/* ── From exchange ── */}
        <div className="mb-4">
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide" style={{ color: tokens.textMuted }}>
            From exchange
          </div>
          <button
            onClick={() => setOpenModal("provider")}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all duration-150"
            style={{
              background: tokens.sectionBg,
              border: tokens.sectionBorder,
              boxShadow: tokens.sectionShadow,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            {selectedProvider ? (
              <>
                {selectedProvider.logos?.light ? (
                  <img src={selectedProvider.logos.light} alt={selectedProvider.name} className="h-8 w-8 rounded-lg object-contain" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold"
                    style={{ background: tokens.hoverBg, color: tokens.textSecondary }}>
                    {selectedProvider.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 text-sm font-semibold" style={{ color: tokens.textPrimary }}>
                  {selectedProvider.name}
                </div>
              </>
            ) : (
              <div className="text-sm" style={{ color: tokens.textMuted }}>
                {isLoadingProviders ? "Loading providers…" : "Select exchange"}
              </div>
            )}
            <span style={{ fontSize: "11px", color: tokens.textMuted }}>▼</span>
          </button>
        </div>

        {/* ── Destination wallet ── */}
        <div className="mb-3.5">
          {/* Label row */}
          <div className="mb-2 flex items-center justify-between">
            <label className="text-[13px] font-medium" style={{ color: tokens.textSecondary }}>
              Destination Wallet
            </label>

            {wallet.hasWallet && (
              <div className="relative" ref={pickerRef}>
                <span
                  onClick={isWalletConnected ? wallet.disconnect : handleConnectClick}
                  className="flex items-center gap-1 text-[12px] font-medium"
                  style={{ color: isWalletConnected ? tokens.successColor : tokens.linkColor, cursor: "pointer" }}
                >
                  {wallet.isConnecting ? "Connecting…" : isWalletConnected ? (
                    <>
                      <WalletIcon icon={connectedWalletInfo?.icon} size={14} />
                      Disconnect
                    </>
                  ) : "Connect Wallet"}
                </span>

                {/* Wallet picker dropdown */}
                {pickerOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 6px)",
                      right: 0,
                      background: tokens.modalBg,
                      border: tokens.modalBorder,
                      borderRadius: "10px",
                      boxShadow: tokens.modalShadow,
                      padding: "6px",
                      minWidth: "160px",
                      zIndex: 50,
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                    }}
                  >
                    {wallet.availableWallets.map((w) => (
                      <button
                        key={w.type}
                        onClick={() => handlePickWallet(w.type)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "8px 10px",
                          borderRadius: "8px",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: 500,
                          color: tokens.textPrimary,
                          textAlign: "left",
                          width: "100%",
                          transition: "background 0.12s",
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = tokens.hoverBg; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                      >
                        <WalletIcon icon={w.icon} size={18} />
                        {w.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Input row */}
          <div
            className="flex items-center gap-2"
            style={{
              background: tokens.inputBg,
              border: walletBorderStyle,
              borderRadius: tokens.inputRadius,
              boxShadow: tokens.inputShadow,
              padding: "8px 8px 8px 15px",
              transition: "border-color 0.2s",
            }}
          >
            <input
              type="text"
              placeholder={isWalletConnected ? "Connected" : "Enter destination address"}
              value={destinationWallet}
              onChange={(e) => { if (!isWalletConnected) setDestinationWallet(e.target.value); }}
              readOnly={isWalletConnected}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              style={{
                color: tokens.textPrimary,
                border: "none",
                fontFamily: "monospace",
                opacity: isWalletConnected ? 0.7 : 1,
              }}
            />
          </div>

          {isAddressInvalid && (
            <p className="mt-1.5 text-[11px]" style={{ color: tokens.errorColor }}>
              Invalid {selectedCrypto?.chainCode ?? ""} address format
            </p>
          )}
          {wallet.connectError && (
            <p className="mt-1.5 text-[11px]" style={{ color: tokens.errorColor }}>
              {wallet.connectError}
            </p>
          )}
        </div>

        {/* ── Submit ── */}
        <div className="mb-5">
          <button
            onClick={handleTransfer}
            disabled={!canSubmit || isCreatingSession}
            className="w-full py-[18px] text-base font-bold transition-all duration-200"
            style={{
              background: canSubmit ? tokens.accentBg : tokens.disabledBg,
              color: canSubmit ? tokens.accentText : tokens.disabledText,
              border: "none",
              borderRadius: tokens.inputRadius,
              boxShadow: canSubmit ? tokens.accentShadow : "none",
              cursor: canSubmit ? "pointer" : "not-allowed",
            }}
          >
            {isCreatingSession ? "Opening…" : `Transfer ${selectedCrypto?.currencyCode ?? "Crypto"}`}
          </button>
        </div>

        <PoweredByFooter />
      </div>

      {/* ── Country modal ── */}
      <BaseModal
        isOpen={openModal === "country"}
        onClose={closeModal}
        title="Select Country"
        searchPlaceholder="Search country"
        searchValue={countrySearch}
        onSearchChange={setCountrySearch}
      >
        {isLoadingCountries ? (
          <div className="py-8 text-center text-sm" style={{ color: tokens.textMuted }}>Loading…</div>
        ) : (
          filteredCountries.map((country) => (
            <div
              key={country.countryCode}
              onClick={() => { setSelectedCountry(country); closeModal(); }}
              className="flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors"
              style={{
                background: selectedCountry?.countryCode === country.countryCode ? tokens.selectedBg : "transparent",
                border: selectedCountry?.countryCode === country.countryCode ? tokens.selectedBorder : "1.5px solid transparent",
              }}
              onMouseEnter={(e) => { if (selectedCountry?.countryCode !== country.countryCode) e.currentTarget.style.background = tokens.hoverBg; }}
              onMouseLeave={(e) => { if (selectedCountry?.countryCode !== country.countryCode) e.currentTarget.style.background = "transparent"; }}
            >
              {country.flagImageUrl ? (
                <img src={country.flagImageUrl} alt={country.name} className="h-7 w-9 rounded-sm object-cover" />
              ) : (
                <span className="text-[28px]">🌍</span>
              )}
              <div>
                <div className="text-[15px] font-semibold" style={{ color: tokens.textPrimary }}>{country.name}</div>
                <div className="text-[13px]" style={{ color: tokens.textMuted }}>{country.countryCode}</div>
              </div>
            </div>
          ))
        )}
      </BaseModal>

      {/* ── Crypto modal ── */}
      <BaseModal
        isOpen={openModal === "crypto"}
        onClose={closeModal}
        title="Select Cryptocurrency"
        searchPlaceholder="Search token"
        searchValue={cryptoSearch}
        onSearchChange={setCryptoSearch}
        stickyContent={
          <div className="mb-3">
            <select
              value={cryptoChainFilter}
              onChange={(e) => setCryptoChainFilter(e.target.value)}
              className="w-full cursor-pointer text-sm outline-none"
              style={{ padding: "10px 12px", border: tokens.inputBorder, borderRadius: tokens.inputRadius, background: tokens.inputBg, color: tokens.textPrimary }}
            >
              <option value="all">All Chains</option>
              {cryptoChains.map((chain) => <option key={chain} value={chain}>{chain}</option>)}
            </select>
          </div>
        }
      >
        {isLoadingCryptos ? (
          <div className="py-8 text-center text-sm" style={{ color: tokens.textMuted }}>Loading…</div>
        ) : filteredCryptos.length === 0 ? (
          <div className="py-8 text-center text-sm" style={{ color: tokens.textMuted }}>No tokens available</div>
        ) : (
          filteredCryptos.map((crypto) => {
            const isSelected = selectedCrypto?.currencyCode === crypto.currencyCode && selectedCrypto?.chainCode === crypto.chainCode;
            return (
              <div
                key={`${crypto.currencyCode}-${crypto.chainCode}`}
                onClick={() => { setSelectedCrypto(crypto); closeModal(); }}
                className="flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors"
                style={{ background: isSelected ? tokens.selectedBg : "transparent", border: isSelected ? tokens.selectedBorder : "1.5px solid transparent" }}
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = tokens.hoverBg; }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
              >
                <div className="flex items-center gap-3">
                  {crypto.symbolImageUrl ? (
                    <img src={crypto.symbolImageUrl} alt={crypto.currencyCode} className="h-9 w-9 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full text-lg font-bold"
                      style={{ background: tokens.hoverBg, color: tokens.textSecondary }}>
                      {crypto.currencyCode.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="text-[15px] font-semibold" style={{ color: tokens.textPrimary }}>{crypto.currencyCode}</div>
                    <div className="text-[13px]" style={{ color: tokens.textMuted }}>{crypto.name}</div>
                  </div>
                </div>
                <div className="rounded-md px-2.5 py-1 text-xs" style={{ color: tokens.textSecondary, background: tokens.hoverBg }}>
                  {crypto.chainName}
                </div>
              </div>
            );
          })
        )}
      </BaseModal>

      {/* ── Provider modal ── */}
      <BaseModal
        isOpen={openModal === "provider"}
        onClose={closeModal}
        title="Select Exchange"
        searchPlaceholder="Search exchange"
        searchValue={providerSearch}
        onSearchChange={setProviderSearch}
      >
        {isLoadingProviders ? (
          <div className="py-8 text-center text-sm" style={{ color: tokens.textMuted }}>Loading…</div>
        ) : filteredProviders.length === 0 ? (
          <div className="py-8 text-center text-sm" style={{ color: tokens.textMuted }}>No exchanges available</div>
        ) : (
          filteredProviders.map((provider) => {
            const isSelected = selectedProvider?.serviceProvider === provider.serviceProvider;
            return (
              <div
                key={provider.serviceProvider}
                onClick={() => { setSelectedProvider(provider); closeModal(); }}
                className="flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors"
                style={{ background: isSelected ? tokens.selectedBg : "transparent", border: isSelected ? tokens.selectedBorder : "1.5px solid transparent" }}
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = tokens.hoverBg; }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
              >
                {provider.logos?.light ? (
                  <img src={provider.logos.light} alt={provider.name} className="h-10 w-10 rounded-lg object-contain" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold"
                    style={{ background: tokens.hoverBg, color: tokens.textSecondary }}>
                    {provider.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1">
                  <div className="text-[15px] font-semibold" style={{ color: tokens.textPrimary }}>{provider.name}</div>
                </div>
              </div>
            );
          })
        )}
      </BaseModal>

      {/* ── Transaction history modal ── */}
      <TransactionHistoryModal
        isOpen={openModal === "history"}
        onClose={() => { closeModal(); resetTransaction(); }}
        initialTxId={txPhase === "active" ? txId : null}
      />

      {/* ── Error modal ── */}
      <ErrorModal
        isOpen={openModal === "error"}
        onClose={() => { setAppError(null); closeModal(); }}
        title={appError?.title ?? "Error"}
        message={appError?.message ?? ""}
      />

      {/* ── Waiting overlay ── */}
      {txPhase === "waiting" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: tokens.widgetRadius,
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            background: tokens.modalBg,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            padding: "32px",
            textAlign: "center",
            zIndex: 10,
          }}
        >
          <div style={{ fontSize: "32px" }}>⏳</div>
          <div style={{ color: tokens.textPrimary, fontSize: "17px", fontWeight: 600 }}>
            Processing transfer
          </div>
          <div style={{ color: tokens.textSecondary, fontSize: "13px" }}>
            {txStatus ? (WAITING_STATUS_LABELS[txStatus] ?? txStatus) : "Waiting for exchange…"}
          </div>
          <div style={{ color: tokens.textMuted, fontSize: "11px", marginTop: "2px" }}>
            Complete the transfer in the exchange tab
          </div>
          <button
            onClick={resetTransaction}
            style={{
              marginTop: "16px",
              width: "100%",
              borderRadius: tokens.inputRadius,
              padding: "12px 0",
              fontSize: "15px",
              fontWeight: 600,
              background: "transparent",
              color: tokens.textMuted,
              border: `1.5px solid ${tokens.dividerColor}`,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
