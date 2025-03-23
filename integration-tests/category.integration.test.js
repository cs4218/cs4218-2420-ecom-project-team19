import mongoose from "mongoose";
import categoryModel from "../models/categoryModel.js";
import request from 'supertest';
import app from './app';
import JWT from 'jsonwebtoken';

import { MongoMemoryServer } from 'mongodb-memory-server';
import dotenv from "dotenv";
import userModel from "../models/userModel.js";

let mongoServer;
let JWToken;
let admin;

describe('Given Category Controller', () => {
    let createdCategoryIds = [];

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();

        await mongoose.connect(mongoUri);
        
        //await mongoose.connect(process.env.MONGO_URL);

        admin = await userModel.create({
            name: "Admin",
            email: "admin@a.com",
            password: "admin",
            phone: "91234567",
            address: "Kent ridge",
            answer: "Admin",
            role: 1,
        });

        process.env.JWT_SECRET = "testing";
        JWToken = JWT.sign({ _id: admin._id }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });
    });

    afterEach(async () => {
        await categoryModel.deleteMany({ _id: { $in: createdCategoryIds } });
        createdCategoryIds = [];
    });

    afterAll(async () => {
        await userModel.deleteMany({ email: "admin@a.com" }); // Clean up admin
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    test('When a new valid category is created', async () => {
        const newCategory = await categoryModel({
            name: "Cat1",
            slug: "cat1",
        });
        
        const res = await request(app)
            .post('/api/v1/category/create-category')
            .set("Authorization", JWToken)
            .send({ name: newCategory.name });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('New category created');
        expect(res.body.category).toHaveProperty('_id');
        expect(res.body.category.name).toBe(newCategory.name);
        expect(res.body.category.slug).toBe(newCategory.slug);

        createdCategoryIds.push(res.body.category._id);
    });

    test('When given category name is empty', async () => {
        const res = await request(app)
            .post('/api/v1/category/create-category')
            .set("Authorization", JWToken)
            .send({ name: '' });

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Name is required');
    });

    // Bug found: status code (200) for duplicated category error is not representative
    test('When duplicate categories are created', async () => {
        const duplicateCategory = await categoryModel({
            name: "Dupe1",
            slug: "dupe1",
        });
        
        const res = await request(app)
            .post('/api/v1/category/create-category')
            .set("Authorization", JWToken)
            .send({ name: duplicateCategory.name });

        expect(res1.status).toBe(201);
        expect(res.body.category.name).toBe(duplicateCategory.name);
        createdCategoryIds.push(res1.body.category._id);

        // Create duplicate category
        const res2 = await request(app)
            .post('/api/v1/category/create-category')
            .set("Authorization", JWToken)
            .send({ name: duplicateCategory.name });

        expect(res2.status).toBe(409);
        expect(res2.body.message).toBe('Category Already Exists');
    });

    // Bug found: message for updateCategory in categoryController was spelled wrongly
    test('When a category is updated with valid changes', async () => {
        const newCategory = await categoryModel({
            name: "Cat1",
            slug: "cat1",
        });
        
        const res = await request(app)
            .post('/api/v1/category/create-category')
            .set("Authorization", JWToken)
            .send({ name: newCategory.name });

        const categoryId = createRes.body.category._id;
        createdCategoryIds.push(categoryId);
        
        // Update newly added category
        const updateRes = await request(app)
            .put(`/api/v1/category/update-category/${categoryId}`)
            .set("Authorization", JWToken)
            .send({ name: "Updated" });

        expect(updateRes.status).toBe(200);
        expect(updateRes.body.success).toBe(true);
        expect(updateRes.body.message).toBe('Category Updated Successfully');
        expect(updateRes.body.category).toHaveProperty('_id');
        expect(updateRes.body.category.name).toBe("Updated");
        expect(updateRes.body.category.slug).toBe("updated");
    });

    test('When a category is updated to have the same name as existing category', async () => {
        // Create "Existing" category
        await request(app)
            .post('/api/v1/category/create-category')
            .set("Authorization", JWToken)
            .send({ name: "Food" });

        // Create new category to be edited
        const createRes = await request(app)
            .post('/api/v1/category/create-category')
            .set("Authorization", JWToken)
            .send({ name: "Computer" });

        const categoryId = createRes.body.category._id;
        createdCategoryIds.push(res1.body.category._id, categoryId2);
        
        // Update newly added category to have same name as existing category
        const updateRes = await request(app)
            .put(`/api/v1/category/update-category/${categoryId}`)
            .set("Authorization", JWToken)
            .send({ name: "Food" });

        expect(updateRes.status).toBe(500);
        expect(updateRes.body.message).toBe('Error while updating category');
    });

    test('When a category is deleted', async () => {
        const newCategory = await categoryModel({
            name: "Cat1",
            slug: "cat1",
        });
        
        // Create category to be deletec
        const res = await request(app)
            .post('/api/v1/category/create-category')
            .set("Authorization", JWToken)
            .send({ name: newCategory.name });

        const categoryId = res.body.category._id;

        // Delete newly added category
        const updateRes = await request(app)
            .delete(`/api/v1/category/delete-category/${categoryId}`)
            .set("Authorization", JWToken);

        expect(updateRes.status).toBe(200);
        expect(updateRes.body.success).toBe(true);
        expect(updateRes.body.message).toBe('Category Deleted Successfully');
    });
});