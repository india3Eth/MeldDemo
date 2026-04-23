"use client";

import { useState, useRef, useEffect } from "react";
import { BaseModal } from "./BaseModal";
import { useWidget } from "@/contexts/WidgetContext";
import { useTheme } from "@/themes/ThemeProvider";
import { useTransactionList } from "@/hooks/use-transaction-list";
import { useTransaction } from "@/hooks/use-transaction";
import { STATUS_CONFIG, StatusBadge } from "@/components/widget/StatusBadge";
import type { Transaction } from "@/lib/meld/types";

// =============================================================================
// TransactionHistoryModal — slides up from bottom like other modals
// List view → click row → detail view (back returns to list)
// =============================================================================

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialTxId?: string | null;
}

function formatAmount(value: number | null | undefined): string {
  if (value == null || isNaN(value as number)) return "—";
  return parseFloat((value as number).toFixed(6)).toString();
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " · " +
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  );
}

// ── Transaction row in list ──────────────────────────────────────────────────

function TxRow({ tx, onClick }: { tx: Transaction; onClick: () => void }) {
  const { tokens } = useTheme();
  const [hovered, setHovered] = useState(false);
  const statusColor = STATUS_CONFIG[tx.status]?.color ?? "#6b7280";

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: "10px",
        padding: "10px 8px",
        borderRadius: "10px",
        cursor: "pointer",
        background: hovered ? tokens.hoverBg : "transparent",
        transition: "background 0.15s ease",
        marginLeft: "-8px", marginRight: "-8px",
      }}
    >
      {/* Status accent bar */}
      <div style={{
        width: "3px", height: "36px", borderRadius: "2px",
        background: statusColor, flexShrink: 0, opacity: 0.8,
      }} />

      {/* Amount + date */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          color: tokens.textPrimary, fontSize: "13px", fontWeight: 600,
          fontVariantNumeric: "tabular-nums",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {formatAmount(tx.sourceAmount)} {tx.sourceCurrencyCode ?? ""}
          <span style={{ color: tokens.textMuted, fontWeight: 400 }}> → </span>
          {formatAmount(tx.destinationAmount)} {tx.destinationCurrencyCode ?? ""}
        </div>
        <div style={{ color: tokens.textMuted, fontSize: "11px", marginTop: "2px" }}>
          {formatDate(tx.createdAt)}
        </div>
      </div>

      {/* Badge + arrow */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px", flexShrink: 0 }}>
        <StatusBadge status={tx.status} />
        <span style={{ color: tokens.textMuted, fontSize: "10px" }}>{tx.serviceProvider}</span>
      </div>
    </div>
  );
}

// ── Skeleton row ─────────────────────────────────────────────────────────────

