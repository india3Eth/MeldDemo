import type { ThemeDefinition } from "./types";

export const liquidglass: ThemeDefinition = {
  id: "liquidglass",
  name: "Liquid Glass",
  icon: "\uD83D\uDCA7",
  selectorColor: "#a78bfa",
  tokens: {
    // Multi-color dynamic background — warm-to-cool gradient for refraction variety
    pageBg: [
      "linear-gradient(135deg,",
      "#1a1a2e 0%,",       // deep navy
      "#16213e 20%,",      // dark blue
      "#0f3460 40%,",      // rich blue
      "#533483 60%,",      // deep purple
      "#e94560 80%,",      // hot pink accent
      "#0f3460 100%)",     // loop back to blue
    ].join(" "),

    // Liquid glass panel — high transparency with strong refraction highlights
    // 3 layers: highlight (bright top inset), shadow (outer drop), illumination (bottom inset glow)
    widgetBg:
      "linear-gradient(160deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 100%)",
    widgetBorder: "1.5px solid rgba(255,255,255,0.45)",
    widgetRadius: "28px",
    widgetShadow: [
      "0 8px 40px rgba(0,0,0,0.3)",
      "0 2px 8px rgba(0,0,0,0.12)",
      "inset 0 2px 0 rgba(255,255,255,0.55)",         // highlight layer — bright top edge
      "inset 0 -1px 0 rgba(255,255,255,0.08)",        // illumination — subtle bottom glow
    ].join(", "),
    widgetBackdrop: "blur(40px) saturate(200%) brightness(110%)",

    // Inner sections — thinner glass layer, softer refraction
    sectionBg:
      "linear-gradient(160deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.05) 100%)",
    sectionBorder: "1px solid rgba(255,255,255,0.35)",
    sectionRadius: "20px",
    sectionShadow: [
      "0 4px 20px rgba(0,0,0,0.12)",
      "inset 0 1.5px 0 rgba(255,255,255,0.5)",        // highlight
      "inset 0 -0.5px 0 rgba(255,255,255,0.06)",      // illumination
    ].join(", "),
    sectionBackdrop: "blur(24px) saturate(180%)",

    // Typography — crisp white, no text shadow (liquid glass is clearer than frosted)
    textPrimary: "#ffffff",
    textSecondary: "rgba(255,255,255,0.80)",
    textMuted: "rgba(255,255,255,0.50)",
    textShadow: "0 0 8px rgba(0,0,0,0.15)",

    // Accent — luminous tinted glass with bright refraction edge
    accentBg:
      "linear-gradient(160deg, rgba(167,139,250,0.55) 0%, rgba(120,80,220,0.45) 100%)",
    accentText: "#ffffff",
    accentShadow: [
      "0 4px 20px rgba(120,80,220,0.35)",
      "inset 0 1.5px 0 rgba(255,255,255,0.45)",
    ].join(", "),

    // Toggle — recessed liquid well
    toggleBg: "transparent",
    toggleInactiveText: "rgba(255,255,255,0.45)",
    toggleTrackBg: "rgba(255,255,255,0.08)",
    toggleTrackBorder: "1px solid rgba(255,255,255,0.25)",
    toggleTrackShadow: "inset 0 2px 4px rgba(0,0,0,0.15)",

    // Inputs — clear glass recess
    inputBg: "rgba(255,255,255,0.10)",
    inputBorder: "1px solid rgba(255,255,255,0.30)",
    inputRadius: "14px",
    inputShadow: "inset 0 2px 4px rgba(0,0,0,0.12)",

    // Pills — small liquid glass drops
    pillBg: "rgba(255,255,255,0.14)",
    pillBorder: "1px solid rgba(255,255,255,0.32)",
    pillRadius: "12px",
    pillShadow: [
      "0 2px 8px rgba(0,0,0,0.12)",
      "inset 0 1px 0 rgba(255,255,255,0.35)",
    ].join(", "),

    // Disabled
    disabledBg: "rgba(255,255,255,0.05)",
    disabledText: "rgba(255,255,255,0.22)",

    dividerColor: "rgba(255,255,255,0.12)",

    // Modal — deep liquid glass with strong blur
    modalBg: "rgba(15,15,30,0.55)",
    modalBorder: "1.5px solid rgba(255,255,255,0.3)",
    modalRadius: "24px",
    modalBackdrop: "blur(48px) saturate(200%) brightness(105%)",
    modalShadow: [
      "0 24px 64px rgba(0,0,0,0.4)",
      "0 8px 24px rgba(0,0,0,0.2)",
      "inset 0 1.5px 0 rgba(255,255,255,0.25)",
    ].join(", "),

    // Interactive states
    hoverBg: "rgba(255,255,255,0.16)",
    selectedBg: "rgba(167,139,250,0.22)",
    selectedBorder: "1.5px solid rgba(167,139,250,0.6)",
  },
};
