import { test, expect, type APIRequestContext } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { quickPaymentQuote, parseQuickPaymentInput } from "@/lib/dubnov-quick-payment";

const fixture = "http://127.0.0.1:4012";
const healthMarker = "SYNTHETIC_HEALTH_UPDATE_ONLY";
const registration = {
  plan: "monthly", fullName: "דורון", dateOfBirth: "2016-03-12",
  guardianName: "הורה בדיקה", guardianPhone: "0501111111", phone: "0501111111", email: "fixture@example.test",
  emergencyContactName: "איש בדיקה", emergencyContactPhone: "0502222222",
  compliance: {
    healthDeclarationCompleted: true, termsAccepted: true, guardianConsent: true,
    healthAnswers: { q1: "no", q2: "no", q3: "no", q4: "no", q5: "no" },
    guardianName: "הורה בדיקה", guardianPhone: "0501111111", healthDeclarationVersion: "dubnov-kids-2026-09-short-v1",
    healthDeclarationAcceptedAt: "2026-09-01T10:00:00Z", healthDeclarationStatus: "completed",
    termsAcceptedAt: "2026-09-01T10:00:00Z", termsVersion: "dubnov-kids-2026-09-v1"
  }
};

function validInput() {
  return { childName: "דורון", guardianPhone: "0501111111", dateOfBirth: "2016-03-12", month: "2026-10", sessions: 3, healthStatus: "unchanged", healthUpdate: "", healthConfirmed: true, idempotencyKey: randomUUID() };
}

async function rawRecord(request: APIRequestContext, reference: string) {
  const response = await request.post(fixture, { data: ["HGETALL", "pushtakim:checkout:" + reference] });
  const values = (await response.json()).result as string[];
  const record: Record<string, string> = {};
  for (let i = 0; i < values.length; i += 2) record[values[i]] = values[i + 1];
  return record;
}

function localCallback(value: string) {
  const url = new URL(value);
  expect(url.origin).toBe("https://pushtakim.co.il");
  return url.pathname + url.search;
}

test("price validation uses the server tariff and rejects invalid quantities or incomplete confirmation", () => {
  expect(quickPaymentQuote("דורון", "2026-10", 3).total).toBe(270);
  expect(quickPaymentQuote("דורון", "2026-10", 3).description).toMatch(/דורון.*אוקטובר.*3.*270/);
  for (const count of [0, -1, 1.5, 32, NaN, Infinity]) expect(() => quickPaymentQuote("דורון", "2026-10", count)).toThrow();
  for (const input of [
    { ...validInput(), month: "2026-13" }, { ...validInput(), sessions: "3" }, { ...validInput(), healthConfirmed: false },
    { ...validInput(), healthStatus: "changed", healthUpdate: "" }, { ...validInput(), healthUpdate: "unexpected note" }
  ]) expect(parseQuickPaymentInput(input)).toBeNull();
});

