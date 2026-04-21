import type { ThemeDefinition } from "./types";

export const neobrutalism: ThemeDefinition = {
  id: "neobrutalism",
  name: "Neo-Brutalism",
  icon: "\u2B1B",
  selectorColor: "#FFD23F",
  tokens: {
    // Page — bold yellow, the signature neo-brutalism background (Gumroad-style)
    pageBg: "#FFD23F",

    // Widget — warm off-white with thick border and hard-offset shadow (large tier)
    widgetBg: "#FFFDF5",
    widgetBorder: "4px solid #000000",
    widgetRadius: "0px",
    widgetShadow: "8px 8px 0px #000000",
    widgetBackdrop: "none",

    // Sections — white with medium-tier shadow
    sectionBg: "#ffffff",
    sectionBorder: "3px solid #000000",
    sectionRadius: "0px",
    sectionShadow: "5px 5px 0px #000000",
    sectionBackdrop: "none",

    // Text — pure black for maximum contrast on off-white
    textPrimary: "#000000",
    textSecondary: "#1a1a1a",
    textMuted: "#555555",
    textShadow: "none",

    // Accent — vibrant coral-pink button, black text + black shadow (NOT a black button)
    accentBg: "#FF6B6B",
    accentText: "#000000",
    accentShadow: "5px 5px 0px #000000",

    // Toggle
    toggleBg: "transparent",
    toggleInactiveText: "#555555",
    toggleTrackBg: "#FFFDF5",
    toggleTrackBorder: "3px solid #000000",
    toggleTrackShadow: "none",

    // Inputs — small-tier shadow
    inputBg: "#ffffff",
    inputBorder: "3px solid #000000",
    inputRadius: "0px",
    inputShadow: "3px 3px 0px #000000",

    // Pills — small-tier shadow
    pillBg: "#ffffff",
    pillBorder: "3px solid #000000",
    pillRadius: "0px",
    pillShadow: "3px 3px 0px #000000",

    // Disabled — muted but still warm
    disabledBg: "#e8e8e0",
    disabledText: "#999999",

    // Divider — bold black line
    dividerColor: "#000000",

    // Modal — large-tier shadow, matches widget weight
    modalBg: "#FFFDF5",
    modalBorder: "4px solid #000000",
    modalRadius: "0px",
    modalBackdrop: "none",
    modalShadow: "8px 8px 0px #000000",

    // Interactive — bold, high-contrast states
    hoverBg: "#FFD23F",
    selectedBg: "#74B9FF",
    selectedBorder: "3px solid #000000",
  },
};
