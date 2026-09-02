import type { CheckoutIntent } from "@/lib/checkout-intents";

export const healthQuestions = [
  "האם קיימת בעיית לב, כאב או לחץ בחזה, התעלפות, דפיקות לב חריגות או קוצר נשימה חריג בזמן מאמץ או במנוחה?",
  "האם קיימת כיום או הייתה בעבר פציעה משמעותית, ניתוח, שבר, פריקה, פגיעת ראש או עמוד שדרה, כאב או מגבלה שיכולים להשפיע על האימון?",
  "האם קיימת מחלה כרונית, אסתמה, אלרגיה משמעותית, רגישות רפואית, טיפול תרופתי קבוע או צורך בתרופת חירום?",
  "האם קיימים סחרחורת חוזרת, בעיית שיווי משקל, מצב נוירולוגי או כל מצב רפואי אחר שעלול להשפיע על השתתפות בטוחה בפעילות?",
  "האם רופא הגביל בעבר פעילות גופנית, המליץ על התייעצות לפני מאמץ, או שיש סיבה אחרת שבגללה כדאי שנדע משהו לפני שמתחילים?"
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
    "תפקיד המאשר", "אישור צילום", "מקור הרשמה", "מידע רפואי / איש קשר חירום / הערות"
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
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] ?? character);
}
