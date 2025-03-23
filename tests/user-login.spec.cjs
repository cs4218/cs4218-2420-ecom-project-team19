const { test, expect } = require('@playwright/test');
const { before } = require('node:test');

const base_url = 'http://127.0.0.1:3000';
const date_now = Date.now();

let user_details = {
  name: 'test@gmail.com',
  email: 'test@gmail.com',
  password: 'test@gmail.com'
};

test.describe('User Login', () => {
  test('should be able to go to login page', async ({ page }) => {
    await page.goto(base_url);
    await page.locator('a:has-text("Login")').click();
    await page.waitForURL('**/login');
    expect(page.url()).toBe(base_url + '/login');
  });

  test('should have correct placeholders and buttons', async ({ page }) => {
    await page.goto(base_url + '/login');
    expect(await page.getAttribute('input[id="exampleInputEmail1"]', 'placeholder')).toBe('Enter Your Email');
    expect(await page.getAttribute('input[id="exampleInputPassword1"]', 'placeholder')).toBe('Enter Your Password');
    await expect(page.getByRole('button', { name: 'LOGIN' })).toBeVisible();
  });

  test('should not submit when email is missing', async ({ page }) => {
    await page.goto(base_url + '/login');
    await page.click('button[type="submit"]:has-text("LOGIN")');
    expect(await page.url()).toBe(base_url + '/login');
  });

  test('should not submit when email is invalid', async ({ page }) => {
    await page.goto(base_url + '/login');
    await page.fill('input[id="exampleInputEmail1"]', 'invalidemail');
    await page.click('button[type="submit"]:has-text("LOGIN")');
    expect(await page.url()).toBe(base_url + '/login');
  });

  test('should not submit when password is missing', async ({ page }) => {
    await page.goto(base_url + '/login');
    await page.fill('input[id="exampleInputEmail1"]', user_details.email);
    await page.click('button[type="submit"]:has-text("LOGIN")');
    expect(await page.url()).toBe(base_url + '/login');
  });

  test('should not submit when email is not registered', async ({ page }) => {
    await page.goto(base_url + '/login');
    await page.fill('input[id="exampleInputEmail1"]', 'invalidemail@example.com');
    await page.fill('input[id="exampleInputPassword1"]', user_details.password);
    await page.click('button[type="submit"]:has-text("LOGIN")');
    // await page.waitForSelector('text="Something went wrong"');
    // const toast = await page.getByText('Something went wrong');
    // expect(toast).toBeVisible;
    expect(await page.url()).toBe(base_url + '/login');
  });

  test('should not submit when password is incorrect', async ({ page }) => {
    await page.goto(base_url + '/login');
    await page.fill('input[id="exampleInputEmail1"]', user_details.email);
    await page.fill('input[id="exampleInputPassword1"]', 'invalidpassword');
    await page.click('button[type="submit"]:has-text("LOGIN")');
    // await page.waitForSelector('text="Something went wrong"');
    // const toast = await page.getByText('Something went wrong');
    // expect(toast).toBeVisible;
    expect(await page.url()).toBe(base_url + '/login');
  });

  test('should successfully login with valid inputs and logout', async ({ page }) => {
    await page.goto(base_url + '/login');
    await page.fill('input[id="exampleInputEmail1"]', user_details.email);
    await page.fill('input[id="exampleInputPassword1"]', user_details.password);
    await page.click('button[type="submit"]:has-text("LOGIN")');
    await page.waitForURL(base_url);
    expect(page.url()).toBe(base_url + '/');
    await page.waitForSelector('a:has-text("' + user_details.name + '")', { state: 'visible' });
    expect(page.locator('a:has-text("' + user_details.name + '")')).toBeVisible();
  });
});
