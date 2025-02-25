import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import orderModel from "../models/orderModel.js";

import fs from "fs";
import braintree from "braintree";

import {
  createProductController,
  deleteProductController,
  getProductController,
  getSingleProductController,
  productPhotoController,
  updateProductController,
  productFiltersController,
  productCountController,
  productListController,
  searchProductController,
  relatedProductController,
  productCategoryController,
  braintreeTokenController,
  brainTreePaymentController,
} from './productController';

const token = { token: 'token' };
const txnSuccess = { success: true };

jest.mock('../models/productModel');
jest.mock('../models/categoryModel');
jest.mock('../models/orderModel');

jest.mock('fs');
jest.mock('slugify', () => {
  return jest.fn().mockReturnValue('product');
});
jest.mock('braintree', () => ({
  BraintreeGateway: jest.fn(() => {
    return {
      clientToken: {
        generate: jest.fn(),
      },
      transaction: {
        sale: jest.fn(),
      },
    };
  }),
  Environment: {
    Sandbox: 'Sandbox',
  },
}));

const gateway = braintree.BraintreeGateway.mock.results[0].value;

let response = {
  status: jest.fn().mockReturnThis(),
  send: jest.fn(),
  set: jest.fn().mockReturnThis(),
  json: jest.fn(),
};

let mockedProductData = {
  name: 'product',
  slug: 'product',
  description: 'product description',
  price: 100,
  category: '123',
  quantity: 10,
  photo: {
    data: Buffer.from([1, 2, 3, 4]),
    contentType: 'image/png',
  },
  shipping: true,
};

describe('createProductController', () => {
  let request;

  beforeEach(() => {
    jest.clearAllMocks();

    request = {
      fields: {
        name: 'product',
        description: 'product description',
        price: 100,
        category: '123',
        quantity: 10,
        shipping: true,
      },
      files: {
        photo: {
          size: 32,
          path: '/public/images/photo.jpeg',
          name: 'photo.jpeg',
          type: 'image/jpeg',
        },
      },
    };

    fs.readFileSync.mockReturnValue(Buffer.from([1, 2, 3, 4]));
    productModel.prototype.save.mockResolvedValue(mockedProductData);
  });

  const testCases = [
    {
      description: 'should create a new product',
      modifyRequest: (req) => req,
      expectedStatus: 201,
      expectedResponse: {
        success: true,
        message: 'Product Created Successfully',
        products: mockedProductData,
      },
    },
    {
      description: 'should create a new product when no shipping is provided',
      modifyRequest: (req) => {
        req.fields.shipping = null;
        return req;
      },
      expectedStatus: 201,
      expectedResponse: {
        success: true,
        message: 'Product Created Successfully',
        products: mockedProductData,
      },
    },
    {
      description: 'should throw an error when name is missing',
      modifyRequest: (req) => {
        req.fields.name = null;
        return req;
      },
      expectedStatus: 500,
      expectedResponse: { error: 'Name is Required' },
    },
    {
      description: 'should throw an error when description is missing',
      modifyRequest: (req) => {
        req.fields.description = null;
        return req;
      },
      expectedStatus: 500,
      expectedResponse: { error: 'Description is Required' },
    },
    {
      description: 'should throw an error when price is missing',
      modifyRequest: (req) => {
        req.fields.price = null;
        return req;
      },
      expectedStatus: 500,
      expectedResponse: { error: 'Price is Required' },
    },
    {
      description: 'should throw an error when category is missing',
      modifyRequest: (req) => {
        req.fields.category = null;
        return req;
      },
      expectedStatus: 500,
      expectedResponse: { error: 'Category is Required' },
    },
    {
      description: 'should throw an error when quantity is missing',
      modifyRequest: (req) => {
        req.fields.quantity = null;
        return req;
      },
      expectedStatus: 500,
      expectedResponse: { error: 'Quantity is Required' },
    },
    {
      description: 'should create a new product when photo is missing',
      modifyRequest: (req) => {
        req.files.photo = null;
        return req;
      },
      expectedStatus: 201,
      expectedResponse: {
        success: true,
        message: 'Product Created Successfully',
        products: mockedProductData,
      },
    },
    {
      description: 'should create a new product when photo is small enough',
      modifyRequest: (req) => {
        req.files.photo.size = 1000;
        return req;
      },
      expectedStatus: 201,
      expectedResponse: {
        success: true,
        message: 'Product Created Successfully',
        products: mockedProductData,
      },
    },
    {
      description: 'should throw an error when photo is too large',
      modifyRequest: (req) => {
        req.files.photo.size = 1000001;
        return req;
      },
      expectedStatus: 500,
      expectedResponse: {
        error: 'photo is Required and should be less then 1mb',
      },
    },
    {
      description: 'should throw an error when an error is thrown',
      modifyRequest: (req) => {
        productModel.prototype.save.mockRejectedValueOnce(new Error('Error in creating product'));
        return req;
      },
      expectedStatus: 500,
      expectedResponse: {
        success: false,
        error: new Error('Error in creating product'),
        message: 'Error in creating product',
      },
    },
  ];

  testCases.forEach(({ description, modifyRequest, expectedStatus, expectedResponse }) => {
    it(description, async () => {
      let consoleErrorMock;
      let consoleLogMock;

      // Suppress errors only for the specific test case
      if (description === 'should throw an error when an error is thrown') {
        consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => { });
        consoleLogMock = jest.spyOn(console, 'log').mockImplementation(() => { });
      }

      await createProductController(modifyRequest(request), response);

      expect(response.status).toHaveBeenCalledWith(expectedStatus);
      expect(response.send).toHaveBeenCalledWith(expectedResponse);

      // Restore console.error and console.log after the test
      if (consoleErrorMock) {
        consoleErrorMock.mockRestore();
      }
      if (consoleLogMock) {
        consoleLogMock.mockRestore();
      }
    });
  });

});

