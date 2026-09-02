import { NextResponse } from "next/server";

const monthlyRenewalUrl = "https://pay.grow.link/MTAzMDM2~dfda365100439cc8523c2a9657641c2b-MzkzMTgxNw";

export function GET() {
  return NextResponse.redirect(monthlyRenewalUrl);
}
