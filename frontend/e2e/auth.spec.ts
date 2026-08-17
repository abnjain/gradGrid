import { test, expect } from "@playwright/test";

/**
 * Signup and login — client-side validation and navigation.
 * These tests exercise the reusable Input validation and do NOT require the backend.
 */

test.describe("Signup", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
  });

  test("empty submit shows a field-specific error for every field", async ({ page }) => {
    // Native click — reliable in this throttled headless environment
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("form button")).find((b) =>
        b.textContent?.includes("Create Account")
      );
      (btn as HTMLButtonElement).click();
    });

    for (const message of [
      "First name is required",
      "Last name is required",
      "Email is required",
      "Password is required",
      "Confirm password is required",
    ]) {
      await expect(page.locator("form")).toContainText(message);
    }
  });

  test("invalid email shows a format error, not the required error", async ({ page }) => {
    const email = page.locator('input[placeholder="you@institution.edu"]');
    await email.fill("not-an-email");
    await email.blur();
    await expect(page.locator("form")).toContainText("Please enter a valid email address");
    await expect(page.locator("form")).not.toContainText("Email is required");
  });

  test("password strength checklist updates live and fills as rules are met", async ({ page }) => {
    const pw = page.locator('input[placeholder="At least 8 characters"]');
    const checklist = page.locator("form ul");

    // The checklist only renders while the password field is focused
    await pw.focus();

    await expect(checklist).toContainText("At least 8 characters");
    await expect(checklist).toContainText("One lowercase letter");
    await expect(checklist).toContainText("One uppercase letter");
    await expect(checklist).toContainText("One number");
    await expect(checklist).toContainText("One special character");

    // Weak password — only length + lowercase met
    await pw.fill("abcdefgh");
    await expect(checklist.locator('span.bg-success')).toHaveCount(2);

    // Strong password — all rules met
    await pw.fill("Abcdefg1!");
    await expect(checklist.locator('span.bg-success')).toHaveCount(5);
    await expect(page.locator("form")).toContainText("Strong");
  });

  test("8-char password without variety is rejected by the validator", async ({ page }) => {
    const pw = page.locator('input[placeholder="At least 8 characters"]');
    await pw.fill("abcdefgh");
    await pw.blur();
    await expect(page.locator("form")).toContainText(
      /Password must include at least 8 characters/
    );
  });

  test("mismatched confirm password shows an error", async ({ page }) => {
    await page.locator('input[placeholder="At least 8 characters"]').fill("Abcdefg1!");
    const confirm = page.locator('input[placeholder="Re-enter your password"]');
    await confirm.fill("Abcdefg2!");
    await confirm.blur();
    await expect(page.locator("form")).toContainText("Passwords do not match");
  });

  test("password and confirm password reveal independently", async ({ page }) => {
    const pw = page.locator('input[placeholder="At least 8 characters"]');
    const confirm = page.locator('input[placeholder="Re-enter your password"]');
    await pw.fill("Abcdefg1!");
    await confirm.fill("Abcdefg1!");

    // Two eye buttons
    const eyeButtons = page.locator('form button svg.lucide-eye');
    await expect(eyeButtons).toHaveCount(2);

    // Toggle only the password field's eye (native click on the eye button)
    await page.evaluate(() => {
      const input = document.querySelector('input[placeholder="At least 8 characters"]');
      const btn = input?.closest("div.relative")?.querySelector("button");
      (btn as HTMLButtonElement)?.click();
    });
    await expect(pw).toHaveAttribute("type", "text");
    await expect(confirm).toHaveAttribute("type", "password");

    // Toggle the confirm field's eye independently
    await page.evaluate(() => {
      const input = document.querySelector('input[placeholder="Re-enter your password"]');
      const btn = input?.closest("div.relative")?.querySelector("button");
      (btn as HTMLButtonElement)?.click();
    });
    await expect(confirm).toHaveAttribute("type", "text");
    await expect(pw).toHaveAttribute("type", "text");
  });

  test("navigation links are wired correctly", async ({ page }) => {
    await expect(page.locator('a[href="/"]').first()).toContainText("GradGrid");
    await expect(page.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/login");
    await expect(page.getByRole("link", { name: "Terms of Service" })).toHaveAttribute("href", "/terms");
    await expect(page.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", "/privacy");
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
    await expect(page.getByRole("link", { name: "Create an account" })).toHaveAttribute("href", "/signup");
    await expect(page.locator('a[href="/"]').first()).toContainText("GradGrid");
    await page.getByRole("link", { name: "Create an account" }).click();
    await expect(page).toHaveURL(/\/signup/);
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

  test("invalid email shows a format error", async ({ page }) => {
    const email = page.locator('input[placeholder="you@institution.edu"]');
    await email.fill("not-an-email");
    await email.blur();
    await expect(page.locator("form")).toContainText("Please enter a valid email address");
  });

  test("valid submit shows the check-your-email success state", async ({ page }) => {
    // Mock the public forgot-password API so this works without a backend.
    await page.route("**/api/v1/auth/forgot-password", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "If that email is registered, a password reset link has been sent",
        }),
      })
    );

    const email = page.locator('input[placeholder="you@institution.edu"]');
    await email.fill("user@test.com");
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("form button")).find((b) =>
        b.textContent?.includes("Send Reset Link")
      );
      (btn as HTMLButtonElement).click();
    });

    await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
    await expect(page.locator("body")).toContainText(
      "We've sent a password reset link to your email"
    );
  });

  test("navigation links are wired correctly", async ({ page }) => {
    await expect(page.locator('a[href="/"]').first()).toContainText("GradGrid");
    await expect(page.getByRole("link", { name: "← Back to sign in" })).toHaveAttribute("href", "/login");
  });

  test("success state shows a back-to-login link", async ({ page }) => {
    await page.route("**/api/v1/auth/forgot-password", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, message: "sent" }),
      })
    );
    const email = page.locator('input[placeholder="you@institution.edu"]');
    await email.fill("user@test.com");
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("form button")).find((b) =>
        b.textContent?.includes("Send Reset Link")
      );
      (btn as HTMLButtonElement).click();
    });
    await expect(page.getByRole("link", { name: "Back to login" })).toHaveAttribute("href", "/login");
  });
});

