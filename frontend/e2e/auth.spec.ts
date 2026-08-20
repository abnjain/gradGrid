import { test, expect } from "@playwright/test";
import { mockLoginError, toastContainer } from "./helpers/test-auth";

/**
 * Core auth pages — login, forgot password, reset password.
 * Signup and tenant routing tests live in signup.spec.ts and tenant-routing.spec.ts.
 */

async function submitLogin(page: import("@playwright/test").Page, email: string, password: string) {
  await page.locator('input[placeholder="you@institution.edu"]').fill(email);
  await page.locator('input[placeholder="Enter your password"]').fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
}

test.describe("Login", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Institution sign in" })).toBeVisible();
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

test.describe("Login — signup application status", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Institution sign in" })).toBeVisible();
  });

  test("pending application shows approval warning toast", async ({ page }) => {
    await mockLoginError(
      page,
      "APPLICATION_PENDING",
      "Your signup application is awaiting admin approval"
    );
    await submitLogin(page, "owner@school.edu", "SecurePass1!");

    await expect(toastContainer(page).getByText("Application pending", { exact: true })).toBeVisible();
    await expect(page.getByText("awaiting admin approval")).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("rejected application shows rejection toast", async ({ page }) => {
    await mockLoginError(
      page,
      "APPLICATION_REJECTED",
      "Your previous application was rejected"
    );
    await submitLogin(page, "owner@school.edu", "SecurePass1!");

    await expect(toastContainer(page).getByText("Application rejected", { exact: true })).toBeVisible();
    await expect(page.getByText("submit a new one")).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("unverified email redirects to signup verify step", async ({ page }) => {
    await mockLoginError(page, "EMAIL_NOT_VERIFIED", "Please verify your email before logging in");
    await submitLogin(page, "owner@school.edu", "SecurePass1!");

    await expect(page).toHaveURL(/\/signup\?step=verify&email=owner%40school\.edu/);
    await expect(page.getByRole("heading", { name: "Verify your email" })).toBeVisible();
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
    await expect(page.getByText("check your Spam or Junk folder")).toBeVisible();
  });
});

test.describe("Reset Password", () => {
  test("missing token shows the invalid-link state", async ({ page }) => {
    await page.goto("/reset-password");
    await expect(page.getByRole("heading", { name: "Invalid reset link" })).toBeVisible();
  });
});
