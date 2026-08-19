import { expect, type Page } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

export const MOCK_ORGANIZATIONS = {
  success: true,
  data: {
    organizations: [
      {
        id: "org-1",
        name: "EduTrust Foundation",
        institutions: [
          { id: "inst-1", name: "Greenwood High School", code: "GHS-001" },
          { id: "inst-2", name: "Riverside Academy", code: "RA-002" },
        ],
      },
      {
        id: "org-2",
        name: "Sunrise Education Trust",
        institutions: [{ id: "inst-3", name: "Sunrise Primary", code: "SP-003" }],
      },
    ],
  },
};

export const MOCK_TENANT_CONTEXT = {
  organizationId: "org-1",
  organizationName: "EduTrust Foundation",
  institutionId: "inst-1",
  institutionName: "Greenwood High School",
  institutionCode: "GHS-001",
};

export async function setSessionCookies(
  page: Page,
  portalType: "institution" | "platform" | "portal" = "institution"
) {
  const audienceCookie =
    portalType === "platform"
      ? "refreshToken_platform"
      : portalType === "portal"
        ? "refreshToken_portal"
        : "refreshToken_institution";

  await page.context().addCookies([
    {
      name: "refreshToken",
      value: "mock-refresh-token",
      url: BASE_URL,
      httpOnly: true,
      sameSite: "Strict",
    },
    {
      name: audienceCookie,
      value: "mock-refresh-token",
      url: BASE_URL,
      httpOnly: true,
      sameSite: "Strict",
    },
    {
      name: "gradgrid_portal",
      value: portalType,
      url: BASE_URL,
      sameSite: "Strict",
    },
  ]);
}

export async function mockInstitutionAuthApis(
  page: Page,
  options?: {
    withTenantContext?: boolean;
    email?: string;
  }
) {
  const email = options?.email ?? "accountant@demo.edu";
  const withTenantContext = options?.withTenantContext ?? false;

  await page.route("**/api/v1/auth/**/refresh", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: { tokens: { accessToken: "mock-access-token" } },
      }),
    })
  );
  await page.route("**/api/v1/auth/refresh", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: { tokens: { accessToken: "mock-access-token" } },
      }),
    })
  );

  await page.route("**/api/v1/auth/**/me", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          user: {
            id: "user-1",
            firstName: "Priya",
            lastName: "Iyer",
            email,
            userType: "institution",
            sessionId: "session-1",
            ...(withTenantContext
              ? {
                  institutionId: MOCK_TENANT_CONTEXT.institutionId,
                  organizationId: MOCK_TENANT_CONTEXT.organizationId,
                  organizationName: MOCK_TENANT_CONTEXT.organizationName,
                  institutionName: MOCK_TENANT_CONTEXT.institutionName,
                  tenantContext: MOCK_TENANT_CONTEXT,
                }
              : {}),
          },
        },
      }),
    })
  );
  await page.route("**/api/v1/auth/me", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          user: {
            id: "user-1",
            firstName: "Priya",
            lastName: "Iyer",
            email,
            userType: "institution",
            sessionId: "session-1",
            ...(withTenantContext
              ? {
                  institutionId: MOCK_TENANT_CONTEXT.institutionId,
                  organizationId: MOCK_TENANT_CONTEXT.organizationId,
                  organizationName: MOCK_TENANT_CONTEXT.organizationName,
                  institutionName: MOCK_TENANT_CONTEXT.institutionName,
                  tenantContext: MOCK_TENANT_CONTEXT,
                }
              : {}),
          },
        },
      }),
    })
  );
}

export async function mockInstitutionSession(
  page: Page,
  options?: {
    withTenantContext?: boolean;
    email?: string;
  }
) {
  await setSessionCookies(page, "institution");
  await mockInstitutionAuthApis(page, options);
}

export async function mockPlatformAuthApis(page: Page) {
  const fulfillRefresh = (route: { fulfill: (r: object) => Promise<void> }) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: { tokens: { accessToken: "mock-platform-token" } },
      }),
    });
  const fulfillMe = (route: { fulfill: (r: object) => Promise<void> }) =>
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
            sessionId: "session-admin",
          },
        },
      }),
    });

  await page.route("**/api/v1/auth/**/refresh", fulfillRefresh);
  await page.route("**/api/v1/auth/refresh", fulfillRefresh);
  await page.route("**/api/v1/auth/**/me", fulfillMe);
  await page.route("**/api/v1/auth/me", fulfillMe);
}