test.describe("Reset Password", () => {
  test("missing token shows the invalid-link state", async ({ page }) => {
    await page.goto("/reset-password");
    await expect(page.getByRole("heading", { name: "Invalid reset link" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Request a new link" })).toHaveAttribute(
      "href",
      "/forgot-password"
    );
  });

  test.describe("with a token in the URL", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/reset-password?token=validtoken123");
      await expect(page.getByRole("heading", { name: "Set a new password" })).toBeVisible();
    });

    test("empty submit shows required errors for both password fields", async ({ page }) => {
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll("form button")).find((b) =>
          b.textContent?.includes("Reset Password")
        );
        (btn as HTMLButtonElement).click();
      });
      await expect(page.locator("form")).toContainText("Valid Password is required");
      await expect(page.locator("form")).toContainText("Confirm password is required");
    });

    test("mismatched confirm password shows an error", async ({ page }) => {
      const pw = page.locator('input[placeholder="At least 8 characters"]');
      await pw.fill("Abcdefg1!");
      const confirm = page.locator('input[placeholder="Re-enter your password"]');
      await confirm.fill("Abcdefg2!");
      await confirm.blur();
      await expect(page.locator("form")).toContainText("Passwords do not match");
    });

    test("valid submit shows the password-updated success state", async ({ page }) => {
      await page.route("**/api/v1/auth/reset-password", (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            message: "Password has been reset. Please sign in with your new password.",
          }),
        })
      );

      const pw = page.locator('input[placeholder="At least 8 characters"]');
      await pw.fill("Abcdefg1!");
      const confirm = page.locator('input[placeholder="Re-enter your password"]');
      await confirm.fill("Abcdefg1!");
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll("form button")).find((b) =>
          b.textContent?.includes("Reset Password")
        );
        (btn as HTMLButtonElement).click();
      });

      await expect(page.getByRole("heading", { name: "Password updated" })).toBeVisible();
      // Toast renders outside <main> — assert on body.
      await expect(page.locator("body")).toContainText("Please sign in with your new password");
    });
  });
});
