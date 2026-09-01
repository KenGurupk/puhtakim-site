import type { Metadata } from "next";

import { DubnovKidsRegistration } from "@/components/classes/dubnov-kids-registration";
import { dubnovKidsConfig } from "@/lib/dubnov-kids";

export const metadata: Metadata = {
  title: dubnovKidsConfig.name,
  description: "אימון שבועי בקבוצה קטנה, עם תהליך מקצועי, בטוח ויחס אישי בגינת דובנוב, תל אביב."
};

export default function DubnovKidsPage() {
  return <DubnovKidsRegistration />;
}
