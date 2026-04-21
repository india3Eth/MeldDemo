import { NextRequest, NextResponse } from "next/server";
import { MeldApiError } from "@/lib/meld/client";

// =============================================================================
// API Proxy Factories
// =============================================================================
// Eliminates boilerplate from route files. Each route becomes a one-liner:
//
//   export const GET = createGetProxy(meldClient.getCountries);
//   export const POST = createPostProxy(meldClient.getQuote);
// =============================================================================

type QueryParams = Record<string, string | number | boolean | undefined>;

function errorResponse(error: unknown): NextResponse {
  if (error instanceof MeldApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

/** Creates a GET route handler that forwards query params to a meldClient method */
export function createGetProxy(handler: (params: QueryParams) => Promise<unknown>) {
  return async function GET(req: NextRequest) {
    try {
      const params = Object.fromEntries(req.nextUrl.searchParams.entries());
      const data = await handler(params);
      return NextResponse.json(data);
    } catch (error) {
      return errorResponse(error);
    }
  };
}

/** Creates a POST route handler that forwards the JSON body to a meldClient method */
export function createPostProxy<B>(handler: (body: B) => Promise<unknown>) {
  return async function POST(req: NextRequest) {
    try {
      const body = (await req.json()) as B;
      const data = await handler(body);
      return NextResponse.json(data);
    } catch (error) {
      return errorResponse(error);
    }
  };
}
