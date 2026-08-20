import { test, expect } from "@playwright/test";
import { fillSignupInstitutionStep, fillSignupOwnerStep, passwordField } from "./helpers/test-auth";

async function mockApiHealth(page: import("@playwright/test").Page) {
  await page.route("**/api/v1/health", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, data: { service: "GradGrid API" } }),
    })
  );
}

/**
 * Institution signup wizard — validation and multi-step flow.
 * API calls are mocked so tests run without a live backend.
 */

test.describe("Signup — validation", () => {
  test.beforeEach(async ({ page }) => {
    await mockApiHealth(page);
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
    await fillSignupInstitutionStep(page);
    await expect(page.getByText("Step 2 of 2")).toBeVisible();
    await expect(page.getByLabel("First name")).toBeVisible();
  });

  test("step 2 validates owner fields", async ({ page }) => {
    await fillSignupInstitutionStep(page);
    await page.getByRole("button", { name: "Submit application" }).click();
    await expect(page.locator("body")).toContainText("First name is required");
    await expect(page.locator("body")).toContainText("Email is required");
  });

  test("password strength checklist appears on owner step", async ({ page }) => {
    await fillSignupInstitutionStep(page);
    const pw = passwordField(page);
    await pw.focus();
    await pw.fill("Abcdefg1!");
    await expect(page.locator("body")).toContainText("Strong");
  });

  test("owner step back button returns to institution step", async ({ page }) => {
    await fillSignupInstitutionStep(page);
    await page.getByRole("button", { name: "Back" }).click();
    await expect(page.getByText("Step 1 of 2")).toBeVisible();
    await expect(page.getByLabel("Organization name")).toBeVisible();
  });

  test("navigation links are wired correctly", async ({ page }) => {
    await expect(page.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/login");
    await expect(page.locator('a[href="/"]').first()).toContainText("GradGrid");
  });
});

test.describe("Signup — application flow", () => {
  test.beforeEach(async ({ page }) => {
    await mockApiHealth(page);
  });

  test("successful submit advances to email verification step", async ({ page }) => {
    await page.route("**/api/v1/auth/institution/register-institution", (route) =>
      route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            requestId: "req-1",
            email: "owner@school.edu",
            requiresEmailVerification: true,
          },
          message: "Application submitted. Please verify your email.",
        }),
      })
    );

    await page.goto("/signup");
    await fillSignupInstitutionStep(page);
    await fillSignupOwnerStep(page);
    await page.getByRole("button", { name: "Submit application" }).click();

    await expect(page.getByRole("heading", { name: "Verify your email" })).toBeVisible();
    await expect(page.getByLabel("Email")).toHaveValue("owner@school.edu");
    await expect(page.getByRole("button", { name: "Verify email" })).toBeVisible();
  });

  test("OTP verification shows pending approval screen", async ({ page }) => {
    await page.route("**/api/v1/auth/institution/register-institution", (route) =>
      route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { email: "owner@school.edu", requiresEmailVerification: true },
        }),
      })
    );

    await page.route("**/api/v1/auth/institution/verify-email", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            status: "pending",
            message: "Email verified. Your application is awaiting admin approval.",
          },
        }),
      })
    );

    await page.goto("/signup");
    await fillSignupInstitutionStep(page);
    await fillSignupOwnerStep(page);
    await page.getByRole("button", { name: "Submit application" }).click();

    await page.getByLabel("Verification code").fill("123456");
    await page.getByRole("button", { name: "Verify email" }).click();

    await expect(page.getByRole("heading", { name: "Application submitted" })).toBeVisible();
    await expect(page.locator("body")).toContainText("pending admin approval");
    await expect(page.locator("body")).toContainText("Greenwood High");
    await expect(page.getByRole("link", { name: "Back to sign in" })).toHaveAttribute("href", "/login");
  });

  test("verify step can be opened directly via query params", async ({ page }) => {
    await page.goto("/signup?step=verify&email=owner@school.edu");
    await expect(page.getByRole("heading", { name: "Verify your email" })).toBeVisible();
    await expect(page.getByLabel("Email")).toHaveValue("owner@school.edu");
  });

  test("resend OTP calls API and shows success feedback", async ({ page }) => {
    await page.route("**/api/v1/auth/institution/resend-otp", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { message: "Verification code sent" },
        }),
      })
    );

    await page.goto("/signup?step=verify&email=owner@school.edu");
    await page.getByRole("button", { name: "Resend code" }).click();
    await expect(
      page.locator(".fixed.top-4.right-4").getByText("Code sent", { exact: true })
    ).toBeVisible();
  });

  test("invalid OTP shows validation feedback", async ({ page }) => {
    await page.goto("/signup?step=verify&email=owner@school.edu");
    await page.getByLabel("Verification code").fill("12");
    await page.getByRole("button", { name: "Verify email" }).click();
    await expect(page.getByText("Invalid code")).toBeVisible();
  });

  test("pending application returns to the verification step", async ({ page }) => {
    await page.route("**/api/v1/auth/institution/register-institution", (route) =>
      route.fulfill({
        status: 409,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          error: {
            code: "APPLICATION_PENDING",
            message: "An application with this email is already under review",
          },
        }),
      })
    );

    await page.goto("/signup");
    await fillSignupInstitutionStep(page);
    await fillSignupOwnerStep(page, "pending@school.edu");
    await page.getByRole("button", { name: "Submit application" }).click();

    await expect(page.getByRole("heading", { name: "Verify your email" })).toBeVisible();
    await expect(page.getByText("Application already submitted")).toBeVisible();
  });

  test("already registered email shows error toast", async ({ page }) => {
    await page.route("**/api/v1/auth/institution/register-institution", (route) =>
      route.fulfill({
        status: 409,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          error: {
            code: "EMAIL_ALREADY_REGISTERED",
            message: "A user with this email already exists. Please sign in instead.",
          },
        }),
      })
    );

    await page.goto("/signup");
    await fillSignupInstitutionStep(page);
    await fillSignupOwnerStep(page, "existing@school.edu");
    await page.getByRole("button", { name: "Submit application" }).click();

    await expect(page.getByText("Sign up failed")).toBeVisible();
    await expect(page.getByText("already exists")).toBeVisible();
  });
});
