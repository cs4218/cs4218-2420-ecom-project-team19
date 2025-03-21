import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import JWT from "jsonwebtoken";
import fs from "fs";
import path from "path";

import app from "../app";
import userModel from "../models/userModel";
import categoryModel from "../models/categoryModel";
import productModel from "../models/productModel";

jest.mock("../config/db.js", () => jest.fn());

describe("Product Controller Integration Tests", () => {
  let mongoServer;
  let admin;
  let adminToken;
  let category;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    process.env.JWT_SECRET = "testsecret";

    admin = await userModel.create({
      name: "Admin User",
      email: "admin@example.com",
      password: "password",
      phone: "1234567890",
      address: "1234th St, San Francisco, CA",
      answer: "Admin",
      role: 1,
    });

    adminToken = JWT.sign({ _id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    category = await categoryModel.create({ name: "Electronics" });
  });

  afterEach(async () => {
    await userModel.deleteMany();
    await categoryModel.deleteMany();
    await productModel.deleteMany();
  });

  it("should create a product successfully", async () => {
    const imagePath = path.join(__dirname, "../test-photos/test-image.png");

    const res = await request(app)
      .post("/api/v1/product/create-product")
      .set("Authorization", adminToken)
      .field("name", "Test Product")
      .field("description", "A product for testing")
      .field("price", "99.99")
      .field("category", category._id.toString())
      .field("quantity", "10")
      .field("shipping", "true")
      .attach("photo", imagePath);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Product Created Successfully");
    expect(res.body.products).toHaveProperty("_id");
    expect(res.body.products.name).toBe("Test Product");
  });

  it("should return error if required fields are missing", async () => {
    const res = await request(app)
      .post("/api/v1/product/create-product")
      .set("Authorization", adminToken)
      .field("description", "Missing name field");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Name is Required");
  });

  it("should update a product successfully", async () => {
    const imagePath = path.join(__dirname, "../test-photos/test-image.png");
  
    // Step 1: Create the product first
    const createRes = await request(app)
      .post("/api/v1/product/create-product")
      .set("Authorization", adminToken)
      .field("name", "Old Product")
      .field("description", "Old description")
      .field("price", "50.00")
      .field("category", category._id.toString())
      .field("quantity", "5")
      .field("shipping", "true")
      .attach("photo", imagePath);
  
    const productId = createRes.body.products._id;
  
    // Step 2: Update the product
    const updateRes = await request(app)
      .put(`/api/v1/product/update-product/${productId}`)
      .set("Authorization", adminToken)
      .field("name", "Updated Product")
      .field("description", "Updated description")
      .field("price", "75.00")
      .field("category", category._id.toString())
      .field("quantity", "8")
      .field("shipping", "false")
      .attach("photo", imagePath); // Optional: include updated image
  
    // Step 3: Assertions
    expect(updateRes.status).toBe(201);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.message).toBe("Product Updated Successfully");
    expect(updateRes.body.products.name).toBe("Updated Product");
    expect(updateRes.body.products.description).toBe("Updated description");
    expect(updateRes.body.products.price).toBe(75.00);
  });

  it("should delete a product successfully", async () => {
    const imagePath = path.join(__dirname, "../test-photos/test-image.png");
  
    // Step 1: Create the product
    const createRes = await request(app)
      .post("/api/v1/product/create-product")
      .set("Authorization", adminToken)
      .field("name", "Product To Delete")
      .field("description", "Will be deleted")
      .field("price", "49.99")
      .field("category", category._id.toString())
      .field("quantity", "3")
      .field("shipping", "true")
      .attach("photo", imagePath);
  
    const productId = createRes.body.products._id;
  
    // Step 2: Delete the product
    const deleteRes = await request(app)
      .delete(`/api/v1/product/delete-product/${productId}`)
      .set("Authorization", adminToken);
  
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);
    expect(deleteRes.body.message).toBe("Product Deleted successfully");
  
    // Step 3: Ensure product is no longer in DB
    const productInDb = await productModel.findById(productId);
    expect(productInDb).toBeNull();
  });
  
  it("should complete a payment successfully", async () => {
    // Step 1: Create a product to use in cart
    const imagePath = path.join(__dirname, "../test-photos/test-image.png");
  
    const createRes = await request(app)
      .post("/api/v1/product/create-product")
      .set("Authorization", adminToken)
      .field("name", "Payable Product")
      .field("description", "Product for payment test")
      .field("price", "199.99")
      .field("category", category._id.toString())
      .field("quantity", "2")
      .field("shipping", "true")
      .attach("photo", imagePath);
  
    const product = createRes.body.products;
  
    // Step 2: Fetch Braintree token
    const tokenRes = await request(app)
      .get("/api/v1/product/braintree/token")
      .set("Authorization", adminToken);
  
    expect(tokenRes.status).toBe(200);
    const clientToken = tokenRes.body.clientToken;
    expect(clientToken).toBeDefined();
  
    // Step 3: Simulate payment
    const fakeNonce = "fake-valid-nonce"; // Use "fake-valid-nonce" for Braintree sandbox testing
  
    const paymentRes = await request(app)
      .post("/api/v1/product/braintree/payment")
      .set("Authorization", adminToken)
      .send({
        nonce: fakeNonce,
        cart: [
          {
            _id: product._id,
            name: product.name,
            price: product.price,
          },
        ],
      });
  
    expect(paymentRes.status).toBe(200);
    expect(paymentRes.body.ok).toBe(true);
  });  
});
