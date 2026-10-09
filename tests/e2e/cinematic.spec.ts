import { test, expect, type Page } from "@playwright/test";

// The scroll-driven homepage: Lenis, the pinned hero curtain, the pinned
// Ritual story, and the reduced-motion fallback.

const ritualTop = (page: Page) =>
  page.evaluate(() => document.querySelector("#ritual")!.getBoundingClientRect().top + scrollY);

const activeTab = (page: Page) =>
  page.locator('#ritual button[aria-current="true"]').textContent();

test("smooth scrolling runs on the homepage", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/\blenis\b/);
});

test("hero holds in place while the next section slides over it", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/\blenis\b/);
  await page.evaluate(() => scrollTo(0, innerHeight * 0.5));
  await expect
    .poll(() => page.locator("#top").evaluate((el) => Math.round(el.getBoundingClientRect().top)))
    .toBe(0);
});

test("scrolling walks the Ritual through all four stages", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/\blenis\b/);
  const top = await ritualTop(page);
  const stage = page.locator("#ritual [data-stage]").first().locator("xpath=..");

  // Find the pinned stage's own offset (it sits below the section heading).
  const stageTop = await page.evaluate(
    () => document.querySelector("#ritual [data-stage]")!.parentElement!.getBoundingClientRect().top + scrollY,
  );
  expect(stageTop).toBeGreaterThan(top);
  const vh = await page.evaluate(() => innerHeight);

  await page.evaluate((y) => scrollTo(0, y), stageTop + vh * 0.2);
  await expect.poll(() => activeTab(page)).toBe("Source");

  await page.evaluate((y) => scrollTo(0, y), stageTop + vh * 2.85);
  await expect.poll(() => activeTab(page), { timeout: 5_000 }).toBe("Serve");

  // Still pinned to the top of the viewport while the story plays.
  await expect
    .poll(() => stage.evaluate((el) => Math.round(el.getBoundingClientRect().top)))
    .toBeLessThanOrEqual(1);
});

test("Ritual tabs scroll to their stage", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/\blenis\b/);
  const stageTop = await page.evaluate(
    () => document.querySelector("#ritual [data-stage]")!.parentElement!.getBoundingClientRect().top + scrollY,
  );
  await page.evaluate((y) => scrollTo(0, y), stageTop + 10);
  await page.locator("#ritual button", { hasText: "Brew" }).click();
  await expect.poll(() => activeTab(page), { timeout: 5_000 }).toBe("Brew");
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("no smooth scrolling, no pinning, and all content visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Stay");
    await expect(page.locator("html")).not.toHaveClass(/\blenis\b/);
    expect(await page.locator(".pin-spacer").count()).toBe(0);

    // Nothing is left hidden behind a scroll animation.
    const hidden = await page.evaluate(() =>
      [...document.querySelectorAll("[data-clip], [data-split], [data-rise], [data-expand]")].filter((el) => {
        const cs = getComputedStyle(el);
        return cs.opacity === "0" || cs.visibility === "hidden" || cs.clipPath.startsWith("inset(100%");
      }).length,
    );
    expect(hidden).toBe(0);
  });

  test("Ritual falls back to the tab slideshow", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Play stage slideshow" })).toBeVisible();
    await page.locator("#ritual button", { hasText: "Roast" }).click();
    await expect.poll(() => activeTab(page)).toBe("Roast");
  });

  test("Moments gallery falls back to a plain swipeable row", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("[data-moment]")).toHaveCount(0);
    await expect(page.locator("#philosophy li")).toHaveCount(10);
    await expect(page.locator("#philosophy li").first()).toContainText("Heart Latte");
  });
});

// Which moment's caption is showing in the 3D gallery.
const visibleMoment = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>("[data-moment-caption]")]
      .filter((el) => getComputedStyle(el).visibility === "visible" && Number(getComputedStyle(el).opacity) > 0.5)
      .map((el) => el.querySelector("[data-moment-name]")!.textContent)
      .join("|"),
  );

test("Moments gallery plays through in 3D and reverses on the way back", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/\blenis\b/);
  await expect(page.locator("[data-moment]")).toHaveCount(10);

  const { top, length } = await page.evaluate(() => {
    const spacer = document.querySelector("[data-moments-ivory]")!.parentElement!.parentElement!;
    return { top: spacer.getBoundingClientRect().top + scrollY, length: spacer.offsetHeight - innerHeight };
  });
  // Timeline units: moment i is centred at 1.5 + i of a 12.15-unit run.
  const at = (unit: number) => page.evaluate((y) => scrollTo(0, y), top + (length * unit) / 12.15);

  await at(1.5);
  await expect.poll(() => visibleMoment(page), { timeout: 5_000 }).toBe("Heart Latte");
  // Panels really are in 3D space (perspective + transforms on the panels).
  const transform = await page.locator("[data-moment]").nth(1).evaluate((el) => getComputedStyle(el).transform);
  expect(transform).toMatch(/^matrix3d/);

  await at(10.5);
  await expect.poll(() => visibleMoment(page), { timeout: 5_000 }).toBe("Winter Sangria");

  // Scrolling back up rewinds the sequence.
  await at(3.5);
  await expect.poll(() => visibleMoment(page), { timeout: 5_000 }).toBe("Spiced Mulled Wine");

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
