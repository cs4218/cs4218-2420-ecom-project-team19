import { test, expect } from '@playwright/test';

/* The following tests assume that there is an admin account in the database with the follwing credentials. */
const testAdmin = {
    name: 'Test',
    email: 'test@admin.com',
    password: 'test@admin.com',
};

test.describe("Given Category", () => {
    test.beforeEach( async ({ page }) => {
        await page.goto('http://localhost:3000/');
        await page.getByRole('link', { name: 'Login' }).click();
        await page.getByPlaceholder('Enter Your Email').fill(testAdmin.email);
        await page.getByPlaceholder('Enter Your Password').fill(testAdmin.password);
        await page.getByRole('button', { name: 'LOGIN' }).click();
        await page.waitForURL('http://localhost:3000/');

        await page.getByRole('button', { name: testAdmin.name }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await page.waitForURL('http://localhost:3000/dashboard/admin');

        await page.getByRole('link', { name: 'Create Category' }).click();
    });

    test.afterEach( async ({ page }) => {
        await page.getByRole('button', { name: testAdmin.name }).click();
        await page.getByRole('link', { name: 'Logout' }).click();
    });

    test('should allow me to add new category', async ({ page }) => {
        const categoryName = 'New Category';

        await page.getByPlaceholder('Enter new category').fill(categoryName);
        await page.getByRole('button', { name: 'Submit' }).click();
        await expect(page.getByRole('cell', { name: categoryName })).toBeVisible();

        //clean up by deleting newly added category
        await page.getByRole('row', { name: `${categoryName} Edit Delete` }).getByRole('button').nth(1).click();
        await page.waitForTimeout(500); // wait to delete
    });

    test('should allow me to add new category with numbers and symbols', async ({ page }) => {
        const categoryName = 'New 123$';

        await page.getByPlaceholder('Enter new category').fill(categoryName);
        await page.getByRole('button', { name: 'Submit' }).click();
        await expect(page.getByRole('cell', { name: categoryName })).toBeVisible();

        //clean up by deleting newly added category
        await page.getByRole('row', { name: `${categoryName} Edit Delete` }).getByRole('button').nth(1).click();
        await page.waitForTimeout(500); // wait to delete
    });

    test('should not allow me to add duplicate categories', async ({ page }) => {
        const catName = 'Same Category';

        await page.getByPlaceholder('Enter new category').fill(catName);
        await page.getByRole('button', { name: 'Submit' }).click();

        // try adding duplicate category
        await page.getByPlaceholder('Enter new category').fill(catName);
        await page.getByRole('button', { name: 'Submit' }).click();

        // there should only be 1 category with the name ${catName}
        const table = page.locator('table');
        await expect(table.locator(`text=${catName}`)).toHaveCount(1);

        // clean up
        await page.getByRole('row', { name: `${catName} Edit Delete` }).getByRole('button').nth(1).click();
        await page.waitForTimeout(500); // wait to delete
    });
});


test.describe("Given Edit Category", () => {
    test.beforeEach( async ({ page }) => {
        await page.goto('http://localhost:3000/');
        await page.getByRole('link', { name: 'Login' }).click();
        await page.getByPlaceholder('Enter Your Email').fill(testAdmin.email);
        await page.getByPlaceholder('Enter Your Password').fill(testAdmin.password);
        await page.getByRole('button', { name: 'LOGIN' }).click();
        await page.waitForURL('http://localhost:3000/');

        await page.getByRole('button', { name: testAdmin.name }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await page.waitForURL('http://localhost:3000/dashboard/admin');

        await page.getByRole('link', { name: 'Create Category' }).click();
    });

    test.afterEach( async ({ page }) => {
        await page.getByRole('button', { name: testAdmin.name }).click();
        await page.getByRole('link', { name: 'Logout' }).click();
    });

    test('should allow me to edit category', async ({ page }) => {
        const oldCat = 'Old';
        const newCat = 'Pen';

        // add category to set up tests
        await page.getByPlaceholder('Enter new category').fill(oldCat);
        await page.getByRole('button', { name: 'Submit' }).click();
        await expect(page.getByRole("cell", {name: oldCat} )).toBeVisible();

        // edit cat
        await page.getByRole('row', { name: `${oldCat} Edit Delete` }).getByRole('button').first().click();

        const dialog = page.getByRole('dialog');
        await dialog.getByRole('textbox', { name: 'Enter new category' }).fill(newCat);
        await dialog.getByRole('button', { name: 'Submit' }).click();

        // check
        await expect(page.getByRole('cell', { name: newCat })).toBeVisible();
        const table = page.locator('table');
        await expect(table.locator(`text=${oldCat}`)).toHaveCount(0);

        // clean up be restoring to previous state
        await page.getByRole('row', { name: `${newCat} Edit Delete`, exact: true}).getByRole('button').nth(1).click();
        await page.waitForTimeout(500); // wait to delete
    });

    test('should allow me to cancel edit', async ({ page }) => {
        const catToBeEdited = 'to edit';
        const newCat = 'Food';

        // add new category to set up test
        await page.getByPlaceholder('Enter new category').fill(catToBeEdited);
        await page.getByRole('button', { name: 'Submit' }).click();
        await expect(page.getByRole("cell", {name: catToBeEdited} )).toBeVisible();

        // start edit and then cancel
        await page.getByRole('row', { name: `${catToBeEdited} Edit Delete` })
            .getByRole('button').first().click();

        const dialog = page.getByRole('dialog');
        await dialog.getByRole('textbox', { name: 'Enter new category' }).fill(newCat);
        await dialog.getByRole('button', { name: 'Close' }).click();

        await expect(page.getByRole('cell', { name: catToBeEdited })).toBeVisible();
        const table = page.locator('table');
        await expect(table.locator(`text=${newCat}`)).toHaveCount(0);

        // clean up
        await page.getByRole('row', { name: `${catToBeEdited} Edit Delete` }).getByRole('button').nth(1).click();
        await page.waitForTimeout(500); // wait to delete
    });

    test('should not allow me to update to a duplicated name', async ({ page }) => {
        const existingCat = 'Existing';
        const catToBeEdited = 'ZZ';

        // add category to set up test
        await page.getByRole('textbox', { name: 'Enter new category' }).fill(existingCat);
        await page.getByRole('button', { name: 'Submit' }).click();

        await page.getByRole('textbox', { name: 'Enter new category' }).fill(catToBeEdited);
        await page.getByRole('button', { name: 'Submit' }).click();

        // edit catToBeEdited to have the same name as existingCat
        await page.getByRole('row', { name: `${catToBeEdited} Edit Delete` }).getByRole('button').first().click();
        const dialog = page.getByRole('dialog');
        await dialog.getByRole('textbox', { name: 'Enter new category' }).fill(existingCat);
        await dialog.getByRole('button', { name: 'Submit' }).click();
        await dialog.getByRole('button', { name: 'Close' }).click();
        
        const table = page.locator("table");
        await expect(table.locator(`text=${existingCat}`)).toHaveCount(1);
        await expect(table.locator(`text=${catToBeEdited}`)).toHaveCount(1);

        // clean up
        await page.getByRole('row', { name: `${existingCat} Edit Delete` }).getByRole('button').nth(1).click();
        await page.getByRole('row', { name: `${catToBeEdited} Edit Delete` }).getByRole('button').nth(1).click();
        await page.waitForTimeout(500); // wait to delete
    });
});

test.describe("Given Delete Category", () => {
    test.beforeEach( async ({ page }) => {
        await page.goto('http://localhost:3000/');
        await page.getByRole('link', { name: 'Login' }).click();
        await page.getByPlaceholder('Enter Your Email').fill(testAdmin.email);
        await page.getByPlaceholder('Enter Your Password').fill(testAdmin.password);
        await page.getByRole('button', { name: 'LOGIN' }).click();
        await page.waitForURL('http://localhost:3000/');

        await page.getByRole('button', { name: testAdmin.name }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await page.waitForURL('http://localhost:3000/dashboard/admin');

        await page.getByRole('link', { name: 'Create Category' }).click();
    });

    test.afterEach( async ({ page }) => {
        await page.getByRole('button', { name: testAdmin.name }).click();
        await page.getByRole('link', { name: 'Logout' }).click();
    });

    test('should allow me to delete category', async ({ page }) => {
        const catToBeDeleted = 'to delete';
        // add new category that is to be deleted
        await page.getByPlaceholder('Enter new category').fill(catToBeDeleted);
        await page.getByRole('button', { name: 'Submit' }).click();
        await expect(page.getByRole('cell', { name: catToBeDeleted })).toBeVisible();
    
        // delete newly added category
        await page.getByRole('row', { name: `${catToBeDeleted} Edit Delete`, exact: true })
            .getByRole('button').nth(1).click();

        const table = page.locator('table');
        await expect(table.locator(`text=${catToBeDeleted}`)).toHaveCount(0);
    });
});
