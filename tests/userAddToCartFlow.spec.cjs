import { test, expect } from '@playwright/test';

/*
Database Setup:
User with name: user tests, email: user@tests.com, password: usertests
*/

test.use({ launchOptions: { slowMo: 500 } });

test.describe("UI - Add to Cart Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.getByText("LOGIN").click();
    await page.getByPlaceholder("Enter Your Email").fill("user@tests.com");
    await page.getByPlaceholder("Enter Your Password").fill("usertests");
    await page.getByRole("button", { name: "LOGIN" }).click();
    await page.waitForURL("http://localhost:3000/");
  });

  test.afterEach(async ({ page }) => {
    await page.getByRole('button', { name: 'user tests' }).click();
    await page.getByRole('link', { name: 'Logout' }).click();
  });

// add to cart from home page
test('login -> add to cart -> inspect cart -> remove item -> logout', async ({ page }) => {
    // wait for homepage
    await page.goto('http://localhost:3000/');

    // add items to cart
    await page.getByRole('heading', { name: 'Novel' }).click();
    await page.locator('button:nth-child(4)').first().click();
    await page.getByRole('heading', { name: 'Smartphone' }).click();
    await page.locator('div:nth-child(4) > .card-body > button:nth-child(4)').click();
    await page.getByRole('heading', { name: 'Laptop' }).click();
    await page.locator('div:nth-child(5) > .card-body > button:nth-child(4)').click();

    // navigate to cart
    await page.getByRole('link', { name: 'Cart' }).click();
    await page.waitForURL("http://localhost:3000/cart");

    // inspect all items added to cart
    await expect(page.locator('h1')).toContainText('Hello user testsYou Have 3 items in your cart');
    await expect(page.locator('h1')).toContainText('You Have 3 items in your cart');
    
    // novel
    await expect(page.getByRole('img', { name: 'Novel' })).toBeVisible();
    await expect(page.getByText('Novel', { exact: true })).toBeVisible();
    await expect(page.getByText('A bestselling novel')).toBeVisible();
    await expect(page.getByText('Price : 15')).toBeVisible();
    
    // smartphone 
    await expect(page.getByRole('img', { name: 'Smartphone' })).toBeVisible();
    await expect(page.getByText('Smartphone', { exact: true })).toBeVisible();
    await expect(page.getByText('A high-end smartphone')).toBeVisible();
    await expect(page.getByText('Price : 999.99')).toBeVisible();
    
    // laptop 
    await expect(page.getByRole('img', { name: 'Laptop' })).toBeVisible();
    await expect(page.getByText('Laptop', { exact: true })).toBeVisible();
    await expect(page.getByText('A powerful laptop')).toBeVisible();
    await expect(page.getByText('Price : 1499.99')).toBeVisible();

    // check total
    await expect(page.getByRole('main')).toContainText('Total : $2,514.98');

    // remove item
    await page.locator('div').filter({ hasText: /^NovelA bestselling novelPrice : 15Remove$/ }).getByRole('button').click();

    // inspect item removed
    await expect(page.locator('h1')).toContainText('Hello user testsYou Have 2 items in your cart');
    await expect(page.locator('h1')).toContainText('You Have 2 items in your cart');
    
    // smartphone
    await expect(page.getByRole('img', { name: 'Smartphone' })).toBeVisible();
    await expect(page.getByText('Smartphone', { exact: true })).toBeVisible();
    await expect(page.getByText('A high-end smartphone')).toBeVisible();
    await expect(page.getByText('Price : 999.99')).toBeVisible();
    
    // laptop
    await expect(page.getByRole('img', { name: 'Laptop' })).toBeVisible();
    await expect(page.getByText('Laptop', { exact: true })).toBeVisible();
    await expect(page.getByText('A powerful laptop')).toBeVisible();
    await expect(page.getByText('Price : 1499.99')).toBeVisible();

    // check total
    await expect(page.getByRole('main')).toContainText('Total : $2,499.98');
    });

