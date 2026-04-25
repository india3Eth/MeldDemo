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
      <span className="font-bold" style={{ color: tokens.linkColor }}>
        Meld.io
      </span>
      <div
        className="flex h-5 w-5 items-center justify-center text-[11px] font-bold"
        style={{
          background: tokens.accentBg,
          color: tokens.accentText,
          borderRadius: "5px",
          boxShadow: tokens.accentShadow,
        }}
      >
        ⬢
      </div>
    </div>
  );
}
