"use client";

// Status color is a solid hex used as text color.
// Background is derived at render time as `color + 18` (≈ 9% opacity hex),
// which blends naturally into any theme — light or dark.
export const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  SETTLED:         { label: "Complete",     color: "#16a34a" },
  SETTLING:        { label: "Transferring", color: "#2563eb" },
  PENDING:         { label: "Pending",      color: "#d97706" },
  PENDING_CREATED: { label: "Created",      color: "#d97706" },
  TWO_FA_REQUIRED: { label: "2FA Required", color: "#7c3aed" },
  TWO_FA_PROVIDED: { label: "Verifying",    color: "#7c3aed" },
  FAILED:          { label: "Failed",       color: "#dc2626" },
  DECLINED:        { label: "Declined",     color: "#dc2626" },
  CANCELLED:       { label: "Cancelled",    color: "#6b7280" },
  REFUNDED:        { label: "Refunded",     color: "#6b7280" },
};

const FALLBACK = { label: "", color: "#6b7280" };

export function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { ...FALLBACK, label: status };
  // Append 18 (hex alpha ≈ 9%) to the color for a semi-transparent bg
  const bg = cfg.color + "18";
  return (
    <span
      style={{
        background: bg,
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
