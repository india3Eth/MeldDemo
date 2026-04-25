"use client";

import { useEffect, useState, useRef } from "react";
import { useWidget } from "@/contexts/WidgetContext";
import { useTheme } from "@/themes/ThemeProvider";
import { useWallet } from "@/hooks/use-wallet";
import type { WalletType } from "@/hooks/use-wallet";

// =============================================================================
// WalletAddressInput — wallet address field with multi-wallet picker
// =============================================================================

function WalletIcon({ icon, size }: { icon: string | undefined; size: number }) {
  if (!icon) return <span style={{ fontSize: size }}>🔗</span>;
  // Emoji/symbols are ≤ 4 chars. Any URL or data URI is much longer → render as img.
  // This avoids fragile prefix checks that break if the wallet uses an unexpected scheme.
  if (icon.length > 4) {
    return (
      <img
        src={icon}
        alt=""
        style={{ width: size, height: size, borderRadius: 4, flexShrink: 0, objectFit: "contain" }}
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
      />
    );
  }
  return <span style={{ fontSize: size, lineHeight: 1, flexShrink: 0 }}>{icon}</span>;
}

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
  const { walletAddress, setWalletAddress, selectedCrypto } = useWidget();
  const { tokens } = useTheme();
  const wallet = useWallet(setWalletAddress);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Re-sync connected wallet address after mode switch clears walletAddress
  useEffect(() => {
    if (wallet.connected && !walletAddress) {
      setWalletAddress(wallet.connected.address);
    }
  }, [wallet.connected, walletAddress, setWalletAddress]);

  // Close picker on outside click
  useEffect(() => {
    if (!pickerOpen) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [pickerOpen]);

  const isEmpty = !walletAddress.trim();
  const isInvalid = !isEmpty && !validateAddress(walletAddress, selectedCrypto?.chainCode);
  const isWalletConnected = wallet.connected !== null;
  const connectedWalletInfo = wallet.availableWallets.find(w => w.type === wallet.connected?.type);

  const errorBorder = `1px solid ${tokens.errorColor}66`;
  const borderStyle = isInvalid || isEmpty ? errorBorder : tokens.inputBorder;

  async function handleConnectClick() {
    if (wallet.availableWallets.length === 1) {
      // Only one wallet — connect directly
      await wallet.connectSpecific(wallet.availableWallets[0].type, selectedCrypto?.chainCode);
    } else {
      // Multiple wallets — show picker
      setPickerOpen((v) => !v);
    }
  }

  async function handlePickWallet(type: WalletType) {
    setPickerOpen(false);
    await wallet.connectSpecific(type, selectedCrypto?.chainCode);
  }

  return (
    <div className="mb-3.5">
      {/* Label row */}
      <div className="mb-2 flex items-center justify-between">
        <label className="text-[13px] font-medium" style={{ color: tokens.textSecondary }}>
          Wallet Address
        </label>

        {wallet.hasWallet && (
          <div className="relative" ref={pickerRef}>
            <span
              onClick={isWalletConnected ? wallet.disconnect : handleConnectClick}
              className="flex items-center gap-1 text-[12px] font-medium"
              style={{
                color: isWalletConnected ? tokens.successColor : tokens.linkColor,
                cursor: "pointer",
              }}
            >
              {wallet.isConnecting ? "Connecting…" : isWalletConnected ? (
                <>
                  <WalletIcon icon={connectedWalletInfo?.icon} size={14} />
                  Disconnect
                </>
              ) : "Connect Wallet"}
            </span>

            {/* Wallet picker dropdown */}
            {pickerOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  right: 0,
                  background: tokens.modalBg,
                  border: tokens.modalBorder,
                  borderRadius: "10px",
                  boxShadow: tokens.modalShadow,
                  padding: "6px",
                  minWidth: "160px",
                  zIndex: 50,
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
                {wallet.availableWallets.map((w) => (
                  <button
                    key={w.type}
                    onClick={() => handlePickWallet(w.type)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 10px",
                      borderRadius: "8px",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: tokens.textPrimary,
                      textAlign: "left",
                      width: "100%",
                      transition: "background 0.12s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = tokens.hoverBg; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                  >
                    <WalletIcon icon={w.icon} size={18} />
                    {w.name}
                  </button>
                ))}
              </div>
            )}
          </div>
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
          onChange={(e) => { if (!isWalletConnected) setWalletAddress(e.target.value); }}
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
