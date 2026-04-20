"use client";

import { useWidget } from "@/contexts/WidgetContext";
import { useTheme } from "@/themes/ThemeProvider";

// =============================================================================
// PaymentMethodSelect — shows selected payment method, opens modal on click
// =============================================================================

interface PaymentMethodSelectProps {
  onOpenModal: () => void;
}

export function PaymentMethodSelect({ onOpenModal }: PaymentMethodSelectProps) {
  const { selectedPaymentMethod, mode } = useWidget();
  const { tokens } = useTheme();

  return (
    <div className="mb-5">
      <label
        className="mb-2 block text-[13px] font-medium"
        style={{ color: tokens.textSecondary }}
      >
        {mode === "BUY" ? "Payment Method" : "Receive Funds Via"}
      </label>
      <button
        onClick={onOpenModal}
        className="flex w-full items-center justify-between transition-all duration-200"
        style={{
          padding: "15px",
          background: tokens.pillBg,
          border: tokens.pillBorder,
          borderRadius: tokens.inputRadius,
          boxShadow: tokens.pillShadow,
          cursor: "pointer",
          fontSize: "14px",
        }}
      >
        <div className="flex items-center gap-2.5">
          {(selectedPaymentMethod?.logos?.light || selectedPaymentMethod?.logos?.dark) && (
            <img
              src={selectedPaymentMethod.logos.light || selectedPaymentMethod.logos.dark}
              alt={selectedPaymentMethod.name}
              className="h-5 w-5 object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          <span style={{ color: tokens.textPrimary, fontWeight: 500 }}>
            {selectedPaymentMethod?.name ?? "Select payment method"}
          </span>
        </div>
        <span style={{ fontSize: "12px", color: tokens.textMuted }}>▼</span>
      </button>
    </div>
  );
}
