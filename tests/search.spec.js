// @ts-check
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
});

test.describe('Tests for search functionality UI', () => {
    test('Search for product with full name', async ({ page }) => {
        await expect(page.getByRole("heading", { name: "Laptop" })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("heading", { name: "Novel" })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("heading", { name: "NUS T-shirt" })).toBeVisible({ timeout: 15000 });

        await page.getByRole('searchbox', { name: 'Search' }).fill("laptop");
        await page.getByRole('button', { name: 'Search' }).click();

        await expect(page.getByRole("heading", { name: "Laptop" })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("heading", { name: "Novel" })).not.toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("heading", { name: "NUS T-shirt" })).not.toBeVisible({ timeout: 15000 });
    });

    test('Search with word that appears both in title and description', async ({ page }) => {
        await expect(page.getByRole("heading", { name: "Laptop" })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("heading", { name: "The Law of Contract in Singapore" })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("heading", { name: "Textbook" })).toBeVisible({ timeout: 15000 });

        await page.getByRole('searchbox', { name: 'Search' }).fill("book");
        await page.getByRole('button', { name: 'Search' }).click();

        await expect(page.getByRole("heading", { name: "Laptop" })).not.toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("heading", { name: "The Law of Contract in Singapore" })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("heading", { name: "Textbook" })).toBeVisible({ timeout: 15000 });
    });

    test('Search with entry that does not match any products', async ({ page }) => {
        await expect(page.getByRole("heading", { name: "Laptop" })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("heading", { name: "Novel" })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("heading", { name: "NUS T-shirt" })).toBeVisible({ timeout: 15000 });

        await page.getByRole('searchbox', { name: 'Search' }).fill("alsdjkfhsfnkdsfsl");
        await page.getByRole('button', { name: 'Search' }).click();

        await expect(page.getByRole("heading", { name: "Laptop" })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("heading", { name: "Novel" })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("heading", { name: "NUS T-shirt" })).toBeVisible({ timeout: 15000 });
    });
});