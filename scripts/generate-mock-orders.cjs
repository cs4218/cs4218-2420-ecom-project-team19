const fs = require('fs');
const { ObjectId } = require('bson');
const { faker } = require('@faker-js/faker');

const statuses = ["Not Process", "Processing", "Shipped", "Delivered", "Cancelled"];

function generateOrder() {
  const productCount = faker.number.int({ min: 1, max: 5 });
  const products = Array.from({ length: productCount }, () => new ObjectId());

  return {
    _id: new ObjectId(),
    products,
    payment: {
      errors: {
        validationErrors: {},
        errorCollections: {}
      },
      params: {
        transaction: {
          amount: faker.commerce.price(),
          paymentMethodNonce: faker.string.alphanumeric(24),
          options: {
            submitForSettlement: "true"
          },
          type: "sale"
        }
      },
      message: "",
      success: true
    },
    buyer: new ObjectId(),
    status: faker.helpers.arrayElement(statuses),
    createdAt: new Date(),
    updatedAt: new Date(),
    __v: 0
  };
}

// Create JSON array
const NUM_ORDERS = 100000;
const orders = Array.from({ length: NUM_ORDERS }, generateOrder);

// Write to file
fs.writeFileSync('mock.orders.json', JSON.stringify(orders, null, 2));
console.log(`✅ Created ${NUM_ORDERS} mock orders in mock.orders.json`);
