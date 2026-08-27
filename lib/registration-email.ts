import type { CheckoutIntent } from "@/lib/checkout-intents";
import { registrationEmailHtml } from "@/lib/registration-form";

export async function sendRegistrationNotification(intent: CheckoutIntent) {
  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.REGISTRATION_NOTIFICATION_EMAIL;
  const from = process.env.REGISTRATION_EMAIL_FROM;

  if (!apiKey || !recipient || !from) return { sent: false, reason: "not_configured" as const };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: recipient.split(",").map((value) => value.trim()).filter(Boolean),
      subject: `טופס הרשמה חדש — ${intent.fullName} — ${intent.checkoutReference}`,
      html: registrationEmailHtml(intent)
    })
  });

  if (!response.ok) throw new Error(`Registration email failed with ${response.status}`);
  return { sent: true as const };
}
