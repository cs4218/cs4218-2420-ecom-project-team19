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

  it('should create a new product', async () => {
    await createProductController(request, response);

    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.send).toHaveBeenCalledWith({
      success: true,
      message: 'Product Created Successfully',
      products: mockedProductData
    });
  });

  it('should create a new product when no shipping is provided', async () => {
    request.fields.shipping = null;

    const mockedProductData = {
      name: 'product',
      slug: 'product',
      description: 'product description',
      price: 100,
      category: '123',
      quantity: 10,
      photo: {
        data: Buffer.from([1, 2, 3, 4]),
        contentType: 'image/jpeg',
      },
      shipping: false
    };

    productModel.prototype.save.mockResolvedValueOnce(mockedProductData);
    await createProductController(request, response);

    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.send).toHaveBeenCalledWith({
      success: true,
      message: 'Product Created Successfully',
      products: mockedProductData
    });
  });

  it('should throw an error when name is missing', async () => {
    request.fields.name = null;

    await createProductController(request, response);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.send).toHaveBeenCalledWith({ error: 'Name is Required' });
  });

  it('should throw an error when description is missing', async () => {
    request.fields.description = null;

    await createProductController(request, response);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.send).toHaveBeenCalledWith({
      error: 'Description is Required',
    });
  });

  it('should throw an error when price is missing', async () => {
    request.fields.price = null;

    await createProductController(request, response);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.send).toHaveBeenCalledWith({ error: 'Price is Required' });
  });

  it('should throw an error when category is missing', async () => {
    request.fields.category = null;

    await createProductController(request, response);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.send).toHaveBeenCalledWith({
      error: 'Category is Required',
    });
  });

  it('should throw an error when quantity is missing', async () => {
    request.fields.quantity = null;

    await createProductController(request, response);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.send).toHaveBeenCalledWith({
      error: 'Quantity is Required',
    });
  });

  it('should create a new product when photo is missing', async () => {
    request.files.photo = null;

    const mockedProductData = {
      name: 'product',
      slug: 'product',
      description: 'product description',
      price: 100,
      category: '123',
      quantity: 10,
      shipping: true,
    };

    productModel.prototype.save.mockResolvedValueOnce(mockedProductData);
    await createProductController(request, response);

    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.send).toHaveBeenCalledWith({
      success: true,
      message: 'Product Created Successfully',
      products: mockedProductData
    });
  });

  it('should create a new product when photo is small enough', async () => {
    request.files.photo.size = 1000;

    productModel.prototype.save.mockResolvedValueOnce(mockedProductData);
    await createProductController(request, response);

    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.send).toHaveBeenCalledWith({
      success: true,
      message: 'Product Created Successfully',
      products: mockedProductData
    });
  });

  it('should throw an error when photo is too large', async () => {
    request.files.photo.size = 1000001;

    await createProductController(request, response);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.send).toHaveBeenCalledWith({
      error: 'photo is Required and should be less then 1mb',
    });
  });

  it('should throw an error when an error is thrown', async () => {
    // Suppress all possible console outputs for the test
    const consoleLogMock = jest.spyOn(console, 'log').mockImplementation(() => { });

    const error = new Error('Error in creating product');

    productModel.prototype.save.mockRejectedValueOnce(error);
    await createProductController(request, response);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.send).toHaveBeenCalledWith({
      success: false,
      error: error,
      message: 'Error in creating product'
    });

    // Restore original console behavior after the test
    consoleLogMock.mockRestore();
  });
});

describe('getProductController', () => {
  const mockedProductQueryData = [mockedProductData];

  const mockedProductQuery = {
    populate: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    sort: jest.fn().mockResolvedValue(mockedProductQueryData),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    productModel.find.mockReturnValue(mockedProductQuery);
  });

  it('should get products', async () => {
    await getProductController({}, response);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.send).toHaveBeenCalledWith({
      success: true,
      counTotal: mockedProductQueryData.length,
      message: 'All Products',
      products: mockedProductQueryData
    });
  });

  it('should throw an error when an error is thrown', async () => {
    const consoleLogMock = jest.spyOn(console, 'log').mockImplementation(() => { });

    const error = new Error('Error in getting products');

    const mockedProductQuery = {
      populate: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockRejectedValue(error),
    };

    productModel.find.mockReturnValue(mockedProductQuery);
    await getProductController({}, response);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.send).toHaveBeenCalledWith({
      message: 'Error in getting products',
      success: false,
      error: error,
    });
    consoleLogMock.mockRestore();
  });
});

