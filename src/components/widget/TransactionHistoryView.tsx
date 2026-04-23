"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/themes/ThemeProvider";
import { useWidget } from "@/contexts/WidgetContext";
import { useTransactionList } from "@/hooks/use-transaction-list";
import { STATUS_CONFIG, StatusBadge } from "./StatusBadge";
import type { Transaction } from "@/lib/meld/types";
import type { ThemeTokens } from "@/themes/types";

// =============================================================================
// TransactionHistoryView — list of all transactions for a customer
// =============================================================================

interface Props {
  onSelectTx: (txId: string) => void;
  onNew: () => void;
}

function formatAmount(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return "—";
  return parseFloat(value.toFixed(6)).toString();
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    " · " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function SkeletonRow({ tokens }: { tokens: ThemeTokens }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "12px",
      padding: "12px 0",
      borderBottom: `1px solid ${tokens.dividerColor}`,
    }}>
      <div style={{ width: "3px", height: "40px", borderRadius: "2px", background: tokens.dividerColor }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{
          height: "13px", width: "40%", borderRadius: "6px",
          background: "linear-gradient(90deg, rgba(128,128,128,0.08) 25%, rgba(128,128,128,0.15) 50%, rgba(128,128,128,0.08) 75%)",
          backgroundSize: "300px 100%",
          animation: "shimmer 1.4s infinite linear",
        }} />
        <div style={{
          height: "11px", width: "25%", borderRadius: "6px",
          background: "linear-gradient(90deg, rgba(128,128,128,0.06) 25%, rgba(128,128,128,0.12) 50%, rgba(128,128,128,0.06) 75%)",
          backgroundSize: "300px 100%",
          animation: "shimmer 1.4s infinite linear 0.15s",
        }} />
      </div>
      <div style={{
        height: "22px", width: "60px", borderRadius: "999px",
        background: "linear-gradient(90deg, rgba(128,128,128,0.08) 25%, rgba(128,128,128,0.15) 50%, rgba(128,128,128,0.08) 75%)",
        backgroundSize: "300px 100%",
        animation: "shimmer 1.4s infinite linear 0.08s",
      }} />
    </div>
  );
}

function TxRow({ tx, tokens, onClick }: { tx: Transaction; tokens: ThemeTokens; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const statusColor = STATUS_CONFIG[tx.status]?.color ?? "#6b7280";

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: "12px",
        padding: "12px 8px",
        borderRadius: "10px",
        cursor: "pointer",
        background: hovered ? tokens.hoverBg : "transparent",
        transition: "background 0.15s ease",
        marginLeft: "-8px", marginRight: "-8px",
      }}
    >
      {/* Status accent bar */}
      <div style={{
        width: "3px", height: "40px", borderRadius: "2px",
        background: statusColor, flexShrink: 0,
        opacity: 0.8,
      }} />

      {/* Left: amount + date */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          color: tokens.textPrimary,
          fontSize: "13px", fontWeight: 600,
          fontVariantNumeric: "tabular-nums",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {formatAmount(tx.sourceAmount)} {tx.sourceCurrencyCode ?? ""}
          <span style={{ color: tokens.textMuted, fontWeight: 400 }}> → </span>
          {formatAmount(tx.destinationAmount)} {tx.destinationCurrencyCode ?? ""}
        </div>
        <div style={{ color: tokens.textMuted, fontSize: "11px", marginTop: "2px" }}>
          {formatDate(tx.createdAt)} · {tx.serviceProvider}
        </div>
      </div>

      {/* Right: status badge + arrow */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
        <StatusBadge status={tx.status} />
        <span style={{ color: tokens.textMuted, fontSize: "11px" }}>›</span>
      </div>
    </div>
  );
}

export function TransactionHistoryView({ onSelectTx, onNew }: Props) {
  const { tokens } = useTheme();
  const { walletAddress } = useWidget();

  const [walletInput, setWalletInput] = useState(walletAddress);
  const [debouncedWallet, setDebouncedWallet] = useState(walletAddress);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, isLoading, error } = useTransactionList(debouncedWallet.trim() || null);
  const transactions = data?.transactions ?? [];

  function handleWalletChange(val: string) {
    setWalletInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedWallet(val), 500);
  }

  // Cleanup debounce on unmount
  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -300px 0; }
          100% { background-position: 300px 0; }
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", height: "100%", animation: "fadeIn 0.22s ease" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <span style={{ color: tokens.textPrimary, fontSize: "17px", fontWeight: 700 }}>
            History
          </span>
          <button
            onClick={onNew}
            style={{
              background: tokens.accentBg,
              border: "none",
              borderRadius: "8px",
              padding: "5px 12px",
              fontSize: "12px",
              fontWeight: 600,
              color: tokens.accentText,
              cursor: "pointer",
            }}
          >
            + New
          </button>
        </div>

        {/* Wallet address input */}
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          background: tokens.inputBg,
          border: tokens.inputBorder,
          borderRadius: tokens.inputRadius ?? "12px",
          padding: "8px 12px",
          marginBottom: "14px",
        }}>
          <span style={{ color: tokens.textMuted, fontSize: "14px", flexShrink: 0 }}>🔍</span>
          <input
            type="text"
            value={walletInput}
            onChange={(e) => handleWalletChange(e.target.value)}
            placeholder="Wallet address / customer ID"
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              fontSize: "12px",
              color: tokens.textPrimary,
              minWidth: 0,
            }}
          />
          {walletInput && (
            <button
              onClick={() => handleWalletChange("")}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: tokens.textMuted, fontSize: "14px", lineHeight: 1,
                padding: "0 2px", flexShrink: 0,
              }}
            >
              ×
            </button>
          )}
        </div>

        {/* Transaction list */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {isLoading && (
            <>
              <SkeletonRow tokens={tokens} />
              <SkeletonRow tokens={tokens} />
              <SkeletonRow tokens={tokens} />
            </>
          )}

          {!isLoading && error && (
            <div style={{ color: "#dc2626", fontSize: "12px", textAlign: "center", padding: "24px 0" }}>
              Failed to load transactions
            </div>
          )}

          {!isLoading && !error && !debouncedWallet.trim() && (
            <div style={{ color: tokens.textMuted, fontSize: "13px", textAlign: "center", padding: "32px 0", lineHeight: 1.5 }}>
              Enter a wallet address above<br />to view transaction history
            </div>
          )}

          {!isLoading && !error && debouncedWallet.trim() && transactions.length === 0 && (
            <div style={{ color: tokens.textMuted, fontSize: "13px", textAlign: "center", padding: "32px 0" }}>
              No transactions found
            </div>
          )}

          {!isLoading && transactions.map((tx) => (
            <TxRow
              key={tx.id}
              tx={tx}
              tokens={tokens}
              onClick={() => onSelectTx(tx.id)}
            />
          ))}
        </div>
      </div>
    </>
  );
}
