"use client";

import { useTheme } from "@/themes/ThemeProvider";
import { useWidget } from "@/contexts/WidgetContext";
import { useTransactions } from "@/hooks/use-transactions";

// =============================================================================
// TransactionsView — shows inside the widget after a transaction completes
// =============================================================================

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  SETTLED:          { label: "Complete",    color: "#16a34a", bg: "#dcfce7" },
  SETTLING:         { label: "Transferring",color: "#2563eb", bg: "#dbeafe" },
  PENDING:          { label: "Pending",     color: "#d97706", bg: "#fef3c7" },
  PENDING_CREATED:  { label: "Created",     color: "#d97706", bg: "#fef3c7" },
  TWO_FA_REQUIRED:  { label: "2FA Required",color: "#7c3aed", bg: "#ede9fe" },
  TWO_FA_PROVIDED:  { label: "Verifying",   color: "#7c3aed", bg: "#ede9fe" },
  FAILED:           { label: "Failed",      color: "#dc2626", bg: "#fee2e2" },
  DECLINED:         { label: "Declined",    color: "#dc2626", bg: "#fee2e2" },
  CANCELLED:        { label: "Cancelled",   color: "#6b7280", bg: "#f3f4f6" },
  REFUNDED:         { label: "Refunded",    color: "#6b7280", bg: "#f3f4f6" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: "#6b7280", bg: "#f3f4f6" };
  return (
    <span
      style={{
        background: cfg.bg,
        color: cfg.color,
        fontSize: "11px",
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: "999px",
      }}
    >
      {cfg.label}
    </span>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    " · " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function shortId(id: string | null): string {
  if (!id) return "—";
  return id.length > 12 ? `${id.slice(0, 6)}…${id.slice(-4)}` : id;
}

export function TransactionsView() {
  const { tokens } = useTheme();
  const { walletAddress, resetTransaction, txPhase, txStatus } = useWidget();
  const { transactions, isLoading } = useTransactions(walletAddress || null);

  const currentStatusCfg = txStatus
    ? (STATUS_CONFIG[txStatus] ?? { label: txStatus, color: "#6b7280", bg: "#f3f4f6" })
    : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <span style={{ color: tokens.textPrimary, fontSize: "17px", fontWeight: 700 }}>
          Transactions
        </span>
        <button
          onClick={resetTransaction}
          style={{
            background: tokens.pillBg,
            border: tokens.pillBorder,
            borderRadius: "8px",
            padding: "6px 14px",
            fontSize: "13px",
            fontWeight: 500,
            color: tokens.textPrimary,
            cursor: "pointer",
          }}
        >
          ← New
        </button>
      </div>

      {/* Current transaction result banner */}
      {txPhase !== "idle" && currentStatusCfg && (
        <div
          className="mb-4 rounded-xl p-4"
          style={{ background: currentStatusCfg.bg, border: `1px solid ${currentStatusCfg.color}22` }}
        >
          <div style={{ color: currentStatusCfg.color, fontSize: "13px", fontWeight: 600 }}>
            {txPhase === "timeout"
              ? "Transaction is taking longer than expected"
              : currentStatusCfg.label}
          </div>
          {txPhase === "timeout" && (
            <div style={{ color: currentStatusCfg.color, fontSize: "12px", marginTop: "2px", opacity: 0.8 }}>
              Check your email for updates from the provider
            </div>
          )}
        </div>
      )}

      {/* History list */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {isLoading && (
          <div style={{ color: tokens.textMuted, fontSize: "13px", textAlign: "center", padding: "24px 0" }}>
            Loading history...
          </div>
        )}

        {!isLoading && transactions.length === 0 && (
          <div style={{ color: tokens.textMuted, fontSize: "13px", textAlign: "center", padding: "24px 0" }}>
            No transaction history yet
          </div>
        )}

        {!isLoading && transactions.map((tx) => (
          <div
            key={tx.session_id}
            className="mb-2.5 rounded-xl p-3.5"
            style={{ border: `1.5px solid ${tokens.dividerColor}`, background: "transparent" }}
          >
            <div className="flex items-center justify-between">
              <div style={{ color: tokens.textPrimary, fontSize: "13px", fontWeight: 500 }}>
                {shortId(tx.transaction_id)}
              </div>
              <StatusBadge status={tx.status} />
            </div>
            <div style={{ color: tokens.textMuted, fontSize: "11px", marginTop: "4px" }}>
              {formatDate(tx.created_at)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