describe('getSingleProductController', () => {
  const mockedProductQueryData = mockedProductData;

  const mockedProductQuery = {
    findOne: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    populate: jest.fn().mockResolvedValue(mockedProductQueryData),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    productModel.findOne.mockReturnValue(mockedProductQuery);
  });

  it('should get a single product', async () => {
    await getSingleProductController({ params: { slug: 'product' } }, response);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.send).toHaveBeenCalledWith({
      success: true,
      message: 'Single Product Fetched',
      product: mockedProductQueryData,
    });
  });

  it('should throw an error if an error is thrown', async () => {
    const consoleLogMock = jest.spyOn(console, 'log').mockImplementation(() => { });

    const error = new Error('Error while getting single product');

    const mockedProductQuery = {
      findOne: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockRejectedValue(error),
    };

    productModel.findOne.mockReturnValue(mockedProductQuery);
    await getSingleProductController({ params: { slug: 'product' } }, response);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.send).toHaveBeenCalledWith({
      success: false,
      message: 'Error while getting single product',
      error: error
    });
    consoleLogMock.mockRestore();
  });
});

describe('productPhotoController', () => {
  const mockedProductQueryData = {
    photo: {
      data: Buffer.from([1, 2, 3, 4]),
      contentType: 'image/jpeg',
    },
  };

  const mockedProductQuery = {
    findById: jest.fn().mockReturnThis(),
    select: jest.fn().mockResolvedValue(mockedProductQueryData),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    productModel.findById.mockReturnValue(mockedProductQuery);
  });

  it('should retrieve a product photo', async () => {
    await productPhotoController({ params: { pid: '123' } }, response);

    expect(response.set).toHaveBeenCalledWith('Content-type', 'image/jpeg');
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.send).toHaveBeenCalledWith(
      mockedProductQueryData.photo.data
    );
  });

  it('should throw an error if an error is thrown', async () => {
    const consoleLogMock = jest.spyOn(console, 'log').mockImplementation(() => { });

    const error = new Error('Error while getting photo');

    const mockedProductQuery = {
      findById: jest.fn().mockReturnThis(),
      select: jest.fn().mockRejectedValue(error),
    };

    productModel.findById.mockReturnValue(mockedProductQuery);
    await productPhotoController({ params: { pid: '123' } }, response);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.send).toHaveBeenCalledWith({
      success: false,
      message: 'Error while getting photo',
      error: error,
    });

    consoleLogMock.mockRestore();
  });
});

describe('deleteProductController', () => {
  const mockedProductQuery = {
    findByIdAndDelete: jest.fn().mockReturnThis(),
    select: jest.fn().mockResolvedValue({}),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    productModel.findByIdAndDelete.mockReturnValue(mockedProductQuery);
  });

  it('should delete a product', async () => {
    await deleteProductController({ params: { pid: '123' } }, response);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.send).toHaveBeenCalledWith({
      success: true,
      message: 'Product Deleted successfully',
    });
  });

  it('should throw an error if an error is thrown', async () => {
    const consoleLogMock = jest.spyOn(console, 'log').mockImplementation(() => { });

    const error = new Error('Error while deleting product');

    const mockedProductQuery = {
      findByIdAndDelete: jest.fn().mockReturnThis(),
      select: jest.fn((...args) => {
        throw error;
      }),
    };

    productModel.findByIdAndDelete.mockReturnValue(mockedProductQuery);
    await deleteProductController({ params: { pid: '123' } }, response);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.send).toHaveBeenCalledWith({
      success: false,
      message: 'Error while deleting product',
      error: error
    });

    consoleLogMock.mockRestore();
  });
});

