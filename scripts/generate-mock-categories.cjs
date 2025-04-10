const fs = require('fs');
const { faker } = require('@faker-js/faker');
const { ObjectId } = require('bson');

const NUM_CATEGORIES = 100;
const categories = new Set();

while (categories.size < NUM_CATEGORIES) {
  const name = faker.word.adjective() + ' ' + faker.word.noun();
  categories.add(name);
}

const output = Array.from(categories).map((name) => ({
  _id: new ObjectId(),
  name,
  slug: name.toLowerCase().replace(/\s+/g, '-'),
  __v: 0,
}));

fs.writeFileSync('mock.categories.json', JSON.stringify(output, null, 2));
console.log(`✅ Created ${NUM_CATEGORIES} mock categories in mock.categories.json`);
