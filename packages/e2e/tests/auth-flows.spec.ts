import { test, expect, runE2E, uniqueEmail } from "./helpers/auth-fixture";
import { e2eFrontendBaseUrl } from "./helpers/e2e-urls";

test.describe("auth flows", () => {
  test.skip(!runE2E, "Set RUN_E2E=1 to run browser smoke tests.");

  test("signs in an admin user and reaches settings", async ({
    authSeed,
    page,
  }) => {
    const admin = await authSeed.createCredentialUser({
      email: uniqueEmail("admin-login"),
      password: "AdminPass123!",
      name: "Platform Admin",
      role: "admin",
      organization: {
        name: "Admin Org",
      },
    });

    await page.goto("/sign-in?next=%2Fsettings");
    await page.getByLabel("Email").fill(admin.email);
    await page.getByLabel("Password").fill(admin.password);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();

    await expect(page).toHaveURL(`${e2eFrontendBaseUrl}/settings`);
    await expect(page.getByLabel("Name", { exact: true })).toBeVisible();

    const lookedUp = await authSeed.lookupUser({ email: admin.email });
    expect(lookedUp.role).toBe("admin");
    expect(lookedUp.emailVerified).toBe(true);
  });

  test("signs up, verifies email, then signs in", async ({
    authSeed,
    page,
  }) => {
    const email = uniqueEmail("signup-flow");
    const password = "SignUpPass123!";

    await page.goto("/signup?next=%2Fonboarding%2Forganization");
    await page.getByLabel("Name").fill("Signup Flow User");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign up", exact: true }).click();

    await expect(page).toHaveURL(/\/sign-in\?.*verification=required/);

    const verification = await authSeed.getEmailToken({
      email,
      type: "verification",
    });
    const user = await authSeed.lookupUser({ email });
    expect(user.emailVerified).toBe(false);

    await page.goto(
      `/verify-email?token=${encodeURIComponent(verification.token)}&callbackURL=${encodeURIComponent(`${e2eFrontendBaseUrl}/onboarding/organization`)}`
    );

    await expect(page).toHaveURL(/\/onboarding\/organization/);
    await expect(page.getByText("Create an organization")).toBeVisible();
  });

  test("completes forgot password and signs in with the new password", async ({
    authSeed,
    page,
  }) => {
    const seededUser = await authSeed.createCredentialUser({
      email: uniqueEmail("forgot-password"),
      password: "OldPass123!",
      name: "Forgot Password User",
      organization: {
        name: "Forgot Password Org",
      },
    });
    const newPassword = "NewPass123!";

    await page.goto("/sign-in");
    await page.getByLabel("Email").fill(seededUser.email);
    await page.getByRole("button", { name: "Forgot your password?" }).click();
    await expect(
      page.getByText(
        "Enter your account email and we'll send you a password reset link."
      )
    ).toBeVisible();
    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(
      page.getByText(
        "If an account exists for that email, a reset link has been sent."
      )
    ).toBeVisible();

    const reset = await authSeed.getEmailToken({
      email: seededUser.email,
      type: "reset-password",
    });

    await page.goto(`/reset-password?token=${encodeURIComponent(reset.token)}`);
    await page
      .getByRole("textbox", { name: "New password", exact: true })
      .fill(newPassword);
    await page
      .getByRole("textbox", { name: "Confirm new password", exact: true })
      .fill(newPassword);
    await page.getByRole("button", { name: "Update password" }).click();

    await expect(page).toHaveURL(/\/sign-in\?passwordReset=success/);

    await page.goto("/sign-in?next=%2Fsettings");
    await page.getByLabel("Email").fill(seededUser.email);
    await page.getByLabel("Password").fill(newPassword);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();

    await expect(page).toHaveURL(`${e2eFrontendBaseUrl}/settings`);
    await expect(page.getByLabel("Name", { exact: true })).toBeVisible();
  });
});
