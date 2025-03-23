const { test, expect } = require('@playwright/test');
const { before } = require('node:test');

const base_url = 'http://127.0.0.1:3000';

let admin_details = {
  email: 'admin@test.sg',
  password: 'admin@test.sg',
  name: 'admin@test.sg'
}

test.describe('Admin Login', () => {
  test('should be able to login as Admin', async ({ page }) => {
    await page.goto(base_url + '/login');
    await page.fill('input[id="exampleInputEmail1"]', admin_details.email);
    await page.fill('input[id="exampleInputPassword1"]', admin_details.password);
    await page.click('button[type="submit"]:has-text("LOGIN")');
    await page.waitForURL('**/');
    await page.getByRole('button', { name: admin_details.name }).click();
    await page.locator('a:has-text("Dashboard")').click();
    await expect(page.locator('a:has-text("Products")')).toBeVisible();
    await expect(page.locator('a:has-text("Create Category")')).toBeVisible();
    await expect(page.locator('a:has-text("Create Product")')).toBeVisible();
    await expect(page.locator('a:has-text("Orders")')).toBeVisible();
  });
});