describe('getProductController', () => {
  const mockedProductQueryData = [mockedProductData];

  let mockedProductQuery;

  beforeEach(() => {
    jest.clearAllMocks();

    mockedProductQuery = {
      populate: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(mockedProductQueryData),
    };

    productModel.find.mockReturnValue(mockedProductQuery);
  });

  const testCases = [
    {
      description: 'should get products',
      modifyMock: () => { }, // No modification needed
      expectedStatus: 200,
      expectedResponse: {
        success: true,
        counTotal: mockedProductQueryData.length,
        message: 'All Products',
        products: mockedProductQueryData,
      },
    },
    {
      description: 'should throw an error when an error is thrown',
      modifyMock: () => {
        mockedProductQuery.sort.mockRejectedValueOnce(new Error('Error in getting products'));
      },
      expectedStatus: 500,
      expectedResponse: {
        message: 'Error in getting products',
        success: false,
        error: new Error('Error in getting products'),
      },
    },
  ];

  testCases.forEach(({ description, modifyMock, expectedStatus, expectedResponse }) => {
    it(description, async () => {
      let consoleErrorMock;
      let consoleLogMock;

      // Suppress errors only for the specific test case
      if (description === 'should throw an error when an error is thrown') {
        consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => { });
        consoleLogMock = jest.spyOn(console, 'log').mockImplementation(() => { });
      }

      modifyMock(); // Apply modifications to mocks

      await getProductController({}, response);

      expect(response.status).toHaveBeenCalledWith(expectedStatus);
      expect(response.send).toHaveBeenCalledWith(expectedResponse);

      // Restore console.error and console.log after the test
      if (consoleErrorMock) {
        consoleErrorMock.mockRestore();
      }
      if (consoleLogMock) {
        consoleLogMock.mockRestore();
      }
    });
  });
});

