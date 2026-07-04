import { NextResponse } from "next/server";

import { siteCopy } from "@/content/site-copy";
import type { ContactPayload } from "@/types/contact";

const inquiryTypes = new Set<string>(siteCopy.contact.form.inquiryTypes);

export async function POST(request: Request) {
  const payload = (await request.json()) as Partial<ContactPayload>;

  if (
    !payload.name ||
    !payload.email ||
    !payload.message ||
    !payload.type ||
    !inquiryTypes.has(payload.type)
  ) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
