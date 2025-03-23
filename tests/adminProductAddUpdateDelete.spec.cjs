import { test, expect } from "@playwright/test";

const Product1 = {
    name: "product1",
    description: "b",
    price: "1",
    quantity: "2",
    shipping: "Yes",
    category: "Electronics",
    photo: "test-photos/test-image.png",
};

const Product2 = {
    name: "product2",
    description: "b",
    price: "1",
    quantity: "2",
    shipping: "Yes",
    category: "Electronics",
    photo: "test-image.png",
};

async function verifyProductDetails(page, product) {
    await expect(page.getByRole("textbox", { name: "write a name" })).toHaveValue(product.name);
    await expect(page.getByRole("textbox", { name: "write a description" })).toHaveValue(product.description);
    await expect(page.getByPlaceholder('write a price')).toHaveValue(product.price.toString());
    await expect(page.getByPlaceholder('write a quantity')).toHaveValue(product.quantity.toString());
    await expect(page.getByText(product.shipping)).toBeVisible();
    await expect(page.getByTitle(product.category)).toBeVisible();
}

async function fillInProductDetails(page, { category, photo, name, description, price, quantity, shipping }) {
    if (category) {
        await page.locator('#rc_select_0').click();
        await page.getByTitle(category).locator("div").click();
    }
    if (photo) {
        await page.getByText("Upload Photo").click();
        await page.getByText("Upload Photo").setInputFiles(photo);
    }
    if (name) {
        await page.getByRole("textbox", { name: "write a name" }).click();
        await page.getByRole("textbox", { name: "write a name" }).fill(name);
    }
    if (description) {
        await page.getByRole("textbox", { name: "write a description" }).click();
        await page.getByRole("textbox", { name: "write a description" }).fill(description);
    }
    if (price) {
        await page.getByPlaceholder('write a Price').click();
        await page.getByPlaceholder('write a Price').fill(price);
    }
    if (quantity) {
        await page.getByPlaceholder('write a quantity').click();
        await page.getByPlaceholder('write a quantity').fill(quantity);
    }

    if (shipping) {
        await page.locator('#rc_select_1').click();
        await page.getByText(shipping).click();
    }
}

test.beforeEach("Login as admin and navigate to admin dashboard",
    async ({ page }) => {
        console.log(`Running ${test.info().title}`);
        await page.goto("http://localhost:3000/");
        await page.getByRole("link", { name: "Login" }).click();
        await page.getByRole("textbox", { name: "Enter Your Email" }).click();
        await page.getByRole("textbox", { name: "Enter Your Email" }).fill("admin@test.sg");
        await page.getByRole("textbox", { name: "Enter Your Password" }).click();
        await page.getByRole("textbox", { name: "Enter Your Password" }).fill("admin@test.sg");
        await page.getByRole("button", { name: "LOGIN" }).click();
        await page.getByRole("button", { name: "admin@test.sg" }).click();
        await page.getByRole("link", { name: "Dashboard" }).click();
    }
);

test("Create, update and delete product successfully",
    async ({ page }) => {
        // Create a product
        await page.getByRole("link", { name: "Create Product" }).click();
        await fillInProductDetails(page, Product1);
        await page.getByRole("button", { name: "CREATE PRODUCT" }).click();
        await expect(page.getByRole("heading", { name: "All Products List" })).toBeVisible();
        await expect(page.getByRole("link", { name: Product1.name })).toBeVisible();
        await page.getByRole("link", { name: "product1" }).click();
        await verifyProductDetails(page, Product1);

        // Update the product
        await page.getByRole("textbox", { name: "write a name" }).click();
        await page.getByRole("textbox", { name: "write a name" }).fill("product2");
        await page.getByRole("button", { name: "UPDATE PRODUCT" }).click();
        await page.getByRole("link", { name: "product2" }).click();
        await verifyProductDetails(page, Product2);

        // Delete the product
        page.once("dialog", async (dialog) => {
            console.log(`Dialog message: ${dialog.message()}`);
            await dialog.accept("Yes");
        });
        await page.getByRole("button", { name: "DELETE PRODUCT" }).click();

        // Verify the product has been deleted
        await expect(page.getByRole("heading", { name: "All Products List" })).toBeVisible();
        await expect(page.getByRole("link", { name: "product2" })).not.toBeVisible();
    }
);
