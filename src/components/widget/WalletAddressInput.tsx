"use client";

import { useWidget } from "@/contexts/WidgetContext";
import { useTheme } from "@/themes/ThemeProvider";

// =============================================================================
// WalletAddressInput — wallet address field (required for buy flow)
// =============================================================================

// Fix #8: per-chain address format validation
function validateAddress(address: string, chainCode?: string): boolean {
  if (!address) return true;
  const a = address.trim();
  switch (chainCode?.toUpperCase()) {
    case "ETH":
    case "MATIC":
    case "POLYGON":
    case "BSC":
    case "BNB":
    case "AVAX":
    case "ARB":
    case "OP":
    case "BASE":
      return /^0x[a-fA-F0-9]{40}$/.test(a);
    case "BTC":
      return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[ac-hj-np-z02-9]{6,87}$/.test(a);
    case "SOL":
      return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(a);
    default:
      return a.length >= 10;
  }
}

interface WalletAddressInputProps {
  onOpenHistory: () => void;
}

export function WalletAddressInput({ onOpenHistory }: WalletAddressInputProps) {
  const { walletAddress, setWalletAddress, mode, selectedCrypto } = useWidget();
  const { tokens } = useTheme();

  const isBuy = mode === "BUY";
  const isEmpty = !walletAddress.trim();
  const isInvalid = !isEmpty && !validateAddress(walletAddress, selectedCrypto?.chainCode);

  const borderStyle = isInvalid
    ? "1px solid #fca5a5"
    : isEmpty && isBuy
      ? "1px solid #fca5a5"
      : tokens.inputBorder;

  return (
    <div className="mb-3.5">
      <label
        className="mb-2 block text-[13px] font-medium"
        style={{ color: tokens.textSecondary }}
      >
        {isBuy ? "Wallet Address" : "Wallet Address (optional)"}
      </label>

      {/* Input + inline history button */}
      <div
        className="flex items-center gap-2"
        style={{
          background: tokens.inputBg,
          border: borderStyle,
          borderRadius: tokens.inputRadius,
          boxShadow: tokens.inputShadow,
          padding: "8px 8px 8px 15px",
          transition: "border-color 0.2s",
        }}
      >
        <input
          type="text"
          placeholder="Enter wallet address to proceed"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          style={{ color: tokens.textPrimary, border: "none" }}
        />
        <button
          onClick={onOpenHistory}
          style={{
            flexShrink: 0,
            background: tokens.pillBg,
            border: tokens.pillBorder,
            borderRadius: "8px",
            padding: "6px 10px",
            fontSize: "11px",
            fontWeight: 600,
            color: tokens.textSecondary,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Tx History
        </button>
      </div>

      {isInvalid && (
        <p className="mt-1.5 text-[11px] text-red-400">
          Invalid {selectedCrypto?.chainCode ?? ""} address format
        </p>
      )}
    </div>
  );
}
