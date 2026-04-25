// =============================================================================
// Liquid Glass Theme — "Frosted Mint"
// =============================================================================
// Design principles:
//
//   - LIGHT liquid glass on warm neutral canvas — NOT pastels like glassmorphism.
//   - Background: solid warm light gray. No gradient. Quiet canvas.
//   - Glass panels have subtle green-gray tint — like real tinted glass, not
//     white frost. Blur + refraction highlights create the liquid feel.
//   - Accent: deep teal — grounded, sophisticated, fintech-trustworthy.
//   - Typography: dark slate — crisp, professional, readable.
//   - Difference from glassmorphism: that theme = colorful pastel sky + pure
//     white frost + bright blue. This = neutral warm gray + tinted glass + teal.
// =============================================================================

import type { ThemeDefinition } from "./types";

export const liquidglass: ThemeDefinition = {
  id: "liquidglass",
  name: "Liquid Glass",
  icon: "\uD83D\uDCA7",
  selectorColor: "#0d9488",
  tokens: {
    // Warm light gray — neutral canvas, not colorful
    pageBg: "#eeecea",

    // Green-gray tinted glass — subtle tint, not pure white frost
    widgetBg: "rgba(240,253,250,0.65)",
    widgetBorder: "1px solid rgba(13,148,136,0.14)",
    widgetRadius: "28px",
    widgetShadow: [
      "0 8px 32px rgba(0,0,0,0.07)",
      "0 2px 8px rgba(0,0,0,0.04)",
      "inset 0 1.5px 0 rgba(255,255,255,0.85)",
      "inset 0 -1px 0 rgba(0,0,0,0.02)",
    ].join(", "),
    widgetBackdrop: "blur(40px) saturate(170%)",

    // Inner sections — slightly deeper tinted glass
    sectionBg: "rgba(204,251,241,0.30)",
    sectionBorder: "1px solid rgba(13,148,136,0.10)",
    sectionRadius: "20px",
    sectionShadow: [
      "0 1px 6px rgba(0,0,0,0.04)",
      "inset 0 1px 0 rgba(255,255,255,0.80)",
    ].join(", "),
    sectionBackdrop: "blur(16px)",

    // Typography — dark slate, crisp on light glass
    textPrimary: "#1e293b",
    textSecondary: "#475569",
    textMuted: "#94a3b8",
    textShadow: "none",

    // Accent — deep teal: grounded, sophisticated
    accentBg: "#0d9488",
    accentText: "#ffffff",
    accentShadow: [
      "0 4px 14px rgba(13,148,136,0.30)",
      "inset 0 1px 0 rgba(255,255,255,0.20)",
    ].join(", "),

    // Toggle — tinted glass track
    toggleBg: "transparent",
    toggleInactiveText: "#94a3b8",
    toggleTrackBg: "rgba(204,251,241,0.50)",
    toggleTrackBorder: "1px solid rgba(13,148,136,0.08)",
    toggleTrackShadow: "inset 0 1px 3px rgba(0,0,0,0.05)",

    // Inputs — tinted glass recess
    inputBg: "rgba(240,253,250,0.55)",
    inputBorder: "1px solid rgba(13,148,136,0.12)",
    inputRadius: "14px",
    inputShadow: "inset 0 1px 2px rgba(0,0,0,0.04)",

    // Pills — small tinted glass chips
    pillBg: "rgba(204,251,241,0.45)",
    pillBorder: "1px solid rgba(13,148,136,0.10)",
    pillRadius: "12px",
    pillShadow: [
      "0 1px 4px rgba(0,0,0,0.05)",
      "inset 0 1px 0 rgba(255,255,255,0.75)",
    ].join(", "),

    // Disabled
    disabledBg: "rgba(204,251,241,0.25)",
    disabledText: "#cbd5e1",

    dividerColor: "rgba(13,148,136,0.08)",

    // Modal — deeper tinted glass layer
    modalBg: "rgba(240,253,250,0.78)",
    modalBorder: "1px solid rgba(13,148,136,0.12)",
    modalRadius: "24px",
    modalBackdrop: "blur(48px) saturate(170%)",
    modalShadow: [
      "0 24px 80px rgba(0,0,0,0.10)",
      "0 8px 24px rgba(0,0,0,0.06)",
      "inset 0 1px 0 rgba(255,255,255,0.85)",
    ].join(", "),

    // Interactive states — teal-tinted
    hoverBg: "rgba(13,148,136,0.06)",
    selectedBg: "rgba(13,148,136,0.10)",
    selectedBorder: "1.5px solid rgba(13,148,136,0.45)",

    linkColor: "#0f766e",
    errorColor: "#dc2626",
    successColor: "#16a34a",
  },
};
