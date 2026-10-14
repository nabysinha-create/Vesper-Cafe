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

test("café film takes over the music while on screen, then hands it back", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/\blenis\b/);
  const hero = page.locator("section#top video");
  const film = page.locator("#experience video");
  const muted = (v: typeof hero) => v.evaluate((el: HTMLVideoElement) => el.muted);

  // First click anywhere switches sound on: the hero film is heard.
  await expect(async () => {
    await page.mouse.click(10, 300);
    expect(await muted(hero)).toBe(false);
  }).toPass({ timeout: 15_000 });
  expect(await muted(film)).toBe(true);

  // With the café film filling the view, its soundtrack takes over.
  await film.evaluate((el) => {
    const r = el.parentElement!.parentElement!.getBoundingClientRect();
    scrollTo(0, r.top + scrollY - (innerHeight - r.height) / 2);
  });
  await expect.poll(() => muted(film), { timeout: 5_000 }).toBe(false);
  await expect.poll(() => muted(hero), { timeout: 5_000 }).toBe(true);
  await expect.poll(() => film.evaluate((el: HTMLVideoElement) => !el.paused)).toBe(true);

  // Its sound button is the same page-wide switch.
  await expect(page.locator("#experience").getByRole("button", { name: "Mute background music" })).toBeVisible();

  // Scroll back to the top: the hero's music returns, the film pauses.
  await page.evaluate(() => scrollTo(0, 0));
  await expect.poll(() => muted(hero), { timeout: 5_000 }).toBe(false);
  await expect.poll(() => film.evaluate((el: HTMLVideoElement) => el.paused), { timeout: 5_000 }).toBe(true);
});

// Which dish's caption is showing in the 3D menu.
const visibleDish = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>("[data-dish-caption]")]
      .filter((el) => getComputedStyle(el).visibility === "visible" && Number(getComputedStyle(el).opacity) > 0.5)
      .map((el) => el.querySelector("[data-dish-name]")!.textContent)
      .join("|"),
  );

test("3D menu builds each dish in turn and reverses on the way back", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/\blenis\b/);
  await expect(page.locator("[data-dish]")).toHaveCount(7);

  const { top, length } = await page.evaluate(() => {
    const spacer = document.querySelector("[data-dish]")!.parentElement!.parentElement!;
    return { top: spacer.getBoundingClientRect().top + scrollY, length: spacer.offsetHeight - innerHeight };
  });
  // Timeline units: dish i is centred at 1 + 1.3i of a 9.4-unit run.
  const at = (i: number) => page.evaluate((y) => scrollTo(0, y), top + (length * (1 + 1.3 * i)) / 9.4);

  await at(0);
  await expect.poll(() => visibleDish(page), { timeout: 5_000 }).toBe("Falafel Wrap");
  await at(6);
  await expect.poll(() => visibleDish(page), { timeout: 5_000 }).toBe("Jalapeño Cheese Rolls");
  await at(2);
  await expect.poll(() => visibleDish(page), { timeout: 5_000 }).toBe("Pesto Fusilli");
});

test.describe("reduced motion menu", () => {
  test.use({ reducedMotion: "reduce" });
  test("shows the dishes as a plain grid", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("[data-dish]")).toHaveCount(0);
    await expect(page.locator("#signature li")).toHaveCount(7);
  });
});
