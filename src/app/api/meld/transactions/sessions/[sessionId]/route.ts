import { NextRequest, NextResponse } from "next/server";
import { meldClient, MeldApiError } from "@/lib/meld/client";

// Force-fetch endpoint for the SELL preferred flow.
// Called immediately after the provider redirects the user back — before a webhook
// has fired — to get the exact token, amount, and destination wallet for the transfer.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const data = await meldClient.getTransactionBySession(sessionId) as { transaction?: unknown };
    return NextResponse.json(data?.transaction ?? data);
  } catch (error) {
    if (error instanceof MeldApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
