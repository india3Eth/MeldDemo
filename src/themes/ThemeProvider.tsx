"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { THEMES, getThemeById } from "./index";
import type { ThemeDefinition, ThemeTokens } from "./types";

// =============================================================================
// Theme Context — injects the active theme into the component tree
// =============================================================================

interface ThemeContextValue {
  theme: ThemeDefinition;
  themeId: string;
  tokens: ThemeTokens;
  setThemeId: (id: string) => void;
  allThemes: ThemeDefinition[];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = "skeuomorphism",
}: ThemeProviderProps) {
  const [themeId, setThemeId] = useState(defaultTheme);
  const theme = getThemeById(themeId);

  const handleSetTheme = useCallback((id: string) => {
    setThemeId(id);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      themeId,
      tokens: theme.tokens,
      setThemeId: handleSetTheme,
      allThemes: THEMES,
    }),
    [theme, themeId, handleSetTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      <div
        style={{ background: theme.tokens.pageBg }}
        className="min-h-screen w-full transition-all duration-500"
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
