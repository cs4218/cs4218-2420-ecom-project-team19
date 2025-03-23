const { test, expect } = require('@playwright/test');
const { before } = require('node:test');

const base_url = 'http://127.0.0.1:3000';
const date_now = Date.now();

let user_details = {
  name: 'test' + date_now,
  email: 'test' + date_now + '@example.com',
  password: 'password',
  phone: '1234567890',
  address: '123 Main St',
  dob: '2000-01-01',
  answer: 'Soccer'
};

test.describe('User Register', () => {
  test('should be able to go to register page', async ({ page }) => {
    await page.goto(base_url);
    await page.locator('a:has-text("Register")').click();
    await page.waitForURL('**/register');
    expect(page.url()).toBe(base_url + '/register');
  });

  test('should have correct placeholders and buttons', async ({ page }) => {
    await page.goto(base_url + '/register');
    expect(await page.getAttribute('input[id="exampleInputName1"]', 'placeholder')).toBe('Enter Your Name');
    expect(await page.getAttribute('input[id="exampleInputEmail1"]', 'placeholder')).toBe('Enter Your Email');
    expect(await page.getAttribute('input[id="exampleInputPassword1"]', 'placeholder')).toBe('Enter Your Password');
    expect(await page.getAttribute('input[id="exampleInputPhone1"]', 'placeholder')).toBe('Enter Your Phone');
    expect(await page.getAttribute('input[id="exampleInputAddress1"]', 'placeholder')).toBe('Enter Your Address');
    expect(await page.getAttribute('input[id="exampleInputAnswer1"]', 'placeholder')).toBe('What is Your Favorite Sports');
    await expect(page.getByRole('button', { name: 'REGISTER' })).toBeVisible();
  });

  test('should not submit when all fields are empty', async ({ page }) => {
    await page.goto(base_url + '/register');
    await page.click('button[type="submit"]:has-text("REGISTER")');
    expect(await page.url()).toBe(base_url + '/register');
  });

  test('should not submit when email is missing', async ({ page }) => {
    await page.goto(base_url + '/register');
    await page.fill('input[id="exampleInputName1"]', user_details.name);
    await page.click('button[type="submit"]:has-text("REGISTER")');
    expect(await page.url()).toBe(base_url + '/register');
  });

  test('should not submit when email is invalid', async ({ page }) => {
    await page.goto(base_url + '/register');
    await page.fill('input[id="exampleInputEmail1"]', 'invalidemail');
    await page.click('button[type="submit"]:has-text("REGISTER")');
    expect(await page.url()).toBe(base_url + '/register');
  });

  test('should not submit when password is missing', async ({ page }) => {
    await page.goto(base_url + '/register');
    await page.fill('input[id="exampleInputName1"]', user_details.name);
    await page.fill('input[id="exampleInputEmail1"]', user_details.email);
    await page.click('button[type="submit"]:has-text("REGISTER")');
    expect(await page.url()).toBe(base_url + '/register');
  });

  test('should not submit when phone is missing', async ({ page }) => {
    await page.goto(base_url + '/register');
    await page.fill('input[id="exampleInputName1"]', user_details.name);
    await page.fill('input[id="exampleInputEmail1"]', user_details.email);
    await page.fill('input[id="exampleInputPassword1"]', user_details.password);
    await page.click('button[type="submit"]:has-text("REGISTER")');
    expect(await page.url()).toBe(base_url + '/register');
  });

  test('should not submit when address is missing', async ({ page }) => {
    await page.goto(base_url + '/register');
    await page.fill('input[id="exampleInputName1"]', user_details.name);
    await page.fill('input[id="exampleInputEmail1"]', user_details.email);
    await page.fill('input[id="exampleInputPassword1"]', user_details.password);
    await page.fill('input[id="exampleInputPhone1"]', user_details.phone);
    await page.click('button[type="submit"]:has-text("REGISTER")');
    expect(await page.url()).toBe(base_url + '/register');
  });

  test('should not submit when date of birth is missing', async ({ page }) => {
    await page.goto(base_url + '/register');
    await page.fill('input[id="exampleInputName1"]', user_details.name);
    await page.fill('input[id="exampleInputEmail1"]', user_details.email);
    await page.fill('input[id="exampleInputPassword1"]', user_details.password);
    await page.fill('input[id="exampleInputPhone1"]', user_details.phone);
    await page.fill('input[id="exampleInputAddress1"]', user_details.address);
    await page.click('button[type="submit"]:has-text("REGISTER")');
    expect(await page.url()).toBe(base_url + '/register');
  });

  test('should not submit when answer is missing', async ({ page }) => {
    await page.goto(base_url + '/register');
    await page.fill('input[id="exampleInputName1"]', user_details.name);
    await page.fill('input[id="exampleInputEmail1"]', user_details.email);
    await page.fill('input[id="exampleInputPassword1"]', user_details.password);
    await page.fill('input[id="exampleInputPhone1"]', user_details.phone);
    await page.fill('input[id="exampleInputAddress1"]', user_details.address);
    await page.fill('input[id="exampleInputDOB1"]', user_details.dob);
    await page.click('button[type="submit"]:has-text("REGISTER")');
    expect(await page.url()).toBe(base_url + '/register');
  });

  test('should successfully register with valid inputs', async ({ page }) => {
    await page.goto(base_url + '/register');
    await page.fill('input[id="exampleInputName1"]', user_details.name);
    await page.fill('input[id="exampleInputEmail1"]', user_details.email);
    await page.fill('input[id="exampleInputPassword1"]', user_details.password);
    await page.fill('input[id="exampleInputPhone1"]', user_details.phone);
    await page.fill('input[id="exampleInputAddress1"]', user_details.address);
    await page.fill('input[id="exampleInputDOB1"]', user_details.dob);
    await page.fill('input[id="exampleInputAnswer1"]', user_details.answer);
    await page.click('button[type="submit"]:has-text("REGISTER")');
    await page.waitForSelector('text="Registered successfully, please login."');
    // const toast = await page.getByText('Registered successfully, please login.');
    // expect(toast).toBeVisible;
    // await page.waitForURL('**/login');
    expect(page.url()).toBe(base_url + '/login');
  });

  test('should not submit when email is already registered', async ({ page }) => {
    await page.goto(base_url + '/register');
    await page.fill('input[id="exampleInputName1"]', user_details.name);
    await page.fill('input[id="exampleInputEmail1"]', user_details.email);
    await page.fill('input[id="exampleInputPassword1"]', user_details.password);
    await page.fill('input[id="exampleInputPhone1"]', user_details.phone);
    await page.fill('input[id="exampleInputAddress1"]', user_details.address);
    await page.fill('input[id="exampleInputDOB1"]', user_details.dob);
    await page.fill('input[id="exampleInputAnswer1"]', user_details.answer);
    await page.click('button[type="submit"]:has-text("REGISTER")');
    // await page.waitForSelector('text="Something went wrong"');
    // const toast = await page.getByText('Something went wrong');
    // expect(toast).toBeVisible;
    expect(await page.url()).toBe(base_url + '/register');
  });
});
