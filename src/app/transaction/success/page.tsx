"use client";

import { useEffect } from "react";

// =============================================================================
// /transaction/success — auto-closes the provider tab
// =============================================================================
// The provider redirects here after the user completes or cancels.
// We close this tab so the user lands back on the original app tab.
// Fallback: if window.close() is blocked (tab was not script-opened,
// e.g. user refreshed), redirect to home instead.
// =============================================================================

export default function TransactionSuccessPage() {
  useEffect(() => {
    window.close();
    const t = setTimeout(() => {
      window.location.href = "/";
    }, 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        fontFamily: "sans-serif",
      }}
    >
      <p style={{ color: "#888", fontSize: "14px" }}>Returning to app...</p>
    </div>
  );
}
