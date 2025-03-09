import mongoose from "mongoose";
import Order from "../models/orderModel";  // Adjust the path as needed
import { MongoMemoryServer } from "mongodb-memory-server";

describe("Order Model", () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  it("creates a new order", async () => {
    const order = new Order({
      products: [new mongoose.Types.ObjectId()],
      payment: { method: "Credit Card", amount: 100 },
      buyer: new mongoose.Types.ObjectId(),
      status: "Not Process",
    });

    const createdOrder = await order.save();
    expect(createdOrder).toMatchObject(order);
  });

  it("updates an order's status", async () => {
    const order = await Order({
      products: [new mongoose.Types.ObjectId()],
      payment: { method: "Credit Card", amount: 100 },
      buyer: new mongoose.Types.ObjectId(),
      status: "Not Process",
    }).save();

    await Order.findByIdAndUpdate(
      order._id,
      { status: "Processing" },
      { new: true }
    );

    const getOrder = await Order.findById(order._id);
    expect(getOrder.payment.method).toBe("Credit Card");
    expect(getOrder.status).toBe("Processing");
  });

  it("deletes an order", async () => {
    const order = await Order({
      products: [new mongoose.Types.ObjectId()],
      payment: { method: "Credit Card", amount: 100 },
      buyer: new mongoose.Types.ObjectId(),
      status: "Not Process",
    }).save();

    await Order.findByIdAndDelete(order._id);
    const deletedOrder = await Order.findById(order._id);

    expect(deletedOrder).toBeNull();
  });

  it("saves order without status by defaulting to 'Not Process'", async () => {
    const order = await Order({
      products: [new mongoose.Types.ObjectId()],
      payment: { method: "Credit Card", amount: 100 },
      buyer: new mongoose.Types.ObjectId(),
    }).save();

    expect(order.status).toBe("Not Process");
  });

  it("fails to save an order without payment", async () => {
    const order = new Order({
      products: [new mongoose.Types.ObjectId()],
      buyer: new mongoose.Types.ObjectId(),
      status: "Not Process",
    });

    await expect(order.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it("fails to save an order without products", async () => {
    const order = new Order({
      payment: { method: "Credit Card" },
      buyer: new mongoose.Types.ObjectId(),
      status: "Not Process",
    });
    await expect(order.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it("fails to save an order without a buyer", async () => {
    const order = new Order({
      products: [new mongoose.Types.ObjectId()],
      payment: { method: "Credit Card" },
      status: "Not Process",
    });

    await expect(order.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it("fails to save an order with an invalid status", async () => {
    const order = new Order({
      products: [new mongoose.Types.ObjectId()],
      payment: { method: "Credit Card" },
      buyer: new mongoose.Types.ObjectId(),
      status: "Invalid Status"
    });

    await expect(order.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });
});
