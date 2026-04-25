// =============================================================================
// Theme Token Types
// =============================================================================
// Every theme must implement this interface. Components read these tokens via
// the useTheme() hook — they never import theme files directly.
// =============================================================================

export interface ThemeTokens {
  // Page
  pageBg: string;

  // Widget container
  widgetBg: string;
  widgetBorder: string;
  widgetRadius: string;
  widgetShadow: string;
  widgetBackdrop: string;

  // Sections (cards inside the widget)
  sectionBg: string;
  sectionBorder: string;
  sectionRadius: string;
  sectionShadow: string;
  sectionBackdrop: string;

  // Typography
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textShadow: string;

  // Accent / primary action
  accentBg: string;
  accentText: string;
  accentShadow: string;

  // Toggle switch
  toggleBg: string;
  toggleInactiveText: string;
  toggleTrackBg: string;
  toggleTrackBorder: string;
  toggleTrackShadow: string;

  // Inputs
  inputBg: string;
  inputBorder: string;
  inputRadius: string;
  inputShadow: string;

  // Selector pills
  pillBg: string;
  pillBorder: string;
  pillRadius: string;
  pillShadow: string;

  // Disabled state
  disabledBg: string;
  disabledText: string;

  // Divider
  dividerColor: string;

  // Modal
  modalBg: string;
  modalBorder: string;
  modalRadius: string;
  modalShadow: string;
  modalBackdrop: string;

  // Interactive states
  hoverBg: string;
  selectedBg: string;
  selectedBorder: string;

  // Semantic accent for links, brand highlights, interactive text
  linkColor: string;

  // Semantic status — used for error text/borders across all components
  errorColor: string;
  successColor: string;
}

export interface ThemeDefinition {
  id: string;
  name: string;
  icon: string;
  selectorColor: string;
  tokens: ThemeTokens;
}
