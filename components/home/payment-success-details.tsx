"use client";

import { useEffect, useState } from "react";

import { checkoutIntentService, type CheckoutIntent } from "@/lib/checkout-intents";

export function PaymentSuccessDetails() {
  const [intent, setIntent] = useState<CheckoutIntent | null>(null);

  useEffect(() => {
    setIntent(checkoutIntentService.getLatest());
  }, []);

  if (!intent) {
    return null;
  }

  return (
    <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-right shadow-[0_18px_70px_rgba(0,0,0,0.24)]">
      <p className="text-sm font-black text-blood">מספר הרשמה</p>
      <p className="mt-2 text-2xl font-black text-white" dir="ltr">{intent.checkoutReference}</p>
      <div className="mt-5 grid gap-3 text-sm font-bold leading-7 text-zinc-300">
        <p>
          <span className="text-zinc-500">כרטיס: </span>
          <span className="text-white">{intent.ticketName}</span>
        </p>
        <div>
          <p className="text-zinc-500">אירועים שנבחרו:</p>
          <div className="mt-2 grid gap-2">
            {intent.selectedEvents.map((event) => (
              <p key={event.id} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white">
                {event.city} · {event.venue} · <span dir="ltr">{event.date}</span>
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
