import { test, expect } from "@playwright/test";

/**
 * Landing page (/) — header, footer, FAQ accordion, and theme toggle.
 */

test.describe("Landing page", () => {
  test("header renders logo, nav links, and auth buttons", async ({ page }) => {
    await page.goto("/");

    // Logo links home
    const logo = page.locator('header a[href="/"]').first();
    await expect(logo).toContainText("GradGrid");

    // Nav links
    const nav = page.locator('header nav[aria-label="Main"]');
    await expect(nav.getByRole("link", { name: "About" })).toHaveAttribute("href", "#about");
    await expect(nav.getByRole("link", { name: "Features" })).toHaveAttribute("href", "#features");
    await expect(nav.getByRole("link", { name: "Why GradGrid" })).toHaveAttribute("href", "#why");
    await expect(nav.getByRole("link", { name: "FAQ" })).toHaveAttribute("href", "#faq");

    // Auth buttons
    await expect(page.locator('header a[href="/login"]')).toBeVisible();
    await expect(page.locator('header a[href="/signup"]')).toBeVisible();

    // Section anchors exist
    for (const id of ["about", "features", "why", "faq"]) {
      await expect(page.locator(`#${id}`)).toBeVisible();
    }
  });

  test("footer links to all public pages", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer.getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
    await expect(footer.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/contact");
    await expect(footer.getByRole("link", { name: "Terms" })).toHaveAttribute("href", "/terms");
    await expect(footer.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy");
    await expect(footer).toContainText("GradGrid");
    await expect(footer).toContainText("All rights reserved");
  });

  test("FAQ renders as an accordion with the pricing question", async ({ page }) => {
    await page.goto("/");

    const faq = page.locator("#faq");
    await expect(faq).toBeVisible();

    // 6 questions, first one open by default
    const buttons = faq.locator('button[aria-expanded]');
    await expect(buttons).toHaveCount(6);
    await expect(buttons.nth(0)).toHaveAttribute("aria-expanded", "true");
    await expect(buttons.nth(1)).toHaveAttribute("aria-expanded", "false");

    // Pricing question exists
    await expect(faq.getByRole("button", { name: /How much does GradGrid cost/i })).toBeVisible();

    // Clicking the second question opens it and closes the first
    await buttons.nth(1).click();
    await expect(buttons.nth(0)).toHaveAttribute("aria-expanded", "false");
    await expect(buttons.nth(1)).toHaveAttribute("aria-expanded", "true");

    // Clicking the open question collapses it
    await buttons.nth(1).click();
    await expect(buttons.nth(1)).toHaveAttribute("aria-expanded", "false");
  });

  test("theme toggle switches between light and dark and persists", async ({ page }) => {
    // Force a deterministic starting theme (light)
    await page.addInitScript(() => {
      window.localStorage.setItem("gradgrid-theme", "light");
    });
    await page.goto("/");

    const html = page.locator("html");
    await expect(html).not.toHaveClass(/dark/);

    const toggle = page.locator('header [aria-label*="Switch to"]');
    await expect(toggle).toHaveAttribute("aria-label", "Switch to dark mode");

    // Switch to dark
    await toggle.click();
    await expect(html).toHaveClass(/dark/);
    await expect(toggle).toHaveAttribute("aria-label", "Switch to light mode");

    // Persisted
    const stored = await page.evaluate(() => localStorage.getItem("gradgrid-theme"));
    expect(stored).toBe("dark");

    // Switch back to light
    await toggle.click();
    await expect(html).not.toHaveClass(/dark/);
  });

  test("nav link scrolls to a section", async ({ page }) => {
    await page.goto("/");
    await page.locator('header nav a[href="#features"]').click();
    await expect(page).toHaveURL(/#features/);
    await expect(page.locator("#features")).toBeInViewport();
  });
});
