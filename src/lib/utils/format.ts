// =============================================================================
// Shared Formatters
// =============================================================================

/** Convert "TRANSAK" → "Transak", "MOONPAY" → "Moonpay" */
export function formatProviderName(raw: string): string {
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}

/**
 * Format a crypto/fiat amount for display, stripping trailing zeros.
 * Preserves up to 6 decimal places of precision.
 * Examples: 288.120000 → "288.12",  100.000000 → "100",  0.000001 → "0.000001"
 */
export function formatAmount(value: number): string {
  return parseFloat(value.toFixed(6)).toString();
}
