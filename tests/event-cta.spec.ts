import { expect, test } from "@playwright/test";

const eventDates = ["03.08", "14.08", "16.08", "28.08"];

for (const eventDate of eventDates) {
  test(`events page CTA scrolls to tickets for ${eventDate}`, async ({ page }) => {
    await page.goto("/events");

    const eventCard = page.locator("#event-stops article").filter({ hasText: eventDate });
    await expect(eventCard).toBeVisible();

    const cta = eventCard.locator("button");
    await expect(cta).toBeVisible();
    await cta.scrollIntoViewIfNeeded();

    const before = await page.evaluate(() => ({
      href: window.location.href,
      hash: window.location.hash
    }));

    await cta.click();

    await expect(page.locator('[role="dialog"]')).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "כמה רחוק אתם באים לזוז איתנו?" })).toBeInViewport();

    const after = await page.evaluate(() => ({
      href: window.location.href,
      hash: window.location.hash,
      contactVisible: (() => {
        const contact = document.querySelector("#contact");
        return contact ? contact.getBoundingClientRect().top < window.innerHeight : false;
      })()
    }));

    expect(after.href).toBe(before.href);
    expect(after.hash).toBe(before.hash);
    expect(after.contactVisible).toBe(false);
  });
}
