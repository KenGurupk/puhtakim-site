"use client";

import { useEffect, useMemo, useState } from "react";

import { checkoutConfig } from "@/lib/checkout-config";
import type { CheckoutIntent } from "@/lib/checkout-intents";

const openingTicketLimit = 15;

type StatusFilter = "all" | "paid" | "pending_cash" | "cash_paid";
type MissingFilter = "all" | "missing_health" | "missing_terms";
type SourceFilter = "all" | "Website Purchase" | "Manual Check-in" | "Cash / Walk-in" | "Missing Forms Completion";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0
  }).format(value);
}

function paidRevenue(intent: CheckoutIntent) {
  if (intent.status !== "paid") {
    return 0;
  }

  return typeof intent.growPaymentAmount === "number" ? intent.growPaymentAmount : intent.price;
}

function formatDate(value: string | undefined) {
  if (!value) {
    return "לא הוזן";
  }

  return new Intl.DateTimeFormat("he-IL", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function calculateAge(dateOfBirth: string | undefined) {
  if (!dateOfBirth) {
    return "לא הוזן";
  }

  const birthDate = new Date(`${dateOfBirth}T00:00:00`);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return Number.isFinite(age) ? String(age) : "לא הוזן";
}

function csvCell(value: string | number | undefined) {
  const stringValue = String(value ?? "");
  return `"${stringValue.replace(/"/g, '""')}"`;
}

function displayBoolean(value: boolean | undefined) {
  if (typeof value !== "boolean") {
    return "לא הוזן";
  }

  return value ? "כן" : "לא";
}

function eventLabel(intent: CheckoutIntent) {
  return intent.selectedEvents.map((event) => `${event.city} / ${event.venue} / ${event.date}`).join(" | ") || "לא הוזן";
}

function registrationSource(intent: CheckoutIntent): NonNullable<CheckoutIntent["registrationSource"]> {
  if (intent.registrationSource) {
    return intent.registrationSource;
  }

  if (intent.sourcePage === "/checkin" && intent.paymentMethod === "Cash") {
    return "Cash / Walk-in";
  }

  if (intent.checkinFormCompleted && intent.paymentProvider === "grow") {
    return "Missing Forms Completion";
  }

  return "Website Purchase";
}

function paymentMethod(intent: CheckoutIntent) {
  if (intent.paymentMethod) {
    return intent.paymentMethod;
  }

  return intent.paymentProvider === "cash" ? "Cash" : "Grow";
}

function paymentStatus(intent: CheckoutIntent) {
  if (intent.status === "pending_cash") {
    return "Pending Cash";
  }

  if (intent.status === "paid" && paymentMethod(intent) === "Cash") {
    return "Cash Paid";
  }

  if (intent.status === "paid") {
    return "Paid";
  }

  if (intent.status === "pending_payment") {
    return "Pending Payment";
  }

  if (intent.status === "failed") {
    return "Failed";
  }

  return "Cancelled";
}

function statusBadgeClass(intent: CheckoutIntent) {
  if (intent.status === "paid" && paymentMethod(intent) === "Cash") {
    return "border-amber-300/40 bg-amber-300/10 text-amber-100";
  }

  if (intent.status === "paid") {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-200";
  }

  if (intent.status === "pending_cash") {
    return "border-amber-300/35 bg-amber-300/10 text-amber-100";
  }

  if (intent.status === "failed") {
    return "border-blood/40 bg-blood/10 text-red-200";
  }

  return "border-zinc-300/20 bg-zinc-300/10 text-zinc-300";
}

function groupByTicketType(intents: CheckoutIntent[]) {
  return checkoutConfig.tickets.map((ticket) => {
    const matching = intents.filter((intent) => intent.ticketType === ticket.type);

    return {
      id: ticket.type,
      name: ticket.name,
      count: matching.length,
      revenue: matching.reduce((sum, intent) => sum + paidRevenue(intent), 0)
    };
  });
}

function groupByEvent(intents: CheckoutIntent[]) {
  return checkoutConfig.events.map((event) => {
    const matching = intents.filter((intent) => intent.selectedEventIds.includes(event.id));

    return {
      id: event.id,
      name: `${event.city} / ${event.venue}`,
      date: event.date,
      count: matching.length,
      revenue: matching.reduce((sum, intent) => sum + paidRevenue(intent), 0)
    };
  });
}

function exportRows(intents: CheckoutIntent[]) {
  const headers = [
    "Full name",
    "Age",
    "Phone",
    "Email",
    "Ticket type",
    "Event",
    "Payment method",
    "Payment status",
    "Health declaration",
    "Terms accepted",
    "Registration source",
    "Submission date",
    "Notes"
  ];

  const rows = intents.map((intent) => [
    intent.fullName,
    calculateAge(intent.dateOfBirth),
    intent.phone,
    intent.email,
    intent.ticketName,
    eventLabel(intent),
    paymentMethod(intent),
    paymentStatus(intent),
    displayBoolean(intent.compliance?.healthDeclarationCompleted),
    displayBoolean(intent.compliance?.termsAccepted),
    registrationSource(intent),
    formatDate(intent.createdAt),
    intent.notes
  ]);

  return { headers, rows };
}

export function AdminDashboard() {
  const [query, setQuery] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [missingFilter, setMissingFilter] = useState<MissingFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [intents, setIntents] = useState<CheckoutIntent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [updatingReference, setUpdatingReference] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadPurchases() {
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/purchases", { cache: "no-store" });
      const payload = (await response.json()) as { purchases?: CheckoutIntent[]; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "לא הצלחנו לטעון את נתוני המכירות.");
      }

      setIntents(payload.purchases ?? []);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "לא הצלחנו לטעון את נתוני המכירות.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadPurchases();
  }, []);

  const filteredIntents = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return intents.filter((intent) => {
      const matchesQuery =
        !normalized ||
        [intent.fullName, intent.phone, intent.email, intent.checkoutReference].join(" ").toLowerCase().includes(normalized);
      const matchesEvent = eventFilter === "all" || intent.selectedEventIds.includes(eventFilter);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "cash_paid" ? intent.status === "paid" && paymentMethod(intent) === "Cash" : intent.status === statusFilter);
      const matchesMissing =
        missingFilter === "all" ||
        (missingFilter === "missing_health"
          ? intent.compliance?.healthDeclarationCompleted !== true
          : intent.compliance?.termsAccepted !== true);
      const matchesSource = sourceFilter === "all" || registrationSource(intent) === sourceFilter;

      return matchesQuery && matchesEvent && matchesStatus && matchesMissing && matchesSource;
    });
  }, [eventFilter, intents, missingFilter, query, sourceFilter, statusFilter]);

  const manualCheckins = useMemo(
    () =>
      filteredIntents.filter(
        (intent) =>
          intent.checkinFormCompleted ||
          intent.paymentProvider === "cash" ||
          registrationSource(intent) === "Cash / Walk-in" ||
          registrationSource(intent) === "Missing Forms Completion" ||
          registrationSource(intent) === "Manual Check-in"
      ),
    [filteredIntents]
  );

  const metrics = useMemo(() => {
    const paidIntents = intents.filter((intent) => intent.status === "paid");
    const pendingCash = intents.filter((intent) => intent.status === "pending_cash");
    const cashPaid = intents.filter((intent) => intent.status === "paid" && paymentMethod(intent) === "Cash");
    const openingSold = paidIntents.filter((intent) => intent.ticketType === "opening").length;

    return {
      totalSold: paidIntents.length,
      totalRevenue: paidIntents.reduce((sum, intent) => sum + paidRevenue(intent), 0),
      openingRemaining: Math.max(openingTicketLimit - openingSold, 0),
      openingSold,
      pendingCashCount: pendingCash.length,
      cashPaidCount: cashPaid.length,
      byEvent: groupByEvent(paidIntents),
      byTicketType: groupByTicketType(paidIntents)
    };
  }, [intents]);

  function exportCsv() {
    const { headers, rows } = exportRows(filteredIntents);
    const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pushtakim-updated-event-list-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function exportXlsx() {
    setIsExporting(true);

    try {
      const params = new URLSearchParams({
        query,
        event: eventFilter,
        status: statusFilter,
        missing: missingFilter,
        source: sourceFilter
      });
      const response = await fetch(`/api/admin/event-checkin-export?${params.toString()}`, { cache: "no-store" });

      if (!response.ok) {
        throw new Error("לא הצלחנו לייצא את הקובץ.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `pushtakim-updated-event-list-${new Date().toISOString().slice(0, 10)}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
      setError(null);
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "לא הצלחנו לייצא את הקובץ.");
    } finally {
      setIsExporting(false);
    }
  }

  async function markCashPaid(checkoutReference: string) {
    setUpdatingReference(checkoutReference);

    try {
      const response = await fetch("/api/admin/cash-paid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkoutReference })
      });
      const payload = (await response.json().catch(() => null)) as { purchase?: CheckoutIntent; error?: string } | null;

      if (!response.ok || !payload?.purchase) {
        throw new Error(payload?.error ?? "לא הצלחנו לעדכן תשלום מזומן.");
      }

      setIntents((current) =>
        current.map((intent) => (intent.checkoutReference === payload.purchase?.checkoutReference ? payload.purchase : intent))
      );
      setError(null);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "לא הצלחנו לעדכן תשלום מזומן.");
    } finally {
      setUpdatingReference(null);
    }
  }

  return (
    <section className="relative isolate overflow-hidden bg-black px-5 py-24 text-white sm:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_8%,rgba(193,18,31,0.24),transparent_32rem),linear-gradient(180deg,#050505_0%,#111_45%,#050505_100%)]" />
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 border-b border-white/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black tracking-[0.16em] text-blood">PushTakim Admin</p>
            <h1 className="mt-4 text-5xl font-black leading-tight sm:text-7xl">לוח מכירות</h1>
            <p className="mt-4 max-w-2xl text-base font-bold leading-8 text-zinc-300">
              נתוני הרשמה מרכזיים לפי רכישות Grow, צ׳ק-אין במקום והשלמת טפסים.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://pushtakim.co.il/checkin"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.045] px-5 py-3 text-sm font-black text-white transition hover:bg-white hover:text-black"
            >
              פתיחת טופס צ׳ק-אין
            </a>
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-blood/45 bg-blood/12 px-5 py-3 text-sm font-black text-white transition hover:bg-blood"
            >
              ייצוא CSV
            </button>
            <button
              type="button"
              onClick={exportXlsx}
              disabled={isExporting}
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-blood px-5 py-3 text-sm font-black text-white shadow-[0_18px_70px_rgba(193,18,31,0.24)] transition hover:bg-white hover:text-black disabled:cursor-wait disabled:opacity-70"
            >
              {isExporting ? "מייצאים..." : "ייצוא רשימת אירוע מעודכנת"}
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="סה״כ כרטיסים ששולמו" value={metrics.totalSold.toLocaleString("he-IL")} />
          <MetricCard label="סה״כ הכנסות מאומתות" value={formatCurrency(metrics.totalRevenue)} />
          <MetricCard label="כרטיסי פתיחה שנותרו" value={`${metrics.openingRemaining} מתוך ${openingTicketLimit}`} detail={`${metrics.openingSold} נמכרו`} />
          <MetricCard label="מזומן באירוע" value={metrics.pendingCashCount.toLocaleString("he-IL")} detail={`${metrics.cashPaidCount} סומנו Cash Paid`} />
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <BreakdownCard title="מכירות לפי אירוע" items={metrics.byEvent} />
          <BreakdownCard title="מכירות לפי סוג כרטיס" items={metrics.byTicketType} />
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.32)] sm:p-6">
          <div className="grid gap-4 lg:grid-cols-5">
            <label className="grid gap-2 text-sm font-black text-zinc-200">
              חיפוש
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="min-h-12 rounded-2xl border border-white/10 bg-black/42 px-4 py-3 text-white outline-none transition focus:border-blood"
                placeholder="שם, טלפון או אימייל"
              />
            </label>
            <Select label="אירוע" value={eventFilter} onChange={setEventFilter} options={[["all", "כל האירועים"], ...checkoutConfig.events.map((event) => [event.id, `${event.city} / ${event.date}`] as [string, string])]} />
            <Select
              label="סטטוס"
              value={statusFilter}
              onChange={(value) => setStatusFilter(value as StatusFilter)}
              options={[
                ["all", "כל הסטטוסים"],
                ["paid", "Paid"],
                ["pending_cash", "Pending Cash"],
                ["cash_paid", "Cash Paid"]
              ]}
            />
            <Select
              label="אישורים חסרים"
              value={missingFilter}
              onChange={(value) => setMissingFilter(value as MissingFilter)}
              options={[
                ["all", "הכל"],
                ["missing_health", "חסרה הצהרת בריאות"],
                ["missing_terms", "חסרים תנאים"]
              ]}
            />
            <Select
              label="מקור הרשמה"
              value={sourceFilter}
              onChange={(value) => setSourceFilter(value as SourceFilter)}
              options={[
                ["all", "כל המקורות"],
                ["Website Purchase", "Website Purchase"],
                ["Manual Check-in", "Manual Check-in"],
                ["Cash / Walk-in", "Cash / Walk-in"],
                ["Missing Forms Completion", "Missing Forms Completion"]
              ]}
            />
          </div>

          {isLoading && <StatusNotice text="טוענים נתונים מרכזיים..." />}
          {error && <StatusNotice text={error} tone="error" />}
        </div>

        <AdminTable title="רכישות והרשמות" intents={filteredIntents} onMarkCashPaid={markCashPaid} updatingReference={updatingReference} />

        <section className="mt-8 rounded-2xl border border-amber-300/24 bg-[linear-gradient(145deg,rgba(245,158,11,0.11),rgba(255,255,255,0.045)_52%,rgba(193,18,31,0.1))] p-5 shadow-[0_24px_90px_rgba(245,158,11,0.11)] sm:p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-black tracking-[0.12em] text-amber-200">Cash / Walk-in</p>
              <h2 className="mt-3 text-3xl font-black">רישום ידני / תשלום במזומן</h2>
              <p className="mt-2 text-sm font-bold leading-7 text-zinc-300">
                כאן מופיעות הרשמות מהטופס בכניסה, משתתפי מזומן ומשתתפים ששילמו בעבר והשלימו טפסים.
              </p>
            </div>
            <p className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm font-black text-white">
              {manualCheckins.length} רשומות מוצגות
            </p>
          </div>
          <AdminTable intents={manualCheckins} compact onMarkCashPaid={markCashPaid} updatingReference={updatingReference} />
        </section>
      </div>
    </section>
  );
}

