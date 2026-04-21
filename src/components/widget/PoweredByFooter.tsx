"use client";

import { useTheme } from "@/themes/ThemeProvider";

// =============================================================================
// PoweredByFooter — "Powered by Meld.io" branding
// =============================================================================

export function PoweredByFooter() {
  const { tokens } = useTheme();

  return (
    <div
      className="flex items-center justify-center gap-2 pt-[18px] text-xs"
      style={{
        borderTop: `1px solid ${tokens.dividerColor}`,
        color: tokens.textMuted,
      }}
    >
      <span>Powered by</span>
      <span className="font-bold" style={{ color: "#667eea" }}>
        Meld.io
      </span>
      <div
        className="flex h-5 w-5 items-center justify-center text-[11px] font-bold text-white"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "5px",
          boxShadow: "0 2px 4px rgba(102,126,234,0.3)",
        }}
      >
        ⬢
      </div>
    </div>
  );
}
