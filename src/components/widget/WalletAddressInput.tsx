"use client";

import { useEffect } from "react";
import { useWidget } from "@/contexts/WidgetContext";
import { useTheme } from "@/themes/ThemeProvider";
import { useWallet } from "@/hooks/use-wallet";

// =============================================================================
// WalletAddressInput — wallet address field with wallet connect button
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
  const wallet = useWallet(setWalletAddress);

  // Re-sync connected wallet address after mode switch clears walletAddress
  useEffect(() => {
    if (wallet.connected && !walletAddress) {
      setWalletAddress(wallet.connected.address);
    }
  }, [wallet.connected, walletAddress, setWalletAddress]);

  const isBuy = mode === "BUY";
  const isEmpty = !walletAddress.trim();
  const isInvalid = !isEmpty && !validateAddress(walletAddress, selectedCrypto?.chainCode);
  const isWalletConnected = wallet.connected !== null;

  const errorBorder = `1px solid ${tokens.errorColor}66`;
  const borderStyle = isInvalid || isEmpty
    ? errorBorder
    : tokens.inputBorder;

  return (
    <div className="mb-3.5">
      {/* Label row — wallet address label + connect/disconnect text link */}
      <div className="mb-2 flex items-center justify-between">
        <label
          className="text-[13px] font-medium"
          style={{ color: tokens.textSecondary }}
        >
          Wallet Address
        </label>

        {wallet.hasWallet && (
          <span
            onClick={
              isWalletConnected
                ? wallet.disconnect
                : () => wallet.connect(selectedCrypto?.chainCode)
            }
            className="text-[12px] font-medium"
            style={{
              color: isWalletConnected ? tokens.successColor : tokens.linkColor,
              cursor: "pointer",
            }}
          >
            {wallet.isConnecting
              ? "Connecting..."
              : isWalletConnected
                ? "Disconnect"
                : "Connect Wallet"}
          </span>
        )}
      </div>

      {/* Input + history button */}
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
          placeholder={isWalletConnected ? "Connected" : "Enter wallet address"}
          value={walletAddress}
          onChange={(e) => {
            if (!isWalletConnected) setWalletAddress(e.target.value);
          }}
          readOnly={isWalletConnected}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          style={{
            color: tokens.textPrimary,
            border: "none",
            opacity: isWalletConnected ? 0.7 : 1,
          }}
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
        <p className="mt-1.5 text-[11px]" style={{ color: tokens.errorColor }}>
          Invalid {selectedCrypto?.chainCode ?? ""} address format
        </p>
      )}
      {wallet.connectError && (
        <p className="mt-1.5 text-[11px]" style={{ color: tokens.errorColor }}>
          {wallet.connectError}
        </p>
      )}
    </div>
  );
}
