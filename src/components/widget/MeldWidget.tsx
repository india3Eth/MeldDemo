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
  const { mode } = useWidget();
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const closeModal = () => setOpenModal(null);

  const isBuy = mode === "BUY";

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