describe('getSingleProductController', () => {
  const mockedProductQueryData = mockedProductData;
  let mockedProductQuery;

  beforeEach(() => {
    jest.clearAllMocks();

    mockedProductQuery = {
      findOne: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue(mockedProductQueryData),
    };

    productModel.findOne.mockReturnValue(mockedProductQuery);
  });

  const testCases = [
    {
      description: 'should get a single product',
      modifyMock: () => { }, // No modification needed
      requestParams: { params: { slug: 'product' } },
      expectedStatus: 200,
      expectedResponse: {
        success: true,
        message: 'Single Product Fetched',
        product: mockedProductQueryData,
      },
    },
    {
      description: 'should throw an error if an error is thrown',
      modifyMock: () => {
        mockedProductQuery.populate.mockRejectedValueOnce(new Error('Error while getting single product'));
      },
      requestParams: { params: { slug: 'product' } },
      expectedStatus: 500,
      expectedResponse: {
        success: false,
        message: 'Error while getting single product',
        error: new Error('Error while getting single product'),
      },
    },
  ];

  testCases.forEach(({ description, modifyMock, requestParams, expectedStatus, expectedResponse }) => {
    it(description, async () => {
      let consoleErrorMock;
      let consoleLogMock;

      // Suppress errors only for the error test case
      if (description === 'should throw an error if an error is thrown') {
        consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => { });
        consoleLogMock = jest.spyOn(console, 'log').mockImplementation(() => { });
      }

      modifyMock(); // Apply mock modifications

      await getSingleProductController(requestParams, response);

      expect(response.status).toHaveBeenCalledWith(expectedStatus);
      expect(response.send).toHaveBeenCalledWith(expectedResponse);

      // Restore console.error and console.log after the test
      if (consoleErrorMock) {
        consoleErrorMock.mockRestore();
      }
      if (consoleLogMock) {
        consoleLogMock.mockRestore();
      }
    });
  });
});

describe('productPhotoController', () => {
  const mockedProductQueryData = {
    photo: {
      data: Buffer.from([1, 2, 3, 4]),
      contentType: 'image/jpeg',
    },
  };

  let mockedProductQuery;

  beforeEach(() => {
    jest.clearAllMocks();

    mockedProductQuery = {
      findById: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue(mockedProductQueryData),
    };

    productModel.findById.mockReturnValue(mockedProductQuery);
  });

  const testCases = [
    {
      description: 'should retrieve a product photo',
      modifyMock: () => { }, // No modification needed
      requestParams: { params: { pid: '123' } },
      expectedStatus: 200,
      expectedHeaders: { 'Content-type': 'image/jpeg' },
      expectedResponse: mockedProductQueryData.photo.data,
    },
    {
      description: 'should throw an error if an error is thrown',
      modifyMock: () => {
        mockedProductQuery.select.mockRejectedValueOnce(new Error('Error while getting photo'));
      },
      requestParams: { params: { pid: '123' } },
      expectedStatus: 500,
      expectedResponse: {
        success: false,
        message: 'Error while getting photo',
        error: new Error('Error while getting photo'),
      },
    },
  ];

  testCases.forEach(({ description, modifyMock, requestParams, expectedStatus, expectedHeaders, expectedResponse }) => {
    it(description, async () => {
      let consoleErrorMock;
      let consoleLogMock;

      // Suppress errors only for the error test case
      if (description === 'should throw an error if an error is thrown') {
        consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => { });
        consoleLogMock = jest.spyOn(console, 'log').mockImplementation(() => { });
      }

      modifyMock(); // Apply mock modifications

      await productPhotoController(requestParams, response);

      if (expectedHeaders) {
        expect(response.set).toHaveBeenCalledWith('Content-type', expectedHeaders['Content-type']);
      }
      expect(response.status).toHaveBeenCalledWith(expectedStatus);
      expect(response.send).toHaveBeenCalledWith(expectedResponse);

      // Restore console.error and console.log after the test
      if (consoleErrorMock) {
        consoleErrorMock.mockRestore();
      }
      if (consoleLogMock) {
        consoleLogMock.mockRestore();
      }
    });
  });
});

describe('deleteProductController', () => {
  let mockedProductQuery;

  beforeEach(() => {
    jest.clearAllMocks();

    mockedProductQuery = {
      findByIdAndDelete: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({}),
    };

    productModel.findByIdAndDelete.mockReturnValue(mockedProductQuery);
  });

  const testCases = [
    {
      description: 'should delete a product',
      modifyMock: () => { }, // No modification needed
      requestParams: { params: { pid: '123' } },
      expectedStatus: 200,
      expectedResponse: {
        success: true,
        message: 'Product Deleted successfully',
      },
    },
    {
      description: 'should throw an error if an error is thrown',
      modifyMock: () => {
        mockedProductQuery.select.mockRejectedValueOnce(new Error('Error while deleting product'));
      },
      requestParams: { params: { pid: '123' } },
      expectedStatus: 500,
      expectedResponse: {
        success: false,
        message: 'Error while deleting product',
        error: new Error('Error while deleting product'),
      },
    },
  ];

  testCases.forEach(({ description, modifyMock, requestParams, expectedStatus, expectedResponse }) => {
    it(description, async () => {
      let consoleErrorMock;
      let consoleLogMock;

      // Suppress errors only for the error test case
      if (description === 'should throw an error if an error is thrown') {
        consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => { });
        consoleLogMock = jest.spyOn(console, 'log').mockImplementation(() => { });
      }

      modifyMock(); // Apply mock modifications

      await deleteProductController(requestParams, response);

      expect(response.status).toHaveBeenCalledWith(expectedStatus);
      expect(response.send).toHaveBeenCalledWith(expectedResponse);

      // Restore console.error and console.log after the test
      if (consoleErrorMock) {
        consoleErrorMock.mockRestore();
      }
      if (consoleLogMock) {
        consoleLogMock.mockRestore();
      }
    });
  });
});

