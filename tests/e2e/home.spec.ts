import { test, expect } from "@playwright/test";

test("home page loads without errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Stay");
  expect(errors).toEqual([]);
});

test("hero video plays and music turns on with a click", async ({ page }) => {
  await page.goto("/");
  const video = page.locator("section#top video");
  await expect
    .poll(() => video.evaluate((v: HTMLVideoElement) => v.readyState), { timeout: 15_000 })
    .toBeGreaterThanOrEqual(2);
  expect(await video.evaluate((v: HTMLVideoElement) => v.muted)).toBe(true);

  // Retry until the page has hydrated and the first-click listener is attached.
  await expect(async () => {
    await page.mouse.click(10, 300);
    expect(await video.evaluate((v: HTMLVideoElement) => v.muted)).toBe(false);
  }).toPass({ timeout: 15_000 });
});

test("no sideways scrolling", async ({ page }) => {
  await page.goto("/");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
