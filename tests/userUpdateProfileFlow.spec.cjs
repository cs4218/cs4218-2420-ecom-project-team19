import { test, expect } from '@playwright/test';

/*
Database Setup:
User with email: user@tests.com, password: usertests
*/

test.use({ launchOptions: { slowMo: 500 } });

test.describe("UI - Update User Profile Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.getByText("LOGIN").click();
    await page.getByPlaceholder("Enter Your Email").fill("user@tests.com");
    await page.getByPlaceholder("Enter Your Password").fill("usertests");
    await page.getByRole("button", { name: "LOGIN" }).click();
    await page.waitForURL("http://localhost:3000/");
  });

  test.afterEach(async ({ page }) => {
    await page.getByRole('button', { name: 'user tests' }).click();
    await page.getByRole('link', { name: 'Logout' }).click();
  });

test('login -> check initial user details -> update user details -> check updated user details -> restore to initial user details', async ({ page }) => {
    // navigate to user profile page
    await page.getByRole('button', { name: 'user tests' }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await page.waitForURL("http://localhost:3000/dashboard/user");

    // check initial
    await expect(page.getByRole('main')).toContainText('user tests');
    await expect(page.getByRole('main')).toContainText('user@tests.com');
    await expect(page.getByRole('main')).toContainText('567 test test road');

    // edit profile
    await page.getByRole('link', { name: 'Profile' }).click();
    await expect(page.getByRole('main')).toContainText('UPDATE');
    
    // change name
    await page.getByRole('textbox', { name: 'Enter Your Name' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Name' }).press('ControlOrMeta+a');
    await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('test user');

    // change phone
    await page.getByRole('textbox', { name: 'Enter Your Phone' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Phone' }).press('ControlOrMeta+a');
    await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill('98765432');

    // change address
    await page.getByRole('textbox', { name: 'Enter Your Address' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Phone' }).press('ControlOrMeta+a');
    await page.getByRole('textbox', { name: 'Enter Your Address' }).fill('789 test road');

    // update profile
    await page.getByRole('button', { name: 'UPDATE' }).click();
    await page.locator('div').filter({ hasText: /^Profile Updated Successfully$/ }).nth(2).click();

    // check profile updated
    await expect(page.locator('#navbarTogglerDemo01')).toContainText('test user');
    await page.getByRole('button', { name: 'test user' }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await page.waitForURL("http://localhost:3000/dashboard/user");

    // check name
    await expect(page.getByRole('heading', { name: 'test user' })).toBeVisible();
    await expect(page.getByRole('main')).toContainText('test user');

    // check email
    await expect(page.getByRole('main')).toContainText('user@tests.com');

    // check address
    await expect(page.getByRole('main')).toContainText('789 test road');

    // restore to default
    await page.getByRole('link', { name: 'Profile' }).click();

    // change name
    await page.getByRole('textbox', { name: 'Enter Your Name' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Name' }).press('ControlOrMeta+a');
    await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('user tests');

    // change phone
    await page.getByRole('textbox', { name: 'Enter Your Phone' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Phone' }).press('ControlOrMeta+a');
    await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill('12345678');

    // change address
    await page.getByRole('textbox', { name: 'Enter Your Address' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Address' }).press('ControlOrMeta+a');
    await page.getByRole('textbox', { name: 'Enter Your Address' }).fill('567 test test road');

    // update
    await page.getByRole('button', { name: 'UPDATE' }).click();
    });
});