test("synthetic Doron: three October sessions are 270 ILS, with no repeat questionnaire and verified tracking", async ({ page, request, context }) => {
  await request.post(fixture + "/__test__/reset");
  const rootResponse = await request.post("/api/classes/dubnov-kids/checkout", { data: registration });
  expect(rootResponse.ok()).toBeTruthy();
  const rootReference = (await rootResponse.json()).checkoutReference as string;
  const original = await rawRecord(request, rootReference);
  expect(JSON.parse(original.healthAnswers).q1).toBe("no");

  // Missing/incomplete registrations cannot bypass the first registration.
  expect((await request.post("/api/classes/dubnov-kids/quick-payment", { data: { ...validInput(), guardianPhone: "0509999999" } })).status()).toBe(400);
  const incomplete = await request.post("/api/classes/dubnov-kids/checkout", { data: { ...registration, fullName: "ילד ללא שאלון", compliance: { ...registration.compliance, healthAnswers: {} } } });
  expect(incomplete.ok()).toBeTruthy();
  expect((await request.post("/api/classes/dubnov-kids/quick-payment", { data: { ...validInput(), childName: "ילד ללא שאלון" } })).status()).toBe(400);

  const capturedResponses: Array<{ body: Record<string, unknown>; input: Record<string, unknown> }> = [];
  // Capture the actual server response before the browser leaves this origin.
  // CDP response bodies can disappear during a cross-origin payment redirect.
  await page.route("**/api/classes/dubnov-kids/quick-payment", async route => {
    const response = await route.fetch();
    capturedResponses.push({ body: await response.json(), input: route.request().postDataJSON() });
    await route.fulfill({ response });
  });
  await page.route("https://sandboxapi.grow.link/payment/**", async route => {
    const id = new URL(route.request().url()).pathname.split("/").pop();
    const providerProcess = await (await request.get(fixture + "/__test__/process/" + id)).json();
    await route.fulfill({ contentType: "text/html", body: "<title>Fixture hosted payment</title><main>" + providerProcess.form.sum + " ILS</main>" });
  });
  await page.goto("/classes/dubnov-kids/quick-payment?month=2026-10&sessions=3");
  await expect(page.getByRole("heading", { name: "תשלום מהיר למתאמנים קיימים" })).toBeVisible();
  await expect(page.locator("output")).toHaveText("90 ₪ × 3 אימונים = 270 ₪");
  expect(await page.locator("main input[type=radio], main textarea").count()).toBe(0);
  await page.getByLabel("שם הילד/ה כפי שנרשם").fill("דורון");
  await page.getByLabel("תאריך לידה של הילד/ה").fill("2016-03-12");
  await page.getByLabel("טלפון ההורה שנמסר בהרשמה").fill("0501111111");
  await page.getByLabel("אני מאשר/ת שלא חל שינוי במידע הבריאותי שנמסר בהרשמה.").check();
  const created = page.waitForResponse(r => r.url().endsWith("/api/classes/dubnov-kids/quick-payment") && r.request().method() === "POST");
  await page.getByRole("button", { name: "לתשלום מאובטח ב־Grow · 270 ₪" }).click();
  const createdResponse = await created, body = capturedResponses[capturedResponses.length - 1].body;
  expect(createdResponse.status(), String(body.error || "") + " " + String(body.code || "")).toBe(200);
  await page.waitForURL("https://sandboxapi.grow.link/payment/**");
  await expect(page.locator("body")).toContainText("270 ILS");
  const provider = await (await request.get(fixture + "/__test__/process/1")).json();
  expect(provider.form.sum).toBe("270");
  expect(provider.form["productData[0][price]"]).toBe("90");
  expect(provider.form["productData[0][quantity]"]).toBe("3");
  expect(provider.form["productData[0][itemDescription]"]).toMatch(/דורון.*אוקטובר.*3.*270/);
  expect(JSON.stringify(provider.form)).not.toContain(healthMarker);
  expect(JSON.stringify(provider.form)).not.toContain("healthAnswers");
  expect(body).not.toHaveProperty("processToken");
  expect(body).not.toHaveProperty("processId");
  expect(body).not.toHaveProperty("callbackKey");
  const reference = body.checkoutReference as string;
  let payment = await rawRecord(request, reference);
  expect(payment.registrationId).toBe(rootReference);
  expect(payment.classMonth).toBe("2026-10");
  expect(payment.sessionCount).toBe("3");
  expect(payment.price).toBe("270");
  expect(payment.status).toBe("pending_payment");
  expect(JSON.parse(payment.healthAnswers)).toEqual({});

  // Browser-supplied prices cannot change the sum, and a double submit reuses the same process.
  const submitted = capturedResponses[0].input;
  const replay = await request.post("/api/classes/dubnov-kids/quick-payment", { data: { ...submitted, price: 1, amount: 1, unitPrice: 1 } });
  expect(replay.ok()).toBeTruthy();
  expect((await replay.json()).checkoutReference).toBe(reference);
  expect((await (await request.get(fixture + "/__test__/process/2")).json()).processId).toBeUndefined();

  const notify = localCallback(provider.form.notifyUrl);
  expect((await request.post(notify.replace(/&key=.*/, ""), { data: { status: "paid" } })).status()).toBe(401);
  expect((await request.post(notify, { data: { status: "paid", amount: 270, transactionId: "forged" } })).status()).toBe(200);
  expect((await rawRecord(request, reference)).status).toBe("pending_payment");

  // Reaching the thank-you URL does not establish payment.
  await page.goto(localCallback(provider.form.successUrl));
  await expect(page.getByRole("status")).toContainText("ממתין");
  expect((await rawRecord(request, reference)).status).toBe("pending_payment");

  await request.post(fixture + "/__test__/pay", { data: { processId: "1", amount: 269 } });
  expect((await request.post(notify, { data: {} })).status()).toBe(503);
  expect((await rawRecord(request, reference)).status).toBe("pending_payment");
  await request.post(fixture + "/__test__/pay", { data: { processId: "1", amount: 270 } });
  expect((await request.post(notify, { data: {} })).status()).toBe(200);
  expect((await request.post(notify, { data: {} })).status()).toBe(200);
  payment = await rawRecord(request, reference);
  expect(payment.status).toBe("paid");
  expect(payment.growPaymentAmount).toBe("270");
  expect(payment.paymentMatchMethod).toBe("grow-api-process");
  expect(await rawRecord(request, rootReference)).toEqual(original);

  // Receipts must match the verified process and transaction.
  const invoice = localCallback(provider.form.invoiceNotifyUrl);
  expect((await request.post(invoice, { data: [{ processId: "1", transactionId: "wrong", invoiceNumber: "FIXTURE-270" }] })).status()).toBe(409);
  expect((await request.post(invoice, { data: [{ processId: "1", transactionId: "FIXTURE-1", invoiceNumber: "FIXTURE-270" }] })).status()).toBe(200);
  await page.reload();
  await expect(page.getByRole("status")).toContainText("התשלום אושר");
  await expect(page.getByText("מספר קבלה: FIXTURE-270")).toBeVisible();

  // A short medical update is stored before payment without changing the original answers.
  await page.goto("/classes/dubnov-kids/quick-payment?month=2026-10&sessions=3");
  await page.getByLabel("שם הילד/ה כפי שנרשם").fill("דורון");
  await page.getByLabel("תאריך לידה של הילד/ה").fill("2016-03-12");
  await page.getByLabel("טלפון ההורה שנמסר בהרשמה").fill("0501111111");
  await page.getByRole("button", { name: "חל שינוי במידע הבריאותי? לעדכון קצר" }).click();
  await page.getByLabel("מה השתנה מאז ההרשמה?").fill(healthMarker);
  await page.getByLabel("אני מאשר/ת שהעדכון הבריאותי שמסרתי נכון ומלא.").check();
  const updateResponse = page.waitForResponse(r => r.url().endsWith("/api/classes/dubnov-kids/quick-payment") && r.request().method() === "POST");
  await page.getByRole("button", { name: "לתשלום מאובטח ב־Grow · 270 ₪" }).click();
  await updateResponse;
  const updated = capturedResponses[capturedResponses.length - 1].body;
  await page.waitForURL("https://sandboxapi.grow.link/payment/**");
  expect((await rawRecord(request, String(updated.checkoutReference))).status).toBe("pending_payment");
  expect(await rawRecord(request, rootReference)).toEqual(original);
  const secondProvider = await (await request.get(fixture + "/__test__/process/2")).json();
  expect(JSON.stringify(secondProvider.form)).not.toContain(healthMarker);
  expect((await request.get("/api/admin/dubnov-kids/quick-payments/" + String(updated.checkoutReference))).status()).toBe(401);
  const publicStatus = await request.get("/api/classes/dubnov-kids/quick-payment/status/" + reference, { headers: { Authorization: "Bearer " + body.statusAccessToken } });
  expect(publicStatus.ok()).toBeTruthy();expect(await publicStatus.text()).not.toContain(healthMarker);
  expect((await request.get("/api/classes/dubnov-kids/quick-payment/status/" + reference)).status()).toBe(401);

  const login = await request.post("/api/admin/login", { form: { username: "fixture-admin", password: "fixture-password" }, maxRedirects: 0 });
  expect(login.status()).toBe(303);
  const cookie = login.headers()["set-cookie"].split(";")[0], cookieValue = cookie.slice(cookie.indexOf("=") + 1);
  const health = await request.get("/api/admin/dubnov-kids/quick-payments/" + String(updated.checkoutReference), { headers: { Cookie: cookie } });
  expect(health.headers()["cache-control"]).toContain("no-store");
  const healthData = await health.json();
  expect(healthData.healthUpdate).toBe(healthMarker);
  expect(healthData.registrationId).toBe(rootReference);
  expect(healthData).not.toHaveProperty("processToken");
  expect(healthData).not.toHaveProperty("callbackKey");
  const adminPurchases = await (await request.get("/api/admin/purchases", { headers: { Cookie: cookie } })).json();
  expect(adminPurchases.purchases.find((p: { checkoutReference: string }) => p.checkoutReference === reference).statusAccessToken).toBeUndefined();

  await context.addCookies([{ name: "pt_admin_session", value: cookieValue, domain: "127.0.0.1", path: "/", secure: false, httpOnly: true }]);
  await page.goto("/admin");
  await page.getByLabel("חודש למעקב").fill("2026-10");
  await expect(page.getByRole("heading", { name: "דובנוב — תשלומים מהירים" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "90 ₪ × 3 = 270 ₪" })).toHaveCount(2);
  await page.getByRole("button", { name: "צפייה בטופס ובעדכון" }).first().click();
  await expect(page.getByText(healthMarker, { exact: true })).toBeVisible();
  // Existing monthly renewal remains the same redirect.
  const renewal = await request.get("/dubnov", { maxRedirects: 0 });
  expect(renewal.status()).toBe(307);
  expect(renewal.headers().location).toBe("https://pay.grow.link/MTAzMDM2~dfda365100439cc8523c2a9657641c2b-MzkzMTgxNw");
});
