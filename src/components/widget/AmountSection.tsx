"use client";

import { useWidget } from "@/contexts/WidgetContext";
import { useTheme } from "@/themes/ThemeProvider";
import { formatAmount } from "@/lib/utils/format";

function Skeleton({ width, height = 14 }: { width: number | string; height?: number }) {
  return (
    <div
      className="animate-pulse rounded-md"
      style={{ width, height, background: "rgba(128,128,128,0.18)", display: "inline-block" }}
    />
  );
}

// =============================================================================
// AmountSection — "You pay" / "You receive" sections
// =============================================================================

function formatLimitAmount(amount: number, currencyCode?: string): string {
  if (!currencyCode) return amount.toLocaleString();
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
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
    limitUnavailable,
    isLoadingQuotes,
    isLoadingCurrencies,
    isLoadingLimits,
    isLoadingRefinedLimits,
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
    : selectedQuote != null
      ? formatAmount(selectedQuote.destinationAmount)
      : "—";

  // Currency display name
  const displayCode = showFiat
    ? currency?.currencyCode ?? ""
    : crypto?.currencyCode ?? "";

  // Show "enter amount" hint when limits are loaded but no defaultAmount was set, or limit is unavailable
  const showEnterAmountHint = isSource && amount === "" && (
    (!isLoadingLimits && currentLimit && !currentLimit.defaultAmount) || limitUnavailable
  );

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
        padding: "14px 16px",
      }}
    >
      {/* Label row — label left, limit or chain info right */}
      <div className="mb-1.5 flex items-center justify-between">
        <span
          className="text-[12px]"
          style={{ color: tokens.textSecondary, textShadow: tokens.textShadow }}
        >
          {label}
        </span>

        {/* Limit range inline with label (source only) */}
        {isSource && isLoadingRefinedLimits && (
          <Skeleton width={110} height={12} />
        )}
        {isSource && !isLoadingRefinedLimits && limitUnavailable && (
          <span className="text-[11px] font-medium" style={{ color: tokens.textMuted }}>
            No limit info — enter any amount
          </span>
        )}
        {isSource && !isLoadingRefinedLimits && !limitUnavailable && currentLimit && (
          <span className="text-[11px] font-medium" style={{ color: isOutOfRange ? tokens.errorColor : tokens.textMuted }}>
            {formatLimitAmount(currentLimit.minimumAmount, showFiat ? selectedFiatCurrency?.currencyCode : selectedCrypto?.currencyCode)}
            {" – "}
            {formatLimitAmount(currentLimit.maximumAmount, showFiat ? selectedFiatCurrency?.currencyCode : selectedCrypto?.currencyCode)}
          </span>
        )}

        {/* Chain info inline with label (destination crypto only) */}
        {!isSource && chainInfo && (
          <span className="text-[11px]" style={{ color: tokens.textMuted }}>
            {chainInfo}
          </span>
        )}
      </div>

      {/* Amount + selector inline */}
      <div className="flex items-center gap-3">
        {/* Amount — takes all remaining space */}
        {isSource ? (
          <div className="relative min-w-0 flex-1">
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || /^(0|[1-9]\d*)?(\.\d{0,8})?$/.test(val)) setAmount(val);
              }}
              className="w-full bg-transparent text-[32px] font-bold outline-none"
              style={{
                color: isOutOfRange ? tokens.errorColor : tokens.textPrimary,
                border: "none",
                textShadow: tokens.textShadow,
              }}
              placeholder={showEnterAmountHint ? "" : "0"}
            />
            {showEnterAmountHint && amount === "" && (
              <span
                className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-[13px] font-medium"
                style={{ color: tokens.textMuted }}
              >
                Enter an amount
              </span>
            )}
          </div>
        ) : (
          <div
            className="min-w-0 flex-1 text-[32px] font-bold"
            style={{ color: tokens.textSecondary, textShadow: tokens.textShadow }}
          >
            {isLoadingQuotes ? <Skeleton width={100} height={36} /> : displayValue}
          </div>
        )}

        {/* Currency selector pill */}
        <button
          onClick={onOpenSelector}
          className="flex shrink-0 items-center gap-1.5 transition-all duration-200"
          style={{
            padding: "8px 12px",
            minWidth: "100px",
            background: tokens.pillBg,
            border: tokens.pillBorder,
            borderRadius: tokens.pillRadius,
            boxShadow: tokens.pillShadow,
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          {isLoadingCurrencies ? (
            <Skeleton width={60} height={16} />
          ) : (
            <>
              {displayImage && (
                <img
                  src={displayImage}
                  alt={displayCode}
                  className="h-5 w-5 rounded-full object-cover"
                />
              )}
              <span style={{ color: tokens.textPrimary }}>{displayCode}</span>
            </>
          )}
          <span style={{ fontSize: "10px", color: tokens.textMuted }}>▼</span>
        </button>
      </div>

      {/* Out-of-range error — only shows when user enters invalid amount and limit is known */}
      {isSource && isOutOfRange && !limitUnavailable && (
        <p className="mt-1.5 text-[11px]" style={{ color: tokens.errorColor }}>
          {isBelowMin
            ? `Enter at least ${formatLimitAmount(currentLimit!.minimumAmount, showFiat ? selectedFiatCurrency?.currencyCode : selectedCrypto?.currencyCode)}`
            : `Maximum is ${formatLimitAmount(currentLimit!.maximumAmount, showFiat ? selectedFiatCurrency?.currencyCode : selectedCrypto?.currencyCode)}`}
        </p>
      )}

    </div>
  );
}
