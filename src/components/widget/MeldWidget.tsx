"use client";

import { useState } from "react";
import { useTheme } from "@/themes/ThemeProvider";

// Widget sub-components
import { WidgetHeader } from "./WidgetHeader";
import { AmountSection } from "./AmountSection";
import { ProviderCard } from "./ProviderCard";
import { WalletAddressInput } from "./WalletAddressInput";
import { PaymentMethodSelect } from "./PaymentMethodSelect";
import { SubmitButton } from "./SubmitButton";
import { PoweredByFooter } from "./PoweredByFooter";

// Modals
import { CountryModal } from "@/components/modals/CountryModal";
import { CurrencyModal } from "@/components/modals/CurrencyModal";
import { CryptoModal } from "@/components/modals/CryptoModal";
import { ProviderModal } from "@/components/modals/ProviderModal";
import { PaymentMethodModal } from "@/components/modals/PaymentMethodModal";

// Context
import { useWidget } from "@/contexts/WidgetContext";

const STATUS_LABELS: Record<string, string> = {
  PENDING_CREATED: "Transaction created",
  PENDING: "Awaiting provider confirmation",
  TWO_FA_REQUIRED: "Verification required in provider tab",
  TWO_FA_PROVIDED: "Verifying...",
  SETTLING: "Payment approved — crypto transferring",
  SETTLED: "Transaction complete",
  FAILED: "Transaction failed",
  DECLINED: "Declined by provider",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

// =============================================================================
// MeldWidget — the main crypto buy/sell widget
// =============================================================================

type ModalType =
  | "country"
  | "fiatCurrency"
  | "crypto"
  | "provider"
  | "paymentMethod"
  | null;

export function MeldWidget() {
  const { tokens } = useTheme();
  const { mode, txPhase, txStatus, resetTransaction } = useWidget();
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const closeModal = () => setOpenModal(null);

  const isBuy = mode === "BUY";

  // ── Transaction status overlay ─────────────────────────────────────
  if (txPhase !== "idle") {
    return (
      <div
        className="relative w-full max-w-[420px]"
        style={{
          background: tokens.widgetBg,
          border: tokens.widgetBorder,
          borderRadius: tokens.widgetRadius,
          boxShadow: tokens.widgetShadow,
          backdropFilter: tokens.widgetBackdrop,
          padding: "48px 32px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "12px",
        }}
      >
        {txPhase === "waiting" && (
          <>
            <div style={{ fontSize: "32px" }}>⏳</div>
            <div style={{ color: tokens.textPrimary, fontSize: "17px", fontWeight: 600 }}>
              Completing your transaction
            </div>
            <div style={{ color: tokens.textMuted, fontSize: "13px" }}>
              {txStatus
                ? (STATUS_LABELS[txStatus] ?? txStatus)
                : "Waiting for provider..."}
            </div>
            <div style={{ color: tokens.textMuted, fontSize: "11px", marginTop: "4px" }}>
              Complete the payment in the provider tab
            </div>
            <button
              onClick={resetTransaction}
              className="mt-4 w-full rounded-xl py-3 text-[15px] font-semibold transition-all duration-200"
              style={{ background: "transparent", color: tokens.textMuted, border: `1.5px solid ${tokens.dividerColor}`, cursor: "pointer" }}
            >
              Cancel
            </button>
          </>
        )}

        {txPhase === "complete" && (
          <>
            <div style={{ fontSize: "32px" }}>✅</div>
            <div style={{ color: tokens.textPrimary, fontSize: "17px", fontWeight: 600 }}>
              Transaction complete
            </div>
            <div style={{ color: tokens.textMuted, fontSize: "13px" }}>
              Your crypto is on its way
            </div>
            <button
              onClick={resetTransaction}
              className="mt-4 w-full rounded-xl py-3 text-[15px] font-semibold transition-all duration-200"
              style={{ background: tokens.accentBg, color: tokens.accentText, border: "none", cursor: "pointer" }}
            >
              Start new transaction
            </button>
          </>
        )}

        {(txPhase === "failed" || txPhase === "timeout") && (
          <>
            <div style={{ fontSize: "32px" }}>❌</div>
            <div style={{ color: "#f87171", fontSize: "17px", fontWeight: 600 }}>
              {txPhase === "timeout" ? "Taking longer than expected" : "Transaction failed"}
            </div>
            <div style={{ color: tokens.textMuted, fontSize: "13px" }}>
              {txPhase === "timeout"
                ? "Check your email for updates from the provider."
                : (txStatus ? (STATUS_LABELS[txStatus] ?? txStatus) : "The transaction could not be completed.")}
            </div>
            <button
              onClick={resetTransaction}
              className="mt-4 w-full rounded-xl py-3 text-[15px] font-semibold transition-all duration-200"
              style={{ background: tokens.accentBg, color: tokens.accentText, border: "none", cursor: "pointer" }}
            >
              Try again
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div
      className="relative w-full max-w-[420px] overflow-hidden"
      style={{
        background: tokens.widgetBg,
        border: tokens.widgetBorder,
        borderRadius: tokens.widgetRadius,
        boxShadow: tokens.widgetShadow,
        backdropFilter: tokens.widgetBackdrop,
        padding: "32px",
      }}
    >
      <WidgetHeader onOpenCountryModal={() => setOpenModal("country")} />

      <AmountSection
        variant="source"
        onOpenSelector={() =>
          setOpenModal(isBuy ? "fiatCurrency" : "crypto")
        }
      />

      <AmountSection
        variant="destination"
        onOpenSelector={() =>
          setOpenModal(isBuy ? "crypto" : "fiatCurrency")
        }
      />

      <ProviderCard onOpenProviderModal={() => setOpenModal("provider")} />

      <WalletAddressInput />

      <PaymentMethodSelect onOpenModal={() => setOpenModal("paymentMethod")} />

      <SubmitButton />

      <PoweredByFooter />

      {/* Modals — inside widget, slide up from bottom */}
      <CountryModal isOpen={openModal === "country"} onClose={closeModal} />
      <CurrencyModal isOpen={openModal === "fiatCurrency"} onClose={closeModal} />
      <CryptoModal isOpen={openModal === "crypto"} onClose={closeModal} />
      <ProviderModal isOpen={openModal === "provider"} onClose={closeModal} />
      <PaymentMethodModal isOpen={openModal === "paymentMethod"} onClose={closeModal} />
    </div>
  );
}
