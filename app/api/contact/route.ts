import { NextResponse } from "next/server";
import type { ContactPayload } from "@/types/contact";

const inquiryTypes = new Set(["הזמנה", "סדנה", "הפקה", "שיתוף פעולה", "חנות"]);

function isContactPayload(value: unknown): value is ContactPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Record<string, unknown>;

  return (
    typeof payload.name === "string" &&
    payload.name.trim().length >= 2 &&
    typeof payload.email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email) &&
    typeof payload.type === "string" &&
    inquiryTypes.has(payload.type) &&
    typeof payload.message === "string" &&
    payload.message.trim().length >= 10
  );
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);

  if (!isContactPayload(payload)) {
    return NextResponse.json({ error: "Invalid contact payload" }, { status: 400 });
  }

  return NextResponse.json(
    {
      accepted: true,
      channel: "contact",
      inquiryType: payload.type
    },
    { status: 202 }
  );
}
