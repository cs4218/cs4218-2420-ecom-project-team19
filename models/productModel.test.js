import productModel from "./productModel";
import mongoose from "mongoose";

jest.mock("./productModel");

describe("Product Model", () => {
  const createMockProduct = (id, price, category, photo = true, shipping = true) => ({
    _id: new mongoose.Types.ObjectId(id),
    name: "product",
    slug: "product",
    description: "product",
    price,
    category: new mongoose.Types.ObjectId(category),
    quantity: 100,
    photo: photo ? { data: Buffer.from([1, 2, 3, 4]) } : undefined,
    shipping,
  });

  const product1 = createMockProduct("65c2f6a9e3b4c779d8a7b123", 100, "65c2f6a9e3b4c779d8a7b123");
  const product2 = createMockProduct("65c2f6a9e3b4c779d8a7b124", 200, "65c2f6a9e3b4c779d8a7b124", true);
  const multipleProducts = [product1, product2];

  beforeEach(() => jest.clearAllMocks());

  it("fetches all products", async () => {
    productModel.find.mockResolvedValue(multipleProducts);
    const products = await productModel.find();
    expect(products).toEqual(multipleProducts);
  });

  it("fetches a product by ID", async () => {
    productModel.findOne.mockResolvedValue(product1);
    const product = await productModel.findOne({ _id: product1._id });
    expect(product).toEqual(product1);
  });

  it("creates a product", async () => {
    productModel.create.mockResolvedValue(product1);
    const createdProduct = await productModel.create(product1);
    expect(createdProduct).toEqual(product1);
  });

  it("creates a product without a photo", async () => {
    const productWithoutPhoto = createMockProduct("65c2f6a9e3b4c779d8a7b123", 100, "65c2f6a9e3b4c779d8a7b123", false);
    productModel.create.mockResolvedValue(productWithoutPhoto);
    const createdProduct = await productModel.create(productWithoutPhoto);
    expect(createdProduct).toEqual(productWithoutPhoto);
  });

  it("creates a product without shipping information", async () => {
    const productWithoutShipping = createMockProduct("65c2f6a9e3b4c779d8a7b123", 100, "65c2f6a9e3b4c779d8a7b123", true, false);
    productModel.create.mockResolvedValue(productWithoutShipping);
    const createdProduct = await productModel.create(productWithoutShipping);
    expect(createdProduct).toEqual(productWithoutShipping);
  });

  it("updates a product", async () => {
    const updatedProduct = { ...product1, price: 5000 };
    productModel.findOneAndUpdate.mockResolvedValue(updatedProduct);

    const result = await productModel.findOneAndUpdate(
      { _id: product1._id },
      { price: 5000 },
      { new: true }
    );

    expect(result).toEqual(updatedProduct);
  });
});
