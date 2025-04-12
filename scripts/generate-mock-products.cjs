const fs = require('fs');
const { faker } = require('@faker-js/faker');
const { ObjectId } = require('bson');

// ✅ Real category IDs from your test.categories.json
const categoryIds = [
  new ObjectId("66db427fdb0119d9234b27ed"), // Electronics
  new ObjectId("66db427fdb0119d9234b27ef"), // Book
  new ObjectId("66db427fdb0119d9234b27ee")  // Clothing
];

const NUM_PRODUCTS = 10000;
const products = [];

function generateProduct(index) {
  const name = faker.commerce.productName();
  const slug = faker.helpers.slugify(name.toLowerCase());
  const description = faker.commerce.productDescription();
  const price = parseFloat(faker.commerce.price({ min: 10, max: 500 }));
  const quantity = faker.number.int({ min: 1, max: 100 });
  const shipping = faker.datatype.boolean();
  const category = faker.helpers.arrayElement(categoryIds);

  return {
    _id: new ObjectId(),
    name,
    slug,
    description,
    price,
    category,
    quantity,
    photo: {
      data: undefined,
      contentType: 'image/jpeg'
    },
    shipping,
    createdAt: new Date(),
    updatedAt: new Date(),
    __v: 0
  };
}

for (let i = 0; i < NUM_PRODUCTS; i++) {
  products.push(generateProduct(i));
}

fs.writeFileSync('mock.products.json', JSON.stringify(products, null, 2));
console.log(`✅ Generated ${NUM_PRODUCTS} mock products in mock.products.json`);
