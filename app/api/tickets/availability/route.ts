import { NextResponse } from "next/server";

import { createRequestContext } from "@/lib/api-logging";
import { getEarlyBirdAvailability } from "@/lib/sales-db";

export const dynamic = "force-dynamic";

export async function GET() {
  const request = createRequestContext("/api/tickets/availability");

  try {
    const earlyBirdMabuza = await getEarlyBirdAvailability();
    request.log(200, {
      earlyBirdSold: earlyBirdMabuza.sold,
      earlyBirdRemaining: earlyBirdMabuza.remaining,
      earlyBirdSource: earlyBirdMabuza.source
    });

    return NextResponse.json(
      {
        provider: "kv",
        updatedAt: new Date().toISOString(),
        earlyBirdMabuza,
        requestId: request.requestId
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0"
        }
      }
    );
  } catch (error) {
    request.log(503, {
      error: error instanceof Error ? error.message : "unknown_error"
    });

    return NextResponse.json(
      {
        error: "availability_unavailable",
        provider: "kv",
        updatedAt: new Date().toISOString(),
        requestId: request.requestId
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store, max-age=0"
        }
      }
    );
  }
}
