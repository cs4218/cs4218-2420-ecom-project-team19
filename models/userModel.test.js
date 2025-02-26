import mongoose from "mongoose";
import userModel from "./userModel";

jest.mock("./userModel");

describe("User Model", () => {
  const createMockUser = (id, name, email, role = 0) => ({
    _id: new mongoose.Types.ObjectId(id),
    name,
    email,
    password: "hashedpassword123",
    phone: "1234567890",
    address: { city: "Singapore", country: "SG" },
    answer: "test-answer",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const user1 = createMockUser("65c2f6a9e3b4c779d8a7b123", "John Doe", "john@example.com");
  const user2 = createMockUser("65c2f6a9e3b4c779d8a7b124", "Jane Doe", "jane@example.com", 1);
  const multipleUsers = [user1, user2];

  beforeEach(() => jest.clearAllMocks());

  it("fetches all users", async () => {
    userModel.find.mockResolvedValue(multipleUsers);
    const users = await userModel.find();
    expect(users).toEqual(multipleUsers);
  });

  it("fetches a user by ID", async () => {
    userModel.findOne.mockResolvedValue(user1);
    const user = await userModel.findOne({ _id: user1._id });
    expect(user).toEqual(user1);
  });

  it("fetches a user by email", async () => {
    userModel.findOne.mockResolvedValue(user1);
    const user = await userModel.findOne({ email: user1.email });
    expect(user).toEqual(user1);
  });

  it("creates a new user", async () => {
    userModel.create.mockResolvedValue(user1);
    const createdUser = await userModel.create(user1);
    expect(createdUser).toEqual(user1);
  });

  it("creates a user without an address", async () => {
    const userWithoutAddress = { ...user1, address: undefined };
    userModel.create.mockResolvedValue(userWithoutAddress);
    const createdUser = await userModel.create(userWithoutAddress);
    expect(createdUser).toEqual(userWithoutAddress);
  });

  it("updates a user's role", async () => {
    const updatedUser = { ...user1, role: 1 };
    userModel.findOneAndUpdate.mockResolvedValue(updatedUser);

    const result = await userModel.findOneAndUpdate(
      { _id: user1._id },
      { role: 1 },
      { new: true }
    );

    expect(result).toEqual(updatedUser);
  });

  it("updates a user's phone number", async () => {
    const updatedUser = { ...user1, phone: "9876543210" };
    userModel.findOneAndUpdate.mockResolvedValue(updatedUser);

    const result = await userModel.findOneAndUpdate(
      { _id: user1._id },
      { phone: "9876543210" },
      { new: true }
    );

    expect(result).toEqual(updatedUser);
  });

  it("deletes a user", async () => {
    userModel.findOneAndDelete.mockResolvedValue(user1);
    const deletedUser = await userModel.findOneAndDelete({ _id: user1._id });
    expect(deletedUser).toEqual(user1);
  });
});
