// @ts-check
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
});

test.describe('Homepage flows for UI tests', () => {
    test('Add 2 items to cart, then remove 1 from the cart', async ({ page }) => {
        test.setTimeout(30000);
        const shirtCard = page.getByText("NUS T-shirt").locator("..").locator("..");
        const bookCard = page.getByText("NUS T-shirt").locator("..").locator("..");

        await shirtCard.getByRole("button", { name: "ADD TO CART" }).click();
        await bookCard.getByRole("button", { name: "ADD TO CART" }).click();

        const cartLength = await page.evaluate(() => {
            const cart = JSON.parse(localStorage.getItem("cart") || "[]");
            return cart.length;
        });
        expect(cartLength).toBe(2);

        await page.getByRole("link", { name: "CART" }).click();
        await page.getByRole("button", { name: "REMOVE" }).nth(0).click();

        const finalCartLength = await page.evaluate(() => {
            const cart = JSON.parse(localStorage.getItem("cart") || "[]");
            return cart.length;
        });
        expect(finalCartLength).toBe(1);
    });

    test('Filter by 1 price range', async ({ page }) => {
        test.setTimeout(30000);
        await expect(page.getByRole("heading", { name: "Laptop" })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("heading", { name: "Novel" })).toBeVisible({ timeout: 15000 });

        await page.getByRole('radio', { name: '$100 or more' }).click();

        await expect(page.getByRole("heading", { name: "Laptop" })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("heading", { name: "Novel" })).not.toBeVisible({ timeout: 15000 });
    });

    test('Check all category filters individually', async ({ page }) => {
        test.setTimeout(30000);
        await expect(page.getByRole("heading", { name: "Laptop" })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("heading", { name: "Novel" })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("heading", { name: "NUS T-shirt" })).toBeVisible({ timeout: 15000 });

        await page.getByRole('checkbox', { name: 'Clothing' }).check();

        await expect(page.getByRole("heading", { name: "Laptop" })).not.toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("heading", { name: "Novel" })).not.toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("heading", { name: "NUS T-shirt" })).toBeVisible({ timeout: 15000 });

        await page.getByRole('checkbox', { name: 'Clothing' }).uncheck();

        await expect(page.getByRole("heading", { name: "Laptop" })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("heading", { name: "Novel" })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("heading", { name: "NUS T-shirt" })).toBeVisible({ timeout: 15000 });

        await page.getByRole('checkbox', { name: 'Book' }).check();

        await expect(page.getByRole("heading", { name: "Laptop" })).not.toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("heading", { name: "Novel" })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("heading", { name: "NUS T-shirt" })).not.toBeVisible({ timeout: 15000 });

        await page.getByRole('checkbox', { name: 'Book' }).uncheck();

        await expect(page.getByRole("heading", { name: "Laptop" })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("heading", { name: "Novel" })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("heading", { name: "NUS T-shirt" })).toBeVisible({ timeout: 15000 });

        await page.getByRole('checkbox', { name: 'Electronics' }).check();

        await expect(page.getByRole("heading", { name: "Laptop" })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("heading", { name: "Novel" })).not.toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("heading", { name: "NUS T-shirt" })).not.toBeVisible({ timeout: 15000 });

        await page.getByRole('checkbox', { name: 'Electronics' }).uncheck();

        await expect(page.getByRole("heading", { name: "Laptop" })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("heading", { name: "Novel" })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("heading", { name: "NUS T-shirt" })).toBeVisible({ timeout: 15000 });
    });

    test('Select multiple category filters at the same time', async ({ page }) => {
        test.setTimeout(30000);
        await expect(page.getByRole("heading", { name: "Laptop" })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("heading", { name: "Novel" })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("heading", { name: "NUS T-shirt" })).toBeVisible({ timeout: 15000 });

        await page.getByRole('checkbox', { name: 'Clothing' }).check();
        await page.getByRole('checkbox', { name: 'Book' }).check();

        await expect(page.getByRole("heading", { name: "Laptop" })).not.toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("heading", { name: "Novel" })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("heading", { name: "NUS T-shirt" })).toBeVisible({ timeout: 15000 });

        await page.getByRole('checkbox', { name: 'Clothing' }).uncheck();
        await page.getByRole('checkbox', { name: 'Electronics' }).check();

        await expect(page.getByRole("heading", { name: "Laptop" })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("heading", { name: "Novel" })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("heading", { name: "NUS T-shirt" })).not.toBeVisible({ timeout: 15000 });

        await page.getByRole('checkbox', { name: 'Clothing' }).check();

        await expect(page.getByRole("heading", { name: "Laptop" })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("heading", { name: "Novel" })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("heading", { name: "NUS T-shirt" })).toBeVisible({ timeout: 15000 });
    });

    test('Navigate to product details page and back to home', async ({ page }) => {
        test.setTimeout(30000);
        await expect(page.getByRole("heading", { name: "Laptop" })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("heading", { name: "Novel" })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("heading", { name: "NUS T-shirt" })).toBeVisible({ timeout: 15000 });

        await page.locator('.card-body > button').first().click();

        await expect(page.getByText("Name : NUS T-shirt")).toBeVisible({ timeout: 15000 });
        await expect(page.getByText("Description : Plain NUS T-shirt for sale")).toBeVisible({ timeout: 15000 });
        await expect(page.getByText("Price :$4.99")).toBeVisible({ timeout: 15000 });
        await expect(page.getByText("Category : Clothing")).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("heading", { name: "Laptop" })).not.toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("heading", { name: "Novel" })).not.toBeVisible({ timeout: 15000 });

        await page.getByRole('link', { name: 'Home' }).click();
        await expect(page.getByRole("heading", { name: "Laptop" })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("heading", { name: "Novel" })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("heading", { name: "NUS T-shirt" })).toBeVisible({ timeout: 15000 });
    });
});