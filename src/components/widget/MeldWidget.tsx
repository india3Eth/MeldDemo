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
import { TransactionsView } from "./TransactionsView";

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

  // ── Complete / failed / timeout → show TransactionsView inside widget ──
  const showHistory = txPhase === "complete" || txPhase === "failed" || txPhase === "timeout";

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
        minHeight: "520px",
      }}
    >
      {/* ── Main widget form (always rendered, hidden under overlay / history) ── */}
      {showHistory ? (
        <TransactionsView />
      ) : (
        <>
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
        </>
      )}

      {/* ── Waiting overlay — blurs widget, sits on top ── */}
      {txPhase === "waiting" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: tokens.widgetRadius,
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            padding: "32px",
            textAlign: "center",
            zIndex: 10,
          }}
        >
          <div style={{ fontSize: "32px" }}>⏳</div>
          <div style={{ color: "#ffffff", fontSize: "17px", fontWeight: 600 }}>
            Completing your transaction
          </div>
          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "13px" }}>
            {txStatus
              ? (STATUS_LABELS[txStatus] ?? txStatus)
              : "Waiting for provider..."}
          </div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", marginTop: "2px" }}>
            Complete the payment in the provider tab
          </div>
          <button
            onClick={resetTransaction}
            style={{
              marginTop: "16px",
              width: "100%",
              borderRadius: "12px",
              padding: "12px 0",
              fontSize: "15px",
              fontWeight: 600,
              background: "transparent",
              color: "rgba(255,255,255,0.6)",
              border: "1.5px solid rgba(255,255,255,0.25)",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