describe('updateProductController', () => {
  let request;
  let mockedProductQuery;

  beforeEach(() => {
    jest.clearAllMocks();

    mockedProductQuery = {
      findByIdAndUpdate: jest.fn().mockResolvedValue(mockedProductData),
      save: jest.fn().mockResolvedValue(mockedProductData),
    };

    productModel.findByIdAndUpdate.mockReturnValue(mockedProductQuery);

    request = {
      params: { pid: '123' },
      fields: {
        name: 'product',
        description: 'product description',
        price: 100,
        category: '123',
        quantity: 1000,
        shipping: true,
      },
      files: {
        photo: {
          size: 32,
          path: '/photo.jpeg',
          name: 'photo.jpeg',
          type: 'image/jpeg',
        },
      },
    };

    fs.readFileSync.mockReturnValue(Buffer.from([1, 2, 3, 4]));
    productModel.prototype.save.mockResolvedValue(mockedProductData);
  });

  const testCases = [
    {
      description: 'should update a product',
      modifyRequest: (req) => req,
      expectedStatus: 201,
      expectedResponse: {
        success: true,
        message: 'Product Updated Successfully',
        products: mockedProductData,
      },
    },
    {
      description: 'should update a product with no shipping',
      modifyRequest: (req) => {
        req.fields.shipping = null;
        return req;
      },
      expectedStatus: 201,
      expectedResponse: {
        success: true,
        message: 'Product Updated Successfully',
        products: mockedProductData,
      },
    },
    {
      description: 'should throw an error when name is missing',
      modifyRequest: (req) => {
        req.fields.name = null;
        return req;
      },
      expectedStatus: 500,
      expectedResponse: { error: 'Name is Required' },
    },
    {
      description: 'should throw an error when description is missing',
      modifyRequest: (req) => {
        req.fields.description = null;
        return req;
      },
      expectedStatus: 500,
      expectedResponse: { error: 'Description is Required' },
    },
    {
      description: 'should throw an error when price is missing',
      modifyRequest: (req) => {
        req.fields.price = null;
        return req;
      },
      expectedStatus: 500,
      expectedResponse: { error: 'Price is Required' },
    },
    {
      description: 'should throw an error when category is missing',
      modifyRequest: (req) => {
        req.fields.category = null;
        return req;
      },
      expectedStatus: 500,
      expectedResponse: { error: 'Category is Required' },
    },
    {
      description: 'should throw an error when quantity is missing',
      modifyRequest: (req) => {
        req.fields.quantity = null;
        return req;
      },
      expectedStatus: 500,
      expectedResponse: { error: 'Quantity is Required' },
    },
    {
      description: 'should update a product when photo is missing',
      modifyRequest: (req) => {
        req.files.photo = null;
        return req;
      },
      expectedStatus: 201,
      expectedResponse: {
        success: true,
        message: 'Product Updated Successfully',
        products: mockedProductData,
      },
    },
    {
      description: 'should update a product when photo is small enough',
      modifyRequest: (req) => {
        req.files.photo.size = 1000;
        return req;
      },
      expectedStatus: 201,
      expectedResponse: {
        success: true,
        message: 'Product Updated Successfully',
        products: mockedProductData,
      },
    },
    {
      description: 'should throw an error when photo is too large',
      modifyRequest: (req) => {
        req.files.photo.size = 1000001;
        return req;
      },
      expectedStatus: 500,
      expectedResponse: {
        error: 'photo is Required and should be less then 1mb',
      },
    },
    {
      description: 'should throw an error when an error is thrown',
      modifyRequest: (req) => {
        mockedProductQuery.save.mockRejectedValueOnce(new Error('Error in Updating product'));
        return req;
      },
      expectedStatus: 500,
      expectedResponse: {
        success: false,
        message: 'Error in Updating product',
        error: new Error('Error in Updating product'),
      },
    },
  ];

  testCases.forEach(({ description, modifyRequest, expectedStatus, expectedResponse }) => {
    it(description, async () => {
      let consoleErrorMock;
      let consoleLogMock;

      // Suppress errors only for the error test case
      if (description === 'should throw an error when an error is thrown') {
        consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => { });
        consoleLogMock = jest.spyOn(console, 'log').mockImplementation(() => { });
      }

      await updateProductController(modifyRequest(request), response);

      expect(response.status).toHaveBeenCalledWith(expectedStatus);
      expect(response.send).toHaveBeenCalledWith(expectedResponse);

      // Restore console.error and console.log after the test
      if (consoleErrorMock) {
        consoleErrorMock.mockRestore();
      }
      if (consoleLogMock) {
        consoleLogMock.mockRestore();
      }
    });
  });
});

