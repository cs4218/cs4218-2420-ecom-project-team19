const fs = require('fs');

// Step 1: Read the mock order file
const raw = fs.readFileSync('mock.orders.json', 'utf8');
const orders = JSON.parse(raw);

// Step 2: Extract order IDs
const csv = orders
  .map(order => order._id?.$oid || order._id)  // Handle either BSON-like or plain ObjectId
  .filter(Boolean)
  .join('\n');

// Step 3: Write to CSV
fs.writeFileSync('orders.csv', csv);
console.log(`✅ Wrote ${csv.split('\n').length} order IDs to orders.csv`);
