"use client";

import { useState, useCallback } from "react";
import { useWidget } from "@/contexts/WidgetContext";
import { useTheme } from "@/themes/ThemeProvider";

// =============================================================================
// SellConfirmOverlay — shown after provider redirects back in SELL preferred flow
//
// Displays the transfer details fetched from the force-fetch endpoint:
//   - Token + amount the user must send
//   - Destination wallet address (provided by the off-ramp provider)
//   - "Confirm sent" button to proceed to transaction tracking
// =============================================================================

function truncateAddress(addr: string): string {
  if (addr.length <= 16) return addr;
  return `${addr.slice(0, 8)}…${addr.slice(-8)}`;
}

export function SellConfirmOverlay() {
  const { tokens } = useTheme();
  const { sellConfirmData, confirmSellTransfer, resetTransaction } = useWidget();
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const copyAddress = useCallback(() => {
    if (!sellConfirmData?.destinationWalletAddress) return;
    navigator.clipboard.writeText(sellConfirmData.destinationWalletAddress).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [sellConfirmData?.destinationWalletAddress]);

  const handleConfirm = useCallback(async () => {
    setConfirming(true);
    await confirmSellTransfer();
    setConfirming(false);
  }, [confirmSellTransfer]);

  if (!sellConfirmData) return null;

  const { sourceCurrencyCode, sourceAmount, destinationWalletAddress } = sellConfirmData;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: tokens.widgetRadius,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        background: tokens.modalBg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        padding: "32px",
        textAlign: "center",
        zIndex: 10,
      }}
    >
      {/* Icon */}
      <div style={{ fontSize: "36px" }}>↗</div>

      {/* Heading */}
      <div style={{ color: tokens.textPrimary, fontSize: "17px", fontWeight: 700 }}>
        Send your crypto
      </div>

      <div style={{ color: tokens.textSecondary, fontSize: "13px", lineHeight: 1.5 }}>
        Transfer the exact amount below to complete your sell order.
      </div>

      {/* Amount card */}
      <div
        style={{
          width: "100%",
          background: tokens.sectionBg,
          border: tokens.sectionBorder,
          borderRadius: tokens.sectionRadius,
          padding: "14px 16px",
          textAlign: "left",
        }}
      >
        <div style={{ color: tokens.textMuted, fontSize: "11px", marginBottom: "4px" }}>
          Amount to send
        </div>
        <div style={{ color: tokens.textPrimary, fontSize: "26px", fontWeight: 700 }}>
          {sourceAmount} {sourceCurrencyCode}
        </div>
      </div>

      {/* Destination address card */}
      <div
        style={{
          width: "100%",
          background: tokens.sectionBg,
          border: tokens.sectionBorder,
          borderRadius: tokens.sectionRadius,
          padding: "14px 16px",
          textAlign: "left",
        }}
      >
        <div style={{ color: tokens.textMuted, fontSize: "11px", marginBottom: "4px" }}>
          Send to address
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
          <div
            style={{
              color: tokens.textPrimary,
              fontSize: "13px",
              fontWeight: 500,
              fontFamily: "monospace",
              wordBreak: "break-all",
              flex: 1,
            }}
          >
            {truncateAddress(destinationWalletAddress)}
          </div>
          <button
            onClick={copyAddress}
            style={{
              flexShrink: 0,
              background: tokens.pillBg,
              border: tokens.pillBorder,
              borderRadius: "6px",
              padding: "4px 10px",
              fontSize: "11px",
              fontWeight: 600,
              color: copied ? tokens.successColor : tokens.textSecondary,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      {/* Warning */}
      <div
        style={{
          width: "100%",
          color: tokens.textMuted,
          fontSize: "11px",
          lineHeight: 1.5,
          background: `${tokens.errorColor}18`,
          border: `1px solid ${tokens.errorColor}44`,
          borderRadius: "8px",
          padding: "10px 12px",
          textAlign: "left",
        }}
      >
        Send <strong>{sourceAmount} {sourceCurrencyCode}</strong> exactly. Wrong amount or address = lost funds.
      </div>

      {/* Confirm button */}
      <button
        onClick={handleConfirm}
        disabled={confirming}
        style={{
          width: "100%",
          borderRadius: tokens.inputRadius,
          padding: "14px 0",
          fontSize: "15px",
          fontWeight: 700,
          background: tokens.accentBg,
          color: tokens.accentText,
          border: "none",
          cursor: confirming ? "not-allowed" : "pointer",
          opacity: confirming ? 0.7 : 1,
          boxShadow: tokens.accentShadow,
        }}
      >
        {confirming ? "Processing…" : "I've sent the crypto"}
      </button>

      {/* Cancel */}
      <button
        onClick={resetTransaction}
        style={{
          background: "transparent",
          border: "none",
          color: tokens.textMuted,
          fontSize: "13px",
          cursor: "pointer",
          padding: "4px 0",
        }}
      >
        Cancel
      </button>
    </div>
  );
}
