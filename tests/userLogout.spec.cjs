const { test, expect } = require('@playwright/test');
const { before } = require('node:test');

const base_url = 'http://127.0.0.1:3000';
const date_now = Date.now();

let user_details = {
  name: 'test@gmail.com',
  email: 'test@gmail.com',
  password: 'test@gmail.com'
};

test.describe('User Logout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(base_url + '/login');
    await page.fill('input[id="exampleInputEmail1"]', user_details.email);
    await page.fill('input[id="exampleInputPassword1"]', user_details.password);
    await page.click('button[type="submit"]:has-text("LOGIN")');
    await page.waitForURL(base_url);
  });

  test('should only "profile" and "orders" links in Dashboard when logged in as User', async ({ page }) => {
    await page.goto(base_url);
    await page.getByRole('button', { name: user_details.name }).click();
    await page.locator('a:has-text("Dashboard")').click();
    await page.waitForURL(base_url + '/dashboard/user');
    await page.waitForSelector('a:has-text("Profile")', { state: 'visible' });
    expect(await page.locator('a:has-text("Profile")')).toBeVisible();
    expect(await page.locator('a:has-text("Orders")')).toBeVisible();

    expect(await page.locator('a:has-text("Products")')).not.toBeVisible();
    expect(await page.locator('a:has-text("Create Category")')).not.toBeVisible();
    expect(await page.locator('a:has-text("Create Product")')).not.toBeVisible();
  });

  test('should be able to logout', async ({ page }) => {
    await page.goto(base_url);
    await page.getByRole('button', { name: user_details.name }).click();
    await page.locator('a:has-text("Logout")').click();
    await page.waitForURL('**/login');
    expect(page.url()).toBe(base_url + '/login');
    await page.goto(base_url);
    await page.waitForSelector('a:has-text("Login")', { state: 'visible' });
    expect(await page.locator('a:has-text("Login")')).toBeVisible();
    // expect there to be no element with user_details.name in link
    expect(await page.locator('a:has-text("' + user_details.name + '")')).not.toBeVisible();
  });
});
