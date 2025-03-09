import JWT from 'jsonwebtoken';
import mongoose from 'mongoose';
import userModel from '../models/userModel';
import orderModel from '../models/orderModel';
import { comparePassword, hashPassword } from './../helpers/authHelper';
import { registerController, loginController, forgotPasswordController, testController, updateProfileController, getOrdersController, getAllOrdersController, orderStatusController } from './authController';
import { beforeEach } from 'node:test';

jest.mock('../models/userModel');
jest.mock('../models/orderModel');
jest.mock('./../helpers/authHelper');
jest.mock('jsonwebtoken');

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => { });
    jest.spyOn(console, 'error').mockImplementation(() => { });
  });

  describe('registerController', () => {
    it('should return error if name is missing', async () => {
      const req = { body: { email: 'test@test.com', password: 'password', phone: '1234567890', address: 'address', answer: 'answer' } };
      const res = { send: jest.fn() };

      await registerController(req, res);

      expect(res.send).toHaveBeenCalledWith({ error: 'Name is Required' });
    });

    it('should return error if email is missing', async () => {
      const req = { body: { name: 'name', password: 'password', phone: '1234567890', address: 'address', answer: 'answer' } };
      const res = { send: jest.fn() };

      await registerController(req, res);

      expect(res.send).toHaveBeenCalledWith({ message: 'Email is Required' });
    });

    it('should return error if password is missing', async () => {
      const req = { body: { name: 'name', email: 'test@test.com', phone: '1234567890', address: 'address', answer: 'answer' } };
      const res = { send: jest.fn() };

      await registerController(req, res);

      expect(res.send).toHaveBeenCalledWith({ message: 'Password is Required' });
    });

    it('should return error if phone is missing', async () => {
      const req = { body: { name: 'name', email: 'test@test.com', password: 'password', address: 'address', answer: 'answer' } };
      const res = { send: jest.fn() };

      await registerController(req, res);

      expect(res.send).toHaveBeenCalledWith({ message: 'Phone no is Required' });
    });

    it('should return error if address is missing', async () => {
      const req = { body: { name: 'name', email: 'test@test.com', password: 'password', phone: '1234567890', answer: 'answer' } };
      const res = { send: jest.fn() };

      await registerController(req, res);

      expect(res.send).toHaveBeenCalledWith({ message: 'Address is Required' });
    });

    it('should return error if answer is missing', async () => {
      const req = { body: { name: 'name', email: 'test@test.com', password: 'password', phone: '1234567890', address: 'address' } };
      const res = { send: jest.fn() };

      await registerController(req, res);

      expect(res.send).toHaveBeenCalledWith({ message: 'Answer is Required' });
    });

    it('should return error if user already exists', async () => {
      const req = { body: { name: 'name', email: 'test@test.com', password: 'password', phone: '1234567890', address: 'address', answer: 'answer' } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

      userModel.findOne.mockResolvedValue({ email: 'test@test.com' });

      await registerController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: 'Already Register please login',
      });
    });

    it('should register user successfully', async () => {
      const req = { body: { name: 'name', email: 'test@test.com', password: 'password', phone: '1234567890', address: 'address', answer: 'answer' } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

      userModel.findOne.mockResolvedValue(null);
      hashPassword.mockResolvedValue('hashedPassword');
      userModel.prototype.save.mockResolvedValue({
        _id: 'userId',
        name: 'name',
        email: 'test@test.com',
        phone: '1234567890',
        address: 'address',
        password: 'hashedPassword',
        answer: 'answer',
      });

      await registerController(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: 'User Register Successfully',
        user: {
          _id: 'userId',
          name: 'name',
          email: 'test@test.com',
          phone: '1234567890',
          address: 'address',
          password: 'hashedPassword',
          answer: 'answer',
        },
      });
    });
  });

  describe('loginController', () => {
    it('should return error if email or password is missing', async () => {
      const req = { body: { email: '', password: '' } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

      await loginController(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({ success: false, message: 'Invalid email or password' });
    });

    // Add more tests for other validations and successful login
  });

  describe('forgotPasswordController', () => {
    it('should return error if email is missing', async () => {
      const req = { body: { answer: 'answer', newPassword: 'newPassword' } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

      await forgotPasswordController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ message: 'Emai is required' });
    });

    // Add more tests for other validations and successful password reset
  });

  describe('testController', () => {
    it('should return protected routes message', () => {
      const req = {};
      const res = { send: jest.fn() };

      testController(req, res);

      expect(res.send).toHaveBeenCalledWith('Protected Routes');
    });
  });

  describe('updateProfileController', () => {
    it('should return error if password is less than 6 characters', async () => {
      const req = { body: { password: '123' }, user: { _id: 'userId' } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

      await updateProfileController(req, res);

      expect(res.json).toHaveBeenCalledWith({ error: 'Passsword is required and 6 character long' });
    });

    // Add more tests for other validations and successful profile update
  });

  describe('getOrdersController', () => {
    it('should return orders for the user', async () => {
      const req = { user: { _id: 'userId' } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

      orderModel.find.mockImplementation(() => ({
        populate: () => ({
          populate: jest.fn().mockResolvedValue([{ orderId: 'order1' }]),
        })
      }));

      await getOrdersController(req, res);

      expect(res.json).toHaveBeenCalledWith([{ orderId: 'order1' }]);
    });

    // Add more tests for error handling
  });

  describe('getAllOrdersController', () => {
    it('should return all orders', async () => {
      const req = {};
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

      orderModel.find.mockImplementation(() => ({
        populate: () => ({
          populate: () => ({
            sort: jest.fn().mockResolvedValue([{ orderId: 'order1' }]),
          })
        })
      }));

      await getAllOrdersController(req, res);

      expect(res.json).toHaveBeenCalledWith([{ orderId: 'order1' }]);
    });

    // Add more tests for error handling
  });

  describe('orderStatusController', () => {
    it('should update order status', async () => {
      const req = { params: { orderId: 'orderId' }, body: { status: 'shipped' } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };
      orderModel.findByIdAndUpdate.mockResolvedValue({ orderId: 'orderId', status: 'shipped' });

      await orderStatusController(req, res);

      expect(res.json).toHaveBeenCalledWith({ orderId: 'orderId', status: 'shipped' });
    });

    // Add more tests for error handling
  });
});