import { test, expect } from '@playwright/test';

const testUser = {
    name: 'userA',
    email: 'a@a.com',
    address: 'kent ridge',
    phone: '12341234',
}

const testUser2 = {
    name: 'Admin',
    email: 'admin@email.com',
    password: 'admin',
    address: 'kent ridge',
    phone: '12341234',
}

test.describe("Given Profile and valid changes", () => {
    test.beforeEach( async ({ page }) => {
        // register new acc
        await page.goto('http://localhost:3000/');
        await page.getByRole('link', { name: 'Register' }).click();
        await page.getByPlaceholder('Enter Your Name').fill('userAA');
        await page.getByPlaceholder('Enter Your Email').fill('aa@a.com');
        await page.getByPlaceholder('Enter Your Password').fill('aa@a.com');
        await page.getByPlaceholder('Enter Your Phone').fill('12341234');
        await page.getByPlaceholder('Enter Your Address').fill('kent ridge');
        await page.getByPlaceholder('Enter Your DOB').fill('2025-03-01');
        await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).fill('badminton');
        await page.getByRole('button', { name: 'REGISTER' }).click();

        // login
        await page.getByRole('link', { name: 'Login' }).click();
        await page.getByPlaceholder('Enter Your Email').fill('aa@a.com');
        await page.getByPlaceholder('Enter Your Password').fill('aa@a.com');
        await page.getByRole('button', { name: 'LOGIN' }).click();
        await page.waitForURL('http://localhost:3000/');

        await page.getByRole('button', { name: 'USERAA' }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await page.waitForURL('http://localhost:3000/dashboard/user');
    });

    test('show allow me to change profile details', async ({ page }) => {
        // Check initial user details and profile values
        await expect(page.getByRole('heading', { name: 'userAA' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'aa@a.com' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'kent ridge' })).toBeVisible();

        await page.getByRole('link', { name: 'Profile' }).click();

        await expect(page.getByRole('textbox', { name: 'Enter Your Name' })).toHaveValue('userAA');
        await expect(page.getByRole('textbox', { name: 'Enter Your Email' })).toHaveValue('aa@a.com');
        await expect(page.getByRole('textbox', { name: 'Enter Your Phone' })).toHaveValue('12341234');
        await expect(page.getByRole('textbox', { name: 'Enter Your Address' })).toHaveValue('kent ridge');

        // Change profile
        await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('userB');
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('b@b.com');
        await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill('45674567');
        await page.getByRole('textbox', { name: 'Enter Your Address' }).fill('KENT');
        await page.getByRole('button', { name: 'UPDATE' }).click();

        // check profile tab
        await expect(page.getByRole('textbox', { name: 'Enter Your Name' })).toHaveValue('userB');
        await expect(page.getByRole('textbox', { name: 'Enter Your Email' })).toHaveValue('aa@a.com');
        await expect(page.getByRole('textbox', { name: 'Enter Your Phone' })).toHaveValue('45674567');
        await expect(page.getByRole('textbox', { name: 'Enter Your Address' })).toHaveValue('KENT');

        // check dashboard
        await page.getByRole('button', { name: 'USERB' }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await expect(page.getByRole('heading', { name: 'userB' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'aa@a.com' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'KENT' })).toBeVisible();

        //log out and login to confirm
        await page.getByRole('button', { name: 'USERB' }).click();
        await page.getByRole('link', { name: 'Logout' }).click();
        
        await page.goto('http://localhost:3000/');
        await page.getByRole('link', { name: 'Login' }).click();
        await page.getByPlaceholder('Enter Your Email').fill('aa@a.com');
        await page.getByPlaceholder('Enter Your Password').fill('b@b.com');
        await page.getByRole('button', { name: 'LOGIN' }).click();
        await page.waitForURL('http://localhost:3000/');

        await expect(page.getByRole('button', { name: 'USERB' })).toBeVisible();

        // logout
        await page.getByRole('button', { name: 'USERB' }).click();
        await page.getByRole('link', { name: 'Logout' }).click();
    });
});

test.describe("Given Profile and invalid changes", () => {
    test.beforeEach( async ({ page }) => {
        // register new acc
        await page.goto('http://localhost:3000/');
        await page.getByRole('link', { name: 'Register' }).click();
        await page.getByPlaceholder('Enter Your Name').fill('test');
        await page.getByPlaceholder('Enter Your Email').fill('z@z.com');
        await page.getByPlaceholder('Enter Your Password').fill('z@z.com');
        await page.getByPlaceholder('Enter Your Phone').fill('12341234');
        await page.getByPlaceholder('Enter Your Address').fill('kent ridge');
        await page.getByPlaceholder('Enter Your DOB').fill('2025-03-01');
        await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).fill('badminton');
        await page.getByRole('button', { name: 'REGISTER' }).click();

        // login
        await page.getByRole('link', { name: 'Login' }).click();
        await page.getByPlaceholder('Enter Your Email').fill('z@z.com');
        await page.getByPlaceholder('Enter Your Password').fill('z@z.com');
        await page.getByRole('button', { name: 'LOGIN' }).click();
        await page.waitForURL('http://localhost:3000/');

        await page.getByRole('button', { name: 'TEST' }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await page.waitForURL('http://localhost:3000/dashboard/user');
    });

    test.afterEach( async ({ page }) => {
        await page.getByRole('button', { name: 'TEST' }).click();
        await page.getByRole('link', { name: 'Logout' }).click();
    });

    test('should not allow me to update to empty fields', async ({ page }) => {
        await page.getByRole('link', { name: 'Profile' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('');
        await page.getByRole('button', { name: 'UPDATE' }).click();

        // check profile tab
        await expect(page.getByRole('textbox', { name: 'Enter Your Name' })).toHaveValue('test');
    });
});