export async function mockPlatformSession(page: Page) {
  await setSessionCookies(page, "platform");
  await mockPlatformAuthApis(page);
}

export async function mockWorkspaces(page: Page) {
  const fulfill = (route: { fulfill: (r: object) => Promise<void> }) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_ORGANIZATIONS),
    });
  await page.route("**/api/v1/auth/**/workspaces", fulfill);
  await page.route("**/api/v1/auth/workspaces", fulfill);
}

export async function mockSelectContext(page: Page) {
  const fulfill = (route: { fulfill: (r: object) => Promise<void> }) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          tokens: { accessToken: "mock-access-token-with-context" },
          context: MOCK_TENANT_CONTEXT,
        },
      }),
    });
  await page.route("**/api/v1/auth/**/select-context", fulfill);
  await page.route("**/api/v1/auth/select-context", fulfill);
}

export async function mockInstitutionLogin(page: Page, email = "accountant@demo.edu") {
  const fulfill = (route: { fulfill: (r: object) => Promise<void> }) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          user: {
            id: "user-1",
            firstName: "Priya",
            lastName: "Iyer",
            email,
            userType: "institution",
            roleName: "Institution User",
            permissions: [],
            sessionId: "session-1",
          },
          tokens: { accessToken: "mock-access-token" },
        },
      }),
    });
  await page.route("**/api/v1/auth/**/login", fulfill);
  await page.route("**/api/v1/auth/login", fulfill);
}

export async function waitForOrganizations(page: Page) {
  await expect(page.getByText("EduTrust Foundation")).toBeVisible();
}

export async function performInstitutionLogin(
  page: Page,
  email = "accountant@demo.edu",
  password = "Accountant@12345"
) {
  await mockInstitutionLogin(page, email);
  await page.goto("/login");
  await page.locator('input[placeholder="you@institution.edu"]').fill(email);
  await page.locator('input[placeholder="Enter your password"]').fill(password);
  await Promise.all([
    page.waitForResponse((res) => res.url().includes("/auth/login") && res.ok()),
    page.getByRole("button", { name: "Sign In" }).click(),
  ]);
  await setSessionCookies(page, "institution");
  await mockInstitutionAuthApis(page, { email });
  await page.waitForURL(/\/app\/select-organization/);
}

export async function fillSignupInstitutionStep(page: Page) {
  await page.getByLabel("Organization name").fill("ABC Education");
  await page.getByLabel("Institution name").fill("Greenwood High");
  await page.getByLabel("Institution code").fill("GHS-001");
  await page.getByRole("button", { name: "Continue" }).click();
}

export async function fillSignupOwnerStep(page: Page, email = "owner@school.edu") {
  await page.getByLabel("First name").fill("Jane");
  await page.getByLabel("Last name").fill("Doe");
  await page.getByLabel("Email").fill(email);
  await page.getByRole("textbox", { name: /^Password/ }).fill("SecurePass1!");
  await page.getByRole("textbox", { name: /^Confirm password/ }).fill("SecurePass1!");
}

export function passwordField(page: Page) {
  return page.getByRole("textbox", { name: /^Password/ });
}

export const MOCK_SIGNUP_REQUEST = {
  id: "req-1",
  status: "pending",
  organizationName: "ABC Education",
  institutionName: "Greenwood High",
  institutionCode: "GHS-001",
  city: "Mumbai",
  state: "Maharashtra",
  firstName: "Jane",
  lastName: "Doe",
  email: "owner@school.edu",
  phone: "+919876543210",
  emailVerified: true,
  rejectionReason: null,
  submittedAt: "2026-08-18T10:00:00.000Z",
};

export const MOCK_SIGNUP_REQUEST_UNVERIFIED = {
  ...MOCK_SIGNUP_REQUEST,
  id: "req-2",
  email: "unverified@school.edu",
  emailVerified: false,
};

export async function mockSignupRequestsList(
  page: Page,
  requests: typeof MOCK_SIGNUP_REQUEST[] = [MOCK_SIGNUP_REQUEST]
) {
  await page.route("**/api/v1/platform/signup-requests?status=pending", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, data: { requests } }),
    })
  );
}

export async function mockLoginError(
  page: Page,
  code: string,
  message: string,
  status = 403
) {
  await page.route("**/api/v1/auth/login", (route) =>
    route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify({
        success: false,
        error: { code, message },
      }),
    })
  );
}

export function toastContainer(page: Page) {
  return page.locator(".fixed.top-4.right-4");
}
