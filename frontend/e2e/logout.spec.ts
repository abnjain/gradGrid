import { test, expect, type Page } from "@playwright/test";
import { setSessionCookies } from "./helpers/test-auth";

type Audience = "institution" | "platform" | "portal";
type PortalUserType = "student" | "parent";

function authResponse(audience: Audience, userType: "institution" | "platform" | PortalUserType) {
  const isInstitution = audience === "institution";
  const isPlatform = audience === "platform";
  return {
    success: true,
    data: {
      user: {
        id: `${audience}-user`,
        firstName: isPlatform ? "Platform" : "Portal",
        lastName: "User",
        email: `${audience}@demo.edu`,
        userType,
        sessionId: `${audience}-session`,
        ...(isInstitution
          ? {
              institutionId: "inst-1",
              institutionName: "Greenwood High School",
              organizationId: "org-1",
              organizationName: "EduTrust Foundation",
              tenantContext: {
                institutionId: "inst-1",
                institutionName: "Greenwood High School",
                organizationId: "org-1",
                organizationName: "EduTrust Foundation",
              },
            }
          : {}),
      },
    },
  };
}

async function mockSessionLifecycle(
  page: Page,
  audience: Audience,
  userType: "institution" | "platform" | PortalUserType
) {
  let loggedOut = false;

  await page.route("**/api/v1/auth/**/refresh", (route) =>
    route.fulfill({
      status: loggedOut ? 401 : 200,
      contentType: "application/json",
      body: JSON.stringify(
        loggedOut
          ? { success: false, error: { code: "UNAUTHENTICATED" } }
          : { success: true, data: { tokens: { accessToken: `mock-${audience}-token` } } }
      ),
    })
  );
  await page.route("**/api/v1/auth/**/me", (route) =>
    route.fulfill({
      status: loggedOut ? 401 : 200,
      contentType: "application/json",
      body: JSON.stringify(loggedOut ? { success: false } : authResponse(audience, userType)),
    })
  );
  await page.route(`**/api/v1/auth/${audience}/logout`, (route) => {
    loggedOut = true;
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, message: "Logged out successfully" }),
    });
  });

  if (audience === "portal") {
    await page.route("**/api/v1/portal/me", (route) =>
      route.fulfill({
        status: loggedOut ? 401 : 200,
        contentType: "application/json",
        body: JSON.stringify(
          loggedOut
            ? { success: false }
            : {
                success: true,
                data:
                  userType === "student"
                    ? { role: "student", student: { name: "Student User", className: "10", sectionName: "A" } }
                    : { role: "parent", children: [{ id: "student-1", name: "Child User" }] },
              }
        ),
      })
    );
  }

  await setSessionCookies(page, audience);
}

test.describe("Logout protection", () => {
  test("institution logout returns to login and blocks organization selection after logout", async ({ page }) => {
    await mockSessionLifecycle(page, "institution", "institution");
    await page.goto("/app/dashboard");

    await page.getByRole("button", { name: "Logout" }).click();
    await expect(page).toHaveURL(/\/login(?:\?.*)?$/);

    await page.goto("/app/select-organization");
    await expect(page).toHaveURL(/\/login(?:\?.*)?$/);
  });

  test("platform admin logout returns to platform login and blocks dashboard re-entry", async ({ page }) => {
    await mockSessionLifecycle(page, "platform", "platform");
    await page.goto("/platform/dashboard");

    await page.getByRole("button", { name: "Logout" }).click();
    await expect(page).toHaveURL(/\/platform\/login(?:\?.*)?$/);

    await page.goto("/platform/dashboard");
    await expect(page).toHaveURL(/\/platform\/login(?:\?.*)?$/);
  });

  for (const userType of ["student", "parent"] as const) {
    test(`${userType} portal logout returns to portal login and blocks portal re-entry`, async ({ page }) => {
      await mockSessionLifecycle(page, "portal", userType);
      await page.goto("/portal/home");

      await page.getByRole("button", { name: "Sign out" }).click();
      await expect(page).toHaveURL(/\/portal\/login(?:\?.*)?$/);

      await page.goto("/portal/home");
      await expect(page).toHaveURL(/\/portal\/login(?:\?.*)?$/);
    });
  }
});