describe('productFiltersController', () => {
  let request;
  const mockedProductQueryData = [mockedProductData];

  beforeEach(() => {
    jest.clearAllMocks();

    request = {
      body: {
        checked: ['category 1', 'category 2'],
        radio: [10, 20],
      },
    };

    productModel.find.mockResolvedValue(mockedProductQueryData);
  });

  const testCases = [
    {
      description: 'should filter available products',
      modifyRequest: (req) => req,
      expectedStatus: 200,
      expectedResponse: {
        success: true,
        products: mockedProductQueryData,
      },
    },
    {
      description: 'should still filter if checked is missing',
      modifyRequest: (req) => {
        req.body.checked = [];
        return req;
      },
      expectedStatus: 200,
      expectedResponse: {
        success: true,
        products: mockedProductQueryData,
      },
    },
    {
      description: 'should still filter if radio is missing',
      modifyRequest: (req) => {
        req.body.radio = [];
        return req;
      },
      expectedStatus: 200,
      expectedResponse: {
        success: true,
        products: mockedProductQueryData,
      },
    },
    {
      description: 'should throw an error when an error is thrown',
      modifyRequest: (req) => {
        productModel.find.mockRejectedValueOnce(new Error('Error while filtering products'));
        return req;
      },
      expectedStatus: 400,
      expectedResponse: {
        success: false,
        message: 'Error while Filtering Products',
        error: new Error('Error while filtering products'),
      },
    },
  ];

  testCases.forEach(({ description, modifyRequest, expectedStatus, expectedResponse }) => {
    it(description, async () => {
      let consoleErrorMock;
      let consoleLogMock;

      // Suppress errors only for the error test case
      if (description === 'should throw an error when an error is thrown') {
        consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => { });
        consoleLogMock = jest.spyOn(console, 'log').mockImplementation(() => { });
      }

      await productFiltersController(modifyRequest(request), response);

      expect(response.status).toHaveBeenCalledWith(expectedStatus);
      expect(response.send).toHaveBeenCalledWith(expectedResponse);

      // Restore console.error and console.log after the test
      if (consoleErrorMock) {
        consoleErrorMock.mockRestore();
      }
      if (consoleLogMock) {
        consoleLogMock.mockRestore();
      }
    });
  });
});

