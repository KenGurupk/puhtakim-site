const sandboxHosts = new Set(["sandbox.meshulam.co.il", "sandboxapi.grow.link"]);
const productionSiteHosts = new Set(["pushtakim.co.il", "www.pushtakim.co.il"]);

export type GrowPaymentMode = "sandbox" | "live";

function providerHost(hostname: string) {
  return ["meshulam.co.il", "grow.link", "grow.business"].some(host => hostname === host || hostname.endsWith("." + host));
}

export function parseGrowQuickPaymentConfig(env: Record<string, string | undefined>) {
  if (env.GROW_QUICK_PAYMENT_ENABLED !== "true") return null;
  const origin = env.GROW_API_ORIGIN?.trim() || "";
  const callbackOrigin = env.GROW_CALLBACK_ORIGIN?.trim() || "";
  const mode = env.GROW_PAYMENT_MODE?.trim();
  const userId = env.GROW_USER_ID?.trim() || "";
  const pageCode = env.GROW_PAGE_CODE?.trim() || "";
  const vatType = env.GROW_VAT_TYPE?.trim() || "";
  if ((mode !== "sandbox" && mode !== "live") || !userId || !pageCode || !["1", "3"].includes(vatType)) return null;
  try {
    const api = new URL(origin), callback = new URL(callbackOrigin);
    if (api.protocol !== "https:" || api.origin !== origin || !providerHost(api.hostname)) return null;
    if (callback.protocol !== "https:" || callback.origin !== callbackOrigin || callback.username || callback.password) return null;
    if (mode === "sandbox" && (!sandboxHosts.has(api.hostname) || productionSiteHosts.has(callback.hostname))) return null;
    if (mode === "live" && sandboxHosts.has(api.hostname)) return null;
  } catch { return null; }
  return { origin, callbackOrigin, mode: mode as GrowPaymentMode, userId, pageCode, vatType };
}

export function validateGrowHostedPaymentUrl(value: unknown, mode: GrowPaymentMode) {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || !providerHost(url.hostname)) return false;
    return mode === "sandbox" ? sandboxHosts.has(url.hostname) : !sandboxHosts.has(url.hostname);
  } catch { return false; }
}