function AdminTable({
  title,
  intents,
  compact,
  onMarkCashPaid,
  updatingReference
}: {
  title?: string;
  intents: CheckoutIntent[];
  compact?: boolean;
  onMarkCashPaid: (checkoutReference: string) => void;
  updatingReference: string | null;
}) {
  return (
    <div className={`${title ? "mt-8" : "mt-6"} overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.045] p-4 shadow-[0_24px_90px_rgba(0,0,0,0.32)] sm:p-5`}>
      {title && <h2 className="mb-5 text-3xl font-black">{title}</h2>}
      <table className={`${compact ? "min-w-[82rem]" : "min-w-[76rem]"} w-full border-separate border-spacing-y-2 text-right text-sm`}>
        <thead className="text-xs font-black text-zinc-500">
          <tr>
            <th className="px-4 py-2">שם מלא</th>
            <th className="px-4 py-2">טלפון</th>
            <th className="px-4 py-2">אימייל</th>
            <th className="px-4 py-2">תאריך לידה / גיל</th>
            <th className="px-4 py-2">אירוע</th>
            <th className="px-4 py-2">תשלום</th>
            <th className="px-4 py-2">אישורים</th>
            <th className="px-4 py-2">מקור</th>
            <th className="px-4 py-2">נשלח</th>
            <th className="px-4 py-2">הערות</th>
            <th className="px-4 py-2">פעולה</th>
          </tr>
        </thead>
        <tbody>
          {intents.map((intent) => (
            <tr key={intent.checkoutReference} className="rounded-2xl bg-black/35 text-zinc-200">
              <td className="rounded-r-2xl px-4 py-4 font-black text-white">{intent.fullName || "לא הוזן"}</td>
              <td className="px-4 py-4" dir="ltr">{intent.phone || "לא הוזן"}</td>
              <td className="px-4 py-4" dir="ltr">{intent.email || "לא הוזן"}</td>
              <td className="px-4 py-4">
                <p dir="ltr">{intent.dateOfBirth || "לא הוזן"}</p>
                <p className="mt-1 text-xs text-zinc-500">גיל: {calculateAge(intent.dateOfBirth)}</p>
              </td>
              <td className="px-4 py-4">{eventLabel(intent)}</td>
              <td className="px-4 py-4">
                <p>{paymentMethod(intent)}</p>
                <span className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-black ${statusBadgeClass(intent)}`}>
                  {paymentStatus(intent)}
                </span>
              </td>
              <td className="px-4 py-4">
                <p>בריאות: {displayBoolean(intent.compliance?.healthDeclarationCompleted)}</p>
                <p>תנאים: {displayBoolean(intent.compliance?.termsAccepted)}</p>
              </td>
              <td className="px-4 py-4">{registrationSource(intent)}</td>
              <td className="px-4 py-4">{formatDate(intent.createdAt)}</td>
              <td className="px-4 py-4">{intent.notes || "אין"}</td>
              <td className="rounded-l-2xl px-4 py-4">
                {intent.status === "pending_cash" ? (
                  <button
                    type="button"
                    onClick={() => onMarkCashPaid(intent.checkoutReference)}
                    disabled={updatingReference === intent.checkoutReference}
                    className="inline-flex min-h-10 items-center justify-center rounded-xl bg-amber-300 px-4 py-2 text-xs font-black text-black transition hover:bg-white disabled:cursor-wait disabled:opacity-60"
                  >
                    {updatingReference === intent.checkoutReference ? "מעדכן..." : "סימון Cash Paid"}
                  </button>
                ) : (
                  <span className="text-xs font-bold text-zinc-500">אין פעולה</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!intents.length && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-8 text-center text-sm font-bold text-zinc-400">
          אין רשומות להצגה.
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.28)]">
      <p className="text-sm font-black text-zinc-400">{label}</p>
      <p className="mt-4 text-4xl font-black text-white">{value}</p>
      {detail && <p className="mt-2 text-sm font-bold text-blood">{detail}</p>}
    </article>
  );
}

function BreakdownCard({
  title,
  items
}: {
  title: string;
  items: Array<{ id: string; name: string; date?: string; count: number; revenue: number }>;
}) {
  const max = Math.max(...items.map((item) => item.count), 1);

  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.28)] sm:p-6">
      <h2 className="text-3xl font-black">{title}</h2>
      <div className="mt-5 grid gap-4">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-black text-white">{item.name}</p>
                {item.date && <p className="mt-1 text-xs font-bold text-zinc-500" dir="ltr">{item.date}</p>}
              </div>
              <div className="text-left">
                <p className="text-xl font-black text-white">{item.count}</p>
                <p className="text-xs font-bold text-zinc-500">{formatCurrency(item.revenue)}</p>
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-blood shadow-[0_0_24px_rgba(193,18,31,0.8)]"
                style={{ width: `${Math.max((item.count / max) * 100, item.count ? 8 : 0)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function Select({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<[string, string]>;
}) {
  return (
    <label className="grid gap-2 text-sm font-black text-zinc-200">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 rounded-2xl border border-white/10 bg-black/42 px-4 py-3 text-white outline-none transition focus:border-blood"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function StatusNotice({ text, tone = "info" }: { text: string; tone?: "info" | "error" }) {
  return (
    <div className={`mt-5 rounded-2xl border p-5 text-sm font-black ${tone === "error" ? "border-blood/40 bg-blood/10 text-white" : "border-white/10 bg-black/30 text-zinc-300"}`}>
      {text}
    </div>
  );
}
