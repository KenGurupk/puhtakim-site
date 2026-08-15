"use client";

import { type RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  checkoutConfig,
  getCheckoutEventsByIds,
  getDefaultSelectedEventIds,
  type CheckoutTicket
} from "@/lib/checkout-config";
import {
  checkoutIntentService,
  getUtmParams,
  trackCheckoutEvent,
  type CheckoutIntentCustomer
} from "@/lib/checkout-intents";

type TicketCheckoutModalProps = {
  ticket: CheckoutTicket;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  initialSelectedEventIds?: string[];
};

type ValidationErrors = Partial<
  Record<
    "fullName" | "phone" | "email" | "dateOfBirth" | "events" | "health" | "terms" | "guardian" | "guardianName" | "guardianPhone" | "save",
    string
  >
>;

const termsVersion = "2026-07-v1";
const healthDeclarationVersion = "2026-07-v1";

const emptyCustomer: CheckoutIntentCustomer = {
  fullName: "",
  phone: "",
  email: "",
  dateOfBirth: ""
};

function isValidIsraeliMobile(phone: string) {
  const compact = phone.replace(/[\s-]/g, "");
  return /^(05\d{8}|\+9725\d{8}|9725\d{8})$/.test(compact);
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function isValidPastDate(date: string | undefined) {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  return date <= getTodayDateString();
}

function calculateAge(dateOfBirth: string | undefined) {
  if (!isValidPastDate(dateOfBirth)) {
    return null;
  }

  const birthDate = new Date(`${dateOfBirth}T00:00:00`);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age;
}

function hasCustomerInput(customer: CheckoutIntentCustomer) {
  return Boolean(customer.fullName.trim() || customer.phone.trim() || customer.email.trim() || customer.dateOfBirth?.trim());
}

function buildGrowRedirectUrl(baseUrl: string, checkoutReference: string) {
  const url = new URL(baseUrl);
  url.searchParams.set("checkoutReference", checkoutReference);
  return url.toString();
}

const healthQuestions = [
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

type HealthAnswers = Record<number, "yes" | "no" | undefined>;
type PhotoConsent = "approved" | "declined" | "not_selected";
type TermsSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

const termsSections: TermsSection[] = [
  {
    title: "1. אופי הפעילות",
    paragraphs: [
      "פעילויות PushTakim עשויות לכלול, בהתאם למפגש: אימון פתוח, סדנאות, ריצה, קפיצה, טיפוס, נחיתות, תרגילי כוח, תרגילי שיווי משקל, פארקור, פריראנינג, אקרובטיקה, טריקינג, קליסטניקס, סטריט וורקאוט, מובמנט ופעילויות תנועה נוספות.",
      "הפעילות מתקיימת ברמות שונות, ולעיתים במתחמי ספורט, אולמות או מתקנים המופעלים על ידי צדדים שלישיים ואינם בבעלות PushTakim."
    ]
  },
  {
    title: "2. סיכונים הכרוכים בפעילות",
    paragraphs: [
      "ידוע לי כי פעילות גופנית ותנועתית כוללת סיכונים טבעיים, לרבות החלקה, נפילה, התנגשות, עומס, פציעות שריר או מפרק, שברים, פגיעות ראש וסיכונים נוספים.",
      "ידוע לי שלא ניתן למנוע לחלוטין כל פציעה, גם כאשר ננקטים אמצעי זהירות וניתנות הנחיות מקצועיות."
    ]
  },
  {
    title: "3. אחריות אישית והתאמת הרמה",
    bullets: [
      "לפעול בהתאם ליכולת, לניסיון ולמצב הבריאותי שלי.",
      "לא לבצע תרגיל שאיני מרגיש/ה מוכן/ה אליו.",
      "לבקש הסבר או עזרה במקרה של ספק.",
      "לציית להוראות המאמנים, המארגנים וצוות המתחם.",
      "להפסיק מיד פעילות במקרה של כאב, חולשה, סחרחורת, קוצר נשימה חריג או תחושה מדאיגה.",
      "לא להשתתף תחת השפעת אלכוהול, סמים או חומר הפוגע בשיקול הדעת.",
      "להשתמש בציוד ובמתקנים רק בהתאם לייעודם ולהנחיות הצוות.",
      "להתחשב במשתתפים אחרים ולא לסכן אותם."
    ]
  },
  {
    title: "4. מצב רפואי",
    paragraphs: [
      "אני מצהיר/ה שהפרטים שמסרתי בהצהרת הבריאות נכונים ומלאים למיטב ידיעתי.",
      "ידוע לי כי אם חל שינוי במצבי הרפואי או אם נפצעתי לאחר מילוי ההצהרה, עליי לעדכן את המארגנים לפני ההשתתפות.",
      "במקרה שבו נדרש אישור רפואי, השתתפותי תהיה כפופה להצגתו ולאישור המארגנים."
    ]
  },
  {
    title: "5. ציוד אישי ורכוש",
    paragraphs: [
      "האחריות על טלפון, ארנק, תיק, בגדים, ציוד אישי וחפצים יקרי ערך חלה על המשתתף/ת. מומלץ לא להביא ציוד יקר שאינו נחוץ לפעילות."
    ]
  },
  {
    title: "6. הוראות המתחם",
    paragraphs: [
      "ידוע לי כי כל אולם או מתחם עשוי לקבוע כללים נוספים, לרבות שימוש בציוד, נעליים, אזורים אסורים, גיל מינימלי, ליווי הורים או מגבלות בטיחות.",
      "אני מתחייב/ת לפעול גם בהתאם לכללים של המתחם המארח."
    ]
  },
  {
    title: "7. צילום ותיעוד",
    paragraphs: [
      "במהלך האירועים עשויים להתבצע צילום וידאו וצילום סטילס לצורכי תיעוד, פרסום וקידום פעילות PushTakim והקהילה."
    ]
  },
  {
    title: "8. הפסקת השתתפות",
    paragraphs: [
      "המארגנים או צוות המתחם רשאים להפסיק השתתפות של אדם שפועל באופן מסוכן, מפר הנחיות, מסכן אחרים או מתנהג בצורה שאינה מתאימה לאופי האירוע."
    ]
  },
  {
    title: "9. אחריות המארגנים",
    paragraphs: [
      "PushTakim, המארגנים, המדריכים והמתחמים המארחים יעשו מאמץ סביר לקיום הפעילות בצורה מאורגנת ובטוחה.",
      "המשתתף/ת מבין/ה כי אין באפשרות המארגנים להבטיח פעילות נטולת סיכון או למנוע כל פציעה.",
      "השתתפות בפעילות היא מרצון ובהתאם ליכולת האישית, ואין בתנאים אלה כדי לפטור גורם מאחריות שאינה ניתנת לפטור על פי דין."
    ]
  },
  {
    title: "10. קטינים",
    paragraphs: ["משתתף/ת שטרם מלאו לו/ה 18 שנים רשאי/ת להשתתף רק לאחר אישור הורה או אפוטרופוס חוקי."],
    bullets: [
      "הוא מוסמך לתת את האישור.",
      "קרא את הצהרת הבריאות ואת תנאי ההשתתפות.",
      "הפרטים שנמסרו לגבי הקטין נכונים למיטב ידיעתו.",
      "הוא מאשר את השתתפות הקטין בהתאם לתנאים."
    ]
  },
  {
    title: "11. עדכון או שינוי פעילות",
    paragraphs: [
      "ייתכנו שינויים סבירים בשעות, בתוכן, במאמנים, במתחם או במבנה הפעילות עקב אילוצים מקצועיים, בטיחותיים או תפעוליים.",
      "במקרה של שינוי משמעותי או ביטול, יימסר עדכון לפרטי הקשר שהוזנו בהרשמה."
    ]
  },
  {
    title: "12. אישור סופי",
    paragraphs: [
      "אני מאשר/ת כי קראתי את תנאי ההשתתפות, הבנתי את אופי הפעילות ואת הסיכונים הכרוכים בה, קיבלתי אפשרות לשאול שאלות, ואני מסכים/ה להשתתף בהתאם לתנאים."
    ]
  }
];

export function TicketCheckoutModal({ ticket, returnFocusRef, onClose, initialSelectedEventIds }: TicketCheckoutModalProps) {
  const [mounted, setMounted] = useState(false);
  const [customer, setCustomer] = useState<CheckoutIntentCustomer>(emptyCustomer);
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>(() =>
    initialSelectedEventIds?.length ? initialSelectedEventIds : getDefaultSelectedEventIds(ticket)
  );
  const [healthAnswers, setHealthAnswers] = useState<HealthAnswers>({});
  const [healthStep, setHealthStep] = useState(0);
  const [healthDeclarationAccepted, setHealthDeclarationAccepted] = useState(false);
  const [healthAcceptedAt, setHealthAcceptedAt] = useState<string | undefined>();
  const [healthDeclarationCompleted, setHealthDeclarationCompleted] = useState(false);
  const [requiresMedicalApproval, setRequiresMedicalApproval] = useState(false);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [termsDocumentRead, setTermsDocumentRead] = useState(false);
  const [termsConfirmed, setTermsConfirmed] = useState(false);
  const [termsAcceptedAt, setTermsAcceptedAt] = useState<string | undefined>();
  const [guardianConsent, setGuardianConsent] = useState(false);
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [photoConsent, setPhotoConsent] = useState<PhotoConsent>("not_selected");
  const [modalFallbackMessage, setModalFallbackMessage] = useState<string | undefined>();
  const [step, setStep] = useState<"edit" | "confirm">("edit");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const healthDialogRef = useRef<HTMLDivElement>(null);
  const termsDialogRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const healthButtonRef = useRef<HTMLButtonElement>(null);
  const termsButtonRef = useRef<HTMLButtonElement>(null);
  const termsScrollRef = useRef<HTMLDivElement>(null);
  const initialSelectedEventIdsRef = useRef(selectedEventIds);
  const selectedEvents = useMemo(() => getCheckoutEventsByIds(selectedEventIds), [selectedEventIds]);
  const requiredCount = ticket.requiredEventCount;
  const requiresManualSelection = ticket.selectionMode === "single" || ticket.selectionMode === "triple";
  const displayedEvents = requiresManualSelection ? checkoutConfig.events : selectedEvents;
  const isDirty = hasCustomerInput(customer) || (requiresManualSelection && selectedEventIds.length > 0);
  const age = useMemo(() => calculateAge(customer.dateOfBirth), [customer.dateOfBirth]);
  const isMinor = age !== null && age < 18;
  const answeredHealthQuestions = healthQuestions.every((_, index) => healthAnswers[index] === "yes" || healthAnswers[index] === "no");
  const hasMedicalReviewAnswer = healthQuestions.some((_, index) => healthAnswers[index] === "yes");
  const healthProgress = Math.round((Object.values(healthAnswers).filter(Boolean).length / healthQuestions.length) * 100);

  useEffect(() => {
    setMounted(true);
  }, []);

  function getFocusableElements(container: HTMLDivElement | null) {
    if (!container) {
      return [];
    }

    return Array.from(
      container.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled])"
      )
    ).filter((element) => element.offsetParent !== null);
  }

  function closeHealthModal() {
    setIsHealthModalOpen(false);
    window.setTimeout(() => healthButtonRef.current?.focus(), 0);
  }

  function closeTermsModal() {
    setIsTermsModalOpen(false);
    window.setTimeout(() => termsButtonRef.current?.focus(), 0);
  }

  function openHealthModal() {
    try {
      setModalFallbackMessage(undefined);
      setIsHealthModalOpen(true);
    } catch {
      setModalFallbackMessage("לא הצלחנו לפתוח את המסמך. נסו לרענן את העמוד או לפתוח בדפדפן Safari/Chrome.");
    }
  }

  function openTermsModal() {
    try {
      setModalFallbackMessage(undefined);
      setIsTermsModalOpen(true);
    } catch {
      setModalFallbackMessage("לא הצלחנו לפתוח את המסמך. נסו לרענן את העמוד או לפתוח בדפדפן Safari/Chrome.");
    }
  }

  const requestClose = useCallback(() => {
    if (isDirty && !window.confirm("הפרטים שהזנת יימחקו. לסגור את החלון?")) {
      return;
    }

    onClose();
    window.setTimeout(() => returnFocusRef.current?.focus(), 0);
  }, [isDirty, onClose, returnFocusRef]);

  useEffect(() => {
    trackCheckoutEvent("ticket_modal_open", {
      ticket_type: ticket.type,
      price: ticket.price,
      selected_event_ids: initialSelectedEventIdsRef.current
    });
  }, [ticket.price, ticket.type]);

  useEffect(() => {
    if (isHealthModalOpen) {
      window.setTimeout(() => getFocusableElements(healthDialogRef.current)[0]?.focus(), 0);
    }
  }, [isHealthModalOpen]);

  useEffect(() => {
    if (isTermsModalOpen) {
      window.setTimeout(() => getFocusableElements(termsDialogRef.current)[0]?.focus(), 0);
    }
  }, [isTermsModalOpen]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    window.setTimeout(() => firstInputRef.current?.focus(), 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      const activeDialog = isHealthModalOpen ? healthDialogRef.current : isTermsModalOpen ? termsDialogRef.current : dialogRef.current;

      if (event.key === "Escape") {
        if (isHealthModalOpen) {
          closeHealthModal();
          return;
        }

        if (isTermsModalOpen) {
          closeTermsModal();
          return;
        }

        requestClose();
      }

      if (event.key !== "Tab" || !activeDialog) {
        return;
      }

      const focusable = getFocusableElements(activeDialog);

      if (!focusable.length) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isHealthModalOpen, isTermsModalOpen, requestClose]);

  function updateCustomer(field: keyof CheckoutIntentCustomer, value: string) {
    setCustomer((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, save: undefined }));

    if (field === "dateOfBirth") {
      setGuardianConsent(false);
      setGuardianName("");
      setGuardianPhone("");
    }
  }

  function answerHealthQuestion(index: number, answer: "yes" | "no") {
    setHealthAnswers((current) => ({ ...current, [index]: answer }));
    setHealthStep((current) => Math.min(Math.max(current, index), healthQuestions.length - 1));
    setHealthDeclarationCompleted(false);
    setHealthDeclarationAccepted(false);
    setHealthAcceptedAt(undefined);
    setRequiresMedicalApproval(false);
    setErrors((current) => ({ ...current, health: undefined, save: undefined }));
  }

  function completeHealthDeclaration() {
    if (!answeredHealthQuestions || hasMedicalReviewAnswer || !healthDeclarationAccepted) {
      return;
    }

    setRequiresMedicalApproval(false);
    setHealthDeclarationCompleted(true);
    setHealthAcceptedAt(new Date().toISOString());
    setErrors((current) => ({ ...current, health: undefined, save: undefined }));
    closeHealthModal();
    setErrors((current) => ({ ...current, health: undefined, save: undefined }));
  }

  function contactPushTakimForMedicalReview() {
    setRequiresMedicalApproval(true);
    setHealthDeclarationCompleted(true);
    setHealthAcceptedAt(new Date().toISOString());
    setErrors((current) => ({
      ...current,
      health: "סימנת תשובה שמצריכה בירור לפני המשך הרכישה. צרו איתנו קשר ונעזור להבין את הצעד הבא.",
      save: undefined
    }));

    closeHealthModal();
    window.open("https://wa.me/972547632268", "_blank", "noopener,noreferrer");
  }

  function markTermsRead() {
    setTermsDocumentRead(true);
    setErrors((current) => ({ ...current, terms: undefined, save: undefined }));
    closeTermsModal();
  }

  function updateGuardian(field: "guardianName" | "guardianPhone", value: string) {
    if (field === "guardianName") {
      setGuardianName(value);
    } else {
      setGuardianPhone(value);
    }

    setErrors((current) => ({ ...current, [field]: undefined, guardian: undefined, save: undefined }));
  }

  function toggleEvent(eventId: string) {
    if (!requiresManualSelection) {
      return;
    }

    setSelectedEventIds((current) => {
      const exists = current.includes(eventId);
      const next = exists
        ? current.filter((id) => id !== eventId)
        : current.length < requiredCount
          ? [...current, eventId]
          : current;

      trackCheckoutEvent("ticket_event_selected", {
        ticket_type: ticket.type,
        price: ticket.price,
        selected_event_ids: next
      });

      return next;
    });
    setErrors((current) => ({ ...current, events: undefined, save: undefined }));
  }

  function validate() {
    const nextErrors: ValidationErrors = {};

    if (!customer.fullName.trim()) {
      nextErrors.fullName = "צריך למלא שם מלא.";
    }

    if (!isValidIsraeliMobile(customer.phone)) {
      nextErrors.phone = "צריך מספר נייד ישראלי תקין.";
    }

    if (!isValidEmail(customer.email)) {
      nextErrors.email = "צריך אימייל תקין לקבלת עדכונים.";
    }

    if (!isValidPastDate(customer.dateOfBirth)) {
      nextErrors.dateOfBirth = "צריך להזין תאריך לידה תקין שאינו בעתיד.";
    }

    if (selectedEventIds.length !== requiredCount) {
      nextErrors.events =
        requiredCount === 1 ? "צריך לבחור אירוע אחד." : `צריך לבחור בדיוק ${requiredCount} אירועים.`;
    }

    if (!healthDeclarationCompleted) {
      nextErrors.health = requiresMedicalApproval
        ? "צריך ליצור קשר עם פושטקים לפני שממשיכים במקרה שנדרש בירור רפואי."
        : "צריך להשלים את הצהרת הבריאות לפני שממשיכים.";
    }

    if (hasMedicalReviewAnswer && !requiresMedicalApproval) {
      nextErrors.health = "סימנת תשובה שמצריכה בירור לפני המשך הרכישה. צרו איתנו קשר ונעזור להבין את הצעד הבא.";
    }

    if (!termsDocumentRead) {
      nextErrors.terms = "צריך לפתוח ולקרוא את תנאי ההשתתפות לפני האישור.";
    } else if (!termsConfirmed) {
      nextErrors.terms = "צריך לאשר את תנאי ההשתתפות לפני שממשיכים.";
    }

    if (isMinor && !guardianName.trim()) {
      nextErrors.guardianName = "צריך למלא שם מלא של הורה או אפוטרופוס.";
    }

    if (isMinor && !isValidIsraeliMobile(guardianPhone)) {
      nextErrors.guardianPhone = "צריך למלא טלפון ישראלי תקין של הורה או אפוטרופוס.";
    }

    if (isMinor && !guardianConsent) {
      nextErrors.guardian = "נדרש אישור הורה או אפוטרופוס להשתתפות קטין.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function continueToSummary() {
    if (validate()) {
      setStep("confirm");
      window.setTimeout(() => closeButtonRef.current?.focus(), 0);
    }
  }

  async function continueToPayment() {
    if (!ticket.growUrl || ticket.salesClosed) {
      setErrors({ save: "הכרטיס הזה כבר לא זמין. אפשר לבחור כרטיס לבאר שבע או כרטיס לראשון לציון." });
      return;
    }

    if (isSaving || !validate()) {
      return;
    }

    setIsSaving(true);
    setErrors({});

    try {
      const intent = await checkoutIntentService.save({
        ticketType: ticket.type,
        ticketName: ticket.name,
        price: ticket.price,
        selectedEventIds,
        selectedEvents: selectedEvents.map((event) => ({
          id: event.id,
          name: event.name,
          venue: event.venue,
          city: event.city,
          date: event.date
        })),
        fullName: customer.fullName.trim(),
        phone: customer.phone.trim(),
        email: customer.email.trim(),
        dateOfBirth: customer.dateOfBirth?.trim(),
        compliance: {
          healthDeclarationCompleted,
          requiresMedicalApproval,
          healthDeclarationVersion,
          healthDeclarationAcceptedAt: healthAcceptedAt,
          healthDeclarationStatus: requiresMedicalApproval || hasMedicalReviewAnswer
              ? "medical-review-required"
              : healthDeclarationCompleted
                ? "completed"
              : "incomplete",
          healthAnswers: Object.fromEntries(
            healthQuestions.map((_, index) => [`q${index + 1}`, healthAnswers[index]]).filter(([, answer]) => answer === "yes" || answer === "no")
          ) as Record<string, "yes" | "no">,
          termsAccepted: termsConfirmed,
          termsVersion,
          termsAcceptedAt,
          termsDocumentRead,
          participantName: customer.fullName.trim(),
          participantDateOfBirth: customer.dateOfBirth?.trim(),
          isMinor,
          guardianConsent: isMinor ? guardianConsent : false,
          guardianName: isMinor ? guardianName.trim() : undefined,
          guardianPhone: isMinor ? guardianPhone.trim() : undefined,
          approverRole: isMinor ? "guardian" : "participant",
          photoConsent
        },
        sourcePage: typeof window !== "undefined" ? window.location.pathname : undefined,
        ctaId: ticket.ctaId,
        utm: getUtmParams()
      });

      trackCheckoutEvent("ticket_checkout_intent_saved", {
        ticket_type: ticket.type,
        price: ticket.price,
        selected_event_ids: selectedEventIds,
        checkout_reference: intent.checkoutReference
      });
      trackCheckoutEvent("ticket_checkout_click", {
        ticket_type: ticket.type,
        price: ticket.price,
        selected_event_ids: selectedEventIds,
        checkout_reference: intent.checkoutReference
      });

      window.location.assign(buildGrowRedirectUrl(ticket.growUrl, intent.checkoutReference));
    } catch (error) {
      setIsSaving(false);
      setErrors({
        save:
          error instanceof Error && error.message
            ? error.message
            : "לא הצלחנו לשמור את ההרשמה לפני המעבר לתשלום. נסו שוב בעוד רגע."
      });
    }
  }

  const selectionProgress =
    ticket.selectionMode === "triple"
      ? `נבחרו ${selectedEventIds.length} מתוך 3`
      : ticket.selectionMode === "single"
        ? selectedEventIds.length === 1
          ? "נבחר אירוע אחד"
          : "בחרו אירוע אחד"
        : ticket.selectionMode === "fixed"
          ? "האירוע כבר נבחר"
        : undefined;

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/82 px-4 py-6 backdrop-blur-md sm:px-5 sm:py-8"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          requestClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        className="relative mx-auto flex max-h-[calc(100dvh-3rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#070707] p-5 text-right shadow-[0_30px_120px_rgba(0,0,0,0.55)] sm:max-h-[calc(100dvh-4rem)] sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`checkout-modal-${ticket.type}`}
        dir="rtl"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={requestClose}
          className="motion-button absolute left-4 top-4 grid size-9 place-items-center rounded-full border border-white/10 bg-white/5 text-xl font-black text-white transition hover:bg-white hover:text-black"
          aria-label="סגירה"
        >
          ×
        </button>

        <p className="text-sm font-black tracking-[0.08em] text-blood">PushTakim Tour 2026</p>
        <h3 id={`checkout-modal-${ticket.type}`} className="mt-4 text-4xl font-black leading-tight text-white">
          {step === "confirm" ? "בודקים שהכל נכון." : "כמעט סיימנו."}
        </h3>
        <p className="mt-3 text-base font-bold leading-7 text-zinc-300">
          {ticket.name} · {ticket.priceLabel}
        </p>

        <div className="mt-7 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-0">
        {step === "edit" ? (
          <div className="grid gap-6">
            <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-white">אירועים בכרטיס</p>
                  {selectionProgress && <p className="mt-1 text-sm font-black text-blood">{selectionProgress}</p>}
                </div>
                {ticket.note && (
                  <p className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-black text-amber-200">
                    {ticket.note}
                  </p>
                )}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {displayedEvents.map((event) => {
                  const selected = selectedEventIds.includes(event.id);
                  const disabled =
                    requiresManualSelection &&
                    !selected &&
                    selectedEventIds.length >= requiredCount;

                  return (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => toggleEvent(event.id)}
                      disabled={!requiresManualSelection || disabled}
                      className={`rounded-2xl border p-4 text-right transition duration-300 ${
                        selected
                          ? "border-blood bg-blood/14 shadow-[0_0_34px_rgba(193,18,31,0.18)]"
                          : "border-white/10 bg-black/28 hover:border-blood/50"
                      } ${!requiresManualSelection || disabled ? "cursor-default" : "cursor-pointer"}`}
                      aria-pressed={selected}
                    >
                      <p className="text-xs font-black tracking-[0.08em] text-blood">{event.stop}</p>
                      <p className="mt-2 text-xl font-black text-white">{event.city}</p>
                      <p className="mt-1 text-sm font-bold text-zinc-300">{event.venue}</p>
                      <p className="mt-2 text-sm font-black text-white" dir="ltr">{event.date}</p>
                    </button>
                  );
                })}
              </div>
              {errors.events && <p className="mt-3 text-sm font-black text-blood">{errors.events}</p>}
            </section>

            <section className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
              <p className="text-sm font-black text-white">פרטים לקבלת עדכונים</p>
              <label className="grid gap-2 text-sm font-bold text-zinc-200">
                שם מלא
                <input
                  ref={firstInputRef}
                  value={customer.fullName}
                  onChange={(event) => updateCustomer("fullName", event.target.value)}
                  className="min-h-12 rounded-2xl border border-white/10 bg-black/42 px-4 py-3 text-white outline-none transition focus:border-blood"
                  autoComplete="name"
                />
                {errors.fullName && <span className="text-xs font-black text-blood">{errors.fullName}</span>}
              </label>
              <label className="grid gap-2 text-sm font-bold text-zinc-200">
                נייד
                <input
                  value={customer.phone}
                  onChange={(event) => updateCustomer("phone", event.target.value)}
                  className="min-h-12 rounded-2xl border border-white/10 bg-black/42 px-4 py-3 text-white outline-none transition focus:border-blood"
                  autoComplete="tel"
                  inputMode="tel"
                  dir="ltr"
                />
                {errors.phone && <span className="text-xs font-black text-blood">{errors.phone}</span>}
              </label>
              <label className="grid gap-2 text-sm font-bold text-zinc-200">
                אימייל
                <input
                  value={customer.email}
                  onChange={(event) => updateCustomer("email", event.target.value)}
                  className="min-h-12 rounded-2xl border border-white/10 bg-black/42 px-4 py-3 text-white outline-none transition focus:border-blood"
                  autoComplete="email"
                  inputMode="email"
                  dir="ltr"
                />
                {errors.email && <span className="text-xs font-black text-blood">{errors.email}</span>}
              </label>
              <label className="grid gap-2 text-sm font-bold text-zinc-200">
                תאריך לידה
                <input
                  type="date"
                  value={customer.dateOfBirth ?? ""}
                  onChange={(event) => updateCustomer("dateOfBirth", event.target.value)}
                  max={getTodayDateString()}
                  className="min-h-12 rounded-2xl border border-white/10 bg-black/42 px-4 py-3 text-white outline-none transition focus:border-blood"
                  autoComplete="bday"
                  dir="ltr"
                />
                {errors.dateOfBirth && <span className="text-xs font-black text-blood">{errors.dateOfBirth}</span>}
              </label>
            </section>

            <section className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-black text-white">הצהרת בריאות</p>
                    <p className="mt-1 text-xs font-bold leading-5 text-zinc-400">
                      לפני השלמה: {healthDeclarationCompleted ? "הצהרת הבריאות הושלמה ✓" : "עדיין לא הושלם"}
                    </p>
                  </div>
                  <button
                    ref={healthButtonRef}
                    type="button"
                    onClick={openHealthModal}
                    className="motion-button inline-flex min-h-11 items-center justify-center rounded-xl border border-blood/45 bg-blood/12 px-4 py-2 text-sm font-black text-white transition duration-300 hover:-translate-y-0.5 hover:bg-blood"
                  >
                    {healthDeclarationCompleted ? "עדכון הצהרת בריאות" : "מילוי הצהרת בריאות"}
                  </button>
                </div>

                {healthDeclarationCompleted && (
                  <p className="mt-4 rounded-xl border border-white/15 bg-white/[0.055] p-3 text-sm font-black leading-6 text-white">
                    הצהרת הבריאות הושלמה ✓
                  </p>
                )}
                {requiresMedicalApproval && (
                  <p className="mt-4 rounded-xl border border-amber-300/35 bg-amber-300/10 p-3 text-sm font-black leading-6 text-amber-100">
                    ייתכן שנבקש אישור רפואי לפני ההשתתפות.
                  </p>
                )}
                {errors.health && <p className="mt-3 text-sm font-black text-blood">{errors.health}</p>}
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-black text-white">תנאי השתתפות</p>
                    <p className="mt-1 text-xs font-bold leading-5 text-zinc-400">
                      {termsConfirmed ? "תנאי ההשתתפות אושרו ✓" : termsDocumentRead ? "המסמך נקרא. אפשר לאשר." : "צריך לפתוח ולקרוא לפני האישור."}
                    </p>
                  </div>
                  <button
                    ref={termsButtonRef}
                    type="button"
                    onClick={openTermsModal}
                    className="motion-button inline-flex min-h-11 items-center justify-center rounded-xl border border-white/15 bg-white/[0.045] px-4 py-2 text-sm font-black text-white transition duration-300 hover:-translate-y-0.5 hover:border-blood/60 hover:bg-blood/20"
                  >
                    לקריאת תנאי ההשתתפות
                  </button>
                </div>

                <label className={`mt-4 flex items-start gap-3 text-sm font-bold leading-6 ${termsDocumentRead ? "cursor-pointer text-zinc-200" : "cursor-not-allowed text-zinc-500"}`}>
                  <input
                    type="checkbox"
                    checked={termsConfirmed}
                    disabled={!termsDocumentRead}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      setTermsConfirmed(checked);
                      setTermsAcceptedAt(checked ? new Date().toISOString() : undefined);
                      setErrors((current) => ({ ...current, terms: undefined, save: undefined }));
                    }}
                    className="mt-1 size-5 shrink-0 accent-[#c1121f] disabled:opacity-45"
                  />
                  <span>קראתי ואני מאשר/ת את תנאי ההשתתפות.</span>
                </label>
                {errors.terms && <p className="mt-3 text-sm font-black text-blood">{errors.terms}</p>}

                <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                  <p className="text-sm font-black text-white">צילום ותיעוד</p>
                  <p className="mt-1 text-xs font-bold leading-5 text-zinc-500">בחירה נפרדת. היא לא תנאי לרכישה.</p>
                  <div className="mt-3 grid gap-2">
                    <label className="flex cursor-pointer items-start gap-3 text-sm font-bold leading-6 text-zinc-300">
                      <input
                        type="checkbox"
                        checked={photoConsent === "approved"}
                        onChange={(event) => setPhotoConsent(event.target.checked ? "approved" : "not_selected")}
                        className="mt-1 size-5 shrink-0 accent-[#c1121f]"
                      />
                      <span>אני מאשר/ת צילום ושימוש בתמונות או בסרטונים שבהם אני מופיע/ה לצורכי תיעוד ופרסום.</span>
                    </label>
                    <label className="flex cursor-pointer items-start gap-3 text-sm font-bold leading-6 text-zinc-300">
                      <input
                        type="checkbox"
                        checked={photoConsent === "declined"}
                        onChange={(event) => setPhotoConsent(event.target.checked ? "declined" : "not_selected")}
                        className="mt-1 size-5 shrink-0 accent-[#c1121f]"
                      />
                      <span>איני מעוניין/ת להופיע בצילומים, ואעדכן את הצוות בתחילת האירוע.</span>
                    </label>
                  </div>
                </div>
              </div>

              {isMinor && (
                <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="text-sm font-black text-white">אישור הורה/אפוטרופוס</p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-2 text-sm font-bold text-zinc-200">
                      שם מלא של הורה/אפוטרופוס
                      <input
                        value={guardianName}
                        onChange={(event) => updateGuardian("guardianName", event.target.value)}
                        className="min-h-12 rounded-2xl border border-white/10 bg-black/42 px-4 py-3 text-white outline-none transition focus:border-blood"
                        autoComplete="name"
                      />
                      {errors.guardianName && <span className="text-xs font-black text-blood">{errors.guardianName}</span>}
                    </label>
                    <label className="grid gap-2 text-sm font-bold text-zinc-200">
                      טלפון הורה/אפוטרופוס
                      <input
                        value={guardianPhone}
                        onChange={(event) => updateGuardian("guardianPhone", event.target.value)}
                        className="min-h-12 rounded-2xl border border-white/10 bg-black/42 px-4 py-3 text-white outline-none transition focus:border-blood"
                        autoComplete="tel"
                        inputMode="tel"
                        dir="ltr"
                      />
                      {errors.guardianPhone && <span className="text-xs font-black text-blood">{errors.guardianPhone}</span>}
                    </label>
                  </div>
                  <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm font-bold leading-6 text-zinc-200">
                    <input
                      type="checkbox"
                      checked={guardianConsent}
                      onChange={(event) => {
                        setGuardianConsent(event.target.checked);
                        setErrors((current) => ({ ...current, guardian: undefined, save: undefined }));
                      }}
                      className="mt-1 size-5 shrink-0 accent-[#c1121f]"
                    />
                    <span>אני הורה או אפוטרופוס חוקי של המשתתף/ת, קראתי את המסמכים ואני מאשר/ת את השתתפותו/ה.</span>
                  </label>
                  {guardianConsent && <p className="mt-3 text-xs font-black text-white">אישור הורה/אפוטרופוס הושלם ✓</p>}
                  {errors.guardian && <p className="mt-3 text-sm font-black text-blood">{errors.guardian}</p>}
                </div>
              )}

              {modalFallbackMessage && (
                <p className="rounded-2xl border border-blood/35 bg-blood/10 p-4 text-sm font-black leading-6 text-white">
                  {modalFallbackMessage}
                </p>
              )}
            </section>

            <button
              type="button"
              onClick={continueToSummary}
              className="motion-button inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-blood px-6 py-4 text-center text-base font-black text-white shadow-[0_18px_70px_rgba(193,18,31,0.24)] transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black active:scale-[0.98]"
            >
              המשך לסיכום
            </button>
          </div>
        ) : (
          <div className="grid gap-5">
            <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-sm font-black text-blood">סיכום הרשמה</p>
              <div className="mt-4 grid gap-4 text-sm font-bold leading-7 text-zinc-300">
                <div>
                  <p className="text-zinc-500">כרטיס</p>
                  <p className="text-xl font-black text-white">{ticket.name} · {ticket.priceLabel}</p>
                </div>
                <div>
                  <p className="text-zinc-500">אירועים</p>
                  <div className="mt-2 grid gap-2">
                    {selectedEvents.map((event) => (
                      <p key={event.id} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white">
                        {event.city} · {event.venue} · <span dir="ltr">{event.date}</span>
                      </p>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-zinc-500">פרטים</p>
                  <p className="text-white">{customer.fullName}</p>
                  <p className="text-white" dir="ltr">{customer.phone}</p>
                  <p className="text-white" dir="ltr">{customer.email}</p>
                  <p className="text-white" dir="ltr">{customer.dateOfBirth}</p>
                </div>
                <div>
                  <p className="text-zinc-500">אישורים</p>
                  <div className="mt-2 grid gap-2">
                    <p className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white">
                      הצהרת בריאות: הושלמה
                    </p>
                    <p className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white">
                      תנאי השתתפות: אושרו
                    </p>
                    <p className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white">
                      צילום ותיעוד: {photoConsent === "approved" ? "אושר" : photoConsent === "declined" ? "לא מעוניין/ת" : "לא נבחר"}
                    </p>
                    {isMinor && (
                      <>
                        <p className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white">
                          אישור הורה/אפוטרופוס: אושר
                        </p>
                        <p className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white">
                          הורה/אפוטרופוס: {guardianName} · <span dir="ltr">{guardianPhone}</span>
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <p className="rounded-2xl border border-blood/40 bg-blood/10 p-4 text-sm font-black leading-7 text-white">
              🔒 התשלום מתבצע בצורה מאובטחת באמצעות Grow
            </p>

            {errors.save && <p className="rounded-2xl border border-blood/50 bg-blood/10 p-4 text-sm font-black text-white">{errors.save}</p>}

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setStep("edit")}
                disabled={isSaving}
                className="motion-button inline-flex min-h-14 items-center justify-center rounded-2xl border border-white/20 bg-white/[0.035] px-6 py-4 text-center text-base font-black text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black active:scale-[0.98]"
              >
                חזרה לעריכה
              </button>
              <button
                type="button"
                onClick={continueToPayment}
                disabled={isSaving}
                className="motion-button inline-flex min-h-14 items-center justify-center rounded-2xl bg-blood px-6 py-4 text-center text-base font-black text-white shadow-[0_18px_70px_rgba(193,18,31,0.24)] transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
              >
                {isSaving ? "מעבירים אותך לתשלום..." : "המשך לתשלום מאובטח"}
              </button>
            </div>
          </div>
        )}
        </div>
      </div>

        {isHealthModalOpen && (
          <div
            className="fixed inset-0 z-[999] flex items-center justify-center overflow-hidden bg-black/82 px-3 py-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:px-5"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeHealthModal();
              }
            }}
          >
            <div
              ref={healthDialogRef}
              className="mx-auto flex h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#080808] text-right shadow-[0_30px_120px_rgba(0,0,0,0.65)] sm:h-[min(46rem,calc(100vh-3rem))]"
              role="dialog"
              aria-modal="true"
              aria-labelledby="health-declaration-title"
              dir="rtl"
            >
              <div className="shrink-0 border-b border-white/10 p-5 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-black tracking-[0.08em] text-blood">PushTakim</p>
                  <h4 id="health-declaration-title" className="mt-3 text-3xl font-black leading-tight text-white">
                    הצהרת בריאות להשתתפות בפעילות
                  </h4>
                  <p className="mt-2 text-sm font-bold leading-7 text-zinc-300">
                    הפעילות כוללת תנועה, מאמץ גופני, ריצה, קפיצה, טיפוס, תרגילי כוח, אקרובטיקה ופעילויות נוספות בהתאם לאופי המפגש. המטרה של השאלון היא לעזור לנו להבין אם יש משהו שכדאי לבדוק לפני שמתחילים — כדי שכולם יוכלו להשתתף בצורה אחראית ובטוחה ככל האפשר.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeHealthModal}
                  className="motion-button grid size-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-xl font-black text-white transition hover:bg-white hover:text-black"
                  aria-label="סגירת הצהרת בריאות"
                >
                  ×
                </button>
                </div>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
                  <div className="h-full rounded-full bg-blood transition-all duration-300" style={{ width: `${healthProgress}%` }} />
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-7">
                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                  <p className="text-xs font-black tracking-[0.12em] text-blood">
                    שאלה {healthStep + 1} מתוך {healthQuestions.length}
                  </p>
                  <p className="mt-4 text-xl font-black leading-8 text-white">{healthQuestions[healthStep]}</p>
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    {(["no", "yes"] as const).map((answer) => {
                      const active = healthAnswers[healthStep] === answer;

                      return (
                        <button
                          key={answer}
                          type="button"
                          onClick={() => answerHealthQuestion(healthStep, answer)}
                          className={`motion-button min-h-14 rounded-2xl border px-4 py-3 text-base font-black transition duration-300 ${
                            active
                              ? "border-blood bg-blood text-white shadow-[0_0_28px_rgba(193,18,31,0.24)]"
                              : "border-white/10 bg-black/30 text-zinc-200 hover:border-blood/55 hover:text-white"
                          }`}
                          aria-pressed={active}
                        >
                          {answer === "no" ? "לא" : "כן"}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {answeredHealthQuestions && !hasMedicalReviewAnswer && (
                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                    <p className="text-sm font-bold leading-7 text-zinc-200">
                      אני מצהיר/ה כי קראתי את השאלות, עניתי עליהן בכנות ולמיטב ידיעתי אין מניעה רפואית ידועה להשתתפותי בפעילות. ידוע לי שעליי להפסיק מיד אם ארגיש כאב חריג, סחרחורת, קוצר נשימה חריג, חולשה, בחילה או כל תחושה מדאיגה, ולדווח לצוות.
                    </p>
                    <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm font-black leading-6 text-white">
                      <input
                        type="checkbox"
                        checked={healthDeclarationAccepted}
                        onChange={(event) => setHealthDeclarationAccepted(event.target.checked)}
                        className="mt-1 size-5 shrink-0 accent-[#c1121f]"
                      />
                      <span>אני מאשר/ת שהמידע שמסרתי נכון ומלא למיטב ידיעתי.</span>
                    </label>
                  </div>
                )}

                {answeredHealthQuestions && hasMedicalReviewAnswer && (
                  <div className="mt-5 rounded-2xl border border-amber-300/35 bg-amber-300/10 p-4 text-sm font-black leading-7 text-amber-100">
                    <p>סימנת תשובה שכדאי לבדוק לפני ההשתתפות. זה לא בהכרח אומר שלא ניתן להשתתף, אבל כדי לשמור עליך נבקש ליצור איתנו קשר, ובמקרים המתאימים להציג אישור רפואי שמאשר השתתפות בפעילות.</p>
                  </div>
                )}

                <p className="mt-5 rounded-2xl border border-white/10 bg-black/28 p-4 text-xs font-bold leading-6 text-zinc-400">
                  המידע נועד לבדיקת התאמה בסיסית לפעילות, לניהול ההרשמה ולשמירה על בטיחות המשתתפים. המידע יישמר בצורה מאובטחת, יהיה נגיש רק לגורמים המורשים לכך ולא ייעשה בו שימוש שיווקי.
                </p>
              </div>

              <div className="shrink-0 border-t border-white/10 bg-[#080808] p-4 sm:p-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setHealthStep((current) => Math.max(0, current - 1))}
                    disabled={healthStep === 0}
                    className="motion-button inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.035] px-4 py-3 text-sm font-black text-white transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    חזרה
                  </button>
                  {healthStep < healthQuestions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setHealthStep((current) => Math.min(healthQuestions.length - 1, current + 1))}
                      disabled={!healthAnswers[healthStep]}
                      className="motion-button inline-flex min-h-12 items-center justify-center rounded-2xl bg-blood px-4 py-3 text-sm font-black text-white transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-zinc-500"
                    >
                      לשאלה הבאה
                    </button>
                  ) : hasMedicalReviewAnswer ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={contactPushTakimForMedicalReview}
                        className="motion-button inline-flex min-h-12 items-center justify-center rounded-2xl bg-blood px-4 py-3 text-sm font-black text-white transition hover:bg-white hover:text-black"
                      >
                        יצירת קשר עם פושטקים
                      </button>
                      <button
                        type="button"
                        onClick={() => setHealthStep(0)}
                        className="motion-button inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.035] px-4 py-3 text-sm font-black text-white transition hover:bg-white hover:text-black"
                      >
                        חזרה לשאלון
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={completeHealthDeclaration}
                      disabled={!answeredHealthQuestions || !healthDeclarationAccepted}
                      className="motion-button inline-flex min-h-12 items-center justify-center rounded-2xl bg-blood px-4 py-3 text-sm font-black text-white transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-zinc-500"
                    >
                      סיום הצהרת בריאות
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {isTermsModalOpen && (
          <div
            className="fixed inset-0 z-[70] bg-black/82 px-3 py-3 backdrop-blur-sm sm:px-5 sm:py-6"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeTermsModal();
              }
            }}
          >
            <div
              ref={termsDialogRef}
              className="relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#080808] text-right shadow-[0_30px_120px_rgba(0,0,0,0.65)] sm:max-h-[min(48rem,calc(100vh-3rem))]"
              role="dialog"
              aria-modal="true"
              aria-labelledby="participation-terms-title"
              dir="rtl"
            >
              <div className="shrink-0 border-b border-white/10 p-5 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-black tracking-[0.08em] text-blood">PushTakim</p>
                  <h4 id="participation-terms-title" className="mt-3 text-3xl font-black leading-tight text-white">
                    תנאי השתתפות בפעילויות PushTakim
                  </h4>
                  <p className="mt-2 text-sm font-bold leading-7 text-zinc-300">
                    אנחנו באים לזוז, ללמוד, להכיר וליהנות — אבל תנועה כוללת גם אחריות. התנאים הבאים נועדו לוודא שכולנו מבינים את אופי הפעילות ושומרים ככל האפשר על עצמנו ועל האנשים שסביבנו.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeTermsModal}
                  className="motion-button grid size-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-xl font-black text-white transition hover:bg-white hover:text-black"
                  aria-label="סגירת תנאי השתתפות"
                >
                  ×
                </button>
                </div>
              </div>

              <div
                ref={termsScrollRef}
                onScroll={(event) => {
                  const element = event.currentTarget;
                  const nearBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 120;
                  if (nearBottom) {
                    setTermsDocumentRead(true);
                  }
                }}
                className="min-h-0 flex-1 overscroll-contain overflow-y-auto p-5 sm:p-7"
              >
                <div className="grid gap-5">
                  {termsSections.map((section) => (
                    <section key={section.title} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                      <h5 className="text-xl font-black leading-tight text-white">{section.title}</h5>
                      {section.paragraphs?.map((paragraph) => (
                        <p key={paragraph} className="mt-3 text-sm font-bold leading-7 text-zinc-300">
                          {paragraph}
                        </p>
                      ))}
                      {section.bullets && (
                        <ul className="mt-3 grid gap-2 text-sm font-bold leading-7 text-zinc-300">
                          {section.bullets.map((bullet) => (
                            <li key={bullet} className="flex gap-2">
                              <span className="text-blood">•</span>
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>
                  ))}
                </div>
              </div>

              <div className="shrink-0 border-t border-white/10 bg-[#080808] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={closeTermsModal}
                    className="motion-button inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.035] px-4 py-3 text-sm font-black text-white transition hover:bg-white hover:text-black"
                  >
                    סגירה
                  </button>
                  <button
                    type="button"
                    onClick={markTermsRead}
                    className="motion-button inline-flex min-h-12 items-center justify-center rounded-2xl bg-blood px-4 py-3 text-sm font-black text-white transition hover:bg-white hover:text-black"
                  >
                    קראתי והבנתי
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>,
    document.body
  );
}
