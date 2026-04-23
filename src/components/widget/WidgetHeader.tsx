"use client";

import { useWidget } from "@/contexts/WidgetContext";
import { useTheme } from "@/themes/ThemeProvider";
import type { SessionType } from "@/lib/meld/types";

// =============================================================================
// Widget Header — Logo + Buy/Sell toggle + Country flag
// =============================================================================

interface WidgetHeaderProps {
  onOpenCountryModal: () => void;
  onOpenHistory: () => void;
}

export function WidgetHeader({ onOpenCountryModal, onOpenHistory }: WidgetHeaderProps) {
  const { mode, setMode, selectedCountry } = useWidget();
  const { tokens } = useTheme();

  return (
    <div className="mb-6 flex items-center justify-between">
      {/* Logo */}
      <div
        className="flex h-11 w-11 items-center justify-center text-2xl font-bold text-white"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "12px",
          boxShadow: "0 4px 8px rgba(102,126,234,0.3)",
        }}
      >
        ⬢
      </div>

      {/* Buy / Sell Toggle */}
      <div
        className="flex gap-1.5 p-1"
        style={{
          background: tokens.toggleTrackBg,
          border: tokens.toggleTrackBorder,
          borderRadius: "12px",
          boxShadow: tokens.toggleTrackShadow,
        }}
      >
        {(["BUY", "SELL"] as SessionType[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className="px-6 py-2.5 text-sm font-semibold transition-all duration-200"
            style={{
              borderRadius: "9px",
              border: "none",
              background: mode === m ? tokens.accentBg : tokens.toggleBg,
              color: mode === m ? tokens.accentText : tokens.toggleInactiveText,
              boxShadow: mode === m ? tokens.accentShadow : "none",
              cursor: "pointer",
            }}
          >
            {m === "BUY" ? "Buy" : "Sell"}
          </button>
        ))}
      </div>

      {/* Right controls: history + country */}
      <div className="flex items-center gap-2">
        {/* History icon button */}
        <button
          onClick={onOpenHistory}
          title="Transaction history"
          className="flex items-center justify-center transition-all duration-200"
          style={{
            width: "38px", height: "38px",
            background: tokens.pillBg,
            border: tokens.pillBorder,
            borderRadius: tokens.pillRadius,
            boxShadow: tokens.pillShadow,
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          🕐
        </button>

        {/* Country Flag */}
        <button
          onClick={onOpenCountryModal}
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
            <img
              src={selectedCountry.flagImageUrl}
              alt={selectedCountry.name}
              className="h-5 w-7 rounded-sm object-cover"
            />
          ) : (
            <span className="text-xl">🌍</span>
          )}
          <span style={{ fontSize: "12px", color: tokens.textMuted }}>▼</span>
        </button>
      </div>
    </div>
  );
}
