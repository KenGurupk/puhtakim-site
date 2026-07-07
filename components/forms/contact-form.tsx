"use client";

import { useState } from "react";

import { siteCopy } from "@/content/site-copy";
import type { ContactInquiryType, ContactPayload } from "@/types/contact";

const inquiryTypes = siteCopy.contact.form.inquiryTypes;

export function ContactForm() {
  const [type, setType] = useState<ContactInquiryType>(inquiryTypes[0]);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  return (
    <form
      className="grid gap-5 rounded-2xl border border-white/10 bg-white/[0.045] p-5 sm:p-8"
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
          {siteCopy.contact.form.fields.name}
          <input
            name="name"
            required
            className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-blood"
            autoComplete="name"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-zinc-200">
          {siteCopy.contact.form.fields.email}
          <input
            name="email"
            type="email"
            required
            className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-blood"
            autoComplete="email"
          />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-semibold text-zinc-200">
        {siteCopy.contact.form.fields.type}
        <select
          name="type"
          value={type}
          onChange={(event) => setType(event.target.value as ContactInquiryType)}
          className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-blood"
        >
          {inquiryTypes.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-semibold text-zinc-200">
        {siteCopy.contact.form.fields.message}
        <textarea
          name="message"
          required
          rows={6}
          className="resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-blood"
        />
      </label>
      <button
        type="submit"
        disabled={status === "sending"}
        className="motion-button inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-blood px-5 py-3 text-center text-sm font-black text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black active:scale-[0.98] sm:w-fit"
      >
        {status === "sending" ? siteCopy.contact.form.sending : siteCopy.contact.form.submit}
      </button>
      {status === "sent" && (
        <p className="rounded-2xl border border-blood/30 bg-blood/10 px-4 py-3 text-sm font-semibold text-white">
          {siteCopy.contact.form.success}
        </p>
      )}
      {status === "error" && (
        <p className="rounded-2xl border border-blood/30 bg-blood/10 px-4 py-3 text-sm font-semibold text-white">
          {siteCopy.contact.form.error}
        </p>
      )}
    </form>
  );
}
