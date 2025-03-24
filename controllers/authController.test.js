import JWT from 'jsonwebtoken';
import mongoose from 'mongoose';
import userModel from '../models/userModel';
import orderModel from '../models/orderModel';
import { comparePassword, hashPassword } from './../helpers/authHelper';
import { registerController, loginController, forgotPasswordController, testController, updateProfileController, getOrdersController, getAllOrdersController, orderStatusController } from './authController';

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
      const res = { send: jest.fn(), status: jest.fn().mockReturnThis() };

      await registerController(req, res);

      expect(res.send).toHaveBeenCalledWith({ error: 'Name is required' });
    });

    it('should return error if email is missing', async () => {
      const req = { body: { name: 'name', password: 'password', phone: '1234567890', address: 'address', answer: 'answer' } };
      const res = { send: jest.fn(), status: jest.fn().mockReturnThis() };

      await registerController(req, res);

      expect(res.send).toHaveBeenCalledWith({ error: 'Email is required' });
    });

    it('should return error if password is missing', async () => {
      const req = { body: { name: 'name', email: 'test@test.com', phone: '1234567890', address: 'address', answer: 'answer' } };
      const res = { send: jest.fn(), status: jest.fn().mockReturnThis() };

      await registerController(req, res);

      expect(res.send).toHaveBeenCalledWith({ error: 'Password is required' });
    });

    it('should return error if phone is missing', async () => {
      const req = { body: { name: 'name', email: 'test@test.com', password: 'password', address: 'address', answer: 'answer' } };
      const res = { send: jest.fn(), status: jest.fn().mockReturnThis() };

      await registerController(req, res);

      expect(res.send).toHaveBeenCalledWith({ error: 'Phone number is required' });
    });

    it('should return error if address is missing', async () => {
      const req = { body: { name: 'name', email: 'test@test.com', password: 'password', phone: '1234567890', answer: 'answer' } };
      const res = { send: jest.fn(), status: jest.fn().mockReturnThis() };

      await registerController(req, res);

      expect(res.send).toHaveBeenCalledWith({ error: 'Address is required' });
    });

    it('should return error if answer is missing', async () => {
      const req = { body: { name: 'name', email: 'test@test.com', password: 'password', phone: '1234567890', address: 'address' } };
      const res = { send: jest.fn(), status: jest.fn().mockReturnThis() };

      await registerController(req, res);

      expect(res.send).toHaveBeenCalledWith({ error: 'Answer is required' });
    });

    it('should return error if user already exists', async () => {
      const req = { body: { name: 'name', email: 'test@test.com', password: 'password', phone: '1234567890', address: 'address', answer: 'answer' } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

      userModel.findOne.mockResolvedValue({ email: 'test@test.com' });

      await registerController(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: 'You are already registered, please login instead.',
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
        message: 'User registered successfully',
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


    it('should handle errors gracefully', async () => {
      const req = { body: { name: 'name', email: 'test@test.com', password: 'password', phone: '1234567890', address: 'address', answer: 'answer' } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

      userModel.findOne.mockRejectedValue(new Error('Database error'));

      await registerController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: 'Error in registration',
        error: new Error('Database error'),
      });
    });
  });

  describe('loginController', () => {
    it('should return error if email or password is missing', async () => {
      const req = { body: { email: '', password: '' } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

      await loginController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ success: false, message: 'Email and password are required' });
    });

    it('should return error if user is not found', async () => {
      const req = { body: { email: 'test@test.com', password: 'password' } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

      userModel.findOne.mockResolvedValue(null);

      await loginController(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({ success: false, message: 'User not found' });
    });

    it('should return error if password does not match', async () => {
      const req = { body: { email: 'test@test.com', password: 'wrongPassword' } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

      userModel.findOne.mockResolvedValue({ email: 'test@test.com', password: 'hashedPassword' });
      comparePassword.mockResolvedValue(false);

      await loginController(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith({ success: false, message: 'Incorrect password' });
    });

    it('should login successfully', async () => {
      const req = { body: { email: 'test@test.com', password: 'password' } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

      userModel.findOne.mockResolvedValue({
        _id: 'userId',
        name: 'name',
        email: 'test@test.com',
        phone: '1234567890',
        address: 'address',
        password: 'hashedPassword',
        role: 'user',
      });
      comparePassword.mockResolvedValue(true);
      JWT.sign.mockResolvedValue('token');

      await loginController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: 'Login successful',
        user: {
          _id: 'userId',
          name: 'name',
          email: 'test@test.com',
          phone: '1234567890',
          address: 'address',
          role: 'user',
        },
        token: 'token',
      });
    });

    it('should handle errors gracefully', async () => {
      const req = { body: { email: 'test@test.com', password: 'password' } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

      userModel.findOne.mockRejectedValue(new Error('Database error'));

      await loginController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: 'An error occurred during login',
        error: new Error('Database error'),
      });
    });
  });

  describe('forgotPasswordController', () => {
    it('should return error if email is missing', async () => {
      const req = { body: { answer: 'answer', newPassword: 'newPassword' } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

      await forgotPasswordController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ error: 'Email is required' });
    });

    it('should return error if answer is missing', async () => {
      const req = { body: { email: 'test@test.com', newPassword: 'newPassword' } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

      await forgotPasswordController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ error: 'Answer is required' });
    });

    it('should return error if newPassword is missing', async () => {
      const req = { body: { email: 'test@test.com', answer: 'answer' } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

      await forgotPasswordController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ error: 'New password is required' });
    });

    it('should return error if user is not found', async () => {
      const req = { body: { email: 'test@test.com', answer: 'answer', newPassword: 'newPassword' } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

      userModel.findOne.mockResolvedValue(null);

      await forgotPasswordController(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid email or answer',
      });
    });

    it('should reset password successfully', async () => {
      const req = { body: { email: 'test@test.com', answer: 'answer', newPassword: 'newPassword' } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

      userModel.findOne.mockResolvedValue({ _id: 'userId', email: 'test@test.com', answer: 'answer' });
      hashPassword.mockResolvedValue('hashedPassword');
      userModel.findByIdAndUpdate.mockResolvedValue({});

      await forgotPasswordController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: 'Password reset successfully',
      });
    });

    it('should hash the password string before storing it', async () => {
      const req = { body: { email: 'test@test.com', answer: 'answer', newPassword: 'newPassword' } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

      userModel.findOne.mockResolvedValue({ _id: 'userId', email: 'test@test.com', answer: 'answer' });
      hashPassword.mockResolvedValue('hashedPassword');
      userModel.findByIdAndUpdate.mockResolvedValue({});

      await forgotPasswordController(req, res);

      expect(hashPassword).toHaveBeenCalledWith('newPassword');
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith('userId', { password: 'hashedPassword' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: 'Password reset successfully',
      });
    });

  });

  describe('testController', () => {
    it('should return protected routes message', () => {
      const req = {};
      const res = { send: jest.fn(), status: jest.fn().mockReturnThis() };

      testController(req, res);

      expect(res.send).toHaveBeenCalledWith('Protected route');
    });
  });

  describe('updateProfileController', () => {
    it('should return error if password is less than 6 characters', async () => {
      const req = { body: { password: '123' }, user: { _id: 'userId' } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

      await updateProfileController(req, res);

      expect(res.json).toHaveBeenCalledWith({ error: 'Password must be at least 6 characters long' });
    });

    it('should update profile successfully without password', async () => {
      const req = { body: { name: 'newName', email: 'newEmail@test.com', address: 'newAddress', phone: '9876543210' }, user: { _id: 'userId' } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

      userModel.findById.mockResolvedValue({
        _id: 'userId',
        name: 'oldName',
        email: 'oldEmail@test.com',
        address: 'oldAddress',
        phone: '1234567890',
        password: 'hashedPassword',
      });

      userModel.findByIdAndUpdate.mockResolvedValue({
        _id: 'userId',
        name: 'newName',
        email: 'newEmail@test.com',
        address: 'newAddress',
        phone: '9876543210',
        password: 'hashedPassword',
      });

      await updateProfileController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: 'Profile updated successfully',
        updatedUser: {
          _id: 'userId',
          name: 'newName',
          email: 'newEmail@test.com',
          address: 'newAddress',
          phone: '9876543210',
          password: 'hashedPassword',
        },
      });
    });

    it('should update profile successfully with password', async () => {
      const req = { body: { name: 'newName', email: 'newEmail@test.com', address: 'newAddress', phone: '9876543210', password: 'newPassword' }, user: { _id: 'userId' } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

      userModel.findById.mockResolvedValue({
        _id: 'userId',
        name: 'oldName',
        email: 'oldEmail@test.com',
        address: 'oldAddress',
        phone: '1234567890',
        password: 'hashedPassword',
      });

      hashPassword.mockResolvedValue('newHashedPassword');

      userModel.findByIdAndUpdate.mockResolvedValue({
        _id: 'userId',
        name: 'newName',
        email: 'newEmail@test.com',
        address: 'newAddress',
        phone: '9876543210',
        password: 'newHashedPassword',
      });

      await updateProfileController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: 'Profile updated successfully',
        updatedUser: {
          _id: 'userId',
          name: 'newName',
          email: 'newEmail@test.com',
          address: 'newAddress',
          phone: '9876543210',
          password: 'newHashedPassword',
        },
      });
    });

    it('should handle errors gracefully', async () => {
      const req = { body: { name: 'newName', email: 'newEmail@test.com', address: 'newAddress', phone: '9876543210' }, user: { _id: 'userId' } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

      userModel.findById.mockRejectedValue(new Error('Database error'));

      await updateProfileController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: 'An error occurred while updating profile',
        error: new Error('Database error'),
      });
    });
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


    it('should handle errors gracefully', async () => {
      const req = { user: { _id: 'userId' } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

      orderModel.find.mockImplementation(() => ({
        populate: () => ({
          populate: jest.fn().mockRejectedValue(new Error('Database error')),
        })
      }));

      await getOrdersController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: 'An error occurred while fetching orders',
        error: new Error('Database error'),
      });
    });

    it('should return empty array if no orders found', async () => {
      const req = { user: { _id: 'userId' } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

      orderModel.find.mockImplementation(() => ({
        populate: () => ({
          populate: jest.fn().mockResolvedValue([]),
        })
      }));

      await getOrdersController(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should return orders with populated products and buyer', async () => {
      const req = { user: { _id: 'userId' } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

      orderModel.find.mockImplementation(() => ({
        populate: jest.fn().mockImplementation(() => ({
          populate: jest.fn().mockResolvedValue([{ orderId: 'order1', products: ['product1'], buyer: { name: 'buyer1' } }]),
        }))
      }));

      await getOrdersController(req, res);

      expect(res.json).toHaveBeenCalledWith([{ orderId: 'order1', products: ['product1'], buyer: { name: 'buyer1' } }]);
    });
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

    it('should handle errors gracefully', async () => {
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

      orderModel.find.mockImplementation(() => ({
        populate: () => ({
          populate: () => ({
            sort: jest.fn().mockRejectedValue(new Error('Database error')),
          })
        })
      }));

      await getAllOrdersController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: 'An error occurred while fetching orders',
        error: new Error('Database error'),
      });
    });

    it('should return empty array if no orders found', async () => {
      const req = {};
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

      orderModel.find.mockImplementation(() => ({
        populate: () => ({
          populate: () => ({
            sort: jest.fn().mockResolvedValue([]),
          })
        })
      }));

      await getAllOrdersController(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should return orders with populated products and buyer', async () => {
      const req = {};
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };

      orderModel.find.mockImplementation(() => ({
        populate: jest.fn().mockImplementation(() => ({
          populate: jest.fn().mockImplementation(() => ({
            sort: jest.fn().mockResolvedValue([{ orderId: 'order1', products: ['product1'], buyer: { name: 'buyer1' } }]),
          }))
        }))
      }));

      await getAllOrdersController(req, res);

      expect(res.json).toHaveBeenCalledWith([{ orderId: 'order1', products: ['product1'], buyer: { name: 'buyer1' } }]);
    });
  });

  describe('orderStatusController', () => {
    it('should update order status', async () => {
      const req = { params: { orderId: 'orderId' }, body: { status: 'shipped' } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };
      orderModel.findByIdAndUpdate.mockResolvedValue({ orderId: 'orderId', status: 'shipped' });

      await orderStatusController(req, res);

      expect(res.json).toHaveBeenCalledWith({ orderId: 'orderId', status: 'shipped' });
    });

    it('should handle errors gracefully', async () => {
      const req = { params: { orderId: 'orderId' }, body: { status: 'shipped' } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

      orderModel.findByIdAndUpdate.mockRejectedValue(new Error('Database error'));

      await orderStatusController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: 'An error occurred while updating order status',
        error: new Error('Database error'),
      });
    });
  });
});