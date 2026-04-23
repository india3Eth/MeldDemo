"use client";

export const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  SETTLED:         { label: "Complete",     color: "#16a34a", bg: "#dcfce7" },
  SETTLING:        { label: "Transferring", color: "#2563eb", bg: "#dbeafe" },
  PENDING:         { label: "Pending",      color: "#d97706", bg: "#fef3c7" },
  PENDING_CREATED: { label: "Created",      color: "#d97706", bg: "#fef3c7" },
  TWO_FA_REQUIRED: { label: "2FA Required", color: "#7c3aed", bg: "#ede9fe" },
  TWO_FA_PROVIDED: { label: "Verifying",    color: "#7c3aed", bg: "#ede9fe" },
  FAILED:          { label: "Failed",       color: "#dc2626", bg: "#fee2e2" },
  DECLINED:        { label: "Declined",     color: "#dc2626", bg: "#fee2e2" },
  CANCELLED:       { label: "Cancelled",    color: "#6b7280", bg: "#f3f4f6" },
  REFUNDED:        { label: "Refunded",     color: "#6b7280", bg: "#f3f4f6" },
};

export function StatusBadge({ status }: { status: string }) {
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
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
      }}
    >
      {cfg.label}
    </span>
  );
}
