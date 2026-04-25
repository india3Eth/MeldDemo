"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

// =============================================================================
// /transaction/success — provider redirects here after KYC / completion
//
// BUY flow:  provider redirected after transaction complete → just close the tab
// SELL flow: provider redirected after KYC complete (redirectFlow: true) →
//            broadcast all URL params to the main window via BroadcastChannel,
//            then close the tab. Main window picks these up to start the
//            "complete your transfer" screen.
// =============================================================================

function SuccessInner() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Collect every param Meld appended to the redirectUrl
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    // Notify the main window (works even when opened with noopener)
    try {
      const bc = new BroadcastChannel("meld_sell_redirect");
      bc.postMessage({ type: "MELD_SELL_REDIRECT", params });
      bc.close();
    } catch {
      // BroadcastChannel not supported — fallback to localStorage event
      localStorage.setItem(
        "meld_sell_redirect",
        JSON.stringify({ ts: Date.now(), params })
      );
    }

    // Close this tab; fallback redirect if close() is blocked
    window.close();
    const t = setTimeout(() => {
      window.location.href = "/";
    }, 300);
    return () => clearTimeout(t);
  }, [searchParams]);

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
      <p style={{ color: "#888", fontSize: "14px" }}>Returning to app…</p>
    </div>
  );
}

export default function TransactionSuccessPage() {
  return (
    <Suspense>
      <SuccessInner />
    </Suspense>
  );
}
