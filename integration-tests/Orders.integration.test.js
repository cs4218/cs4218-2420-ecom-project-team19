import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import JWT from "jsonwebtoken";
import { ObjectId } from "mongodb";
import dotenv from "dotenv";
import { getAllOrdersController } from "../controllers/authController.js";
import httpMocks from "node-mocks-http";

dotenv.config();

describe("Orders Backend Integration Testing", () => {
  const hashedPassword = "$2b$10$UFcjP/qh6is04xzwk.Y.QOu3j2EqhovIFGuSQXqgt4fUDG1P9wDZS";
  let mongoInMemoryServer, jwtToken;

  let createdOrderIds = [];
  let createdUserIds = [];
  let createdProductIds = [];

  beforeAll(async () => {
    mongoInMemoryServer = await MongoMemoryServer.create();
    const uri = mongoInMemoryServer.getUri();
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri);
    }
  });

  beforeEach(async () => {
    const admin = await new userModel({
      name: "Admin Test",
      email: "admin@test.com",
      phone: "98765432",
      address: "567 orchard road",
      password: hashedPassword,
      answer: "admintest",
      role: 1,
    }).save();

    createdUserIds.push(admin._id);

    jwtToken = JWT.sign({ _id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
  });

  afterEach(async () => {
    await orderModel.deleteMany({ _id: { $in: createdOrderIds } });
    await userModel.deleteMany({ _id: { $in: createdUserIds } });
    await productModel.deleteMany({ _id: { $in: createdProductIds } });

    createdOrderIds = [];
    createdUserIds = [];
    createdProductIds = [];
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoInMemoryServer.stop();
  });

  describe("Order Retrieval Base Cases - 0 and 1", () => {
    it("should return empty array when there are no orders", async () => {
      const req = httpMocks.createRequest({
        method: "GET",
        headers: { authorization: jwtToken },
      });
      req.user = { _id: new ObjectId(), role: 1 };
      const res = httpMocks.createResponse();

      await getAllOrdersController(req, res);
      const data = JSON.parse(res._getData());

      expect(res.statusCode).toBe(200);
      expect(data).toEqual([]);
    });

    it("should return one order when only one order exists", async () => {
      const categoryId = new ObjectId();

      const product = await productModel.create({
        name: "Test Product",
        slug: "test-product",
        description: "Just one product",
        price: 25,
        category: categoryId,
        quantity: 1,
        shipping: true,
      });
      createdProductIds.push(product._id);

      const buyer = await userModel.create({
        name: "Buyer",
        email: "buyer@mail.com",
        phone: "11112222",
        address: "Buyer Addr",
        password: hashedPassword,
        answer: "yes",
      });
      createdUserIds.push(buyer._id);

      const order = await orderModel.create({
        products: [product._id],
        buyer: buyer._id,
        payment: { success: true, transactionId: "singleTxn" },
      });
      createdOrderIds.push(order._id);

      const req = httpMocks.createRequest({
        method: "GET",
        headers: { authorization: jwtToken },
      });
      req.user = { _id: buyer._id, role: 1 };
      const res = httpMocks.createResponse();

      await getAllOrdersController(req, res);
      const data = JSON.parse(res._getData());

      expect(res.statusCode).toBe(200);
      expect(data.length).toBe(1);
      expect(data[0].buyer._id).toBe(String(buyer._id));
    });
  });

  describe("Bulk Order", () => {
    it("should return 50 orders", async () => {
      const categoryId = new ObjectId();

      const product = await productModel.create({
        name: "Bulk Product",
        slug: "bulk-product",
        description: "Test bulk insert",
        price: 10,
        category: categoryId,
        quantity: 100,
        shipping: true,
      });
      createdProductIds.push(product._id);

      const buyer = await userModel.create({
        name: "Bulk Buyer",
        email: "bulk@buyer.com",
        phone: "99998888",
        address: "Bulk Address",
        password: hashedPassword,
        answer: "bulk",
      });
      createdUserIds.push(buyer._id);

      const bulkOrders = Array.from({ length: 50 }, () => ({
        products: [product._id],
        buyer: buyer._id,
        payment: { success: true, transactionId: `txn_${Math.random()}` },
      }));

      const inserted = await orderModel.insertMany(bulkOrders);
      createdOrderIds.push(...inserted.map((o) => o._id));

      const req = httpMocks.createRequest({
        method: "GET",
        headers: { authorization: jwtToken },
      });
      req.user = { _id: buyer._id, role: 1 };
      const res = httpMocks.createResponse();

      await getAllOrdersController(req, res);
      const data = JSON.parse(res._getData());

      expect(res.statusCode).toBe(200);
      expect(data.length).toBe(50);
    });
  });

  describe("Order Correctly Sorted", () => {
    it("should return all orders sorted by createdAt", async () => {
      const categoryId = new ObjectId();

      const product1 = await productModel.create({
        name: "lunch",
        slug: "this-is-someones-lunch",
        description: "this is someone's lunch",
        price: 10.99,
        category: categoryId,
        quantity: 2,
        shipping: true,
      });
      const product2 = await productModel.create({
        name: "steam gift card",
        slug: "steam-gift-card",
        description: "$200 steam gift card",
        price: 200,
        category: categoryId,
        quantity: 1,
        shipping: false,
      });
      createdProductIds.push(product1._id, product2._id);

      const buyer1 = await userModel.create({
        name: "Buyer One",
        email: "buyer1@mail.com",
        phone: "11111111",
        address: "Addr1",
        password: hashedPassword,
        answer: "test",
      });
      const buyer2 = await userModel.create({
        name: "Buyer Two",
        email: "buyer2@mail.com",
        phone: "22222222",
        address: "Addr2",
        password: hashedPassword,
        answer: "test",
      });
      createdUserIds.push(buyer1._id, buyer2._id);

      const order1 = await orderModel.create({
        products: [product1._id],
        buyer: buyer1._id,
        payment: { success: true, transactionId: "txn1" },
      });
      const order2 = await orderModel.create({
        products: [product2._id],
        buyer: buyer2._id,
        payment: { success: true, transactionId: "txn2" },
      });
      createdOrderIds.push(order1._id, order2._id);

      const req = httpMocks.createRequest({
        method: "GET",
        headers: { authorization: jwtToken },
      });
      req.user = { _id: buyer1._id, role: 1 };
      const res = httpMocks.createResponse();

      await getAllOrdersController(req, res);
      const data = JSON.parse(res._getData());

      expect(res.statusCode).toBe(200);
      expect(data.length).toBe(2);
      expect(new Date(data[0].createdAt)).toBeInstanceOf(Date);
      expect(new Date(data[0].createdAt).getTime()).toBeGreaterThan(
        new Date(data[1].createdAt).getTime()
      );
    });
  });
});
