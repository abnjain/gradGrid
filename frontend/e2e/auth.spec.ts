import { test, expect } from "@playwright/test";

/**
 * Auth flows — client-side validation and navigation.
 * Backend-independent except where API routes are mocked.
 */

test.describe("Signup", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByRole("heading", { name: "Register your institution" })).toBeVisible();
  });

  test("step 1 requires organization and institution fields", async ({ page }) => {
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.locator("body")).toContainText("Organization name is required");
    await expect(page.locator("body")).toContainText("Institution name is required");
    await expect(page.locator("body")).toContainText("Institution code is required");
  });

  test("step 1 advances to owner account step", async ({ page }) => {
    await page.getByLabel("Organization name").fill("ABC Education");
    await page.getByLabel("Institution name").fill("Greenwood High");
    await page.getByLabel("Institution code").fill("GHS-001");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("Step 2 of 2")).toBeVisible();
    await expect(page.getByLabel("First name")).toBeVisible();
  });

  test("step 2 validates owner fields", async ({ page }) => {
    await page.getByLabel("Organization name").fill("ABC Education");
    await page.getByLabel("Institution name").fill("Greenwood High");
    await page.getByLabel("Institution code").fill("GHS-001");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Submit application" }).click();
    await expect(page.locator("body")).toContainText("First name is required");
    await expect(page.locator("body")).toContainText("Email is required");
  });

  test("password strength checklist appears on owner step", async ({ page }) => {
    await page.getByLabel("Organization name").fill("ABC Education");
    await page.getByLabel("Institution name").fill("Greenwood High");
    await page.getByLabel("Institution code").fill("GHS-001");
    await page.getByRole("button", { name: "Continue" }).click();
    const pw = page.getByLabel("Password");
    await pw.focus();
    await pw.fill("Abcdefg1!");
    await expect(page.locator("body")).toContainText("Strong");
  });

  test("navigation links are wired correctly", async ({ page }) => {
    await expect(page.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/login");
    await expect(page.locator('a[href="/"]').first()).toContainText("GradGrid");
  });
});

test.describe("Login", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  });

  test("empty submit shows field-specific errors", async ({ page }) => {
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page.locator("form")).toContainText("Email is required");
    await expect(page.locator("form")).toContainText("Password is required");
  });

  test("invalid email shows a format error", async ({ page }) => {
    const email = page.locator('input[placeholder="you@institution.edu"]');
    await email.fill("nope");
    await email.blur();
    await expect(page.locator("form")).toContainText("Please enter a valid email address");
  });

  test("links navigate to signup and home", async ({ page }) => {
    await expect(page.getByRole("link", { name: "Register your institution" })).toHaveAttribute("href", "/signup");
    await expect(page.locator('a[href="/"]').first()).toContainText("GradGrid");
  });
});

test.describe("Forgot Password", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.getByRole("heading", { name: "Reset password" })).toBeVisible();
  });

  test("empty submit shows an email-required error", async ({ page }) => {
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("form button")).find((b) =>
        b.textContent?.includes("Send Reset Link")
      );
      (btn as HTMLButtonElement).click();
    });
    await expect(page.locator("form")).toContainText("Email is required");
  });

  test("valid submit shows the check-your-email success state", async ({ page }) => {
    await page.route("**/api/v1/auth/forgot-password", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, message: "sent" }),
      })
    );
    await page.locator('input[placeholder="you@institution.edu"]').fill("user@test.com");
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("form button")).find((b) =>
        b.textContent?.includes("Send Reset Link")
      );
      (btn as HTMLButtonElement).click();
    });
    await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
  });
});

test.describe("Reset Password", () => {
  test("missing token shows the invalid-link state", async ({ page }) => {
    await page.goto("/reset-password");
    await expect(page.getByRole("heading", { name: "Invalid reset link" })).toBeVisible();
  });
});
