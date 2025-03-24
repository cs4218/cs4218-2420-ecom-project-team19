const { test, expect } = require('@playwright/test');
const { before } = require('node:test');

const base_url = 'http://127.0.0.1:3000';

let user_details = {
  name: 'test@gmail.com',
  email: 'test@gmail.com',
  password: 'test@gmail.com',
  answer: 'test@gmail.com'
};

test.describe('Forgot Password', () => {
  test.afterEach(async ({ page }) => {
    await page.goto(base_url + '/forgot-password');
    await page.fill('input[id="exampleInputEmail1"]', user_details.email);
    await page.fill('input[id="exampleInputAnswer1"]', user_details.answer);
    await page.fill('input[id="exampleInputNewPassword1"]', user_details.password);
    await page.click('button[type="submit"]:has-text("RESET PASSWORD")');
  });

  test('should be able to go to forgot password page', async ({ page }) => {
    await page.goto(base_url + '/login');
    await page.locator('button:has-text("Forgot Password")').click();
    await page.waitForURL('**/forgot-password');
    expect(page.url()).toBe(base_url + '/forgot-password');
  });

  test('should have correct placeholders and buttons', async ({ page }) => {
    await page.goto(base_url + '/forgot-password');
    expect(await page.getAttribute('input[id="exampleInputEmail1"]', 'placeholder')).toBe('Enter Your Email');
    expect(await page.getAttribute('input[id="exampleInputAnswer1"]', 'placeholder')).toBe('Enter Your Answer');
    expect(await page.getAttribute('input[id="exampleInputNewPassword1"]', 'placeholder')).toBe('Enter Your New Password');
    await expect(page.getByRole('button', { name: 'RESET PASSWORD' })).toBeVisible();
  });

  test('should not submit when email is missing', async ({ page }) => {
    await page.goto(base_url + '/forgot-password');
    await page.click('button[type="submit"]:has-text("RESET PASSWORD")');
    expect(await page.url()).toBe(base_url + '/forgot-password');
  });

  test('should not submit when email is invalid', async ({ page }) => {
    await page.goto(base_url + '/forgot-password');
    await page.fill('input[id="exampleInputEmail1"]', 'invalidemail');
    await page.click('button[type="submit"]:has-text("RESET PASSWORD")');
    expect(await page.url()).toBe(base_url + '/forgot-password');
  });

  test('should not submit when email is not registered', async ({ page }) => {
    await page.goto(base_url + '/forgot-password');
    await page.fill('input[id="exampleInputEmail1"]', 'invalidemail@test.com');
    await page.fill('input[id="exampleInputAnswer1"]', user_details.answer);
    await page.fill('input[id="exampleInputNewPassword1"]', user_details.password);
    await page.click('button[type="submit"]:has-text("RESET PASSWORD")');
    // await page.waitForSelector('text="Something went wrong"');
    // const toast = await page.getByText('Something went wrong');
    // expect(toast).toBeVisible;
    expect(await page.url()).toBe(base_url + '/forgot-password');
  });

  test('should not submit when answer is missing', async ({ page }) => {
    await page.goto(base_url + '/forgot-password');
    await page.fill('input[id="exampleInputEmail1"]', user_details.email);
    await page.fill('input[id="exampleInputNewPassword1"]', user_details.password);
    await page.click('button[type="submit"]:has-text("RESET PASSWORD")');
    expect(await page.url()).toBe(base_url + '/forgot-password');
  });

  test('should not submit when new password is missing', async ({ page }) => {
    await page.goto(base_url + '/forgot-password');
    await page.fill('input[id="exampleInputEmail1"]', user_details.email);
    await page.fill('input[id="exampleInputAnswer1"]', user_details.answer);
    await page.click('button[type="submit"]:has-text("RESET PASSWORD")');
    expect(await page.url()).toBe(base_url + '/forgot-password');
  });

  test('should successfully reset password with valid inputs', async ({ page }) => {
    await page.goto(base_url + '/forgot-password');
    await page.fill('input[id="exampleInputEmail1"]', user_details.email);
    await page.fill('input[id="exampleInputAnswer1"]', user_details.answer);
    await page.fill('input[id="exampleInputNewPassword1"]', 'newpassword');
    await page.click('button[type="submit"]:has-text("RESET PASSWORD")');
    // await page.waitForSelector('text="Password reset successfully, please login."');
    // expect(await page.getByText('Password reset successfully, please login.')).toBeVisible();

    // Login with new password
    await page.locator('a:has-text("Login")').click();
    await page.fill('input[id="exampleInputEmail1"]', user_details.email);
    await page.fill('input[id="exampleInputPassword1"]', 'newpassword');
    await page.click('button[type="submit"]:has-text("Login")');
    await page.waitForURL(base_url);
    expect(page.url()).toBe(base_url + '/');
    await page.waitForSelector('a:has-text("' + user_details.name + '")', { state: 'visible' });
    expect(page.locator('a:has-text("' + user_details.name + '")')).toBeVisible();
  });
});