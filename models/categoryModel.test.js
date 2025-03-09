import categoryModel from "./categoryModel";
import Category from "./categoryModel";
import mongoose from "mongoose";
import { MongoMemoryServer } from 'mongodb-memory-server';

let mockedMongoServer;

describe("Given CategoryModel", () => {
    beforeAll( async() => {
        // create an in-memory server
        mockedMongoServer = await MongoMemoryServer.create();
        const mockedMongoUri = mockedMongoServer.getUri();

        await mongoose.connect(mockedMongoUri);
        
    });

    afterAll( async() => {
        await mongoose.disconnect();
        await mockedMongoServer.stop();
    });

    beforeEach( async()  => {
        jest.clearAllMocks();
        await mongoose.connection.dropDatabase();
    });

    describe("Given the saving method", () => {
        test("When creating new category with valid inputs", async () => {
            const category1 = new Category({
                name: "Category 1",
                slug:"category1"
            });
            const result = await category1.save();
            expect(result._id).toBeDefined();
            expect(result).toEqual(category1);
        });

        // Bug found: categories should have a name
        test("When creating new category with no name", async () => {
            const category = new Category({
                slug:"category1"
            });

            await expect(category.save()).rejects.toThrowError();
        });

        test("When creating new category with no slug", async () => {
            const category = new Category({
                name:"Category 1"
            });

            const result = await category.save();
            expect(result._id).toBeDefined();
            expect(result).toEqual(category);
        });

        test("When creating new category with uppercase slug", async () => {
            const category = new Category({
                name:"Category 1",
                slug: "CATEGORY1"
            });

            //slug should change to lower case
            const result = await category.save();
            expect(result.slug).toEqual("category1");
        });

        test("When creating new category with non-string name and slug", async () => {
            const category = new Category({
                name: 12345,
                slug: 12345
            });

            const result = await category.save();
            expect(result.name).toEqual("12345");
            expect(result.slug).toEqual("12345");
        });
    });
    

    describe("Given fetching methods", () => {
        const category1 = {
            name: "category1",
            slug: "category1"
        };

        const category2 = {
            name: "category2",
            slug: "category2"
        };

        const allCategories = [category1, category2];

        beforeEach( async() => {
            const cat1 = new Category(category1);
            const cat2 = new Category(category2);
            await cat1.save();
            await cat2.save();
        });

        test("When fetching all categories", async () => {
            const result = await Category.find();
            expect(result).toHaveLength(2);
        });

        test("When fetching category by name", async () => {
            const result = await Category.find({ name: "category1" });
            expect(result).toHaveLength(1);
            expect(result[0].name).toEqual(category1.name);
        });

        test("When fetching category by name", async () => {
            const result = await Category.find({ name: "category1" });
            expect(result).toHaveLength(1);
            expect(result[0].name).toEqual(category1.name);
        });

        test("When fetching category by id", async () => {
            const newCategory = new Category({ name: "new", slug: "new" });
            const savedCategory = await newCategory.save();
            const id = savedCategory._id;


            const result = await Category.findById(id);
            expect(result.name).toEqual(savedCategory.name);
        });
    });
});