describe('updateProductController', () => {
  let request;

  beforeEach(() => {
    jest.clearAllMocks();

    const mockedProductQuery = {
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

  it('should update a product', async () => {
    await updateProductController(request, response);

    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.send).toHaveBeenCalledWith({
      success: true,
      message: 'Product Updated Successfully',
      products: mockedProductData
    });
  });

  it('should update a product with no shipping', async () => {
    request.fields.shipping = null;

    const mockedProductData = {
      name: 'product',
      slug: 'product',
      description: 'product description',
      price: 100,
      category: '123',
      quantity: 1000,
      photo: {
        data: Buffer.from([1, 2, 3, 4]),
        contentType: 'image/jpeg',
      },
    };

    const mockedProductQuery = {
      findByIdAndUpdate: jest.fn().mockResolvedValue(mockedProductData),
      save: jest.fn().mockResolvedValue(mockedProductData),
    };

    productModel.findByIdAndUpdate.mockResolvedValueOnce(mockedProductQuery);
    productModel.prototype.save.mockResolvedValueOnce(mockedProductData);
    await updateProductController(request, response);

    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.send).toHaveBeenCalledWith({
      success: true,
      message: 'Product Updated Successfully',
      products: mockedProductData
    });
  });

  it('should throw an error when name is missing', async () => {
    request.fields.name = null;

    await updateProductController(request, response);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.send).toHaveBeenCalledWith({ error: 'Name is Required' });
  });

  it('should throw an error when description is missing', async () => {
    request.fields.description = null;

    await updateProductController(request, response);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.send).toHaveBeenCalledWith({
      error: 'Description is Required',
    });
  });

  it('should throw an error when price is missing', async () => {
    request.fields.price = null;

    await updateProductController(request, response);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.send).toHaveBeenCalledWith({ error: 'Price is Required' });
  });

  it('should throw an error when category is missing', async () => {
    request.fields.category = null;

    await updateProductController(request, response);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.send).toHaveBeenCalledWith({
      error: 'Category is Required',
    });
  });

  it('should throw an error when quantity is missing', async () => {
    request.fields.quantity = null;

    await updateProductController(request, response);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.send).toHaveBeenCalledWith({
      error: 'Quantity is Required',
    });
  });

  it('should update a product when photo is missing', async () => {
    request.files.photo = null;

    const mockedProductData = {
      pid: '123',
      name: 'product',
      slug: 'product',
      description: 'product description',
      price: 100,
      category: '123',
      quantity: 10,
      shipping: true,
    };

    const mockedProductQuery = {
      findByIdAndUpdate: jest.fn().mockResolvedValue(mockedProductData),
      save: jest.fn().mockResolvedValue(mockedProductData),
    };

    productModel.findByIdAndUpdate.mockResolvedValueOnce(mockedProductQuery);
    productModel.prototype.save.mockResolvedValueOnce(mockedProductData);
    await updateProductController(request, response);

    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.send).toHaveBeenCalledWith({
      message: 'Product Updated Successfully',
      products: mockedProductData,
      success: true,
    });
  });

  it('should update a product when photo is small enough', async () => {
    request.files.photo.size = 1000;

    productModel.prototype.save.mockResolvedValueOnce(mockedProductData);
    await updateProductController(request, response);

    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.send).toHaveBeenCalledWith({
      message: 'Product Updated Successfully',
      products: mockedProductData,
      success: true,
    });
  });

  it('should update a product when photo is too large', async () => {
    request.files.photo.size = 1000001;

    await updateProductController(request, response);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.send).toHaveBeenCalledWith({
      error: 'photo is Required and should be less then 1mb',
    });
  });

  it('should throw an error when an error is thrown', async () => {
    const consoleLogMock = jest.spyOn(console, 'log').mockImplementation(() => { });

    const error = new Error('Error in Updating product');

    const mockedProductQuery = {
      findByIdAndUpdate: jest.fn().mockReturnThis(),
      save: jest.fn().mockRejectedValue(error),
    };

    productModel.findByIdAndUpdate.mockReturnValue(mockedProductQuery);
    await updateProductController(request, response);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.send).toHaveBeenCalledWith({
      message: 'Error in Updating product',
      success: false,
      error: error,
    });

    consoleLogMock.mockRestore();
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

  it('should filter available products', async () => {
    await productFiltersController(request, response);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.send).toHaveBeenCalledWith({
      success: true,
      products: mockedProductQueryData,
    });
  });

  it('should still filter if checked is missing', async () => {
    request.body.checked = [];

    await productFiltersController(request, response);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.send).toHaveBeenCalledWith({
      success: true,
      products: mockedProductQueryData,
    });
  });

  it('should still filter if radio is missing', async () => {
    request.body.radio = [];

    await productFiltersController(request, response);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.send).toHaveBeenCalledWith({
      success: true,
      products: mockedProductQueryData,
    });
  });

  it('should throw an error when an error is thrown', async () => {
    const consoleLogMock = jest.spyOn(console, 'log').mockImplementation(() => { });

    const error = new Error('Error while filtering products');

    productModel.find.mockRejectedValueOnce(error);
    await productFiltersController(request, response);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.send).toHaveBeenCalledWith({
      success: false,
      message: 'Error while Filtering Products',
      error: error
    });

    consoleLogMock.mockRestore();
  });
});

