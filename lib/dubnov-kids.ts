export const dubnovKidsConfig = {
  productType: "dubnov_kids_class" as const,
  name: "חוג תנועה ופארקור לילדים",
  venue: "גינת דובנוב",
  city: "תל אביב",
  weekday: "יום רביעי",
  time: "17:30–18:30",
  duration: "שעה",
  openingDate: "2026-09-02",
  month: "2026-09",
  capacity: 12,
  contactName: "קן־גורו",
  contactPhone: "054-763-2268",
  sessionDates: ["2.9", "9.9", "16.9", "23.9", "30.9"],
  plans: {
    monthly: {
      id: "monthly" as const,
      name: "מנוי חודשי",
      price: 320,
      recommended: true,
      description: "לילדים שרוצים להתקדם בתהליך שבועי קבוע ולשמור מקום בקבוצה.",
      envUrl: "DUBNOV_KIDS_GROW_MONTHLY_URL",
      envPaymentLinkId: "DUBNOV_KIDS_GROW_MONTHLY_PAYMENT_LINK_ID"
    },
    trial: {
      id: "trial" as const,
      name: "אימון היכרות מורחב",
      price: 120,
      recommended: false,
      description: "למצטרפים חדשים שרוצים היכרות אישית לפני האימון הקבוצתי.",
      details: "מגיעים ב־17:00 לסדנת היכרות אישית או בקבוצה קטנה במשך 20–25 דקות, יוצאים להפסקה קצרה ומצטרפים לאימון הקבוצתי ב־17:30.",
      envUrl: "DUBNOV_KIDS_GROW_INTRO_URL",
      envPaymentLinkId: "DUBNOV_KIDS_GROW_INTRO_PAYMENT_LINK_ID"
    },
    single: {
      id: "single" as const,
      name: "אימון חד־פעמי",
      price: 90,
      recommended: false,
      description: "לילדים שרוצים להצטרף לאימון אחד, בכפוף למקום פנוי.",
      envUrl: "DUBNOV_KIDS_GROW_SINGLE_URL",
      envPaymentLinkId: "DUBNOV_KIDS_GROW_SINGLE_PAYMENT_LINK_ID"
    }
  }
} as const;

export type DubnovKidsPlan = keyof typeof dubnovKidsConfig.plans;

export function getDubnovKidsPlan(value: unknown) {
  const key = String(value ?? "") as DubnovKidsPlan;
  return dubnovKidsConfig.plans[key];
}

export function calculateDubnovProratedPrice(input: { remainingSessions: number; trialAlreadyPaid?: boolean }) {
  const base = Math.min(Math.max(Math.trunc(input.remainingSessions), 0) * 80, dubnovKidsConfig.plans.monthly.price);
  return Math.max(base - (input.trialAlreadyPaid ? dubnovKidsConfig.plans.trial.price : 0), 0);
}
