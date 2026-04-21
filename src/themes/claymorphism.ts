import type { ThemeDefinition } from "./types";

export const claymorphism: ThemeDefinition = {
  id: "claymorphism",
  name: "Claymorphism",
  icon: "\uD83E\uDDF8",
  selectorColor: "#e88fc4",
  tokens: {
    // Page — soft pastel gradient; must be darker than cards for clay depth
    pageBg: "linear-gradient(135deg, #c8b6e2 0%, #d9b8d4 50%, #e4c0c8 100%)",

    // Widget — light cream/lavender, with the 3-shadow clay recipe:
    //   1. outer drop shadow  2. inset dark emboss  3. inset light glow
    widgetBg: "linear-gradient(145deg, #f7f0fc 0%, #eee6f4 100%)",
    widgetBorder: "none",
    widgetRadius: "48px",
    widgetShadow:
      "18px 18px 36px rgba(130,100,160,0.35), inset -6px -6px 14px rgba(150,120,185,0.2), inset 0px 10px 22px rgba(255,255,255,0.7)",
    widgetBackdrop: "none",

    // Sections — slightly lighter still, with subtler clay shadows
    sectionBg: "linear-gradient(145deg, #faf5ff 0%, #f2eaf8 100%)",
    sectionBorder: "none",
    sectionRadius: "28px",
    sectionShadow:
      "8px 8px 16px rgba(140,110,170,0.2), inset -4px -4px 10px rgba(150,120,185,0.12), inset 0px 6px 14px rgba(255,255,255,0.6)",
    sectionBackdrop: "none",

    // Text — deep purple for strong contrast on pastels
    textPrimary: "#2d1b4e",
    textSecondary: "#4a3566",
    textMuted: "#8070a0",
    textShadow: "none",

    // Accent — vibrant coral-pink, the classic claymorphism highlight
    accentBg: "linear-gradient(145deg, #f0849b 0%, #e76882 100%)",
    accentText: "#ffffff",
    accentShadow:
      "6px 6px 14px rgba(231,104,130,0.4), inset -3px -3px 8px rgba(200,70,100,0.2), inset 0px 6px 12px rgba(255,200,215,0.5)",

    // Toggle
    toggleBg: "transparent",
    toggleInactiveText: "#8070a0",
    toggleTrackBg: "linear-gradient(145deg, #ede4f4 0%, #e2d6ec 100%)",
    toggleTrackBorder: "none",
    toggleTrackShadow:
      "inset 4px 4px 10px rgba(140,110,170,0.2), inset -4px -4px 10px rgba(255,255,255,0.5)",

    // Inputs — recessed clay feel via inset-only shadows
    inputBg: "linear-gradient(145deg, #faf5ff 0%, #f2eaf8 100%)",
    inputBorder: "none",
    inputRadius: "20px",
    inputShadow:
      "inset 4px 4px 10px rgba(140,110,170,0.15), inset -4px -4px 10px rgba(255,255,255,0.5)",

    // Pills — small puffy clay pieces
    pillBg: "linear-gradient(145deg, #f7f0fc 0%, #ede4f4 100%)",
    pillBorder: "none",
    pillRadius: "18px",
    pillShadow:
      "4px 4px 10px rgba(140,110,170,0.2), inset -3px -3px 6px rgba(150,120,185,0.1), inset 0px 4px 8px rgba(255,255,255,0.5)",

    // Disabled
    disabledBg: "linear-gradient(145deg, #e8ddf0 0%, #ddd0e8 100%)",
    disabledText: "#a090b8",

    // Divider
    dividerColor: "rgba(74,53,102,0.12)",

    // Modal
    modalBg: "#f7f0fc",
    modalBorder: "none",
    modalRadius: "36px",
    modalBackdrop: "none",
    modalShadow:
      "22px 22px 44px rgba(130,100,160,0.35), inset -8px -8px 16px rgba(150,120,185,0.18), inset 0px 12px 26px rgba(255,255,255,0.65)",

    // Interactive states
    hoverBg: "rgba(240,230,252,0.5)",
    selectedBg: "rgba(240,132,155,0.15)",
    selectedBorder: "2px solid #e76882",
  },
};
