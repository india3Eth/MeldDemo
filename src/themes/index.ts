// =============================================================================
// Theme Registry
// =============================================================================
// Single import point for all themes. Add a new theme by:
//   1. Creating a new file (e.g. mytheme.ts) exporting a ThemeDefinition
//   2. Importing and adding it to the THEMES array below
// =============================================================================

export type { ThemeTokens, ThemeDefinition } from "./types";

import { skeuomorphism } from "./skeuomorphism";
import { glassmorphism } from "./glassmorphism";
import { neobrutalism } from "./neobrutalism";
import { claymorphism } from "./claymorphism";
import { minimalism } from "./minimalism";
import { liquidglass } from "./liquidglass";

import type { ThemeDefinition } from "./types";

export const THEMES: ThemeDefinition[] = [
  skeuomorphism,
  glassmorphism,
  neobrutalism,
  claymorphism,
  minimalism,
  liquidglass,
];

export function getThemeById(id: string): ThemeDefinition {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
