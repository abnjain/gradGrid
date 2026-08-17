import { test, expect, type Page } from "@playwright/test";

/**
 * Click a button by visible text using a native DOM click.
 *
 * In this throttled headless environment, Playwright's synthetic clicks can get
 * swallowed when a blur-triggered validation re-render shifts the layout (the
 * mousedown blurs the focused input → React re-renders → the click misses).
 * A native element.click() dispatches directly on the element and is reliable.
 */
async function clickButton(page: Page, label: string) {
  await page.evaluate((text) => {
    const btn = Array.from(document.querySelectorAll("button")).find((b) =>
      b.textContent?.includes(text)
    );
    if (btn) (btn as HTMLButtonElement).click();
  }, label);
}

/**
 * Settings hub + sub-pages — client-side forms and interactions.
 * These pages are client components that do NOT require the backend,
 * so the tests run against the dev server without any login.
 */

test.describe("Settings Hub", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/app/settings");
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  });

  test("shows all five settings cards", async ({ page }) => {
    for (const card of [
      "General",
      "Branding",
      "Roles & Permissions",
      "Communication",
      "Data Management",
    ]) {
      await expect(page.locator("main").getByRole("heading", { name: card })).toBeVisible();
    }
    // Data Management is now a real page — no "Soon" badge
    await expect(page.locator("main").getByText("Soon", { exact: true })).toHaveCount(0);
  });

  test("cards link to their settings pages", async ({ page }) => {
    const main = page.locator("main");
    await expect(main.getByRole("link", { name: /General/ })).toHaveAttribute("href", "/app/settings/general");
    await expect(main.getByRole("link", { name: /Branding/ })).toHaveAttribute("href", "/app/settings/branding");
    await expect(main.getByRole("link", { name: /Roles & Permissions/ })).toHaveAttribute("href", "/app/settings/roles");
    await expect(main.getByRole("link", { name: /Communication/ })).toHaveAttribute("href", "/app/settings/communication");
    await expect(main.getByRole("link", { name: /Data Management/ })).toHaveAttribute("href", "/app/settings/data");
  });
});

test.describe("General Settings", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/app/settings/general");
    await expect(page.getByRole("heading", { name: "General Settings" })).toBeVisible();
  });

  test("back link returns to the settings hub", async ({ page }) => {
    // Native click — Playwright's synthetic click can get swallowed in this env
    await page.evaluate(() => {
      const link = Array.from(document.querySelectorAll("main a")).find(
        (a) => a.textContent?.trim() === "Settings"
      );
      (link as HTMLAnchorElement).click();
    });
    await expect(page).toHaveURL(/\/app\/settings$/);
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  });

  test("empty submit shows field-specific errors", async ({ page }) => {
    // Clear prefilled fields
    await page.getByLabel("Institution name").fill("");
    await page.getByLabel("Short name / tagline").fill("");
    await page.getByLabel("Contact email").fill("");

    await clickButton(page, "Save Changes");

    for (const message of [
      "Institution name is required",
      "Short name is required",
      "Contact email is required",
    ]) {
      await expect(page.locator("main")).toContainText(message);
    }
    // The error toast renders outside <main> — assert it on the body
    await expect(page.locator("body")).toContainText("Please fix the highlighted fields");
  });

  test("invalid email shows a format error", async ({ page }) => {
    await page.getByLabel("Contact email").fill("not-an-email");
    await page.getByLabel("Contact email").blur();
    await expect(page.locator("main")).toContainText("Please enter a valid email address");
  });

  test("saving valid details shows a success toast", async ({ page }) => {
    await page.getByLabel("Contact email").fill("admin@school.edu");
    await clickButton(page, "Save Changes");
    await expect(page.locator("body")).toContainText("Settings saved");
  });

  test("form fields are prefilled and editable", async ({ page }) => {
    await expect(page.getByLabel("Institution name")).toHaveValue("Demo Institution");
    await page.getByLabel("City").fill("Pune");
    await expect(page.getByLabel("City")).toHaveValue("Pune");
  });
});

test.describe("Branding", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/app/settings/branding");
    await expect(page.getByRole("heading", { name: "Branding" })).toBeVisible();
  });

  test("renders portal identity and color swatches", async ({ page }) => {
    await expect(page.getByLabel("Portal name")).toHaveValue("GradGrid");
    for (const color of ["Teal", "Sky", "Violet", "Emerald", "Amber", "Rose"]) {
      await expect(page.getByRole("button", { name: new RegExp(`Select ${color} brand color`) })).toBeVisible();
    }
  });

  test("selecting a color marks it active and updates the preview", async ({ page }) => {
    const sky = page.getByRole("button", { name: "Select Sky brand color" });
    await expect(sky).toHaveAttribute("aria-pressed", "false");
    await sky.click();
    await expect(sky).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("main")).toContainText("Preview of your portal branding");
  });

  test("empty portal name is rejected on save", async ({ page }) => {
    await page.getByLabel("Portal name").fill("");
    await clickButton(page, "Save Changes");
    await expect(page.locator("main")).toContainText("Portal name is required");
  });

  test("logo dropzone is present", async ({ page }) => {
    await expect(page.locator('input[type="file"]')).toBeVisible();
    await expect(page.locator("main")).toContainText("Click to upload a logo");
  });
});

