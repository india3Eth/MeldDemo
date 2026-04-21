import type { ThemeDefinition } from "./types";

export const minimalism: ThemeDefinition = {
  id: "minimalism",
  name: "Minimalism",
  icon: "\u25FB\uFE0F",
  selectorColor: "#18181B",
  tokens: {
    // Warm off-white — intentional, not clinical
    pageBg: "#F7F7F5",

    // Clean white card with a single delicate shadow for quiet depth
    widgetBg: "#ffffff",
    widgetBorder: "1px solid #E8E8E5",
    widgetRadius: "12px",
    widgetShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)",
    widgetBackdrop: "none",

    // Sections — transparent, separated by dividers not boxes
    sectionBg: "transparent",
    sectionBorder: "none",
    sectionRadius: "8px",
    sectionShadow: "none",
    sectionBackdrop: "none",

    // Typography — rich warm blacks with generous hierarchy
    textPrimary: "#18181B",
    textSecondary: "#52525B",
    textMuted: "#A1A1AA",
    textShadow: "none",

    // Single accent: refined near-black — lets typography do the work
    accentBg: "#18181B",
    accentText: "#ffffff",
    accentShadow: "none",

    // Toggle
    toggleBg: "transparent",
    toggleInactiveText: "#A1A1AA",
    toggleTrackBg: "#F4F4F2",
    toggleTrackBorder: "1px solid #E8E8E5",
    toggleTrackShadow: "none",

    // Inputs — hairline border, subtle radius
    inputBg: "#ffffff",
    inputBorder: "1px solid #E8E8E5",
    inputRadius: "8px",
    inputShadow: "none",

    // Pills — consistent with inputs
    pillBg: "#ffffff",
    pillBorder: "1px solid #E8E8E5",
    pillRadius: "8px",
    pillShadow: "none",

    // Disabled — barely there
    disabledBg: "#F4F4F2",
    disabledText: "#D4D4D0",

    // Divider — light and quiet
    dividerColor: "#E8E8E5",

    // Modal — subtle elevation
    modalBg: "#ffffff",
    modalBorder: "1px solid #E8E8E5",
    modalRadius: "12px",
    modalBackdrop: "none",
    modalShadow: "0 4px 24px rgba(0,0,0,0.08), 0 12px 48px rgba(0,0,0,0.04)",

    // Interactive — minimal and precise
    hoverBg: "#F7F7F5",
    selectedBg: "#F4F4F2",
    selectedBorder: "2px solid #18181B",
  },
};
