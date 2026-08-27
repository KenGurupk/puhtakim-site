import type { CheckoutIntent } from "@/lib/checkout-intents";

export const healthQuestions = [
  "האם רופא אמר לך בעבר שיש לך בעיה בלב או שמותר לך לבצע פעילות גופנית רק תחת פיקוח או הגבלה רפואית?",
  "האם במהלך פעילות גופנית או במנוחה חווית כאב או לחץ בחזה, דפיקות לב חריגות, קוצר נשימה חריג או תחושת עילפון?",
  "האם איבדת הכרה או כמעט איבדת הכרה במהלך פעילות גופנית או בעקבותיה?",
  "האם קיימת אצלך מחלה, פציעה, מגבלה גופנית או מצב רפואי העלולים להחמיר כתוצאה מפעילות גופנית?",
  "האם בשלושת החודשים האחרונים חווית פציעה משמעותית, ניתוח, שבר, פריקה או נזק למפרק, לשריר, לגיד, לרצועה, לראש או לעמוד השדרה?",
  "האם קיימת מגבלה בשיווי המשקל, סחרחורת חוזרת או קושי שעלול להגדיל את הסיכון לנפילה?",
  "האם יש לך אסתמה, קושי נשימתי משמעותי או צורך במשאף בזמן מאמץ?",
  "האם קיימת אלרגיה חמורה, רגישות רפואית משמעותית או צורך לשאת תרופה דחופה כגון מזרק אפינפרין?",
  "האם את בהיריון, או שקיים מצב אחר שבגללו הומלץ לך להתייעץ עם רופא לפני פעילות גופנית?",
  "האם קיימת סיבה רפואית אחרת שבגללה אינך בטוח/ה שנכון לך להשתתף בפעילות?"
] as const;

export function formatRegistrationDate(value?: string) {
  if (!value) return "לא הוזן";
  return new Intl.DateTimeFormat("he-IL", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Jerusalem" }).format(new Date(value));
}

export function displayAnswer(value: boolean | "yes" | "no" | undefined) {
  if (value === true || value === "yes") return "כן";
  if (value === false || value === "no") return "לא";
  return "לא הוזן";
}

export function fullRegistrationExport() {
  const headers = [
    "אסמכתה", "שם מלא", "טלפון", "אימייל", "תאריך לידה", "כרטיס", "אירועים", "סטטוס תשלום", "מועד הרשמה",
    ...healthQuestions.map((_, index) => `שאלת בריאות ${index + 1}`),
    "סטטוס הצהרת בריאות", "גרסת הצהרת בריאות", "מועד אישור בריאות", "התנאים נקראו", "התנאים אושרו",
    "גרסת תנאים", "מועד אישור תנאים", "קטין", "אישור אפוטרופוס", "שם אפוטרופוס", "טלפון אפוטרופוס",
    "תפקיד המאשר", "אישור צילום", "מקור הרשמה", "הערות"
  ];

  return {
    headers,
    row(intent: CheckoutIntent): Array<string | number | undefined> {
      const compliance = intent.compliance;
      return [
        intent.checkoutReference, intent.fullName, intent.phone, intent.email, intent.dateOfBirth, intent.ticketName,
        intent.selectedEvents.map((event) => `${event.city} / ${event.venue} / ${event.date}`).join(" | "), intent.status,
        formatRegistrationDate(intent.createdAt),
        ...healthQuestions.map((_, index) => displayAnswer(compliance?.healthAnswers?.[`q${index + 1}`])),
        compliance?.healthDeclarationStatus, compliance?.healthDeclarationVersion, formatRegistrationDate(compliance?.healthDeclarationAcceptedAt),
        displayAnswer(compliance?.termsDocumentRead), displayAnswer(compliance?.termsAccepted), compliance?.termsVersion,
        formatRegistrationDate(compliance?.termsAcceptedAt), displayAnswer(compliance?.isMinor), displayAnswer(compliance?.guardianConsent),
        compliance?.guardianName, compliance?.guardianPhone, compliance?.approverRole, compliance?.photoConsent,
        intent.registrationSource, intent.notes
      ];
    }
  };
}

export function registrationEmailHtml(intent: CheckoutIntent) {
  const exportData = fullRegistrationExport();
  const values = exportData.row(intent);
  const rows = exportData.headers.map((header, index) => `<tr><th style="padding:8px;border:1px solid #ddd;text-align:right;background:#f4f4f4">${escapeHtml(header)}</th><td style="padding:8px;border:1px solid #ddd;text-align:right">${escapeHtml(values[index] ?? "")}</td></tr>`).join("");
  return `<div dir="rtl" style="font-family:Arial,sans-serif;color:#111"><h1>הרשמה חדשה — ${escapeHtml(intent.fullName)}</h1><p>הטופס נשמר בהצלחה. המידע שלהלן רגיש ומיועד לניהול ההרשמה בלבד.</p><table style="border-collapse:collapse;width:100%;max-width:900px">${rows}</table></div>`;
}

function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
