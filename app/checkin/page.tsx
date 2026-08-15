import type { Metadata } from "next";

import { CheckinForm } from "@/components/checkin/checkin-form";

export const metadata: Metadata = {
  title: "צ׳ק-אין לאירוע | PushTakim",
  description: "טופס צ׳ק-אין למשתתפים שמשלמים במקום או משלימים אישורים לפני פעילות PushTakim.",
  robots: {
    index: false,
    follow: false
  }
};

export default function CheckinPage() {
  return <CheckinForm />;
}