describe('productCountController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get count of specified products', async () => {
    const mockedProductQuery = {
      find: jest.fn().mockReturnThis(),
      estimatedDocumentCount: jest.fn().mockResolvedValue(10),
    };

    productModel.find.mockReturnValue(mockedProductQuery);

    await productCountController({}, response);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.send).toHaveBeenCalledWith({
      success: true,
      total: 10,
    });
  });

  it('should throw an error when an error is thrown', async () => {
    const consoleLogMock = jest.spyOn(console, 'log').mockImplementation(() => { });

    const error = new Error('Error in product count');

    const mockedProductQuery = {
      find: jest.fn().mockReturnThis(),
      estimatedDocumentCount: jest.fn().mockRejectedValue(error),
    };

    productModel.find.mockReturnValue(mockedProductQuery);

    await productCountController({}, response);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.send).toHaveBeenCalledWith({
      message: 'Error in product count',
      error: error,
      success: false
    });

    consoleLogMock.mockRestore();
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
  });

  it('should list all products on a page with page specified', async () => {
    productModel.find.mockReturnValue(mockedProductQuery);

    await productListController({ params: { page: 1 } }, response);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.send).toHaveBeenCalledWith({
      success: true,
      products: [mockedProductData],
    });
  });

  it('should list all products on a page with no page specified', async () => {
    productModel.find.mockReturnValue(mockedProductQuery);

    await productListController({ params: {} }, response);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.send).toHaveBeenCalledWith({
      success: true,
      products: [mockedProductData],
    });
  });

  it('should throw an error when an error is thrown', async () => {
    const consoleLogMock = jest.spyOn(console, 'log').mockImplementation(() => { });

    const error = new Error('Error in per page controller');

    mockedProductQuery.sort = jest.fn().mockRejectedValue(error);

    productModel.find.mockReturnValue(mockedProductQuery);

    await productListController({ params: { page: 1 } }, response);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.send).toHaveBeenCalledWith({
      success: false,
      message: 'Error in per page controller',
      error: error,
    });

    consoleLogMock.mockRestore();
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

  it('should retrieve queried product', async () => {
    const request = {
      params: {
        keyword: 'product',
      },
    };

    await searchProductController(request, response);

    expect(response.json).toHaveBeenCalledWith(mockedProductQueryData);
  });

  it('should throw an error when an error is thrown', async () => {
    const request = {
      params: {
        keyword: 'product',
      },
    };

    const consoleLogMock = jest.spyOn(console, 'log').mockImplementation(() => { });

    const error = new Error('Error In Search Product API');

    mockedProductQuery.select = jest.fn().mockRejectedValue(error);

    await searchProductController(request, response);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.send).toHaveBeenCalledWith({
      success: false,
      message: 'Error In Search Product API',
      error: error,
    });

    consoleLogMock.mockRestore();
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

  it('should retrieve all related products', async () => {
    const request = {
      params: {
        pid: '123',
        cid: '123',
      },
    };

    await relatedProductController(request, response);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.send).toHaveBeenCalledWith({
      success: true,
      products: mockedProductQueryData,
    });
  });

  it('should throw an error when an error is thrown', async () => {
    const consoleLogMock = jest.spyOn(console, 'log').mockImplementation(() => { });

    const error = new Error('Error while geting related product');
    const request = {
      params: {
        pid: '123',
        cid: '123',
      },
    };

    mockedProductQuery.populate = jest.fn().mockRejectedValue(error);

    await relatedProductController(request, response);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.send).toHaveBeenCalledWith({
      success: false,
      message: 'Error while geting related product',
      error: error,
    });

    consoleLogMock.mockRestore();
  });
});

