import { test, expect } from '@playwright/test';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

/*
Database Setup:
User with name: user tests, email: user@tests.com, password: usertests
*/

const testUser = {
    name: 'user tests',
    email: 'user@tests.com',
    password: 'usertests',
    address: '567 orchard road',
    phone: '81234567',
    dob: '2025-03-01',
    sport: 'badminton'
  }

test.use({ launchOptions: { slowMo: 500 } });

test.describe("UI - Check Orders Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole('link', { name: 'Register' }).click();
    await page.getByPlaceholder('Enter Your Name').fill(testUser.name);
    await page.getByPlaceholder('Enter Your Email').fill(testUser.email);
    await page.getByPlaceholder('Enter Your Password').fill(testUser.password);
    await page.getByPlaceholder('Enter Your Phone').fill(testUser.phone);
    await page.getByPlaceholder('Enter Your Address').fill(testUser.address);
    await page.getByPlaceholder('Enter Your DOB').fill(testUser.dob);
    await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).fill(testUser.sport);
    await page.getByRole('button', { name: 'REGISTER' }).click();

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

    await deleteLatestOrder();
  });

test('login -> check initial orders -> add an order -> check updated orders', async ({ page }) => {
    // navigate to orders and check the page
    await page.getByRole('button', { name: 'user tests' }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await page.waitForURL("http://localhost:3000/dashboard/user");
    await page.getByRole('link', { name: 'Orders' }).click();
    await page.waitForURL("http://localhost:3000/dashboard/user/orders");
    await expect(page.locator('h1')).toContainText('All Orders');

    // return to home page
    await page.getByRole('link', { name: 'Home' }).click();
    await page.waitForURL("http://localhost:3000/");

    await expect(page.getByRole('main')).toContainText('Novel');
    await expect(page.getByRole('main')).toContainText('A bestselling novel...');
    await page.locator('button:nth-child(4)').first().click();

    await expect(page.getByRole('main')).toContainText('The Law of Contract in Singapore');
    await expect(page.getByRole('main')).toContainText('A bestselling book in Singapore...');
    await page.locator('div:nth-child(2) > .card-body > button:nth-child(4)').click();

    await page.getByRole('link', { name: 'Cart' }).click();
    await page.waitForURL("http://localhost:3000/cart");

    // pay with generated card number
    await page.getByRole('button', { name: 'Paying with Card' }).click();
    await page.locator('iframe[name="braintree-hosted-field-number"]').contentFrame().getByRole('textbox', { name: 'Credit Card Number' }).click();
    await page.locator('iframe[name="braintree-hosted-field-number"]').contentFrame().getByRole('textbox', { name: 'Credit Card Number' }).fill('4277 3788 8720 1026');
    await page.locator('iframe[name="braintree-hosted-field-cvv"]').contentFrame().getByRole('textbox', { name: 'CVV' }).click();
    await page.locator('iframe[name="braintree-hosted-field-cvv"]').contentFrame().getByRole('textbox', { name: 'CVV' }).fill('237');
    await page.locator('iframe[name="braintree-hosted-field-expirationDate"]').contentFrame().getByRole('textbox', { name: 'Expiration Date' }).click();
    await page.locator('iframe[name="braintree-hosted-field-expirationDate"]').contentFrame().getByRole('textbox', { name: 'Expiration Date' }).fill('072026');
    await page.getByRole('button', { name: 'Make Payment' }).click();

    // check orders page instantly
    await page.waitForURL("http://localhost:3000/dashboard/user/orders");
    await expect(page.getByRole('main')).toContainText('Novel');
    await expect(page.getByRole('main')).toContainText('A bestselling novel');
    await expect(page.getByRole('main')).toContainText('Price : 14.99');
    await expect(page.getByRole('main')).toContainText('The Law of Contract in Singapore');
    await expect(page.getByRole('main')).toContainText('A bestselling book in Singapor');
    await expect(page.getByRole('main')).toContainText('Price : 54.99');

    // go back to home page and check orders again
    await page.getByRole('link', { name: 'Home' }).click();
    await page.getByRole('button', { name: 'user tests' }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await page.waitForURL("http://localhost:3000/dashboard/user");
    await page.getByRole('link', { name: 'Orders' }).click();
    await page.waitForURL("http://localhost:3000/dashboard/user/orders");
    await expect(page.locator('h1')).toContainText('All Orders');

    // check orders
    await expect(page.getByRole('main')).toContainText('Novel');
    await expect(page.getByRole('main')).toContainText('A bestselling novel');
    await expect(page.getByRole('main')).toContainText('Price : 14.99');
    await expect(page.getByRole('main')).toContainText('The Law of Contract in Singapore');
    await expect(page.getByRole('main')).toContainText('A bestselling book in Singapor');
    await expect(page.getByRole('main')).toContainText('Price : 54.99');
    });
});

// delete function
dotenv.config();
const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = "test";
const COLLECTION_NAME = "orders";

async function deleteLatestOrder() {
    const client = new MongoClient(MONGO_URL);
    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        // find latest order
        const latestOrder = await collection.find().sort({ _id: -1 }).limit(1).toArray();
        
        if (latestOrder.length > 0) {
            await collection.deleteOne({ _id: latestOrder[0]._id });
            console.log(`Deleted order: ${latestOrder[0]._id}`);
        } else {
            console.log("No orders found to delete.");
        }
    } catch (error) {
        console.error("Error deleting order:", error);
    } finally {
        await client.close();
    }
}
