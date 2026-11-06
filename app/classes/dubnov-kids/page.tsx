import type { Metadata } from "next";
import Link from "next/link";

import { DubnovKidsRegistration } from "@/components/classes/dubnov-kids-registration";
import { dubnovKidsConfig } from "@/lib/dubnov-kids";

export const metadata: Metadata = {
  title: dubnovKidsConfig.name,
  description: "אימון שבועי בקבוצה קטנה, עם תהליך מקצועי, בטוח ויחס אישי בגינת דובנוב, תל אביב."
};

export default function DubnovKidsPage() {
  return <>
    <div dir="rtl" className="bg-black px-5 pt-8 text-center">
      <Link href="/classes/dubnov-kids/quick-payment" className="inline-flex min-h-12 items-center rounded-2xl border border-blood px-5 py-3 font-black text-white">
        תשלום מהיר למתאמנים קיימים
      </Link>
    </div>
    <DubnovKidsRegistration />
  </>;
}
