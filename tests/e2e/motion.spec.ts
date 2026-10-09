import { test, expect } from "@playwright/test";

// Checks the GSAP + ScrollTrigger + Lenis wiring on the local /dev/motion bench.
test("Lenis drives scrolling and ScrollTrigger follows it", async ({ page }) => {
  await page.goto("/dev/motion");

  // Lenis adds this class to <html> once it's running.
  await expect(page.locator("html")).toHaveClass(/\blenis\b/);

  const progress = () =>
    page.locator("[data-progress]").evaluate((el) => Number(el.getAttribute("data-progress")));
  expect(await progress()).toBe(0);

  // Scroll into the pinned section; Lenis smooths it, ScrollTrigger should update.
  await page.evaluate(() => window.scrollTo(0, window.innerHeight + 600));
  await expect.poll(progress, { timeout: 5_000 }).toBeGreaterThan(0.2);

  // Pinned panel stays at the top of the viewport while scrubbing.
  const top = await page.locator("[data-pin]").evaluate((el) => el.getBoundingClientRect().top);
  expect(Math.abs(top)).toBeLessThan(2);
});
