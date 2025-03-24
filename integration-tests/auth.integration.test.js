import request from 'supertest';
import mongoose from 'mongoose';
import app from './app';
import { MongoMemoryServer } from 'mongodb-memory-server';
import userModel from '../models/userModel';
import JWT from 'jsonwebtoken';

const user_details = {
  name: 'test',
  email: 'test@example.com',
  password: 'password',
  phone: '1234567890',
  address: '123 Main St',
  dob: '01/01/2000',
  answer: 'Soccer'
};

let jwtToken;
let mongoServer;

beforeAll(async () => {
  // Connect to the database
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  // Disconnect from the database

  await mongoose.disconnect();
  await mongoServer.stop();
});


describe('Authentication Module Backend', () => {

  beforeEach(async () => {
    // Check if MongoDB server is running
    if (mongoose.connection.readyState !== 1) {
      throw new Error('MongoDB server is not running');
    }

    // Delete the user if it exists
    await userModel.deleteOne({ email: user_details.email });
  });

  test('should register a new user', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(user_details);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('User registered successfully');

    // Check if the user is saved in the database
    const user = await userModel.findOne({ email: user_details.email });
    expect(user).not.toBeNull();
    expect(user.email).toBe(user_details.email);
  });

  test('should not register a user without an email', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        ...user_details,
        email: null,
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Email is required');
  });

  test('should not register a user without a password', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        ...user_details,
        password: null,
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Password is required');
  });

  test('should not register a user with an existing email', async () => {
    // Register the user first
    await request(app)
      .post('/api/v1/auth/register')
      .send(user_details);

    // Try to register the user again
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(user_details);

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('You are already registered, please login instead.');

    // Ensure that a duplicate user has not been added in the db
    const users = await userModel.find({ email: user_details.email });
    expect(users.length).toBe(1);
  });

  test('should login a registered user', async () => {
    // Register the user first
    await request(app)
      .post('/api/v1/auth/register')
      .send(user_details);

    // Login the user
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: user_details.email,
        password: user_details.password,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Login successful');
    expect(response.body.token).toBeDefined();
  });

  test('should not login a user with incorrect password', async () => {
    // Register the user first
    await request(app)
      .post('/api/v1/auth/register')
      .send(user_details);

    // Try to login with incorrect password
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: user_details.email,
        password: 'wrongpassword',
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Incorrect password');
  });

  test('should not login a non-existent user', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'password',
      });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('User not found');
  });

  test('should not login a user without an email', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: '',
        password: user_details.password,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Email and password are required');
  });

  test('should not login a user without a password', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: user_details.email,
        password: '',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Email and password are required');
  });

  test('should reset password successfully', async () => {
    // Register the user first
    await request(app)
      .post('/api/v1/auth/register')
      .send(user_details);

    // Reset password
    const response = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({
        email: user_details.email,
        answer: user_details.answer,
        newPassword: 'newpassword',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Password reset successfully');
  });

  test('should not reset password with incorrect answer', async () => {
    // Register the user first
    await request(app)
      .post('/api/v1/auth/register')
      .send(user_details);

    // Register the user first
    await request(app)
      .post('/api/v1/auth/register')
      .send(user_details);

    // Get the user before the action
    const userBefore = await userModel.findOne({ email: user_details.email });

    // Attempt to reset password with incorrect answer
    const response = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({
        email: user_details.email,
        answer: 'wronganswer',
        newPassword: 'newpassword',
      });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Invalid email or answer');

    // Get the user after the action
    const userAfter = await userModel.findOne({ email: user_details.email });
    expect(userBefore.password).toBe(userAfter.password);
  });

  test('should not reset password with missing required fields', async () => {
    const response = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({
        email: 'test@example.com',
        answer: '',
        newPassword: 'newpassword',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Answer is required');
  });

  test('should not reset password without email', async () => {
    const response = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({
        email: '',
        answer: user_details.answer,
        newPassword: 'newpassword',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Email is required');
  });

  test('should not reset password without answer', async () => {
    const response = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({
        email: user_details.email,
        answer: '',
        newPassword: 'newpassword',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Answer is required');
  });
});

describe('Authentication Middleware', () => {
  let token;
  let adminToken;

  beforeAll(async () => {
    // Register a regular user
    await request(app)
      .post('/api/v1/auth/register')
      .send(user_details);

    // Login the regular user to get the token
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: user_details.email,
        password: user_details.password,
      });

    token = loginResponse.body.token;

    // Register an admin user
    const adminDetails = {
      ...user_details,
      email: 'admin@example.com'
    };

    await request(app)
      .post('/api/v1/auth/register')
      .send(adminDetails);

    await userModel.updateOne({ email: adminDetails.email }, { role: 1 });

    // Login the admin user to get the token
    const adminLoginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: adminDetails.email,
        password: adminDetails.password,
      });

    adminToken = adminLoginResponse.body.token;
  });

  test('should allow access to protected route with valid token', async () => {
    const response = await request(app)
      .get('/api/v1/auth/user-auth')
      .set('Authorization', token);

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
  });

  test('should deny access to protected route without token', async () => {
    const response = await request(app)
      .get('/api/v1/auth/user-auth');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Token is required');
  });

  test('should allow access to admin route with valid admin token', async () => {
    const response = await request(app)
      .get('/api/v1/auth/admin-auth')
      .set('Authorization', adminToken);

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
  });

  test('should deny access to admin route with regular user token', async () => {
    const response = await request(app)
      .get('/api/v1/auth/admin-auth')
      .set('Authorization', token);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Unauthorized Access');
  });

  test('should deny access to admin route without token', async () => {
    const response = await request(app)
      .get('/api/v1/auth/admin-auth');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Token is required');
  });

  test('should deny access to protected route with invalid token', async () => {
    const response = await request(app)
      .get('/api/v1/auth/user-auth')
      .set('Authorization', 'invalidtoken');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Invalid or expired token');
  });

  test('should deny access to admin route with invalid token', async () => {
    const response = await request(app)
      .get('/api/v1/auth/admin-auth')
      .set('Authorization', 'invalidtoken');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Invalid or expired token');
  });
});