"use client";

import { BaseModal } from "./BaseModal";
import { useTheme } from "@/themes/ThemeProvider";

// =============================================================================
// ErrorModal — centralized error display, uses BaseModal for consistency
// =============================================================================

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export function ErrorModal({ isOpen, onClose, title, message }: ErrorModalProps) {
  const { tokens } = useTheme();

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={title}>
      <div style={{ padding: "4px 0" }}>
        <p
          className="text-sm leading-relaxed"
          style={{ color: tokens.textSecondary, wordBreak: "break-word" }}
        >
          {message}
        </p>

        <button
          onClick={onClose}
          className="mt-4 w-full py-3 text-sm font-semibold transition-all duration-200"
          style={{
            background: tokens.accentBg,
            color: tokens.accentText,
            border: "none",
            borderRadius: tokens.inputRadius,
            boxShadow: tokens.accentShadow,
            cursor: "pointer",
          }}
        >
          Close
        </button>
      </div>
    </BaseModal>
  );
}
