import { NextRequest, NextResponse } from "next/server";
import type { WebhookEvent } from "@/lib/meld/types";
import { createServerClient } from "@/lib/supabase";

// =============================================================================
// Meld Webhook Handler
// =============================================================================
// Receives real-time transaction status updates from Meld.
// Verifies HMAC-SHA256 signatures to ensure authenticity.
//
// Docs: https://docs.meld.io/docs/webhooks-authentication
// =============================================================================

/**
 * POST /api/webhooks/meld
 *
 * Meld sends webhook events here when transaction statuses change.
 * The signature is verified using HMAC-SHA256 with your webhook secret.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.MELD_WEBHOOK_SECRET;
  if (!secret) {
    console.error("MELD_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  // Read raw body for signature verification
  const rawBody = await req.text();
  const signature = req.headers.get("meld-signature");
  const timestamp = req.headers.get("meld-signature-timestamp");

  if (!signature || !timestamp) {
    return NextResponse.json({ error: "Missing signature headers" }, { status: 401 });
  }

  // Verify HMAC-SHA256 signature
  // Formula: base64url(HMAC-SHA256(timestamp.url.body))
  const url = req.url;
  const payload = `${timestamp}.${url}.${rawBody}`;
  const isValid = await verifySignature(payload, signature, secret);

  if (!isValid) {
    console.error("Webhook signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Parse the verified event
  const event: WebhookEvent = JSON.parse(rawBody);

  // Persist to Supabase — powers Realtime subscription on the frontend
  const serverSupabase = createServerClient();
  await serverSupabase.from("transactions").insert({
    session_id: event.payload.externalSessionId,
    event_type: event.eventType,
    event_id: event.eventId,
    transaction_id: event.payload.paymentTransactionId ?? null,
    status: event.payload.paymentTransactionStatus,
    raw_event: event,
  });

  // Handle the event based on type
  await handleWebhookEvent(event);

  // Always return 200 to acknowledge receipt
  return NextResponse.json({ received: true });
}

// ---------------------------------------------------------------------------
// Signature verification using Web Crypto API
// ---------------------------------------------------------------------------

async function verifySignature(
  payload: string,
  expectedSignature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload)
  );

  // Base64 URL encode with padding (per Meld spec)
  const computed = base64UrlEncode(new Uint8Array(signatureBytes));
  return computed === expectedSignature;
}

function base64UrlEncode(bytes: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  // Meld uses base64url with padding, so we keep the '=' chars
}

// ---------------------------------------------------------------------------
// Event handler — extend this with your business logic
// ---------------------------------------------------------------------------

async function handleWebhookEvent(event: WebhookEvent): Promise<void> {
  const { eventType, payload, eventId } = event;

  console.log(`[Webhook] ${eventType} | event=${eventId} | tx=${payload.paymentTransactionId}`);

  switch (eventType) {
    case "TRANSACTION_CRYPTO_PENDING":
      // Transaction created, user started the payment flow
      console.log(`Transaction ${payload.paymentTransactionId} is pending`);
      break;

    case "TRANSACTION_CRYPTO_TRANSFERRING":
      // Payment approved, crypto is being transferred
      console.log(`Transaction ${payload.paymentTransactionId} is settling`);
      break;

    case "TRANSACTION_CRYPTO_COMPLETE":
      // Crypto delivered successfully
      console.log(`Transaction ${payload.paymentTransactionId} completed`);
      break;

    case "TRANSACTION_CRYPTO_FAILED":
      // Transaction failed
      console.error(`Transaction ${payload.paymentTransactionId} failed`);
      break;

    case "CUSTOMER_KYC_STATUS_CHANGE":
      // KYC status updated
      console.log(`KYC status changed for customer ${payload.customerId}`);
      break;
  }

  // TODO: Send email/push notifications for completed/failed transactions
}