describe('productCountController', () => {
  let mockedProductQuery;

  beforeEach(() => {
    jest.clearAllMocks();

    mockedProductQuery = {
      find: jest.fn().mockReturnThis(),
      estimatedDocumentCount: jest.fn().mockResolvedValue(10),
    };

    productModel.find.mockReturnValue(mockedProductQuery);
  });

  const testCases = [
    {
      description: 'should get count of specified products',
      modifyMock: () => { }, // No modification needed
      expectedStatus: 200,
      expectedResponse: {
        success: true,
        total: 10,
      },
    },
    {
      description: 'should throw an error when an error is thrown',
      modifyMock: () => {
        mockedProductQuery.estimatedDocumentCount.mockRejectedValueOnce(new Error('Error in product count'));
      },
      expectedStatus: 400,
      expectedResponse: {
        message: 'Error in product count',
        error: new Error('Error in product count'),
        success: false,
      },
    },
  ];

  testCases.forEach(({ description, modifyMock, expectedStatus, expectedResponse }) => {
    it(description, async () => {
      let consoleErrorMock;
      let consoleLogMock;

      // Suppress errors only for the error test case
      if (description === 'should throw an error when an error is thrown') {
        consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => { });
        consoleLogMock = jest.spyOn(console, 'log').mockImplementation(() => { });
      }

      modifyMock(); // Apply mock modifications

      await productCountController({}, response);

      expect(response.status).toHaveBeenCalledWith(expectedStatus);
      expect(response.send).toHaveBeenCalledWith(expectedResponse);

      // Restore console.error and console.log after the test
      if (consoleErrorMock) {
        consoleErrorMock.mockRestore();
      }
      if (consoleLogMock) {
        consoleLogMock.mockRestore();
      }
    });
  });
});

describe('productListController', () => {
  let mockedProductQuery;

  beforeEach(() => {
    jest.clearAllMocks();

    mockedProductQuery = {
      find: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([mockedProductData]),
    };

    productModel.find.mockReturnValue(mockedProductQuery);
  });

  const testCases = [
    {
      description: 'should list all products on a page with page specified',
      modifyRequest: (req) => req,
      requestParams: { params: { page: 1 } },
      expectedStatus: 200,
      expectedResponse: {
        success: true,
        products: [mockedProductData],
      },
    },
    {
      description: 'should list all products on a page with no page specified',
      modifyRequest: (req) => req,
      requestParams: { params: {} },
      expectedStatus: 200,
      expectedResponse: {
        success: true,
        products: [mockedProductData],
      },
    },
    {
      description: 'should throw an error when an error is thrown',
      modifyRequest: (req) => {
        mockedProductQuery.sort.mockRejectedValueOnce(new Error('Error in per page controller'));
        return req;
      },
      requestParams: { params: { page: 1 } },
      expectedStatus: 400,
      expectedResponse: {
        success: false,
        message: 'Error in per page controller',
        error: new Error('Error in per page controller'),
      },
    },
  ];

  testCases.forEach(({ description, modifyRequest, requestParams, expectedStatus, expectedResponse }) => {
    it(description, async () => {
      let consoleErrorMock;
      let consoleLogMock;

      // Suppress errors only for the error test case
      if (description === 'should throw an error when an error is thrown') {
        consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => { });
        consoleLogMock = jest.spyOn(console, 'log').mockImplementation(() => { });
      }

      await productListController(modifyRequest(requestParams), response);

      expect(response.status).toHaveBeenCalledWith(expectedStatus);
      expect(response.send).toHaveBeenCalledWith(expectedResponse);

      // Restore console.error and console.log after the test
      if (consoleErrorMock) {
        consoleErrorMock.mockRestore();
      }
      if (consoleLogMock) {
        consoleLogMock.mockRestore();
      }
    });
  });
});

describe('searchProductController', () => {
  const mockedProductQueryData = [mockedProductData];
  let mockedProductQuery;

  beforeEach(() => {
    jest.clearAllMocks();

    mockedProductQuery = {
      find: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue(mockedProductQueryData),
    };

    productModel.find.mockReturnValue(mockedProductQuery);
  });

  const testCases = [
    {
      description: 'should retrieve queried product',
      modifyMock: () => { }, // No modification needed
      requestParams: { params: { keyword: 'product' } },
      expectedResponseType: 'json',
      expectedResponse: mockedProductQueryData,
    },
    {
      description: 'should throw an error when an error is thrown',
      modifyMock: () => {
        mockedProductQuery.select.mockRejectedValueOnce(new Error('Error In Search Product API'));
      },
      requestParams: { params: { keyword: 'product' } },
      expectedStatus: 400,
      expectedResponse: {
        success: false,
        message: 'Error In Search Product API',
        error: new Error('Error In Search Product API'),
      },
    },
  ];

  testCases.forEach(({ description, modifyMock, requestParams, expectedStatus, expectedResponse, expectedResponseType }) => {
    it(description, async () => {
      let consoleErrorMock;
      let consoleLogMock;

      // Suppress errors only for the error test case
      if (description === 'should throw an error when an error is thrown') {
        consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => { });
        consoleLogMock = jest.spyOn(console, 'log').mockImplementation(() => { });
      }

      modifyMock(); // Apply mock modifications

      await searchProductController(requestParams, response);

      if (expectedResponseType === 'json') {
        expect(response.json).toHaveBeenCalledWith(expectedResponse);
      } else {
        expect(response.status).toHaveBeenCalledWith(expectedStatus);
        expect(response.send).toHaveBeenCalledWith(expectedResponse);
      }

      // Restore console.error and console.log after the test
      if (consoleErrorMock) {
        consoleErrorMock.mockRestore();
      }
      if (consoleLogMock) {
        consoleLogMock.mockRestore();
      }
    });
  });
});

