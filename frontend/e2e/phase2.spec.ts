import { test, expect } from "@playwright/test";
import { mockInstitutionSession } from "./helpers/test-auth";

test.describe("Phase 2 institution records", () => {
  test("loads institution-scoped teacher records", async ({ page }) => {
    await mockInstitutionSession(page, { withTenantContext: true });
    await page.route("**/api/v1/teachers", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            teachers: [
              {
                id: "teacher-1",
                name: "Ananya Gupta",
                email: "ananya@school.edu",
                phone: "+911234567890",
                employeeCode: "T-001",
                departmentName: "Science",
                designation: "Teacher",
                employmentStatus: "active",
              },
            ],
          },
        }),
      })
    );

    await page.goto("/app/teachers/list");
    await expect(page.getByRole("heading", { name: "Teachers" })).toBeVisible();
    await expect(page.getByText("Ananya Gupta")).toBeVisible();
    await expect(page.getByText("T-001")).toBeVisible();
    await expect(page.getByText("Science")).toBeVisible();
  });
});

test.describe("Phase 2 admission documents", () => {
  test("uploads and lists an enquiry document", async ({ page }) => {
    await mockInstitutionSession(page, { withTenantContext: true });
    await page.route("**/api/v1/admissions/enquiry-1", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            enquiry: {
              id: "enquiry-1",
              status: "new",
              studentName: "Aarav Sharma",
              parentName: "Neha Sharma",
              parentPhone: "+911234567890",
              parentEmail: "neha@school.edu",
              applyingForClass: "5",
              documents: [],
            },
          },
        }),
      })
    );
    await page.route("**/api/v1/admissions/enquiry-1/documents", async (route) => {
      expect(route.request().postDataJSON()).toMatchObject({
        documentType: "identity",
        originalName: "identity.pdf",
        mimeType: "application/pdf",
      });
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            document: {
              id: "document-1",
              documentType: "identity",
              originalName: "identity.pdf",
              mimeType: "application/pdf",
              sizeBytes: 4,
              createdAt: new Date().toISOString(),
            },
          },
        }),
      });
    });

    await page.goto("/app/admissions/enquiry-1");
    await expect(page.getByRole("heading", { name: "Aarav Sharma" })).toBeVisible();
    await page.locator('input[type="file"]').setInputFiles({
      name: "identity.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("test"),
    });
    await page.getByRole("button", { name: "Upload" }).click();
    await expect(page.getByText("Document uploaded")).toBeVisible();
  });
});