test.describe("Roles & Permissions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/app/settings/roles");
    await expect(page.getByRole("heading", { name: "Roles & Permissions" })).toBeVisible();
  });

  test("lists all roles with member counts", async ({ page }) => {
    for (const role of ["Administrator", "Principal", "Teacher", "Accountant", "Parent", "Student"]) {
      await expect(page.locator("main")).toContainText(role);
    }
    await expect(page.locator("main")).toContainText("Always on");
  });

  test("role toggles switch active state and locked roles stay on", async ({ page }) => {
    const teacherToggle = page.getByRole("checkbox", { name: "Toggle Teacher role" });
    await teacherToggle.click({ force: true });
    await expect(teacherToggle).not.toBeChecked();

    const adminToggle = page.getByRole("checkbox", { name: "Toggle Administrator role" });
    await expect(adminToggle).toBeDisabled();
    await expect(adminToggle).toBeChecked();
  });

  test("permission matrix has modules and action checkboxes", async ({ page }) => {
    for (const module of ["Students", "Attendance", "Finance", "Reports", "Communication", "Settings"]) {
      await expect(page.locator("main")).toContainText(module);
    }
    for (const action of ["View", "Create", "Edit", "Delete"]) {
      await expect(page.locator("main")).toContainText(action);
    }
  });

  test("permission checkboxes toggle and save shows a toast", async ({ page }) => {
    const financeDelete = page.getByRole("checkbox", { name: "Finance Delete" });
    await expect(financeDelete).not.toBeChecked();
    await financeDelete.click({ force: true });
    await expect(financeDelete).toBeChecked();

    await clickButton(page, "Save Permissions");
    await expect(page.locator("body")).toContainText("Permissions saved");
  });
});

test.describe("Communication", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/app/settings/communication");
    await expect(page.getByRole("heading", { name: "Communication" })).toBeVisible();
  });

  test("renders SMTP and WhatsApp sections", async ({ page }) => {
    await expect(page.getByLabel("SMTP host")).toBeVisible();
    await expect(page.getByLabel("Port")).toBeVisible();
    await expect(page.getByLabel("From email")).toBeVisible();
    await expect(page.getByLabel("Business number")).toBeVisible();
    await expect(page.locator("main")).toContainText("Enable WhatsApp notifications");
  });

  test("password and API token fields reveal independently", async ({ page }) => {
    const smtpPw = page.locator('input[placeholder="••••••••"]');
    const waKey = page.locator('input[placeholder="Enter your WhatsApp API token"]');
    await smtpPw.fill("secret123");
    await waKey.fill("token-abc");

    await page.getByRole("button", { name: "Show SMTP password" }).click();
    await expect(smtpPw).toHaveAttribute("type", "text");
    await expect(waKey).toHaveAttribute("type", "password");

    await page.getByRole("button", { name: "Show API token" }).click();
    await expect(waKey).toHaveAttribute("type", "text");
  });

  test("test email button shows a success toast", async ({ page }) => {
    await clickButton(page, "Send Test Email");
    await expect(page.locator("body")).toContainText("Test email sent");
  });

  test("empty required fields are rejected on save", async ({ page }) => {
    await page.getByLabel("SMTP host").fill("");
    await page.getByLabel("From email").fill("");
    await page.getByLabel("Business number").fill("");
    await clickButton(page, "Save Changes");
    for (const message of ["SMTP host is required", "From email is required", "Business number is required"]) {
      await expect(page.locator("main")).toContainText(message);
    }
  });
});

test.describe("Data Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/app/settings/data");
    await expect(page.getByRole("heading", { name: "Data Management" })).toBeVisible();
  });

  test("renders retention, backup, export, and danger zone", async ({ page }) => {
    await expect(page.getByLabel("Data retention")).toBeVisible();
    await expect(page.getByLabel("Backup schedule")).toBeVisible();
    await expect(page.getByRole("button", { name: "Download Export" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Delete Data" })).toBeVisible();
    await expect(page.locator("main")).toContainText("Auto-archive old records");
  });

  test("selects change values and save shows a toast", async ({ page }) => {
    await page.getByLabel("Data retention").selectOption("5years");
    await expect(page.getByLabel("Data retention")).toHaveValue("5years");

    await page.getByLabel("Backup schedule").selectOption("daily");
    await expect(page.getByLabel("Backup schedule")).toHaveValue("daily");

    await clickButton(page, "Save Changes");
    await expect(page.locator("body")).toContainText("Data settings saved");
  });

  test("export button shows a toast", async ({ page }) => {
    await clickButton(page, "Download Export");
    await expect(page.locator("body")).toContainText("Export started");
  });

  test("danger zone delete is blocked with a warning", async ({ page }) => {
    await clickButton(page, "Delete Data");
    await expect(page.locator("body")).toContainText("Action cancelled");
  });
});
