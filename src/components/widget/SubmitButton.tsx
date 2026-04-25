"use client";

import { useWidget } from "@/contexts/WidgetContext";
import { useTheme } from "@/themes/ThemeProvider";

// =============================================================================
// SubmitButton — the primary "Buy BTC" / "Sell BTC" CTA
// =============================================================================

export function SubmitButton() {
  const {
    mode,
    selectedCrypto,
    selectedQuote,
    walletAddress,
    handleBuyOrSell,
    isCreatingSession,
    currentLimit,
    amount,
  } = useWidget();
  const { tokens } = useTheme();

  const isBuy = mode === "BUY";
  const cryptoCode = selectedCrypto?.currencyCode ?? "Crypto";
  const hasWallet = walletAddress.trim().length > 0;
  const hasQuote = selectedQuote !== null;

  // Validation
  const numAmount = parseFloat(amount);
  const isAmountValid = !isNaN(numAmount) && numAmount > 0;
  const isWithinLimits = currentLimit
    ? numAmount >= currentLimit.minimumAmount && numAmount <= currentLimit.maximumAmount
    : true;

  const canSubmit = hasWallet && hasQuote && isAmountValid && isWithinLimits;

  const label = isCreatingSession
    ? "Opening..."
    : isBuy
      ? `Buy ${cryptoCode}`
      : `Sell ${cryptoCode}`;

  return (
    <div className="mb-5">
      <button
        onClick={handleBuyOrSell}
        disabled={!canSubmit || isCreatingSession}
        className="relative w-full overflow-hidden py-[18px] text-base font-bold transition-all duration-200"
        style={{
          background: canSubmit ? tokens.accentBg : tokens.disabledBg,
          color: canSubmit ? tokens.accentText : tokens.disabledText,
          border: "none",
          borderRadius: tokens.inputRadius,
          boxShadow: canSubmit ? tokens.accentShadow : "none",
          cursor: canSubmit ? "pointer" : "not-allowed",
        }}
      >
        {label}
      </button>
    </div>
  );
}
