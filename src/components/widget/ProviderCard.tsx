"use client";

import { useWidget } from "@/contexts/WidgetContext";
import { useTheme } from "@/themes/ThemeProvider";
import { formatProviderName } from "@/lib/utils/format";

// =============================================================================
// ProviderCard — shows the selected provider with "See more quotes" link
// =============================================================================

interface ProviderCardProps {
  onOpenProviderModal: () => void;
}

export function ProviderCard({ onOpenProviderModal }: ProviderCardProps) {
  const { selectedQuote, isLoadingQuotes, quoteError } = useWidget();
  const { tokens } = useTheme();

  const providerName = selectedQuote?.serviceProvider ?? "Select provider";
  const rampScore = selectedQuote?.rampIntelligence?.rampScore
    ?? selectedQuote?.customerScore
    ?? null;

  return (
    <button
      onClick={onOpenProviderModal}
      className="mb-3.5 flex w-full items-center justify-between transition-all duration-200"
      style={{
        background: tokens.sectionBg,
        border: tokens.sectionBorder,
        borderRadius: tokens.sectionRadius,
        boxShadow: tokens.sectionShadow,
        backdropFilter: tokens.sectionBackdrop,
        padding: "16px 20px",
        cursor: "pointer",
      }}
    >
      <div className="flex items-center gap-2.5">
        <span className="text-[13px]" style={{ color: tokens.textSecondary }}>
          By
        </span>

        {isLoadingQuotes ? (
          <span className="text-sm" style={{ color: tokens.textMuted }}>
            Loading quotes...
          </span>
        ) : quoteError ? (
          <span className="text-sm text-red-400">
            Unable to fetch quotes
          </span>
        ) : (
          <>
            <div
              className="flex h-7 w-7 items-center justify-center rounded-[7px] text-sm font-bold text-white"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              {providerName.charAt(0)}
            </div>
            <span
              className="text-sm font-medium"
              style={{ color: tokens.textPrimary }}
            >
              {formatProviderName(providerName)}
            </span>
            {rampScore !== null && rampScore >= 70 && (
              <span className="rounded-md bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-800">
                Best Match
              </span>
            )}
          </>
        )}
      </div>

      <span className="text-[13px] font-medium" style={{ color: "#667eea" }}>
        See more quotes →
      </span>
    </button>
  );
}

