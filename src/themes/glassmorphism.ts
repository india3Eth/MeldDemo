// =============================================================================
// Glassmorphism Theme
// =============================================================================
// Design principles (per glassmorphism.css, Apple visionOS, Windows Fluent):
//
//   - Multi-color vibrant background — the glass needs something to show through
//   - Frosted glass via backdrop-filter: blur() + saturate()
//   - Layered transparency: widget > section > element (decreasing opacity)
//   - Thin white borders simulate glass edge refraction
//   - Inner top highlight = light hitting glass surface
//   - Subtle color tinting — glass is never perfectly neutral
//   - Depth via soft drop shadows on floating panels
//   - Typography: crisp white, slight drop shadow for readability on glass
//   - Accent uses a tinted glass with higher opacity for interactivity
//   - Modal gets its own frosted glass layer — never opaque
// =============================================================================

import type { ThemeDefinition } from "./types";

export const glassmorphism: ThemeDefinition = {
  id: "glassmorphism",
  name: "Glassmorphism",
  icon: "\uD83D\uDC8E",
  selectorColor: "#7c5ce7",
  tokens: {
    // Rich multi-color gradient — the glass needs something vibrant to frost over
    pageBg: [
      "linear-gradient(135deg,",
      "#667eea 0%,",     // periwinkle blue
      "#764ba2 25%,",    // deep orchid
      "#f093fb 45%,",    // bright pink
      "#4facfe 65%,",    // vivid sky blue
      "#00f2fe 85%,",    // cyan
      "#43e97b 100%)",   // emerald green
    ].join(" "),

    // Primary glass panel — proper frosted glass opacity
    widgetBg: "rgba(255, 255, 255, 0.18)",
    widgetBorder: "1px solid rgba(255,255,255,0.3)",
    widgetRadius: "24px",
    widgetShadow: [
      "0 8px 32px rgba(31,38,135,0.25)",
      "0 2px 8px rgba(0,0,0,0.08)",
      "inset 0 1px 0 rgba(255,255,255,0.4)",
      "inset 0 -1px 0 rgba(255,255,255,0.06)",
    ].join(", "),
    widgetBackdrop: "blur(20px) saturate(180%)",

    // Inner sections — subtler frost layer
    sectionBg: "rgba(255, 255, 255, 0.10)",
    sectionBorder: "1px solid rgba(255,255,255,0.18)",
    sectionRadius: "16px",
    sectionShadow: [
      "0 2px 12px rgba(0,0,0,0.06)",
      "inset 0 1px 0 rgba(255,255,255,0.25)",
    ].join(", "),
    sectionBackdrop: "blur(10px)",

    // Typography — crisp white on glass with drop shadow for readability
    textPrimary: "#ffffff",
    textSecondary: "rgba(255,255,255,0.78)",
    textMuted: "rgba(255,255,255,0.48)",
    textShadow: "0 1px 3px rgba(0,0,0,0.2)",

    // Accent — tinted glass with higher opacity for clear interactivity
    accentBg: "rgba(102, 126, 234, 0.6)",
    accentText: "#ffffff",
    accentShadow: [
      "0 4px 16px rgba(102,126,234,0.4)",
      "inset 0 1px 0 rgba(255,255,255,0.3)",
    ].join(", "),

    // Toggle — recessed glass track
    toggleBg: "transparent",
    toggleInactiveText: "rgba(255,255,255,0.5)",
    toggleTrackBg: "rgba(255,255,255,0.08)",
    toggleTrackBorder: "1px solid rgba(255,255,255,0.14)",
    toggleTrackShadow: "inset 0 2px 4px rgba(0,0,0,0.12)",

    // Inputs — subtle frosted recess
    inputBg: "rgba(255,255,255,0.10)",
    inputBorder: "1px solid rgba(255,255,255,0.20)",
    inputRadius: "12px",
    inputShadow: "inset 0 1px 3px rgba(0,0,0,0.08)",

    // Pills — small floating glass elements
    pillBg: "rgba(255,255,255,0.14)",
    pillBorder: "1px solid rgba(255,255,255,0.22)",
    pillRadius: "10px",
    pillShadow: [
      "0 2px 8px rgba(0,0,0,0.1)",
      "inset 0 1px 0 rgba(255,255,255,0.18)",
    ].join(", "),

    // Disabled — faint ghost glass
    disabledBg: "rgba(255,255,255,0.05)",
    disabledText: "rgba(255,255,255,0.25)",

    dividerColor: "rgba(255,255,255,0.14)",

    // Modal — frosted dark glass layer
    modalBg: "rgba(20, 15, 40, 0.55)",
    modalBorder: "1px solid rgba(255,255,255,0.18)",
    modalRadius: "20px",
    modalBackdrop: "blur(32px) saturate(160%)",
    modalShadow: [
      "0 24px 80px rgba(0,0,0,0.35)",
      "0 8px 24px rgba(0,0,0,0.2)",
      "inset 0 1px 0 rgba(255,255,255,0.14)",
    ].join(", "),

    // Interactive states
    hoverBg: "rgba(255,255,255,0.14)",
    selectedBg: "rgba(102,126,234,0.25)",
    selectedBorder: "1.5px solid rgba(102,126,234,0.6)",
  },
};