// filter then add
test('login -> filter -> add to cart -> inspect cart -> logout', async ({ page }) => {
    // wait for homepage
    await page.goto('http://localhost:3000/');

    // filter items then add to cart
    await page.getByRole('checkbox', { name: 'Clothing' }).check();
    await page.getByRole('heading', { name: 'NUS T-shirt' }).click();
    await page.getByRole('button', { name: 'ADD TO CART' }).click();

    // navigate to cart
    await page.getByRole('link', { name: 'Cart' }).click();
    await page.waitForURL("http://localhost:3000/cart");

    // inspect all items added to cart
    await expect(page.locator('h1')).toContainText('Hello user testsYou Have 1 items in your cart');
    await expect(page.locator('h1')).toContainText('You Have 1 items in your cart');

    await expect(page.getByRole('main')).toContainText('NUS T-shirt');
    await expect(page.getByRole('main')).toContainText('Plain NUS T-shirt for sale');
    await expect(page.getByRole('main')).toContainText('Price : 4.99');
    await expect(page.getByRole('img', { name: 'NUS T-shirt' })).toBeVisible();

    // check total
    await expect(page.getByRole('main')).toContainText('Total : $4.99');
    });

    // add to cart from product details
    test('login -> product details add to cart -> similar products add to cart -> inspect cart -> remove item -> logout', async ({ page }) => {
      await page.goto('http://localhost:3000/');

      // find novel and navigate to product details
      await page.getByRole('heading', { name: 'Novel' }).click();
      await page.locator('.card-body > button').first().click();
      await expect(page.locator('h1')).toContainText('Product Details');
      await expect(page.getByRole('main')).toContainText('Name : Novel');
      await expect(page.getByRole('main')).toContainText('Description : A bestselling novel');
      await expect(page.getByRole('main')).toContainText('Price :$15.00');
      await expect(page.getByRole('main')).toContainText('Category : Book');
      await expect(page.getByRole('img', { name: 'Novel' })).toBeVisible();
      await page.getByRole('button', { name: 'ADD TO CART' }).first().click();
      await page.locator('div').filter({ hasText: /^Item Added to Cart$/ }).nth(2).click();

      // add similar product to cart
      await expect(page.getByRole('main')).toContainText('Similar Products ➡️');
      await expect(page.getByRole('main')).toContainText('The Law of Contract in Singapore');
      await page.getByRole('heading', { name: '$54.99' }).click();
      await expect(page.getByRole('main')).toContainText('$54.99');
      await expect(page.getByRole('main')).toContainText('A bestselling book in Singapore...');
      await page.getByRole('button', { name: 'ADD TO CART' }).nth(2).click();
      await page.locator('div').filter({ hasText: /^Item Added to Cart$/ }).nth(2).click();

      // go to cart
      await page.getByRole('link', { name: 'Cart' }).click();
      await page.waitForURL("http://localhost:3000/cart");

      // check correct number of items
      await expect(page.locator('h1')).toContainText('Hello user testsYou Have 2 items in your cart');
      await expect(page.locator('h1')).toContainText('You Have 2 items in your cart');

      // check product 1
      await expect(page.getByRole('main')).toContainText('Novel');
      await expect(page.getByRole('main')).toContainText('A bestselling novel');
      await expect(page.getByRole('main')).toContainText('Price : 15');
      await expect(page.getByRole('img', { name: 'Novel' })).toBeVisible();

      // check product 2
      await expect(page.getByRole('main')).toContainText('The Law of Contract in Singapore');
      await expect(page.getByRole('main')).toContainText('A bestselling book in Singapor');
      await expect(page.getByRole('main')).toContainText('Price : 54.99');
      await expect(page.getByRole('img', { name: 'The Law of Contract in' })).toBeVisible();

      // check total
      await expect(page.locator('h2')).toContainText('Cart Summary');
      await expect(page.getByRole('main')).toContainText('Total : $69.99');

      // remove from cart
      await page.locator('div').filter({ hasText: /^NovelA bestselling novelPrice : 15Remove$/ }).getByRole('button').click();
      await page.getByRole('button', { name: 'Remove' }).click();
    });
});
