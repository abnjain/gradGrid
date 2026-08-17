import { test, expect } from "@playwright/test";

/**
 * Public static pages — About, Contact, Terms, Privacy.
 * Verifies rendering, shared header/footer, and contact form validation.
 */

test.describe("Static pages", () => {
  test("about page renders story, mission, and values", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("heading", { name: /Built for education/i })).toBeVisible();
    await expect(page.locator("body")).toContainText("Our Story");
    await expect(page.locator("body")).toContainText("Our Mission");
    await expect(page.locator("body")).toContainText("What We Stand For");
    await expect(page.getByRole("link", { name: "Contact Us" })).toHaveAttribute("href", "/contact");
  });

  test("contact page renders contact details and a working form", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByRole("heading", { name: /We'd love to hear from you/i })).toBeVisible();

    // Contact cards
    await expect(page.locator('a[href^="mailto:"]').first()).toBeVisible();
    await expect(page.locator('a[href^="tel:"]').first()).toBeVisible();

    // Support hours
    await expect(page.locator("body")).toContainText("Support hours");

    // Form fields
    await expect(page.locator('input[placeholder="Jane Doe"]')).toBeVisible();
    await expect(page.locator('input[placeholder="you@institution.edu"]')).toBeVisible();
    await expect(page.locator("textarea")).toBeVisible();
  });

  test("contact form validates required fields on submit", async ({ page }) => {
    await page.goto("/contact");
    // Native click — reliable in this throttled headless environment
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("form button")).find((b) =>
        b.textContent?.includes("Send Message")
      );
      (btn as HTMLButtonElement).click();
    });
    await expect(page.locator("form")).toContainText("Name is required");
    await expect(page.locator("form")).toContainText("Email is required");
    await expect(page.locator("form")).toContainText("Message is required");
  });

  test("terms page renders its sections", async ({ page }) => {
    await page.goto("/terms");
    await expect(page.getByRole("heading", { name: "Terms of Service" })).toBeVisible();
    for (const heading of [
      "1. Acceptance of Terms",
      "3. Accounts & Responsibilities",
      "5. Fees & Payment",
      "9. Limitation of Liability",
      "12. Contact",
    ]) {
      await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    }
    await expect(page.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", "/privacy");
  });

  test("privacy page renders its sections", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.getByRole("heading", { name: "Privacy Policy" })).toBeVisible();
    for (const heading of [
      "1. Information We Collect",
      "3. Data Storage & Security",
      "4. Cookies & Local Storage",
      "7. Your Rights",
      "10. Contact Us",
    ]) {
      await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    }
    await expect(page.getByRole("link", { name: "Contact page" })).toHaveAttribute("href", "/contact");
  });

  test("every static page shares the header and footer", async ({ page }) => {
    for (const path of ["/about", "/contact", "/terms", "/privacy"]) {
      await page.goto(path);
      // Shared header
      await expect(page.locator('header a[href="/"]').first()).toContainText("GradGrid");
      await expect(page.locator('header [aria-label*="Switch to"]')).toBeVisible();
      // Shared footer
      await expect(page.locator("footer").getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
      await expect(page.locator("footer").getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/contact");
      await expect(page.locator("footer").getByRole("link", { name: "Terms" })).toHaveAttribute("href", "/terms");
      await expect(page.locator("footer").getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy");
      await expect(page.locator("footer")).toContainText("All rights reserved");
    }
  });
});
