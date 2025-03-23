import { test, expect } from '@playwright/test';

/* The following tests assume that there are no existing users with the emails used in the test */

const testUser = {
    name: 'userZ',
    email: 'z@z.com',
    password: 'z@z.com',
    address: 'kent ridge',
    phone: '12341234',
    dob: '2025-03-01',
    sports: 'badminton',
}

const newTestUser = {
    name: 'userII',
    email: 'z@z.com',
    password: 'i@i.com',
    address: 'KENT',
    phone: '45674567',
    dob: '2025-03-01',
    sports: 'badminton',
}

const testUser2 = {
    name: 'userO',
    email: 'o@o.com',
    password: 'o@o.com',
    address: 'kr',
    phone: '12345678',
    dob: '2025-03-03',
    sports: 'swimming',
}

test.describe("Given Profile and valid changes", () => {
    test.beforeEach( async ({ page }) => {
        // register new acc
        await page.goto('http://localhost:3000/');
        await page.getByRole('link', { name: 'Register' }).click();
        await page.getByPlaceholder('Enter Your Name').fill(testUser.name);
        await page.getByPlaceholder('Enter Your Email').fill(testUser.email);
        await page.getByPlaceholder('Enter Your Password').fill(testUser.password);
        await page.getByPlaceholder('Enter Your Phone').fill(testUser.phone);
        await page.getByPlaceholder('Enter Your Address').fill(testUser.address);
        await page.getByPlaceholder('Enter Your DOB').fill(testUser.dob);
        await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).fill(testUser.sports);
        await page.getByRole('button', { name: 'REGISTER' }).click();
        await page.waitForTimeout(300); // wait

        // login
        await page.getByRole('link', { name: 'Login' }).click();
        await page.getByPlaceholder('Enter Your Email').fill(testUser.email);
        await page.getByPlaceholder('Enter Your Password').fill(testUser.password);
        await page.getByRole('button', { name: 'LOGIN' }).click();
        await page.waitForTimeout(300); // wait

        await page.getByRole('button', { name: testUser.name }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await page.waitForURL('http://localhost:3000/dashboard/user');
    });

    test('show allow me to change profile details', async ({ page }) => {
        // Check initial user details and profile values
        await expect(page.getByRole('heading', { name: testUser.name })).toBeVisible();
        await expect(page.getByRole('heading', { name: testUser.email })).toBeVisible();
        await expect(page.getByRole('heading', { name: testUser.address })).toBeVisible();

        await page.getByRole('link', { name: 'Profile' }).click();

        await expect(page.getByRole('textbox', { name: 'Enter Your Name' })).toHaveValue(testUser.name);
        await expect(page.getByRole('textbox', { name: 'Enter Your Email' })).toHaveValue(testUser.email);
        await expect(page.getByRole('textbox', { name: 'Enter Your Phone' })).toHaveValue(testUser.phone);
        await expect(page.getByRole('textbox', { name: 'Enter Your Address' })).toHaveValue(testUser.address);

        // Change profile
        await page.getByRole('textbox', { name: 'Enter Your Name' }).fill(newTestUser.name);
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(newTestUser.password);
        await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill(newTestUser.phone);
        await page.getByRole('textbox', { name: 'Enter Your Address' }).fill(newTestUser.address);
        await page.getByRole('button', { name: 'UPDATE' }).click();
        await page.waitForTimeout(300); // wait to update

        // check profile tab
        await expect(page.getByRole('textbox', { name: 'Enter Your Name' })).toHaveValue(newTestUser.name);
        await expect(page.getByRole('textbox', { name: 'Enter Your Email' })).toHaveValue(newTestUser.email);
        await expect(page.getByRole('textbox', { name: 'Enter Your Phone' })).toHaveValue(newTestUser.phone);
        await expect(page.getByRole('textbox', { name: 'Enter Your Address' })).toHaveValue(newTestUser.address);

        // check dashboard
        await page.getByRole('button', { name: newTestUser.name }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await expect(page.getByRole('heading', { name: newTestUser.name })).toBeVisible();
        await expect(page.getByRole('heading', { name: newTestUser.email })).toBeVisible();
        await expect(page.getByRole('heading', { name: newTestUser.address })).toBeVisible();

        //log out and login to confirm
        await page.getByRole('button', { name: newTestUser.name }).click();
        await page.getByRole('link', { name: 'Logout' }).click();
        await page.waitForTimeout(300); // wait\

        await page.getByRole('link', { name: 'Login' }).click();
        await page.getByPlaceholder('Enter Your Email').fill(newTestUser.email);
        await page.getByPlaceholder('Enter Your Password').fill(newTestUser.password);
        await page.getByRole('button', { name: 'LOGIN' }).click();
        await page.waitForTimeout(300); // wait

        await expect(page.getByRole('button', { name: newTestUser.name })).toBeVisible();

        // restore and logout
        await page.getByRole('button', { name: newTestUser.name }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await page.getByRole('link', { name: 'Profile' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Name' }).fill(testUser.name);
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(testUser.password);
        await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill(testUser.phone);
        await page.getByRole('textbox', { name: 'Enter Your Address' }).fill(testUser.address);
        await page.getByRole('button', { name: 'UPDATE' }).click();
        await page.waitForTimeout(300); // wait

        await page.getByRole('button', { name: testUser.name }).click();
        await page.getByRole('link', { name: 'Logout' }).click();
    });
});

test.describe("Given Profile and invalid changes", () => {
    test.beforeEach( async ({ page }) => {
        // register new acc
        await page.goto('http://localhost:3000/');
        await page.getByRole('link', { name: 'Register' }).click();
        await page.getByPlaceholder('Enter Your Name').fill(testUser2.name);
        await page.getByPlaceholder('Enter Your Email').fill(testUser2.email);
        await page.getByPlaceholder('Enter Your Password').fill(testUser2.password);
        await page.getByPlaceholder('Enter Your Phone').fill(testUser2.phone);
        await page.getByPlaceholder('Enter Your Address').fill(testUser2.address);
        await page.getByPlaceholder('Enter Your DOB').fill(testUser2.dob);
        await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).fill(testUser2.sports);
        await page.getByRole('button', { name: 'REGISTER' }).click();
        await page.waitForTimeout(300); // wait

        // login
        await page.getByRole('link', { name: 'Login' }).click();
        await page.getByPlaceholder('Enter Your Email').fill(testUser2.email);
        await page.getByPlaceholder('Enter Your Password').fill(testUser2.password);
        await page.getByRole('button', { name: 'LOGIN' }).click();
        await page.waitForTimeout(300); // wait

        await page.getByRole('button', { name: testUser2.name }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await page.waitForURL('http://localhost:3000/dashboard/user');
    });

    test.afterEach( async ({ page }) => {
        await page.getByRole('button', { name: testUser2.name }).click();
        await page.getByRole('link', { name: 'Logout' }).click();
    });

    test('should not allow me to update to empty fields', async ({ page }) => {
        await page.getByRole('link', { name: 'Profile' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('');
        await page.getByRole('button', { name: 'UPDATE' }).click();
        await page.waitForTimeout(300); // wait

        // check profile tab
        await expect(page.getByRole('textbox', { name: 'Enter Your Name' })).toHaveValue(testUser2.name);
    });
});