function SkeletonRow() {
  const { tokens } = useTheme();
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "10px",
      padding: "10px 0",
      borderBottom: `1px solid ${tokens.dividerColor}`,
    }}>
      <div style={{ width: "3px", height: "36px", borderRadius: "2px", background: tokens.dividerColor }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{
          height: "12px", width: "45%", borderRadius: "6px",
          background: "linear-gradient(90deg, rgba(128,128,128,0.08) 25%, rgba(128,128,128,0.15) 50%, rgba(128,128,128,0.08) 75%)",
          backgroundSize: "300px 100%", animation: "shimmer 1.4s infinite linear",
        }} />
        <div style={{
          height: "10px", width: "28%", borderRadius: "6px",
          background: "linear-gradient(90deg, rgba(128,128,128,0.06) 25%, rgba(128,128,128,0.12) 50%, rgba(128,128,128,0.06) 75%)",
          backgroundSize: "300px 100%", animation: "shimmer 1.4s infinite linear 0.15s",
        }} />
      </div>
      <div style={{
        height: "20px", width: "56px", borderRadius: "999px",
        background: "linear-gradient(90deg, rgba(128,128,128,0.08) 25%, rgba(128,128,128,0.15) 50%, rgba(128,128,128,0.08) 75%)",
        backgroundSize: "300px 100%", animation: "shimmer 1.4s infinite linear 0.08s",
      }} />
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTxType(type: string | null | undefined): string {
  if (!type) return "—";
  return type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatPaymentMethod(pm: string | null | undefined): string {
  if (!pm) return "—";
  return pm.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function truncateHash(hash: string): string {
  return `${hash.slice(0, 10)}…${hash.slice(-8)}`;
}

// ── Reusable detail row ───────────────────────────────────────────────────────

function DetailRow({
  label, value, custom, last = false,
}: {
  label: string; value?: string | null; custom?: React.ReactNode; last?: boolean;
}) {
  const { tokens } = useTheme();
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "9px 14px",
      borderBottom: last ? "none" : `1px solid ${tokens.dividerColor}`,
    }}>
      <span style={{ color: tokens.textMuted, fontSize: "12px", flexShrink: 0 }}>{label}</span>
      {custom ?? (
        <span style={{ color: tokens.textPrimary, fontSize: "12px", fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>
          {value ?? "—"}
        </span>
      )}
    </div>
  );
}

// ── Detail view for a single transaction ─────────────────────────────────────

function TxDetail({ txId, onBack }: { txId: string; onBack: () => void }) {
  const { tokens } = useTheme();
  const { data: tx, isLoading } = useTransaction(txId);
  const [copiedHash, setCopiedHash] = useState(false);

  const status = tx?.status ?? null;
  const cfg = status ? (STATUS_CONFIG[status] ?? { label: status, color: "#6b7280", bg: "#f3f4f6" }) : null;
  const statusIcon = status === "SETTLED" ? "✓" : (status === "FAILED" || status === "DECLINED") ? "✕" : "↻";

  const crypto = tx?.cryptoDetails ?? null;
  const blockchainHash = crypto?.blockchainTransactionId ?? null;
  const totalFeeUsd = crypto?.totalFeeInUsd ?? null;
  const destWallet = crypto?.destinationWalletAddress ?? tx?.externalCustomerId ?? null;

  function copyHash() {
    if (!blockchainHash) return;
    navigator.clipboard.writeText(blockchainHash).then(() => {
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 1500);
    });
  }

  if (isLoading && !tx) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {[60, 100, 48, 48, 48, 48, 48].map((h, i) => (
          <div key={i} style={{
            height: `${h}px`, borderRadius: "10px",
            background: "linear-gradient(90deg, rgba(128,128,128,0.08) 25%, rgba(128,128,128,0.15) 50%, rgba(128,128,128,0.08) 75%)",
            backgroundSize: "600px 100%", animation: "shimmer 1.4s infinite linear",
            animationDelay: `${i * 0.1}s`,
          }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <style>{`
        @keyframes shimmer { 0% { background-position: -300px 0; } 100% { background-position: 300px 0; } }
      `}</style>

      {/* Back */}
      <button
        onClick={onBack}
        style={{
          background: tokens.pillBg, border: tokens.pillBorder,
          borderRadius: "8px", padding: "5px 12px",
          fontSize: "12px", fontWeight: 500, color: tokens.textSecondary,
          cursor: "pointer", alignSelf: "flex-start",
        }}
      >
        ← Back to list
      </button>

      {/* Status hero */}
      {cfg && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "4px 0" }}>
          <div style={{
            width: "44px", height: "44px", borderRadius: "50%",
            background: cfg.bg, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "18px", fontWeight: 700, color: cfg.color,
          }}>
            {statusIcon}
          </div>
          <div style={{ color: cfg.color, fontSize: "13px", fontWeight: 600 }}>{cfg.label}</div>
        </div>
      )}

      {/* Amount hero */}
      {tx && (
        <div style={{
          textAlign: "center", padding: "14px",
          background: tokens.sectionBg, border: tokens.sectionBorder, borderRadius: tokens.sectionRadius,
        }}>
          <div style={{ color: tokens.textPrimary, fontSize: "22px", fontWeight: 700, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>
            {formatAmount(tx.sourceAmount)} {tx.sourceCurrencyCode}
          </div>
          <div style={{ color: tokens.textMuted, fontSize: "12px", margin: "3px 0" }}>→</div>
          <div style={{ color: tokens.textPrimary, fontSize: "17px", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
            {formatAmount(tx.destinationAmount)} {tx.destinationCurrencyCode}
          </div>
        </div>
      )}

      {/* Transaction details card */}
      {tx && (
        <div style={{ background: tokens.sectionBg, border: tokens.sectionBorder, borderRadius: tokens.sectionRadius, overflow: "hidden" }}>
          <DetailRow label="Provider" value={tx.serviceProvider} />
          <DetailRow label="Type" value={formatTxType(tx.transactionType)} />
          {tx.paymentMethodType && (
            <DetailRow label="Payment" value={formatPaymentMethod(tx.paymentMethodType)} />
          )}
          <DetailRow label="Date" value={formatDate(tx.createdAt)} />
          <DetailRow
            label="Status"
            custom={<StatusBadge status={tx.status} />}
          />
          {totalFeeUsd != null && (
            <DetailRow label="Total Fee" value={`$${totalFeeUsd.toFixed(2)} USD`} />
          )}
          {destWallet && (
            <DetailRow
              label="Wallet"
              custom={
                <span style={{
                  color: tokens.textSecondary, fontSize: "11px", fontFamily: "monospace",
                  maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis",
                  whiteSpace: "nowrap", display: "inline-block",
                }}>
                  {destWallet.length > 18 ? `${destWallet.slice(0, 8)}…${destWallet.slice(-6)}` : destWallet}
                </span>
              }
            />
          )}
          {blockchainHash && (
            <DetailRow
              label="TX Hash"
              last
              custom={
                <button
                  onClick={copyHash}
                  title={blockchainHash}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: tokens.textSecondary, fontSize: "11px",
                    fontFamily: "monospace", display: "flex", alignItems: "center", gap: "4px",
                  }}
                >
                  {truncateHash(blockchainHash)}
                  <span style={{ fontSize: "10px", opacity: 0.6 }}>{copiedHash ? "✓" : "📋"}</span>
                </button>
              }
            />
          )}
        </div>
      )}
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────

export function TransactionHistoryModal({ isOpen, onClose, initialTxId }: Props) {
  const { walletAddress } = useWidget();

  const [walletInput, setWalletInput] = useState(walletAddress);
  const [debouncedWallet, setDebouncedWallet] = useState(walletAddress);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, isLoading, error } = useTransactionList(debouncedWallet.trim() || null);
  const transactions = data?.transactions ?? [];

  function handleWalletChange(val: string) {
    setWalletInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedWallet(val), 500);
  }

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  // Sync wallet address + set initial tx when modal opens; reset on close
  useEffect(() => {
    if (isOpen) {
      setWalletInput(walletAddress);
      setDebouncedWallet(walletAddress);
      if (initialTxId) setSelectedTxId(initialTxId);
    } else {
      setSelectedTxId(null);
    }
  }, [isOpen, walletAddress, initialTxId]);

  const { tokens } = useTheme();

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={selectedTxId ? "Transaction Detail" : "Transaction History"}
      searchPlaceholder={selectedTxId ? undefined : "Wallet address / customer ID"}
      searchValue={selectedTxId ? undefined : walletInput}
      onSearchChange={selectedTxId ? undefined : handleWalletChange}
    >
      <style>{`
        @keyframes shimmer { 0% { background-position: -300px 0; } 100% { background-position: 300px 0; } }
      `}</style>

      {/* ── Detail view ── */}
      {selectedTxId && (
        <TxDetail txId={selectedTxId} onBack={() => setSelectedTxId(null)} />
      )}

      {/* ── List view ── */}
      {!selectedTxId && (
        <>
          {isLoading && (
            <>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </>
          )}

          {!isLoading && error && (
            <div style={{ color: "#dc2626", fontSize: "12px", textAlign: "center", padding: "24px 0" }}>
              Failed to load transactions
            </div>
          )}

          {!isLoading && !error && !debouncedWallet.trim() && (
            <div style={{ color: tokens.textMuted, fontSize: "13px", textAlign: "center", padding: "32px 0", lineHeight: 1.5 }}>
              Enter your wallet address above<br />to view transaction history
            </div>
          )}

          {!isLoading && !error && debouncedWallet.trim() && transactions.length === 0 && (
            <div style={{ color: tokens.textMuted, fontSize: "13px", textAlign: "center", padding: "32px 0" }}>
              No transactions found
            </div>
          )}

          {!isLoading && transactions.map((tx) => (
            <TxRow key={tx.id} tx={tx} onClick={() => setSelectedTxId(tx.id)} />
          ))}
        </>
      )}
    </BaseModal>
  );
}
