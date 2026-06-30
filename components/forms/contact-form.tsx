"use client";

import { useState } from "react";
import type { ContactInquiryType, ContactPayload } from "@/types/contact";

const inquiryTypes: ContactInquiryType[] = ["הזמנה", "סדנה", "הפקה", "שיתוף פעולה", "חנות"];

export function ContactForm() {
  const [type, setType] = useState<ContactInquiryType>(inquiryTypes[0]);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  return (
    <form
      className="grid gap-5 rounded-lg border border-white/10 bg-white/[0.045] p-5 sm:p-8"
      onSubmit={async (event) => {
        event.preventDefault();
        setStatus("sending");

        const form = new FormData(event.currentTarget);
        const payload: ContactPayload = {
          name: String(form.get("name") ?? ""),
          email: String(form.get("email") ?? ""),
          type,
          message: String(form.get("message") ?? "")
        };

        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        setStatus(response.ok ? "sent" : "error");
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-zinc-200">
          שם
          <input
            name="name"
            required
            className="rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-citron"
            autoComplete="name"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-zinc-200">
          אימייל
          <input
            name="email"
            type="email"
            required
            className="rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-citron"
            autoComplete="email"
          />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-semibold text-zinc-200">
        סוג פנייה
        <select
          name="type"
          value={type}
          onChange={(event) => setType(event.target.value as ContactInquiryType)}
          className="rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-citron"
        >
          {inquiryTypes.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-semibold text-zinc-200">
        הודעה
        <textarea
          name="message"
          required
          rows={6}
          className="resize-none rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-citron"
        />
      </label>
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-fit rounded-full bg-citron px-5 py-3 text-sm font-black text-ink transition hover:bg-white"
      >
        {status === "sending" ? "שולחים..." : "שלחו פנייה"}
      </button>
      {status === "sent" && (
        <p className="rounded-md border border-lagoon/30 bg-lagoon/10 px-4 py-3 text-sm font-semibold text-lagoon">
          קיבלנו את הפנייה. מכאן אפשר לחבר את הטופס למייל, CRM או מערכת כרטיסים.
        </p>
      )}
      {status === "error" && (
        <p className="rounded-md border border-ember/30 bg-ember/10 px-4 py-3 text-sm font-semibold text-ember">
          משהו השתבש. בדקו את השדות ונסו שוב.
        </p>
      )}
    </form>
  );
}
