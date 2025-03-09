import categoryModel from "../models/categoryModel";
import slugify from "slugify";

import {
    createCategoryController,
    updateCategoryController,
    categoryControlller,
    singleCategoryController,
    deleteCategoryCOntroller,
} from "./categoryController"
import { beforeEach } from "node:test";

jest.mock("../models/categoryModel.js");
jest.mock("slugify");

let request = {
    body: { name: "Category1" }, params: { id: "categoryId1", slug: "categorySlug1" }
};
let response = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
    json: jest.fn()
};

describe("Given createCategoryController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("When name is null", async () => {
        request.body.name = ""

        await createCategoryController(request, response);

        expect(response.status).toHaveBeenCalledWith(401);
        expect(response.send).toHaveBeenCalledWith({ message: "Name is required" });
    });

    // Bug found in: success : true & "Exisits" spelling error
    test("When category already exists", async () => {
        request.body.name = "ExistingCategory";

        categoryModel.findOne.mockResolvedValue({
            name: "ExistingCategory"
        });

        await createCategoryController(request, response);

        expect(response.status).toHaveBeenCalledWith(200);
        expect(response.send).toHaveBeenCalledWith({
            success: false,
            message: "Category Already Exists"
        });
    });

    test("When new category is created", async () => {
        request.body.name = "New category";

        // simulate non-duplicate new category
        categoryModel.findOne.mockResolvedValue(null);

        slugify.mockReturnValue("new category");
        
        const newCategory = {
            name: "New category",
            slug: "new category"
        };

        categoryModel.prototype.save.mockResolvedValue(newCategory);

        await createCategoryController(request, response);

        expect(response.status).toHaveBeenCalledWith(201);
        expect(response.send).toHaveBeenCalledWith({
            success: true,
            message: "New category created",
            category: newCategory
        });
    });

    // Bug found: spelling errors "errro" "Errro"
    test("When error occurs during create category", async () => {
        const error = new Error("Error in categoryModel");
        categoryModel.findOne.mockRejectedValue(error);

        await createCategoryController(request, response);

        expect(response.status).toHaveBeenCalledWith(500);
        expect(response.send).toHaveBeenCalledWith({
            success: false,
            error,
            message: "Error in Category",
        });
    });
});

describe("Given updateCategoryController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("When category is updated successfully", async () => {
        const newId = "updatedId123";
        const newName = "Updated Category";
        const newSlug = "updatedslug";
        request.body.name = newName;
        request.body.id = newId;

        const updatedCategory = {
            _id: newId,
            name: newName,
            slug: newSlug
        };
        categoryModel.findByIdAndUpdate.mockResolvedValue(updatedCategory);

        slugify.mockReturnValue(newSlug);

        await updateCategoryController(request, response);

        expect(response.status).toHaveBeenCalledWith(200);
        expect(response.send).toHaveBeenCalledWith({
            success: true,
            messsage: "Category Updated Successfully",
            category: updatedCategory
        });
    });

    test("When error occurs during update category", async () => {
        const error = new Error("Error while updating");
        categoryModel.findByIdAndUpdate.mockRejectedValue(error);

        await updateCategoryController(request, response);

        expect(response.status).toHaveBeenCalledWith(500);
        expect(response.send).toHaveBeenCalledWith({
            success: false,
            error: error,
            message: "Error while updating category",
        });
    });
});

describe("Given categoryController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("When all categories are found successfully", async () => {
        const category1 = {
            _id: "1",
            name: "category1"
        };

        const category2 = {
            _id: "2",
            name: "category2"
        };

        const allCategories = [category1, category2];
        categoryModel.find.mockResolvedValue(allCategories);

        await categoryControlller(request, response);

        expect(response.status).toHaveBeenCalledWith(200);
        expect(response.send).toHaveBeenCalledWith({
            success: true,
            message: "All Categories List",
            category: allCategories
        });
    });

    test("When error occurs while finding all categories", async () => {
        const error = new Error("Find all error");
        categoryModel.find.mockRejectedValue(error);

        await categoryControlller(request, response);

        expect(response.status).toHaveBeenCalledWith(500);
        expect(response.send).toHaveBeenCalledWith({
            success: false,
            error: error,
            message: "Error while getting all categories",
        });
    });
});

describe("Given singleCategoryController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    //Bug found in success message "Get SIngle Category SUccessfully"
    test("When single category is found successfully", async () => {
        const category1 = {
            _id: "1",
            name: "category1",
            slug: "category1slug"
        };
        
        request.params.slug = "category1slug";
        
        categoryModel.findOne.mockResolvedValue(category1);

        await singleCategoryController(request, response);

        expect(response.status).toHaveBeenCalledWith(200);
        expect(response.send).toHaveBeenCalledWith({
            success: true,
            message: "Get Single Category Successfully",
            category: category1
        });
    });

    // Spelling error found in error message "Error While getting Single Category"
    test("When error occurs while finding single category", async () => {
        request.params.slug = "category100slug";

        const error = new Error("Find single category error");
        categoryModel.findOne.mockRejectedValue(error);

        await singleCategoryController(request, response);

        expect(response.status).toHaveBeenCalledWith(500);
        expect(response.send).toHaveBeenCalledWith({
            success: false,
            error: error,
            message: "Error while getting Single Category",
        });
    });
});

describe("Given deleteCategoryController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Spelling error found in "Categry Deleted Successfully",
    test("When deleting category successfully", async () => {
        request.params.id = "categoryId1";

        categoryModel.findByIdAndDelete.mockResolvedValue(true);

        await deleteCategoryCOntroller(request, response);

        expect(response.status).toHaveBeenCalledWith(200);
        expect(response.send).toHaveBeenCalledWith({
            success: true,
            message: "Category Deleted Successfully",
        });
    });

    // syntax error in "error while deleting category"
    test("When error occurs during category deletion", async () => {
        request.params.id = "999";

        const error = new Error("Deletion error");
        categoryModel.findByIdAndDelete.mockRejectedValue(error);

        await deleteCategoryCOntroller(request, response);

        expect(response.status).toHaveBeenCalledWith(500);
        expect(response.send).toHaveBeenCalledWith({
            success: false,
            message: "Error while deleting category",
            error: error
        });
    })
});
