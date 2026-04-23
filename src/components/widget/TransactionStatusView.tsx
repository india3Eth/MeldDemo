"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/themes/ThemeProvider";
import { useWidget } from "@/contexts/WidgetContext";
import { useTransaction } from "@/hooks/use-transaction";
import { STATUS_CONFIG, StatusBadge } from "./StatusBadge";

// =============================================================================
// TransactionStatusView — full detail view for a single transaction
// =============================================================================

interface Props {
  txId: string | null;
  onBack: () => void;
  onNew: () => void;
}

function formatAmount(value: number): string {
  return parseFloat(value.toFixed(6)).toString();
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " · " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

const ACTIVE_STATUSES = new Set(["SETTLING", "TWO_FA_REQUIRED", "TWO_FA_PROVIDED", "PENDING"]);

const STATUS_ICON: Record<string, string> = {
  SETTLED: "✓",
  SETTLING: "↻",
  TWO_FA_REQUIRED: "◎",
  TWO_FA_PROVIDED: "◎",
  FAILED: "✕",
  DECLINED: "✕",
  CANCELLED: "–",
  REFUNDED: "↺",
  PENDING: "○",
  PENDING_CREATED: "○",
};

export function TransactionStatusView({ txId, onBack, onNew }: Props) {
  const { tokens } = useTheme();
  const { txStatus } = useWidget();
  const { data: tx, isLoading, refetch } = useTransaction(txId);
  const prevStatus = useRef(txStatus);
  const [copied, setCopied] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  // Refetch when live status changes (SETTLING → SETTLED etc.)
  useEffect(() => {
    if (txStatus !== prevStatus.current) {
      prevStatus.current = txStatus;
      if (txId) refetch();
    }
  }, [txStatus, refetch, txId]);

  // If no txId after 30s, show email fallback
  useEffect(() => {
    if (txId) return;
    const t = setTimeout(() => setShowFallback(true), 30_000);
    return () => clearTimeout(t);
  }, [txId]);

  const status = tx?.status ?? txStatus ?? null;
  const cfg = status ? (STATUS_CONFIG[status] ?? { label: status, color: "#6b7280", bg: "#f3f4f6" }) : null;
  const icon = status ? (STATUS_ICON[status] ?? "○") : null;
  const isPulsing = status ? ACTIVE_STATUSES.has(status) : false;

  function copyTxId() {
    if (!tx?.id) return;
    navigator.clipboard.writeText(tx.id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 var(--pulse-color); }
          70%  { box-shadow: 0 0 0 10px transparent; }
          100% { box-shadow: 0 0 0 0 transparent; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0%   { background-position: -300px 0; }
          100% { background-position: 300px 0; }
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", height: "100%", animation: "fadeIn 0.22s ease" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <button
            onClick={onBack}
            style={{
              background: tokens.pillBg,
              border: tokens.pillBorder,
              borderRadius: "8px",
              padding: "5px 12px",
              fontSize: "12px",
              fontWeight: 500,
              color: tokens.textSecondary,
              cursor: "pointer",
            }}
          >
            ← History
          </button>
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

        {/* Loading skeleton */}
        {isLoading && !tx && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
            {[80, 120, 56, 56, 56].map((h, i) => (
              <div
                key={i}
                style={{
                  height: `${h}px`,
                  borderRadius: "12px",
                  background: "linear-gradient(90deg, rgba(128,128,128,0.08) 25%, rgba(128,128,128,0.15) 50%, rgba(128,128,128,0.08) 75%)",
                  backgroundSize: "600px 100%",
                  animation: `shimmer 1.4s infinite linear`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* No txId fallback */}
        {!txId && !isLoading && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", textAlign: "center" }}>
            {!showFallback ? (
              <>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  border: `3px solid ${tokens.dividerColor}`,
                  borderTopColor: tokens.textSecondary,
                  animation: "spin 0.8s linear infinite",
                }} />
                <div style={{ color: tokens.textSecondary, fontSize: "14px", fontWeight: 500 }}>
                  Checking transaction status…
                </div>
                <div style={{ color: tokens.textMuted, fontSize: "12px" }}>
                  Waiting for provider confirmation
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: "28px" }}>📧</div>
                <div style={{ color: tokens.textSecondary, fontSize: "14px", fontWeight: 500 }}>
                  Taking longer than expected
                </div>
                <div style={{ color: tokens.textMuted, fontSize: "12px", lineHeight: 1.5 }}>
                  Check your email for updates<br />from the payment provider
                </div>
              </>
            )}
          </div>
        )}

        {/* Transaction detail */}
        {(tx || (status && !isLoading)) && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto" }}>

            {/* Status hero */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "8px 0" }}>
              {cfg && (
                <div
                  style={{
                    width: "52px", height: "52px",
                    borderRadius: "50%",
                    background: cfg.bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "22px", fontWeight: 700, color: cfg.color,
                    // @ts-expect-error CSS custom property
                    "--pulse-color": cfg.color + "55",
                    animation: isPulsing ? "pulse-ring 1.4s ease-out infinite" : "none",
                  }}
                >
                  {icon}
                </div>
              )}
              {cfg && (
                <div style={{ color: cfg.color, fontSize: "13px", fontWeight: 600 }}>
                  {cfg.label}
                </div>
              )}
            </div>

            {/* Amount display */}
            {tx && (
              <div style={{
                textAlign: "center",
                padding: "16px",
                background: tokens.sectionBg,
                border: tokens.sectionBorder,
                borderRadius: tokens.sectionRadius ?? "16px",
              }}>
                <div style={{
                  color: tokens.textPrimary,
                  fontSize: "22px",
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: "-0.02em",
                }}>
                  {formatAmount(tx.sourceAmount)} {tx.sourceCurrencyCode}
                </div>
                <div style={{ color: tokens.textMuted, fontSize: "13px", margin: "4px 0" }}>→</div>
                <div style={{
                  color: tokens.textPrimary,
                  fontSize: "18px",
                  fontWeight: 600,
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {formatAmount(tx.destinationAmount)} {tx.destinationCurrencyCode}
                </div>
              </div>
            )}

            {/* Detail rows */}
            {tx && (
              <div style={{
                background: tokens.sectionBg,
                border: tokens.sectionBorder,
                borderRadius: tokens.sectionRadius ?? "16px",
                overflow: "hidden",
              }}>
                {[
                  { label: "Provider", value: tx.serviceProvider },
                  tx.destinationCurrencyCode && { label: "Asset", value: tx.destinationCurrencyCode },
                  { label: "Date", value: formatDate(tx.createdAt) },
                  {
                    label: "Status",
                    value: null,
                    custom: <StatusBadge status={tx.status} />,
                  },
                  {
                    label: "TX ID",
                    value: null,
                    custom: (
                      <button
                        onClick={copyTxId}
                        title={tx.id}
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          color: tokens.textSecondary, fontSize: "12px",
                          fontFamily: "monospace", display: "flex", alignItems: "center", gap: "4px",
                        }}
                      >
                        {tx.id.slice(0, 10)}…{tx.id.slice(-6)}
                        <span style={{ fontSize: "10px", opacity: 0.6 }}>
                          {copied ? "✓ Copied" : "📋"}
                        </span>
                      </button>
                    ),
                  },
                ].filter(Boolean).map((row, i, arr) => {
                  const r = row as { label: string; value: string | null; custom?: React.ReactNode };
                  return (
                    <div
                      key={r.label}
                      style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "10px 14px",
                        borderBottom: i < arr.length - 1 ? `1px solid ${tokens.dividerColor}` : "none",
                      }}
                    >
                      <span style={{ color: tokens.textMuted, fontSize: "12px" }}>{r.label}</span>
                      {r.custom ?? (
                        <span style={{ color: tokens.textPrimary, fontSize: "12px", fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>
                          {r.value}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
