import { test, expect } from '@playwright/test';

test.describe("UI - Payment", () => {
    test.beforeEach("Login as admin and navigate to admin dashboard",
        async ({ page }) => {
            console.log(`Running ${test.info().title}`);
            await page.goto("http://localhost:3000/");
            await page.getByRole("link", { name: "Login" }).click();
            await page.getByRole("textbox", { name: "Enter Your Email" }).click();
            await page.getByRole("textbox", { name: "Enter Your Email" }).fill("user@test.com");
            await page.getByRole("textbox", { name: "Enter Your Password" }).click();
            await page.getByRole("textbox", { name: "Enter Your Password" }).fill("user@test.com");
            await page.getByRole("button", { name: "LOGIN" }).click();
        }
    );

    test('add to cart and payment', async ({ page }) => {
        await page.getByRole('heading', { name: 'Novel' }).click();
        await page.locator('button:nth-child(4)').first().click();
        await page.getByRole('link', { name: 'Cart' }).click();
        await page.waitForURL("http://localhost:3000/cart");

        await expect(page.locator('h1')).toContainText('Hello  user@test.comYou Have 1 items in your cart');
        await page.getByRole('button', { name: 'Paying with Card' }).click();

        // Ensure iframes are loaded before interacting
        const frameNumber = page.frameLocator('iframe[name="braintree-hosted-field-number"]');
        await frameNumber.getByRole('textbox', { name: 'Credit Card Number' }).fill('4032 0343 8048 1419');

        const frameExpiration = page.frameLocator('iframe[name="braintree-hosted-field-expirationDate"]');
        await frameExpiration.getByRole('textbox', { name: 'Expiration Date' }).fill('05 / 2026');

        const frameCVV = page.frameLocator('iframe[name="braintree-hosted-field-cvv"]');
        await frameCVV.getByRole('textbox', { name: 'CVV' }).fill('490');

        await page.getByRole('button', { name: 'Make Payment' }).click();
        await expect(page.getByRole('heading', { name: 'All Orders'})).toBeVisible();
    });
});