describe('productCategoryController', () => {
  let request;

  beforeEach(() => {
    request = {
      params: {
        slug: 'product',
      },
    };

    jest.clearAllMocks();
  });

  it('should return category of the requested item', async () => {
    const productModelQuery = {
      find: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue([mockedProductData]),
    };
    const categoryModelQueryData = { name: 'category', slug: 'products' };

    categoryModel.findOne.mockResolvedValue(categoryModelQueryData);
    productModel.find.mockReturnValue(productModelQuery);

    await productCategoryController(request, response);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.send).toHaveBeenCalledWith({
      success: true,
      category: categoryModelQueryData,
      products: [mockedProductData],
    });
  });

  it('should throw an error when an error is thrown', async () => {
    const consoleLogMock = jest.spyOn(console, 'log').mockImplementation(() => { });

    const error = new Error('Error While Getting products');

    categoryModel.findOne.mockRejectedValue(error);
    await productCategoryController(request, response);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.send).toHaveBeenCalledWith({
      success: false,
      error: error,
      message: 'Error While Getting products',
    });

    consoleLogMock.mockRestore();
  });
});

describe('braintreeTokenController', () => {
  let request;

  beforeEach(() => {
    jest.clearAllMocks();

    request = {};
  });

  it('should obtain braintree controller token', async () => {
    gateway.clientToken.generate.mockImplementationOnce((_, callback) => {
      callback(null, token);
    });

    await braintreeTokenController(request, response);

    expect(response.send).toHaveBeenCalledWith(token);
  });

  it('should throw an error when an error is thrown', async () => {
    const error = new Error('Error while getting token');

    gateway.clientToken.generate.mockImplementationOnce((_, callback) => {
      callback(error, null);
    });

    await braintreeTokenController(request, response);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.send).toHaveBeenCalledWith(error);
  });

  it('should trigger a console log when generate() throws an error', async () => {
    const error = new Error('Error while getting token');
    const log = jest.spyOn(console, 'log').mockImplementationOnce(() => { });

    gateway.clientToken.generate.mockImplementationOnce((_, callback) => {
      throw error;
    });

    await braintreeTokenController(request, response);

    expect(log).toBeCalledWith(error);
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

  it('should be able to make payment', async () => {
    gateway.transaction.sale.mockImplementationOnce((_, callback) => {
      callback(null, txnSuccess);
    });

    await brainTreePaymentController(request, response);

    expect(response.json).toHaveBeenCalledWith({ ok: true });
  });

  it('should throw an error when an error is thrown', async () => {
    const error = new Error('Error while getting token');

    gateway.transaction.sale.mockImplementationOnce((_, callback) => {
      callback(error, null);
    });

    await brainTreePaymentController(request, response);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.send).toHaveBeenCalledWith(error);
  });

  it('should trigger a console log when sale() throws an error', async () => {
    const error = new Error('Error while getting token');
    const log = jest.spyOn(console, 'log').mockImplementationOnce(() => { });

    gateway.transaction.sale.mockImplementationOnce((_, callback) => {
      throw error;
    });

    await brainTreePaymentController(request, response);

    expect(log).toBeCalledWith(error);
  });
});