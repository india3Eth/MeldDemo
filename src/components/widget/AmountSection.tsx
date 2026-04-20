"use client";

import { useWidget } from "@/contexts/WidgetContext";
import { useTheme } from "@/themes/ThemeProvider";
import { formatAmount } from "@/lib/utils/format";

// =============================================================================
// AmountSection — "You pay" / "You receive" sections
// =============================================================================

function formatLimitAmount(amount: number, currencyCode?: string): string {
  if (!currencyCode) return amount.toLocaleString();
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currencyCode} ${amount.toLocaleString()}`;
  }
}

interface AmountSectionProps {
  variant: "source" | "destination";
  onOpenSelector: () => void;
}

export function AmountSection({ variant, onOpenSelector }: AmountSectionProps) {
  const {
    mode,
    amount,
    setAmount,
    selectedFiatCurrency,
    selectedCrypto,
    selectedQuote,
    currentLimit,
    isLoadingQuotes,
  } = useWidget();
  const { tokens } = useTheme();

  const isBuy = mode === "BUY";
  const isSource = variant === "source";

  const numAmount = parseFloat(amount);
  const isOutOfRange = isSource && currentLimit && !isNaN(numAmount) && numAmount > 0
    && (numAmount < currentLimit.minimumAmount || numAmount > currentLimit.maximumAmount);
  const isBelowMin = isOutOfRange && numAmount < currentLimit!.minimumAmount;
  const isAboveMax = isOutOfRange && numAmount > currentLimit!.maximumAmount;

  // Determine what to show in each section
  const showFiat = (isBuy && isSource) || (!isBuy && !isSource);
  const currency = showFiat ? selectedFiatCurrency : null;
  const crypto = !showFiat ? selectedCrypto : null;

  // Labels
  const label = isSource
    ? isBuy ? "You pay" : "You sell"
    : "You receive";

  // Display value — loading state in destination, strip trailing zeros
  const displayValue = isSource
    ? amount
    : isLoadingQuotes
      ? "..."
      : selectedQuote != null
        ? formatAmount(selectedQuote.destinationAmount)
        : "—";

  // Currency display name
  const displayCode = showFiat
    ? currency?.currencyCode ?? "..."
    : crypto?.currencyCode ?? "...";

  const displayImage = showFiat
    ? currency?.symbolImageUrl
    : crypto?.symbolImageUrl;

  // Chain info (only for crypto in receive section)
  const chainInfo = !showFiat && crypto ? `on ${crypto.chainName}` : null;

  return (
    <div
      className="mb-3.5"
      style={{
        background: tokens.sectionBg,
        border: tokens.sectionBorder,
        borderRadius: tokens.sectionRadius,
        boxShadow: tokens.sectionShadow,
        backdropFilter: tokens.sectionBackdrop,
        padding: "20px",
      }}
    >
      {/* Header: label + currency pill */}
      <div className="mb-3 flex items-center justify-between">
        <span
          className="text-[13px]"
          style={{ color: tokens.textSecondary, textShadow: tokens.textShadow }}
        >
          {label}
        </span>

        <button
          onClick={onOpenSelector}
          className="flex items-center gap-1.5 transition-all duration-200"
          style={{
            padding: "7px 12px",
            background: tokens.pillBg,
            border: tokens.pillBorder,
            borderRadius: tokens.pillRadius,
            boxShadow: tokens.pillShadow,
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          {displayImage && (
            <img
              src={displayImage}
              alt={displayCode}
              className="h-5 w-5 rounded-full object-cover"
            />
          )}
          <span style={{ color: tokens.textPrimary }}>{displayCode}</span>
          <span style={{ fontSize: "10px", color: tokens.textMuted }}>▼</span>
        </button>
      </div>

      {/* Amount input / display */}
      <div className="flex items-center gap-3">
        {isSource ? (
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => {
              const val = e.target.value;
              // Fix #9: reject leading zeros, multiple decimals, excess precision
              if (val === "" || /^(0|[1-9]\d*)?(\.\d{0,8})?$/.test(val)) setAmount(val);
            }}
            className="w-full bg-transparent text-[38px] font-bold outline-none"
            style={{
              color: isOutOfRange ? "#f87171" : tokens.textPrimary,
              border: "none",
              textShadow: tokens.textShadow,
            }}
            placeholder="0"
          />
        ) : (
          <div
            className="w-full text-[38px] font-bold"
            style={{ color: tokens.textSecondary, textShadow: tokens.textShadow }}
          >
            {displayValue}
          </div>
        )}
      </div>

      {/* Chain badge for crypto */}
      {chainInfo && (
        <div className="mt-2 text-xs" style={{ color: tokens.textMuted }}>
          {chainInfo}
        </div>
      )}

      {/* Limit range — source section only */}
      {isSource && currentLimit && (
        <>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[12px]" style={{ color: isOutOfRange ? "#f87171" : tokens.textMuted }}>
              {isBelowMin ? "Minimum" : isAboveMax ? "Maximum" : "Limit"}
            </span>
            <span className="text-[12px] font-medium" style={{ color: isOutOfRange ? "#f87171" : tokens.textSecondary }}>
              {formatLimitAmount(currentLimit.minimumAmount, showFiat ? selectedFiatCurrency?.currencyCode : selectedCrypto?.currencyCode)}
              {" – "}
              {formatLimitAmount(currentLimit.maximumAmount, showFiat ? selectedFiatCurrency?.currencyCode : selectedCrypto?.currencyCode)}
            </span>
          </div>
          {isBelowMin && (
            <p className="mt-1 text-[11px] text-red-400">
              Enter at least {formatLimitAmount(currentLimit.minimumAmount, showFiat ? selectedFiatCurrency?.currencyCode : selectedCrypto?.currencyCode)}
            </p>
          )}
          {isAboveMax && (
            <p className="mt-1 text-[11px] text-red-400">
              Maximum is {formatLimitAmount(currentLimit.maximumAmount, showFiat ? selectedFiatCurrency?.currencyCode : selectedCrypto?.currencyCode)}
            </p>
          )}
        </>
      )}
    </div>
  );
}
