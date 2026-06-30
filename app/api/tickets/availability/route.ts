import { NextResponse } from "next/server";
import { events } from "@/data/content";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    provider: "static",
    updatedAt: new Date().toISOString(),
    events: events.map((event) => ({
      id: event.id,
      status: event.ticketStatus
    }))
  });
}
