import mongoose from "mongoose";
import request from 'supertest';
import app from './app';
import JWT from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';
import userModel from "../models/userModel.js";

describe("Given Profile", () => {
    let mongoServer;
    let userIds = [];
    let user;
    let JWToken;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();

        await mongoose.connect(mongoUri);

        user = await userModel.create({
            name: "Test",
            email: "j@j.com",
            password: "$2b$10$SAIWJ9X.KeDWkJwbb/EGrurcr5.3oY3P3M1Jf0f5BGyLyRtekO2Em", //random hash pw
            phone: "91234567",
            address: "Kent ridge",
            answer: "User",
            role: 0,
        });
        userIds.push(user._id);

        process.env.JWT_SECRET = "testingProfile";
        JWToken = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });
    });

    afterAll(async () => {
        await userModel.deleteMany({ _id: { $in: userIds } }); // Clean up user
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    test("When profile is updated with valid inputs", async () => {
        const newUser = {
            name: "JJJ",
            password: 'k@j.com',
            phone: "12341234",
            address: "Kridge",
        };

        const res = await request(app)
            .put('/api/v1/auth/profile')
            .set("Authorization", JWToken)
            .send(newUser);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('Profile updated successfully');
        expect(res.body.updatedUser.name).toBe(newUser.name);
        expect(res.body.updatedUser.email).toBe(user.email);
        expect(res.body.updatedUser.password).not.toBe(user.password);
        expect(res.body.updatedUser.phone).toBe(newUser.phone);
        expect(res.body.updatedUser.address).toBe(newUser.address);

        // check userModel
        const updatedUser = await userModel.findById(user._id);
        expect(updatedUser.name).toBe(newUser.name);
        expect(updatedUser.email).toBe(user.email);
        expect(updatedUser.password).not.toBe(user.password);
        expect(updatedUser.phone).toBe(newUser.phone);
        expect(updatedUser.address).toBe(newUser.address);
    });

    // Bug found: status code returned is 200, it should be 400 insead to indicate an error.
    test("When new password is less than 6 characters", async () => {
        const newPw = "aa";

        const res = await request(app)
            .put('/api/v1/auth/profile')
            .set("Authorization", JWToken)
            .send({password: newPw});

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Password must be at least 6 characters long");
    });

    test("When new name is empty", async () => {
        const res = await request(app)
            .put('/api/v1/auth/profile')
            .set("Authorization", JWToken)
            .send({name: "  "});

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Name cannot be left blank");
    });

    test("When new phone is empty", async () => {
        const res = await request(app)
            .put('/api/v1/auth/profile')
            .set("Authorization", JWToken)
            .send({phone: " "});

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Phone cannot be left blank");
    });

    test("When new address is empty", async () => {
        const res = await request(app)
            .put('/api/v1/auth/profile')
            .set("Authorization", JWToken)
            .send({address: " "});

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Address cannot be left blank");
    });
});