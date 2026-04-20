"use client";

import { BaseModal } from "./BaseModal";
import { useWidget } from "@/contexts/WidgetContext";
import { useTheme } from "@/themes/ThemeProvider";
import type { PaymentMethod } from "@/lib/meld/types";

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentMethodModal({ isOpen, onClose }: PaymentMethodModalProps) {
  const { paymentMethods, selectedPaymentMethod, setSelectedPaymentMethod } = useWidget();
  const { tokens } = useTheme();

  function handleSelect(pm: PaymentMethod) {
    setSelectedPaymentMethod(pm);
    onClose();
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Select Payment Method">
      {paymentMethods.map((pm) => {
        const isSelected = selectedPaymentMethod?.paymentMethod === pm.paymentMethod;

        return (
          <div
            key={pm.paymentMethod}
            onClick={() => handleSelect(pm)}
            className="mb-2 flex cursor-pointer items-center justify-between rounded-[10px] p-3.5 transition-colors"
            style={{
              border: `1.5px solid ${tokens.dividerColor}`,
              background: isSelected ? tokens.selectedBg : "transparent",
            }}
          >
            <div className="flex items-center gap-3">
              {pm.logos?.light || pm.logos?.dark ? (
                <img
                  src={pm.logos.light || pm.logos.dark}
                  alt={pm.name}
                  className="h-6 w-6 object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <span className="text-2xl">💳</span>
              )}
              <span
                className="text-[15px] font-medium"
                style={{ color: tokens.textPrimary }}
              >
                {pm.name}
              </span>
            </div>
            {isSelected && (
              <span className="text-xl text-green-600">✓</span>
            )}
          </div>
        );
      })}
    </BaseModal>
  );
}