describe('relatedProductController', () => {
  const mockedProductQueryData = [mockedProductData];
  let mockedProductQuery;

  beforeEach(() => {
    jest.clearAllMocks();

    mockedProductQuery = {
      find: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue(mockedProductQueryData),
    };

    productModel.find.mockReturnValue(mockedProductQuery);
  });

  const testCases = [
    {
      description: 'should retrieve all related products',
      modifyMock: () => { }, // No modification needed
      requestParams: { params: { pid: '123', cid: '123' } },
      expectedStatus: 200,
      expectedResponse: {
        success: true,
        products: mockedProductQueryData,
      },
    },
    {
      description: 'should throw an error when an error is thrown',
      modifyMock: () => {
        mockedProductQuery.populate.mockRejectedValueOnce(new Error('Error while getting related product'));
      },
      requestParams: { params: { pid: '123', cid: '123' } },
      expectedStatus: 400,
      expectedResponse: {
        success: false,
        message: 'Error while getting related product',
        error: new Error('Error while getting related product'),
      },
    },
  ];

  testCases.forEach(({ description, modifyMock, requestParams, expectedStatus, expectedResponse }) => {
    it(description, async () => {
      let consoleErrorMock;
      let consoleLogMock;

      // Suppress errors only for the error test case
      if (description === 'should throw an error when an error is thrown') {
        consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => { });
        consoleLogMock = jest.spyOn(console, 'log').mockImplementation(() => { });
      }

      modifyMock(); // Apply mock modifications

      await relatedProductController(requestParams, response);

      expect(response.status).toHaveBeenCalledWith(expectedStatus);
      expect(response.send).toHaveBeenCalledWith(expectedResponse);

      // Restore console.error and console.log after the test
      if (consoleErrorMock) {
        consoleErrorMock.mockRestore();
      }
      if (consoleLogMock) {
        consoleLogMock.mockRestore();
      }
    });
  });
});

describe('productCategoryController', () => {
  let request;
  let productModelQuery;
  const categoryModelQueryData = { name: 'category', slug: 'products' };
  const mockedProductQueryData = [mockedProductData];

  beforeEach(() => {
    jest.clearAllMocks();

    request = {
      params: { slug: 'product' },
    };

    productModelQuery = {
      find: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue(mockedProductQueryData),
    };

    productModel.find.mockReturnValue(productModelQuery);
  });

  const testCases = [
    {
      description: 'should return category of the requested item',
      modifyMock: () => {
        categoryModel.findOne.mockResolvedValue(categoryModelQueryData);
      },
      expectedStatus: 200,
      expectedResponse: {
        success: true,
        category: categoryModelQueryData,
        products: mockedProductQueryData,
      },
    },
    {
      description: 'should throw an error when an error is thrown',
      modifyMock: () => {
        categoryModel.findOne.mockRejectedValueOnce(new Error('Error While Getting products'));
      },
      expectedStatus: 400,
      expectedResponse: {
        success: false,
        message: 'Error While Getting products',
        error: new Error('Error While Getting products'),
      },
    },
  ];

  testCases.forEach(({ description, modifyMock, expectedStatus, expectedResponse }) => {
    it(description, async () => {
      let consoleErrorMock;
      let consoleLogMock;

      // Suppress errors only for the error test case
      if (description === 'should throw an error when an error is thrown') {
        consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => { });
        consoleLogMock = jest.spyOn(console, 'log').mockImplementation(() => { });
      }

      modifyMock(); // Apply mock modifications

      await productCategoryController(request, response);

      expect(response.status).toHaveBeenCalledWith(expectedStatus);
      expect(response.send).toHaveBeenCalledWith(expectedResponse);

      // Restore console.error and console.log after the test
      if (consoleErrorMock) {
        consoleErrorMock.mockRestore();
      }
      if (consoleLogMock) {
        consoleLogMock.mockRestore();
      }
    });
  });
});

