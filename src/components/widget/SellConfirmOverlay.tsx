"use client";

import { useState, useCallback } from "react";
import QRCode from "react-qr-code";
import { useWidget } from "@/contexts/WidgetContext";
import { useTheme } from "@/themes/ThemeProvider";

// =============================================================================
// SellConfirmOverlay — shown after provider redirects back in SELL preferred flow
// =============================================================================

function truncateAddress(addr: string): string {
  if (addr.length <= 20) return addr;
  return `${addr.slice(0, 10)}…${addr.slice(-10)}`;
}

export function SellConfirmOverlay() {
  const { tokens } = useTheme();
  const { sellConfirmData, confirmSellTransfer, resetTransaction } = useWidget();
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const copyAddress = useCallback(() => {
    if (!sellConfirmData?.walletAddress) return;
    navigator.clipboard.writeText(sellConfirmData.walletAddress).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [sellConfirmData?.walletAddress]);

  const handleConfirm = useCallback(async () => {
    setConfirming(true);
    await confirmSellTransfer();
    setConfirming(false);
  }, [confirmSellTransfer]);

  if (!sellConfirmData) return null;

  const {
    partnerOrderId,
    cryptoCurrency,
    fiatCurrency,
    cryptoAmount,
    fiatAmount,
    walletAddress,
    totalFeeInFiat,
    network,
  } = sellConfirmData;

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
        overflowY: "auto",
        padding: "24px",
        zIndex: 10,
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <div style={{ fontSize: "28px", marginBottom: "6px" }}>↗</div>
        <div style={{ color: tokens.textPrimary, fontSize: "17px", fontWeight: 700 }}>
          Send your crypto
        </div>
        <div style={{ color: tokens.textMuted, fontSize: "11px", marginTop: "4px" }}>
          Order ID: {partnerOrderId}
        </div>
      </div>

      {/* Trade summary */}
      <div
        style={{
          background: tokens.sectionBg,
          border: tokens.sectionBorder,
          borderRadius: tokens.sectionRadius,
          padding: "12px 14px",
          marginBottom: "10px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* You send */}
        <div style={{ textAlign: "center" }}>
          <div style={{ color: tokens.textMuted, fontSize: "10px", marginBottom: "2px" }}>You send</div>
          <div style={{ color: tokens.errorColor, fontSize: "18px", fontWeight: 700 }}>
            {cryptoAmount} {cryptoCurrency}
          </div>
          {network && (
            <div style={{ color: tokens.textMuted, fontSize: "10px", marginTop: "1px" }}>
              on {network}
            </div>
          )}
        </div>

        <div style={{ color: tokens.textMuted, fontSize: "16px" }}>→</div>

        {/* You receive */}
        <div style={{ textAlign: "center" }}>
          <div style={{ color: tokens.textMuted, fontSize: "10px", marginBottom: "2px" }}>You receive</div>
          <div style={{ color: tokens.successColor, fontSize: "18px", fontWeight: 700 }}>
            {fiatAmount} {fiatCurrency}
          </div>
          {totalFeeInFiat != null && (
            <div style={{ color: tokens.textMuted, fontSize: "10px", marginTop: "1px" }}>
              fee: {totalFeeInFiat} {fiatCurrency}
            </div>
          )}
        </div>
      </div>

      {/* QR code */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          padding: "12px",
          display: "flex",
          justifyContent: "center",
          marginBottom: "10px",
        }}
      >
        <QRCode value={walletAddress} size={160} />
      </div>

      {/* Wallet address */}
      <div
        style={{
          background: tokens.sectionBg,
          border: tokens.sectionBorder,
          borderRadius: tokens.sectionRadius,
          padding: "12px 14px",
          marginBottom: "10px",
        }}
      >
        <div style={{ color: tokens.textMuted, fontSize: "10px", marginBottom: "6px" }}>
          Send {cryptoCurrency} to this address
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              color: tokens.textPrimary,
              fontSize: "12px",
              fontWeight: 500,
              fontFamily: "monospace",
              flex: 1,
              wordBreak: "break-all",
            }}
          >
            {truncateAddress(walletAddress)}
          </div>
          <button
            onClick={copyAddress}
            style={{
              flexShrink: 0,
              background: tokens.pillBg,
              border: tokens.pillBorder,
              borderRadius: "6px",
              padding: "5px 10px",
              fontSize: "11px",
              fontWeight: 600,
              color: copied ? tokens.successColor : tokens.textSecondary,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Warning */}
      <div
        style={{
          color: tokens.textMuted,
          fontSize: "11px",
          lineHeight: 1.5,
          background: `${tokens.errorColor}18`,
          border: `1px solid ${tokens.errorColor}44`,
          borderRadius: "8px",
          padding: "9px 12px",
          marginBottom: "14px",
        }}
      >
        Send exactly <strong>{cryptoAmount} {cryptoCurrency}</strong>. Wrong amount or address = lost funds.
      </div>

      {/* Confirm */}
      <button
        onClick={handleConfirm}
        disabled={confirming}
        style={{
          width: "100%",
          borderRadius: tokens.inputRadius,
          padding: "13px 0",
          fontSize: "15px",
          fontWeight: 700,
          background: tokens.accentBg,
          color: tokens.accentText,
          border: "none",
          cursor: confirming ? "not-allowed" : "pointer",
          opacity: confirming ? 0.7 : 1,
          boxShadow: tokens.accentShadow,
          marginBottom: "10px",
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
          textAlign: "center",
        }}
      >
        Cancel
      </button>
    </div>
  );
}
