import { test, expect } from "@playwright/test";
import {
  MOCK_SIGNUP_REQUEST_UNVERIFIED,
  mockPlatformSession,
  mockSignupRequestsList,
  toastContainer,
} from "./helpers/test-auth";

/**
 * Platform admin signup request review — approve/reject flow.
 * APIs are mocked for reliable CI runs.
 */

test.describe("Admin signup requests", () => {
  test.beforeEach(async ({ page }) => {
    await mockPlatformSession(page);
  });

  test("lists pending applications with owner and institution details", async ({ page }) => {
    await mockSignupRequestsList(page);
    await page.goto("/admin/signup-requests");

    await expect(page.getByRole("heading", { name: "Signup requests" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Greenwood High", level: 2 })).toBeVisible();
    await expect(page.getByText("ABC Education")).toBeVisible();
    await expect(page.getByText("owner@school.edu")).toBeVisible();
    await expect(page.getByText("Email verified")).toBeVisible();
    await expect(page.getByRole("button", { name: "Approve" })).toBeEnabled();
  });

  test("shows empty state when no pending applications exist", async ({ page }) => {
    await mockSignupRequestsList(page, []);
    await page.goto("/admin/signup-requests");

    await expect(page.getByText("No pending signup applications.")).toBeVisible();
  });

  test("approve removes application and shows success toast", async ({ page }) => {
    await mockSignupRequestsList(page);
    await page.route("**/api/v1/platform/signup-requests/req-1/approve", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, message: "Application approved" }),
      })
    );

    await page.goto("/admin/signup-requests");
    await page.getByRole("button", { name: "Approve" }).click();

    await expect(toastContainer(page).getByText("Application approved", { exact: true })).toBeVisible();
    await expect(page.getByText("No pending signup applications.")).toBeVisible();
  });

  test("reject with reason removes application and shows success toast", async ({ page }) => {
    await mockSignupRequestsList(page);
    await page.route("**/api/v1/platform/signup-requests/req-1/reject", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, message: "Application rejected" }),
      })
    );

    await page.goto("/admin/signup-requests");
    await page.getByRole("button", { name: "Reject" }).click();
    await page.getByPlaceholder("Optional rejection reason").fill("Incomplete documentation");
    await page.getByRole("button", { name: "Confirm reject" }).click();

    await expect(toastContainer(page).getByText("Application rejected", { exact: true })).toBeVisible();
    await expect(page.getByText("No pending signup applications.")).toBeVisible();
  });

  test("reject modal can be cancelled", async ({ page }) => {
    await mockSignupRequestsList(page);
    await page.goto("/admin/signup-requests");

    await page.getByRole("button", { name: "Reject" }).click();
    await expect(page.getByPlaceholder("Optional rejection reason")).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).click();

    await expect(page.getByPlaceholder("Optional rejection reason")).not.toBeVisible();
    await expect(page.getByRole("heading", { name: "Greenwood High", level: 2 })).toBeVisible();
  });

  test("approve is disabled until email is verified", async ({ page }) => {
    await mockSignupRequestsList(page, [MOCK_SIGNUP_REQUEST_UNVERIFIED]);
    await page.goto("/admin/signup-requests");

    await expect(page.getByText("Email pending")).toBeVisible();
    await expect(page.getByRole("button", { name: "Approve" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Reject" })).toBeEnabled();
  });
});