describe('braintreeTokenController', () => {
  let request;

  beforeEach(() => {
    jest.clearAllMocks();
    request = {};
  });

  const testCases = [
    {
      description: 'should obtain braintree controller token',
      modifyMock: () => {
        gateway.clientToken.generate.mockImplementationOnce((_, callback) => {
          callback(null, token);
        });
      },
      expectedResponse: token,
    },
    {
      description: 'should return error when an error occurs',
      modifyMock: () => {
        gateway.clientToken.generate.mockImplementationOnce((_, callback) => {
          callback(new Error('Error while getting token'), null);
        });
      },
      expectedStatus: 500,
      expectedResponse: new Error('Error while getting token'),
    },
    {
      description: 'should log an error when generate() throws an error',
      modifyMock: () => {
        gateway.clientToken.generate.mockImplementationOnce((_, callback) => {
          throw new Error('Error while getting token');
        });
      },
      expectConsoleLog: true,
    },
  ];

  testCases.forEach(({ description, modifyMock, expectedStatus, expectedResponse, expectConsoleLog }) => {
    it(description, async () => {
      let consoleLogMock;

      if (expectConsoleLog) {
        consoleLogMock = jest.spyOn(console, 'log').mockImplementation(() => { });
      }

      modifyMock();

      await braintreeTokenController(request, response);

      if (expectedStatus) {
        expect(response.status).toHaveBeenCalledWith(expectedStatus);
      }
      if (expectedResponse) {
        expect(response.send).toHaveBeenCalledWith(expectedResponse);
      }
      if (expectConsoleLog) {
        expect(consoleLogMock).toHaveBeenCalled();
        consoleLogMock.mockRestore();
      }
    });
  });
});

describe('brainTreePaymentController', () => {
  let request;

  beforeEach(() => {
    jest.clearAllMocks();

    request = {
      body: {
        nonce: 'nonce',
        cart: [mockedProductData],
      },
      user: {
        _id: '123',
      },
    };

    orderModel.prototype.save.mockResolvedValue(txnSuccess);
  });

  const testCases = [
    {
      description: 'should be able to make payment',
      modifyMock: () => {
        gateway.transaction.sale.mockImplementationOnce((_, callback) => {
          callback(null, txnSuccess);
        });
      },
      expectedResponseType: 'json',
      expectedResponse: { ok: true },
    },
    {
      description: 'should return error when an error occurs',
      modifyMock: () => {
        gateway.transaction.sale.mockImplementationOnce((_, callback) => {
          callback(new Error('Error while getting token'), null);
        });
      },
      expectedStatus: 500,
      expectedResponse: new Error('Error while getting token'),
    },
    {
      description: 'should log an error when sale() throws an error',
      modifyMock: () => {
        gateway.transaction.sale.mockImplementationOnce((_, callback) => {
          throw new Error('Error while getting token');
        });
      },
      expectConsoleLog: true,
    },
  ];

  testCases.forEach(({ description, modifyMock, expectedStatus, expectedResponse, expectedResponseType, expectConsoleLog }) => {
    it(description, async () => {
      let consoleLogMock;

      if (expectConsoleLog) {
        consoleLogMock = jest.spyOn(console, 'log').mockImplementation(() => { });
      }

      modifyMock();

      await brainTreePaymentController(request, response);

      if (expectedStatus) {
        expect(response.status).toHaveBeenCalledWith(expectedStatus);
      }
      if (expectedResponseType === 'json') {
        expect(response.json).toHaveBeenCalledWith(expectedResponse);
      } else if (expectedResponse) {
        expect(response.send).toHaveBeenCalledWith(expectedResponse);
      }
      if (expectConsoleLog) {
        expect(consoleLogMock).toHaveBeenCalled();
        consoleLogMock.mockRestore();
      }
    });
  });
});
