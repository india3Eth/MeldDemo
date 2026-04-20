"use client";

import { BaseModal } from "./BaseModal";
import { useWidget } from "@/contexts/WidgetContext";
import { useTheme } from "@/themes/ThemeProvider";
import { formatProviderName, formatAmount } from "@/lib/utils/format";
import type { Quote } from "@/lib/meld/types";

// =============================================================================
// ProviderModal — shows all quotes sorted by rampScore
// =============================================================================
// Implements Ramp Intelligence UI recommendations:
//   - Score >= 70: "Best Match" badge
//   - Score 30-69: "Recommended" badge
//   - lowKyc: true: "No Docs Required" indicator
//
// Docs: https://docs.meld.io/docs/ramp-intelligence
// =============================================================================

interface ProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProviderModal({ isOpen, onClose }: ProviderModalProps) {
  const { quotes, selectedQuote, setSelectedQuote, mode, isLoadingQuotes, quoteError, serviceProviderMap } = useWidget();
  const { tokens } = useTheme();

  function handleSelect(quote: Quote) {
    setSelectedQuote(quote);
    onClose();
  }

  const title = `Select a Quote to ${mode === "BUY" ? "Buy" : "Sell"} Crypto`;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="mb-4 text-[13px]" style={{ color: tokens.textMuted }}>
        Available providers based on your location
      </div>

      {isLoadingQuotes && (
        <div className="py-8 text-center text-sm" style={{ color: tokens.textMuted }}>
          Loading quotes...
        </div>
      )}

      {/* Fix #2: quote error state */}
      {!isLoadingQuotes && quoteError && (
        <div className="py-8 text-center">
          <div className="text-sm text-red-400">Failed to fetch quotes</div>
          <div className="mt-1 text-xs" style={{ color: tokens.textMuted }}>
            Check your network connection and try again
          </div>
        </div>
      )}

      {/* Fix #10: empty quotes with explanation */}
      {!isLoadingQuotes && !quoteError && quotes.length === 0 && (
        <div className="py-8 text-center">
          <div className="text-sm" style={{ color: tokens.textMuted }}>
            No providers available
          </div>
          <div className="mt-1 text-xs" style={{ color: tokens.textMuted }}>
            Try a different currency, payment method, or amount
          </div>
        </div>
      )}

      {quotes.map((quote, i) => {
        const isSelected = selectedQuote?.serviceProvider === quote.serviceProvider;
        const rampScore = quote.rampIntelligence?.rampScore ?? quote.customerScore ?? 0;
        const lowKyc = quote.rampIntelligence?.lowKyc ?? quote.lowKyc;
        const badge = getBadge(rampScore);
        // Fix #11: provider status from serviceProviderMap
        const providerStatus = serviceProviderMap[quote.serviceProvider]?.status;
        const isBuilding = providerStatus === "BUILDING";
        const isNew = providerStatus === "RECENTLY_ADDED";

        return (
          <div
            key={`${quote.serviceProvider}-${i}`}
            onClick={() => !isBuilding && handleSelect(quote)}
            className="mb-2.5 flex cursor-pointer items-center justify-between rounded-[10px] p-3.5 transition-colors"
            style={{
              border: isSelected ? tokens.selectedBorder : `1.5px solid ${tokens.dividerColor}`,
              background: isSelected ? tokens.selectedBg : "transparent",
              opacity: isBuilding ? 0.5 : 1,
              cursor: isBuilding ? "not-allowed" : "pointer",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-md text-lg font-bold text-white"
                style={{
                  background: "#000",
                }}
              >
                {quote.serviceProvider.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[15px] font-medium"
                    style={{ color: tokens.textPrimary }}
                  >
                    {formatProviderName(quote.serviceProvider)}
                  </span>
                  {badge && !isBuilding && (
                    <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${badge.className}`}>
                      {badge.label}
                    </span>
                  )}
                  {isNew && (
                    <span className="rounded-md bg-purple-100 px-1.5 py-0.5 text-[10px] font-semibold text-purple-800">
                      New
                    </span>
                  )}
                  {isBuilding && (
                    <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500">
                      Coming Soon
                    </span>
                  )}
                </div>
                {lowKyc === true && (
                  <div className="mt-0.5 text-[11px] text-blue-500">
                    No Documents Required
                  </div>
                )}
              </div>
            </div>

            <div className="text-right">
              <div
                className="text-[15px] font-semibold"
                style={{ color: tokens.textPrimary }}
              >
                {formatAmount(quote.destinationAmount)} {quote.destinationCurrencyCode}
              </div>
              <div className="text-[13px]" style={{ color: tokens.textMuted }}>
                Fee: {quote.totalFee.toFixed(2)} {quote.sourceCurrencyCode}
              </div>
            </div>
          </div>
        );
      })}
    </BaseModal>
  );
}

function getBadge(score: number): { label: string; className: string } | null {
  if (score >= 70) return { label: "Best Match", className: "bg-green-100 text-green-800" };
  if (score >= 30) return { label: "Recommended", className: "bg-blue-100 text-blue-800" };
  return null;
}
