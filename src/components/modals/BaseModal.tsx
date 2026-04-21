"use client";

import { useEffect, useCallback, useState, useRef, type ReactNode } from "react";
import { useTheme } from "@/themes/ThemeProvider";

// =============================================================================
// BaseModal — slides up from bottom, lives inside the widget container
// =============================================================================
// - Positioned absolute within the widget (not fixed on viewport)
// - Slides up from the bottom to 80% of widget height
// - Header + search bar are sticky; list content scrolls below
// - Backdrop covers only the widget area
// =============================================================================

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  /** Extra content rendered in the sticky header area (below search) */
  stickyContent?: ReactNode;
}

const EXIT_DURATION = 200;

export function BaseModal({
  isOpen,
  onClose,
  title,
  children,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  stickyContent,
}: BaseModalProps) {
  const { tokens } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [animating, setAnimating] = useState<"enter" | "exit" | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      requestAnimationFrame(() => setAnimating("enter"));
    } else if (mounted) {
      setAnimating("exit");
      timerRef.current = setTimeout(() => {
        setMounted(false);
        setAnimating(null);
      }, EXIT_DURATION);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (mounted) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mounted, handleKeyDown]);

  if (!mounted) return null;

  const backdropClass =
    animating === "enter" ? "modal-backdrop-enter" : "modal-backdrop-exit";
  const panelClass =
    animating === "enter" ? "modal-panel-enter" : "modal-panel-exit";

  return (
    <>
      {/* Backdrop — covers only the widget */}
      <div
        className={`absolute inset-0 z-[10] ${backdropClass}`}
        style={{
          background: "rgba(0,0,0,0.35)",
          borderRadius: "inherit",
        }}
        onClick={onClose}
      />

      {/* Panel — anchored to bottom, 80% of widget height */}
      <div
        className={`absolute inset-x-0 bottom-0 z-[11] flex flex-col ${panelClass}`}
        style={{
          height: "80%",
          background: tokens.modalBg,
          border: tokens.modalBorder,
          borderRadius: `${tokens.modalRadius} ${tokens.modalRadius} 0 0`,
          boxShadow: tokens.modalShadow,
          backdropFilter: tokens.modalBackdrop,
          WebkitBackdropFilter: tokens.modalBackdrop,
        }}
      >
        {/* Sticky header — title + close + search */}
        <div
          className="shrink-0"
          style={{
            padding: "20px 20px 0",
            borderBottom: `1px solid ${tokens.dividerColor}`,
          }}
        >
          {/* Drag handle indicator */}
          <div className="mb-3 flex justify-center">
            <div
              className="h-1 w-10 rounded-full"
              style={{ background: tokens.dividerColor }}
            />
          </div>

          {/* Title + close */}
          <div className="mb-3 flex items-center justify-between">
            <h3
              className="text-base font-semibold"
              style={{ color: tokens.textPrimary, textShadow: tokens.textShadow }}
            >
              {title}
            </h3>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full border-none text-lg leading-none transition-colors"
              style={{
                color: tokens.textMuted,
                background: tokens.hoverBg,
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>

          {/* Search — sticky with header */}
          {onSearchChange && (
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue ?? ""}
              onChange={(e) => onSearchChange(e.target.value)}
              className="mb-3 w-full text-sm outline-none"
              style={{
                padding: "10px 12px",
                border: tokens.inputBorder,
                borderRadius: tokens.inputRadius,
                background: tokens.inputBg,
                color: tokens.textPrimary,
                boxShadow: tokens.inputShadow,
              }}
            />
          )}

          {/* Extra sticky content (e.g. chain filter) */}
          {stickyContent}
        </div>

        {/* Scrollable content */}
        <div
          className="grow overflow-y-auto"
          style={{ padding: "12px 20px 20px" }}
        >
          {children}
        </div>
      </div>
    </>
  );
}
