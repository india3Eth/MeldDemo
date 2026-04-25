// =============================================================================
// Glassmorphism Theme — "visionOS Light"
// =============================================================================
// Design principles:
//
//   - LIGHT glassmorphism: bright colorful background, white-frosted panels,
//     dark text. Think Apple visionOS, macOS Sonoma desktop widgets.
//   - Background is a warm-to-cool pastel gradient — the "sky" you frost over.
//   - Glass panels use high white opacity (0.55–0.70) — frosted, not see-through.
//   - Dark charcoal text on light glass — crisp, readable, no text shadows needed.
//   - Accent: saturated blue — clean, confident, Apple-esque.
//   - Sections have very subtle white overlays for nesting hierarchy.
//   - This is the visual opposite of Liquid Glass (dark, warm, translucent).
// =============================================================================

import type { ThemeDefinition } from "./types";

export const glassmorphism: ThemeDefinition = {
  id: "glassmorphism",
  name: "Glassmorphism",
  icon: "\uD83D\uDC8E",
  selectorColor: "#0ea5e9",
  tokens: {
    // Bright pastel gradient — the colorful sky behind the frost
    pageBg: [
      "linear-gradient(135deg,",
      "#e0f2fe 0%,",       // light sky blue
      "#ddd6fe 25%,",      // soft lavender
      "#fce7f3 50%,",      // blush pink
      "#ccfbf1 75%,",      // mint
      "#cffafe 100%)",     // light cyan
    ].join(" "),

    // Heavy frosted white glass — high opacity, strong blur
    widgetBg: "rgba(255, 255, 255, 0.62)",
    widgetBorder: "1px solid rgba(255,255,255,0.75)",
    widgetRadius: "24px",
    widgetShadow: [
      "0 8px 32px rgba(0,0,0,0.08)",
      "0 2px 8px rgba(0,0,0,0.04)",
      "inset 0 1px 0 rgba(255,255,255,0.9)",
      "inset 0 -1px 0 rgba(0,0,0,0.02)",
    ].join(", "),
    widgetBackdrop: "blur(40px) saturate(180%)",

    // Inner sections — slightly more frosted layer
    sectionBg: "rgba(255, 255, 255, 0.40)",
    sectionBorder: "1px solid rgba(255,255,255,0.65)",
    sectionRadius: "16px",
    sectionShadow: [
      "0 1px 6px rgba(0,0,0,0.04)",
      "inset 0 1px 0 rgba(255,255,255,0.85)",
    ].join(", "),
    sectionBackdrop: "blur(16px)",

    // Typography — dark on light glass, no text shadow needed
    textPrimary: "#1e293b",
    textSecondary: "#475569",
    textMuted: "#94a3b8",
    textShadow: "none",

    // Accent — saturated sky blue, Apple-esque
    accentBg: "#0ea5e9",
    accentText: "#ffffff",
    accentShadow: [
      "0 4px 14px rgba(14,165,233,0.35)",
      "inset 0 1px 0 rgba(255,255,255,0.25)",
    ].join(", "),

    // Toggle — recessed frost track
    toggleBg: "transparent",
    toggleInactiveText: "#94a3b8",
    toggleTrackBg: "rgba(255,255,255,0.50)",
    toggleTrackBorder: "1px solid rgba(0,0,0,0.06)",
    toggleTrackShadow: "inset 0 1px 3px rgba(0,0,0,0.06)",

    // Inputs — frosted recess, dark text
    inputBg: "rgba(255,255,255,0.50)",
    inputBorder: "1px solid rgba(0,0,0,0.08)",
    inputRadius: "12px",
    inputShadow: "inset 0 1px 2px rgba(0,0,0,0.04)",

    // Pills — small frosted glass chips
    pillBg: "rgba(255,255,255,0.55)",
    pillBorder: "1px solid rgba(0,0,0,0.06)",
    pillRadius: "10px",
    pillShadow: [
      "0 1px 4px rgba(0,0,0,0.06)",
      "inset 0 1px 0 rgba(255,255,255,0.8)",
    ].join(", "),

    // Disabled — very faint frost
    disabledBg: "rgba(255,255,255,0.30)",
    disabledText: "#cbd5e1",

    dividerColor: "rgba(0,0,0,0.06)",

    // Modal — deeper frosted layer
    modalBg: "rgba(255, 255, 255, 0.72)",
    modalBorder: "1px solid rgba(255,255,255,0.80)",
    modalRadius: "20px",
    modalBackdrop: "blur(48px) saturate(180%)",
    modalShadow: [
      "0 24px 80px rgba(0,0,0,0.12)",
      "0 8px 24px rgba(0,0,0,0.06)",
      "inset 0 1px 0 rgba(255,255,255,0.90)",
    ].join(", "),

    // Interactive states
    hoverBg: "rgba(14,165,233,0.06)",
    selectedBg: "rgba(14,165,233,0.10)",
    selectedBorder: "1.5px solid rgba(14,165,233,0.5)",

    linkColor: "#0284c7",
    errorColor: "#dc2626",
    successColor: "#16a34a",
  },
};
