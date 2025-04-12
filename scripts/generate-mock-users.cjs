const fs = require('fs');
const bcrypt = require('bcrypt');
const { faker } = require('@faker-js/faker');
const { ObjectId } = require('bson');

const NUM_USERS = 10000; // change this for your desired volume
const users = [];

(async () => {
    const password = await bcrypt.hash('password123', 10);
  
    for (let i = 0; i < NUM_USERS; i++) {
      const user = await generateUser(i, password); // pass in pre-hashed password
      users.push(user);
    }
  
    fs.writeFileSync('mock.users.json', JSON.stringify(users, null, 2));
    console.log(`✅ Generated ${NUM_USERS} mock users in mock.users.json`);
  })();
  
  async function generateUser(index, hashedPassword) {
    const name = faker.person.fullName();
    const email = faker.internet.email(name.split(' ')[0], index);
    const phone = faker.phone.number();
    const address = faker.location.streetAddress();
    const answer = faker.word.noun();
    const role = Math.random() < 0.1 ? 1 : 0;
  
    return {
      _id: new ObjectId(),
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      answer,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      __v: 0
    };
  }
  
