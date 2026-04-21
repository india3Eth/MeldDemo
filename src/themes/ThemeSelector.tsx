"use client";

import { useTheme } from "./ThemeProvider";

// =============================================================================
// Theme Selector — panel showing all available themes
// =============================================================================

export function ThemeSelector() {
  const { themeId, setThemeId, allThemes } = useTheme();

  return (
    <div
      className="rounded-2xl bg-white/95 p-6 shadow-lg backdrop-blur-sm"
      style={{ width: 220 }}
    >
      <div className="mb-5 text-xs font-bold uppercase tracking-widest text-gray-900">
        Themes
      </div>

      <div className="flex flex-col gap-3">
        {allThemes.map((t) => {
          const isActive = themeId === t.id;

          return (
            <button
              key={t.id}
              onClick={() => setThemeId(t.id)}
              className="flex items-center gap-2.5 rounded-xl px-4 py-3.5 text-left text-[13px] font-semibold transition-all duration-200"
              style={{
                background: isActive
                  ? `linear-gradient(135deg, ${t.selectorColor} 0%, ${t.selectorColor}dd 100%)`
                  : "rgba(248,249,250,0.8)",
                color: isActive ? "#fff" : "#495057",
                border: isActive ? "none" : "1px solid rgba(0,0,0,0.06)",
                boxShadow: isActive
                  ? `0 6px 20px ${t.selectorColor}44`
                  : "0 2px 4px rgba(0,0,0,0.04)",
              }}
            >
              <span className="text-xl">{t.icon}</span>
              <span>{t.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
