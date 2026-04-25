"use client";

import { useWidget } from "@/contexts/WidgetContext";
import { useTheme } from "@/themes/ThemeProvider";
import { formatProviderName } from "@/lib/utils/format";

function Skeleton({ width, height = 14 }: { width: number | string; height?: number }) {
  return (
    <div
      className="animate-pulse rounded-md"
      style={{ width, height, background: "rgba(128,128,128,0.18)" }}
    />
  );
}

// =============================================================================
// ProviderCard — shows the selected provider with "See more quotes" link
// =============================================================================

interface ProviderCardProps {
  onOpenProviderModal: () => void;
}

export function ProviderCard({ onOpenProviderModal }: ProviderCardProps) {
  const { selectedQuote, isLoadingQuotes } = useWidget();
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
        minHeight: "60px",
        cursor: "pointer",
      }}
    >
      <div className="flex items-center gap-2.5">
        <span className="text-[13px]" style={{ color: tokens.textSecondary }}>
          By
        </span>

        {isLoadingQuotes ? (
          <div className="flex items-center gap-2">
            <Skeleton width={28} height={28} />
            <Skeleton width={90} height={14} />
          </div>
        ) : !selectedQuote ? (
          <span className="text-sm" style={{ color: tokens.textMuted }}>
            Select provider
          </span>
        ) : (
          <>
            <div
              className="flex h-7 w-7 items-center justify-center rounded-[7px] text-sm font-bold"
              style={{
                background: tokens.accentBg,
                color: tokens.accentText,
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
              <span
                className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold"
                style={{ background: tokens.successColor + "18", color: tokens.successColor }}
              >
                Best Match
              </span>
            )}
          </>
        )}
      </div>

      <span className="text-[13px] font-medium" style={{ color: tokens.linkColor }}>
        See more quotes →
      </span>
    </button>
  );
}

