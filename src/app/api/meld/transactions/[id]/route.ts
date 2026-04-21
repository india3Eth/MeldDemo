import { NextRequest, NextResponse } from "next/server";
import { meldClient, MeldApiError } from "@/lib/meld/client";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await meldClient.getTransaction(id);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof MeldApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
