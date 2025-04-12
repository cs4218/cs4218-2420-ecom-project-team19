# Volume Testing Guide

This guide explains how to perform volume testing for the e-commerce application using Apache JMeter and a seeded MongoDB database.

## Prerequisites

- MongoDB must be running and accessible (locally or remotely)
- Apache JMeter installed (version 5.6.3 or higher recommended)
- Application server (e.g., Express.js) should be running (default API port is 6060)

## Step 1: Seed the MongoDB Database

Use the following JSON files to populate your MongoDB database:

- `database1.categories.json`
- `database1.orders.json`
- `database1.products.json`
- `database1.users.json`

These files can be found under performance-tests/volume/assets

**Important:** If you want to use your own custom data or generate data using the scripts located in the `scripts` directory, make sure to update the `volume_test.jmx` file accordingly:

- **User Login**:  
  Ensure the "Body Data" in the "User Login" request contains valid `email` and `password` fields from your database.

- **Create an Order**:  
Ensure that the `name`, `_id`, and `price` fields used match products that actually exist in the `products` collection.

- **Filter Products by Category**:  
Ensure the `checked` field in the request body contains valid category `_id` values from the database.

## Step 2: Run volume_test.jmx in Apache JMeter

1. Open the `volume_test.jmx` file in Apache JMeter.
2. Click the green Start button to begin the test.

## Step 3: Ramp Up Volume Load

You can adjust the load settings in the Thread Group:

- Number of Threads (Users): 100 to 500
- Ramp-Up Period: 30 to 90 seconds
- Loop Count: 5 to 20

Adjust these values based on your machine’s capabilities and the desired volume.

## After Running the Test

You can monitor the system and gather metrics using the following listeners in JMeter:

- View Results Tree
- Aggregate Report
- Response Time Graph
- Summary Report

Use these to identify bottlenecks and evaluate performance under volume.
