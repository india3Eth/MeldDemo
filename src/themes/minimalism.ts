// =============================================================================
// Minimalism Theme — "Warm Japandi"
// =============================================================================
// Design principles:
//
//   - Inspired by Japanese–Scandinavian design fusion: warm, intentional, restful.
//   - Sand/stone palette replaces sterile white. Nothing is #ffffff — everything
//     has a warm undertone that says "someone chose this."
//   - Sections get ultra-subtle warm containment: barely-there bg + warm shadow.
//     They exist as visual groups, not as bordered "cards."
//   - Accent: deep terracotta — unexpected for a finance widget, warm and grounded.
//   - Typography hierarchy through weight and size only — no color gimmicks.
//   - Shadows are warm (brown-tinted), not cold gray.
//   - Overall feeling: a well-typeset editorial page, not a generic dashboard.
// =============================================================================

import type { ThemeDefinition } from "./types";

export const minimalism: ThemeDefinition = {
  id: "minimalism",
  name: "Minimalism",
  icon: "\u25FB\uFE0F",
  selectorColor: "#78716c",
  tokens: {
    // Warm sand — intentional warmth, not clinical white
    pageBg: "#f5f0eb",

    // Stone-white card with warm shadow for quiet depth
    widgetBg: "#faf8f5",
    widgetBorder: "none",
    widgetRadius: "16px",
    widgetShadow: "0 1px 2px rgba(120,100,80,0.04), 0 6px 24px rgba(120,100,80,0.06)",
    widgetBackdrop: "none",

    // Sections — ultra-subtle warm containment (not invisible, not boxy)
    sectionBg: "rgba(120,100,80,0.04)",
    sectionBorder: "none",
    sectionRadius: "12px",
    sectionShadow: "none",
    sectionBackdrop: "none",

    // Typography — warm charcoal, generous hierarchy
    textPrimary: "#292524",
    textSecondary: "#57534e",
    textMuted: "#a8a29e",
    textShadow: "none",

    // Accent: deep terracotta — warm, grounded, unexpected
    accentBg: "#c2410c",
    accentText: "#fef2f2",
    accentShadow: "0 2px 8px rgba(194,65,12,0.15)",

    // Toggle — warm stone track
    toggleBg: "transparent",
    toggleInactiveText: "#a8a29e",
    toggleTrackBg: "rgba(120,100,80,0.06)",
    toggleTrackBorder: "1px solid rgba(120,100,80,0.10)",
    toggleTrackShadow: "none",

    // Inputs — hairline warm border
    inputBg: "#faf8f5",
    inputBorder: "1px solid rgba(120,100,80,0.14)",
    inputRadius: "10px",
    inputShadow: "none",

    // Pills — warm stone feel
    pillBg: "rgba(120,100,80,0.05)",
    pillBorder: "1px solid rgba(120,100,80,0.12)",
    pillRadius: "10px",
    pillShadow: "none",

    // Disabled — barely visible warm fade
    disabledBg: "rgba(120,100,80,0.06)",
    disabledText: "#d6d3d1",

    // Divider — warm and quiet
    dividerColor: "rgba(120,100,80,0.10)",

    // Modal — warm stone elevation
    modalBg: "#faf8f5",
    modalBorder: "none",
    modalRadius: "16px",
    modalBackdrop: "none",
    modalShadow: "0 4px 24px rgba(120,100,80,0.10), 0 16px 56px rgba(120,100,80,0.08)",

    // Interactive — warm and precise
    hoverBg: "rgba(120,100,80,0.06)",
    selectedBg: "rgba(194,65,12,0.06)",
    selectedBorder: "2px solid #c2410c",

    linkColor: "#c2410c",
    errorColor: "#dc2626",
    successColor: "#16a34a",
  },
};
