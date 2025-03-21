import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import JWT from "jsonwebtoken";
import fs from "fs";
import path from "path";

import app from "../server";
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
});
