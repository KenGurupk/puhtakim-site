import type { EventListing, Feature } from "@/types/content";

export const pillars: Feature[] = [
  {
    meta: "קהילה",
    title: "אנשים לפני ביצועים",
    description:
      "מפגשים שבהם עוזרים אחד לשני לנחות, לנסות, לצחוק, ללמוד ולהרגיש חלק ממשהו גדול יותר."
  },
  {
    meta: "תנועה",
    title: "כל דרך לזוז נכנסת",
    description:
      "פארקור, טריקינג, קליסטניקס, ברייקדאנס, קרקס, אקרובטיקה וכל מי שמחפש שפה חדשה לגוף."
  },
  {
    meta: "שטח",
    title: "מהרחוב לאולם וחזרה",
    description:
      "ספוטים, אולמות, סדנאות, אימונים פתוחים ואירועים שמחברים בין אנשים, ערים וקהילות."
  }
];

export const events: EventListing[] = [
  {
    id: "push-tour-mabuza",
    title: "Push Tour 2026 - Mabuza",
    date: "03.08",
    time: "18:00-20:00",
    location: "פתח תקווה",
    address: "דב לויטן 8, פתח תקווה",
    type: "event",
    description: "התכנסות, סדנה, אימון פתוח ואתגרים עם פרסים.",
    ticketStatus: "available",
    ticketUrl: "/contact?topic=push-tour-mabuza"
  },
  {
    id: "push-tour-raiz",
    title: "Push Tour 2026 - Raiz Gym",
    date: "14.08",
    time: "12:00-14:00",
    location: "מודיעין",
    address: "מתתיהו הכהן 5, מודיעין",
    type: "workshop",
    description: "סדנת מניעת פציעות, אימון פתוח ואתגרים מכל תחום.",
    ticketStatus: "available",
    ticketUrl: "/contact?topic=push-tour-raiz"
  },
  {
    id: "push-tour-pk-spot",
    title: "Push Tour 2026 - PK Spot",
    date: "16.08",
    time: "10:00-12:00 Community Skill Round / 12:00-13:00 Break / 13:00-15:00 Final + Open Gym",
    location: "באר שבע",
    address: "מבצע יואב 49, באר שבע",
    type: "event",
    description: "ספוטים בחוץ, מוקדמות תחרות סקיל, הפסקה, גמר באולם ואימון פתוח.",
    ticketStatus: "available",
    ticketUrl: "/contact?topic=push-tour-pk-spot"
  },
  {
    id: "push-tour-calima",
    title: "Push Tour 2026 - Calima",
    date: "28.08",
    time: "10:30-13:00",
    location: "ראשון לציון",
    address: "הכשרת היישוב 10, ראשון לציון",
    type: "workshop",
    description: "סדנת טריקים משותפים, אימון פתוח, אתגרים ופרסים.",
    ticketStatus: "available",
    ticketUrl: "/contact?topic=push-tour-calima"
  }
];

export const workshops: Feature[] = [
  {
    meta: "יסודות",
    title: "פארקור ותנועה בסיסית",
    description:
      "נחיתות, קפיצות, מעברים, ביטחון בגוף והיכרות עם הדרך שבה קוראים מרחב."
  },
  {
    meta: "כוח",
    title: "קליסטניקס ושליטה",
    description:
      "כוח יחסי, יציבות, החזקות, משיכות ודחיפות שמשרתות תנועה אמיתית."
  },
  {
    meta: "אקרובטיקה",
    title: "טריקים, סיבובים וזרימה",
    description:
      "עבודה הדרגתית על ביטחון, טכניקה, חיבור בין אלמנטים ותנועה משותפת."
  }
];

export const shows: Feature[] = [
  {
    meta: "במה",
    title: "מופעי תנועה חיים",
    description:
      "פורמטים קצרים וחזקים לאירועים, פסטיבלים, השקות, עיריות ומרכזי תרבות."
  },
  {
    meta: "פעלולים",
    title: "אקשן למצלמה ולבמה",
    description:
      "בניית רגעי תנועה, נפילות, מרדפים, קפיצות וקומפוזיציות עם תיאום בטיחותי."
  },
  {
    meta: "קהילה",
    title: "שואוקייסים ואירועי רחוב",
    description:
      "ליינים שמביאים את הקהילה החוצה: מעגלים, באטלים, הופעות, הדגמות וסשנים פתוחים."
  }
];

export const productionServices: Feature[] = [
  {
    meta: "קונספט",
    title: "פיתוח פרויקטי תנועה",
    description:
      "מהרעיון הראשון ועד פורמט שאפשר להפיק: קהל, חלל, אמנים, זרימה וחוויה."
  },
  {
    meta: "הפקה",
    title: "אירועים וסדנאות",
    description:
      "תכנון זמנים, צוותים, חלוקת מרחב, ניהול משתתפים ותיאום בין קהילות ומדריכים."
  },
  {
    meta: "תוכן",
    title: "ימי צילום וסטוריטלינג",
    description:
      "בניית רגעים אמיתיים לצילום, וידאו וקמפיינים שמרגישים כמו תנועה ולא כמו פרסומת."
  }
];

export const storeItems: Feature[] = [
  {
    meta: "לבוש",
    title: "דרופים לקהילה",
    description:
      "חולצות, קפוצ׳ונים ופריטים שיצאו רק כשיהיה להם קשר אמיתי לשטח."
  },
  {
    meta: "אקססוריז",
    title: "ציוד קטן לסשנים",
    description:
      "פריטים שימושיים לאימונים, מפגשים, תיקים, מדבקות ומה שבאמת צריך בדרך."
  },
  {
    meta: "מהדורות",
    title: "פוסטרים וזינים",
    description:
      "תיעוד של אירועים, רגעים, קהילות ואנשים שמרכיבים את הסיפור של PushTakim."
  }
];
