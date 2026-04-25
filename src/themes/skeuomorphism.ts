// =============================================================================
// Skeuomorphism Theme
// =============================================================================
// Inspired by iOS 6 / early macOS design language.
//
// Design principles applied:
//   - Multi-layered shadows simulate physical depth and overhead lighting
//   - Top-left highlights + bottom-right shadows = beveled, 3D surfaces
//   - Inset shadows on inputs/toggles create recessed "well" appearance
//   - Embossed text via light text-shadow below dark text
//   - Gradients simulate light falling on curved/angled surfaces
//   - Widget feels like a physical card sitting on a textured surface
// =============================================================================

import type { ThemeDefinition } from "./types";

export const skeuomorphism: ThemeDefinition = {
  id: "skeuomorphism",
  name: "Skeuomorphism",
  icon: "\uD83C\uDFA8",
  selectorColor: "#6a7d9b",
  tokens: {
    // Warm linen-textured gradient — classic iOS 6 surface feel
    pageBg: "linear-gradient(180deg, #c5beb4 0%, #a69e94 50%, #8e8578 100%)",

    // Brushed-aluminum card with warm undertone and top highlight edge
    widgetBg: "linear-gradient(180deg, #f0ede8 0%, #e0dbd4 50%, #d6d0c8 100%)",
    widgetBorder: "1px solid rgba(255,255,255,0.7)",
    widgetRadius: "14px",
    widgetShadow: [
      "0 1px 0 rgba(255,255,255,0.8)",
      "0 -1px 0 rgba(0,0,0,0.06)",
      "0 4px 8px rgba(0,0,0,0.14)",
      "0 12px 32px rgba(0,0,0,0.16)",
      "0 24px 48px rgba(0,0,0,0.08)",
      "inset 0 1px 0 rgba(255,255,255,0.95)",
      "inset 0 -1px 0 rgba(0,0,0,0.04)",
    ].join(", "),
    widgetBackdrop: "none",

    // Raised panel sections — warm white beveled surface
    sectionBg: "linear-gradient(180deg, #ffffff 0%, #f6f4f0 50%, #edebe6 100%)",
    sectionBorder: "1px solid rgba(255,255,255,0.85)",
    sectionRadius: "10px",
    sectionShadow: [
      "0 1px 0 rgba(255,255,255,0.7)",
      "0 2px 6px rgba(0,0,0,0.1)",
      "inset 0 1px 0 rgba(255,255,255,0.98)",
      "inset 0 -1px 1px rgba(0,0,0,0.03)",
    ].join(", "),
    sectionBackdrop: "none",

    // Typography — warm charcoal with embossed highlight
    textPrimary: "#2a2520",
    textSecondary: "#5c554d",
    textMuted: "#8c8578",
    textShadow: "0 1px 0 rgba(255,255,255,0.6)",

    // Classic iOS-style glossy blue button
    accentBg: "linear-gradient(180deg, #5a9cf5 0%, #3478F6 50%, #2864d8 100%)",
    accentText: "#ffffff",
    accentShadow: [
      "0 1px 0 rgba(255,255,255,0.15)",
      "0 2px 4px rgba(52,120,246,0.4)",
      "0 6px 16px rgba(52,120,246,0.25)",
      "inset 0 1px 0 rgba(255,255,255,0.35)",
      "inset 0 -1px 0 rgba(0,0,0,0.15)",
    ].join(", "),

    // Toggle: recessed track dug into the surface
    toggleBg: "transparent",
    toggleInactiveText: "#6b6560",
    toggleTrackBg: "linear-gradient(180deg, #cac4bb 0%, #d8d2c9 100%)",
    toggleTrackBorder: "1px solid rgba(0,0,0,0.12)",
    toggleTrackShadow: [
      "inset 0 2px 4px rgba(0,0,0,0.18)",
      "inset 0 1px 2px rgba(0,0,0,0.08)",
      "0 1px 0 rgba(255,255,255,0.5)",
    ].join(", "),

    // Recessed text field — pressed into the surface
    inputBg: "linear-gradient(180deg, #f0ede8 0%, #faf8f5 100%)",
    inputBorder: "1px solid rgba(0,0,0,0.14)",
    inputRadius: "8px",
    inputShadow: [
      "inset 0 2px 4px rgba(0,0,0,0.10)",
      "inset 0 1px 1px rgba(0,0,0,0.06)",
      "0 1px 0 rgba(255,255,255,0.5)",
    ].join(", "),

    // Raised pill buttons — beveled edges
    pillBg: "linear-gradient(180deg, #ffffff 0%, #f2efe9 100%)",
    pillBorder: "1px solid rgba(0,0,0,0.10)",
    pillRadius: "8px",
    pillShadow: [
      "0 1px 3px rgba(0,0,0,0.10)",
      "0 2px 6px rgba(0,0,0,0.06)",
      "inset 0 1px 0 rgba(255,255,255,0.95)",
      "inset 0 -1px 0 rgba(0,0,0,0.03)",
    ].join(", "),

    // Disabled: flat, muted, no depth cues
    disabledBg: "linear-gradient(180deg, #e2ddd6 0%, #d6d0c8 100%)",
    disabledText: "#a09890",

    dividerColor: "rgba(0,0,0,0.08)",

    // Modal: heavy shadow for elevated card feel
    modalBg: "linear-gradient(180deg, #faf8f5 0%, #f0ede8 100%)",
    modalBorder: "1px solid rgba(255,255,255,0.6)",
    modalRadius: "12px",
    modalBackdrop: "none",
    modalShadow: [
      "0 0 0 1px rgba(0,0,0,0.06)",
      "0 8px 24px rgba(0,0,0,0.20)",
      "0 24px 64px rgba(0,0,0,0.15)",
    ].join(", "),

    hoverBg: "linear-gradient(180deg, #f7f5f0 0%, #f0ede8 100%)",
    selectedBg: "rgba(52,120,246,0.10)",
    selectedBorder: "1.5px solid #3478F6",

    linkColor: "#3478F6",
    errorColor: "#dc2626",
    successColor: "#16a34a",
  },
};
