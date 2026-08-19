import { test, expect } from "@playwright/test";
import {
  mockInstitutionSession,
  mockPlatformAuthApis,
  mockPlatformSession,
  mockSelectContext,
  mockWorkspaces,
  performInstitutionLogin,
  setSessionCookies,
  waitForOrganizations,
} from "./helpers/test-auth";

/**
 * Post-login tenant routing: Login → Organization → Campus → Dashboard.
 * All auth APIs are mocked for reliable CI runs.
 */

test.describe("Login routing", () => {
  test("institution login redirects to organization selection", async ({ page }) => {
    await mockWorkspaces(page);
    await performInstitutionLogin(page);
    await expect(page).toHaveURL(/\/app\/select-organization$/);
    await expect(page.getByRole("heading", { name: "Choose your organization" })).toBeVisible();
    await waitForOrganizations(page);
  });

  test("platform login redirects to admin dashboard", async ({ page }) => {
    await page.route("**/api/v1/auth/login", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            user: {
              id: "admin-1",
              firstName: "Platform",
              lastName: "Admin",
              email: "admin@gradgrid.app",
              userType: "platform",
              roleName: "Platform User",
              permissions: [],
              sessionId: "session-admin",
            },
            tokens: { accessToken: "mock-platform-token" },
          },
        }),
      })
    );

    await page.goto("/login");
    await page.locator('input[placeholder="you@institution.edu"]').fill("admin@gradgrid.app");
    await page.locator('input[placeholder="Enter your password"]').fill("Admin@12345");
    await Promise.all([
      page.waitForResponse((res) => res.url().includes("/auth/login") && res.ok()),
      page.getByRole("button", { name: "Sign In" }).click(),
    ]);
    await setSessionCookies(page, "platform");
    await mockPlatformAuthApis(page);
    await page.waitForURL(/\/platform\/dashboard/);
    await expect(page).toHaveURL(/\/platform\/dashboard/);
  });
});

test.describe("Organization selection", () => {
  test.beforeEach(async ({ page }) => {
    await mockInstitutionSession(page);
    await mockWorkspaces(page);
  });

  test("lists accessible organizations", async ({ page }) => {
    await page.goto("/app/select-organization");
    await expect(page.getByRole("heading", { name: "Choose your organization" })).toBeVisible();
    await expect(page.getByText("EduTrust Foundation")).toBeVisible();
    await expect(page.getByText("2 campuses")).toBeVisible();
    await expect(page.getByText("Sunrise Education Trust")).toBeVisible();
  });

  test("selecting an organization navigates to campus selection", async ({ page }) => {
    await page.goto("/app/select-organization");
    await waitForOrganizations(page);
    await page.getByRole("button", { name: /EduTrust Foundation/ }).click();
    await expect(page).toHaveURL(/\/app\/select-campus\?organizationId=org-1$/);
    await expect(page.getByRole("heading", { name: "Choose your campus" })).toBeVisible();
    await expect(page.getByText("Greenwood High School")).toBeVisible();
    await expect(page.getByText("Riverside Academy")).toBeVisible();
  });

  test("shows empty state when no organizations are linked", async ({ page }) => {
    await page.route("**/api/v1/auth/workspaces", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { organizations: [] } }),
      })
    );

    await page.goto("/app/select-organization");
    await expect(page.locator("body")).toContainText("No organizations are linked to your account");
  });
});

test.describe("Campus selection and dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await mockInstitutionSession(page);
    await mockWorkspaces(page);
    await mockSelectContext(page);
  });

  test("campus selection leads to dashboard", async ({ page }) => {
    await page.goto("/app/select-campus?organizationId=org-1");
    await expect(page.getByText("Greenwood High School")).toBeVisible();
    await page.getByRole("button", { name: /Greenwood High School/ }).click();
    await expect(page).toHaveURL(/\/app\/dashboard$/);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("back link returns to organization selection", async ({ page }) => {
    await page.goto("/app/select-campus?organizationId=org-1");
    await page.getByRole("link", { name: "Back to organizations" }).click();
    await expect(page).toHaveURL(/\/app\/select-organization$/);
  });

  test("missing organizationId redirects to organization selection", async ({ page }) => {
    await page.goto("/app/select-campus");
    await expect(page).toHaveURL(/\/app\/select-organization$/);
  });
});

test.describe("Portal guards", () => {
  test("dashboard without tenant context redirects to organization selection", async ({ page }) => {
    await mockInstitutionSession(page, { withTenantContext: false });

    await page.goto("/app/dashboard");
    await expect(page).toHaveURL(/\/app\/select-organization$/);
  });

  test("dashboard is accessible when tenant context exists", async ({ page }) => {
    await mockInstitutionSession(page, { withTenantContext: true });

    await page.goto("/app/dashboard");
    await expect(page).toHaveURL(/\/app\/dashboard$/);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("/app root redirects to organization selection", async ({ page }) => {
    await mockInstitutionSession(page);
    await page.goto("/app");
    await expect(page).toHaveURL(/\/app\/select-organization$/);
  });

  test("full login to dashboard routing flow", async ({ page }) => {
    await mockWorkspaces(page);
    await mockSelectContext(page);
    await performInstitutionLogin(page);

    await waitForOrganizations(page);
    await page.getByRole("button", { name: /EduTrust Foundation/ }).click();
    await expect(page).toHaveURL(/\/app\/select-campus\?organizationId=org-1$/);
    await page.getByRole("button", { name: /Greenwood High School/ }).click();
    await expect(page).toHaveURL(/\/app\/dashboard$/);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });
});

test.describe("Platform portal bypass", () => {
  test("platform session does not require tenant selection", async ({ page }) => {
    await mockPlatformSession(page);

    await page.goto("/platform/dashboard");
    await expect(page).toHaveURL(/\/platform\/dashboard/);
  });
});
