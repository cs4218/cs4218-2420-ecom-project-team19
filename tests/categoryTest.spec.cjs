import { test, expect } from '@playwright/test';

test.describe("Given Create Category", () => {
    test.beforeEach( async ({ page }) => {
        await page.goto('http://localhost:3000/');
        await page.getByRole('link', { name: 'Login' }).click();
        await page.getByPlaceholder('Enter Your Email').fill('test@admin.com');
        await page.getByPlaceholder('Enter Your Password').fill('test@admin.com');
        await page.getByRole('button', { name: 'LOGIN' }).click();
        await page.waitForURL('http://localhost:3000/');

        await page.getByRole('button', { name: 'Test' }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await page.waitForURL('http://localhost:3000/dashboard/admin');

        await page.getByRole('link', { name: 'Create Category' }).click();
    });

    test.afterEach( async ({ page }) => {
        await page.getByRole('button', { name: 'Test' }).click();
        await page.getByRole('link', { name: 'Logout' }).click();
    });

    test('should allow me to add new category', async ({ page }) => {
        await page.getByPlaceholder('Enter new category').fill('New Category');
        await page.getByRole('button', { name: 'Submit' }).click();
        await expect(page.getByRole('cell', { name: 'New Category' })).toBeVisible();
    });

    test('should allow me to add new category with numbers and symbols', async ({ page }) => {
        await page.getByPlaceholder('Enter new category').fill('123$%');
        await page.getByRole('button', { name: 'Submit' }).click();
        await expect(page.getByRole('cell', { name: '123$%' })).toBeVisible();
    });

    test('should not allow me to add duplicate categories', async ({ page }) => {
        await page.getByPlaceholder('Enter new category').fill('Same Category');
        await page.getByRole('button', { name: 'Submit' }).click();

        await page.getByPlaceholder('Enter new category').fill('Same Category');
        await page.getByRole('button', { name: 'Submit' }).click();

        const table = page.locator('table');
        await expect(table.locator('text=Same Category')).toHaveCount(1);
    });

    /*
    test('should not allow me to add empty categories', async ({ page }) => {
        await page.getByPlaceholder('Enter new category').fill('');
        await page.getByRole('button', { name: 'Submit' }).click();

        const table = page.locator('table');
        expect(table.locator('text=""')).toHaveCount(0);
    });
    */
});

test.describe("Given Edit Category", () => {
    test.beforeEach( async ({ page }) => {
        await page.goto('http://localhost:3000/');
        await page.getByRole('link', { name: 'Login' }).click();
        await page.getByPlaceholder('Enter Your Email').fill('test@admin.com');
        await page.getByPlaceholder('Enter Your Password').fill('test@admin.com');
        await page.getByRole('button', { name: 'LOGIN' }).click();
        await page.waitForURL('http://localhost:3000/');

        await page.getByRole('button', { name: 'Test' }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await page.waitForURL('http://localhost:3000/dashboard/admin');

        await page.getByRole('link', { name: 'Create Category' }).click();
    });

    test.afterEach( async ({ page }) => {
        await page.getByRole('button', { name: 'Test' }).click();
        await page.getByRole('link', { name: 'Logout' }).click();
    });

    test('should allow me to edit category', async ({ page }) => {
        await page.getByRole('row', { name: 'Book Edit Delete' }).getByRole('button').first().click();

        const dialog = page.getByRole('dialog');
        await dialog.getByRole('textbox', { name: 'Enter new category' }).fill('Pen');
        await dialog.getByRole('button', { name: 'Submit' }).click();

        await expect(page.getByRole('cell', { name: 'Pen' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Book' })).not.toBeVisible();
    });

    test('should allow me to cancel edit', async ({ page }) => {
        await page.getByRole('row', { name: 'Electronics Edit Delete' }).getByRole('button').first().click();

        const dialog = page.getByRole('dialog');
        await dialog.getByRole('textbox', { name: 'Enter new category' }).fill('Food');
        await page.getByRole('button', { name: 'Close' }).click();

        await expect(page.getByRole('cell', { name: 'Electronics' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Food' })).not.toBeVisible();
    });

    test('should not allow me to update to a duplicated name', async ({ page }) => {
        await expect(page.getByRole("cell", {name: 'Clothing'} )).toBeVisible();
        await page.getByRole('row', { name: 'Electronics Edit Delete' }).getByRole('button').first().click();

        const dialog = page.getByRole('dialog');
        await dialog.getByRole('textbox', { name: 'Enter new category' }).fill('Clothing');
        await page.getByRole('button', { name: 'Close' }).click();
        
        const table = page.locator("table");
        await expect(table.locator('text=Clothing')).toHaveCount(1);
    });
});

test.describe("Given Delete Category", () => {
    test.beforeEach( async ({ page }) => {
        await page.goto('http://localhost:3000/');
        await page.getByRole('link', { name: 'Login' }).click();
        await page.getByPlaceholder('Enter Your Email').fill('test@admin.com');
        await page.getByPlaceholder('Enter Your Password').fill('test@admin.com');
        await page.getByRole('button', { name: 'LOGIN' }).click();
        await page.waitForURL('http://localhost:3000/');

        await page.getByRole('button', { name: 'Test' }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await page.waitForURL('http://localhost:3000/dashboard/admin');

        await page.getByRole('link', { name: 'Create Category' }).click();
    });

    test.afterEach( async ({ page }) => {
        await page.getByRole('button', { name: 'Test' }).click();
        await page.getByRole('link', { name: 'Logout' }).click();
    });

    test('should allow me to delete category', async ({ page }) => {
        await page.getByPlaceholder('Enter new category').fill('To delete');
        await page.getByRole('button', { name: 'Submit' }).click();
        await expect(page.getByRole('cell', { name: 'To delete' })).toBeVisible();
    
        await page.getByRole('row', { name: 'To delete Edit Delete' }).getByRole('button').nth(1).click();

        const table = page.locator('table');
        await expect(table.locator('text=To delete')).not.toBeVisible();
    });
});
