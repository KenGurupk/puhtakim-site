import { NextResponse } from "next/server";

import { dubnovKidsConfig } from "@/lib/dubnov-kids";
import { getDubnovKidsGrowConfig } from "@/lib/dubnov-kids-server";
import { getCentralStorageStatus, listSalesRecords } from "@/lib/sales-db";

export async function GET() {
  let sold = 0;

  if (getCentralStorageStatus().configured) {
    try {
      const records = await listSalesRecords();
      sold = records.filter((record) => record.ticketType === "dubnov-kids" && record.status === "paid").length;
    } catch {
      sold = 0;
    }
  }

  const remaining = Math.max(dubnovKidsConfig.capacity - sold, 0);

  return NextResponse.json(
    {
      total: dubnovKidsConfig.capacity,
      sold,
      remaining,
      isFull: remaining <= 0,
      dropInAvailable: remaining > 1,
      checkoutAvailable: {
        monthly: Boolean(getDubnovKidsGrowConfig("monthly").url),
        trial: Boolean(getDubnovKidsGrowConfig("trial").url),
        single: Boolean(getDubnovKidsGrowConfig("single").url)
      }
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
