import JWT from 'jsonwebtoken';
import mongoose from 'mongoose';
import userModel from '../models/userModel';
import { requireSignIn, isAdmin } from './authMiddleware';

jest.mock('jsonwebtoken');
jest.mock('mongoose');
jest.mock('../models/userModel', () => ({
  findById: jest.fn(),
}));

describe('Auth Middleware', () => {
  describe('requireSignIn', () => {
    it('should call next if token is valid', async () => {
      const req = {
        headers: {
          authorization: 'valid-token'
        }
      };
      const res = {};
      const next = jest.fn();
      const decodedToken = { userId: '123' };

      JWT.verify.mockReturnValue(decodedToken);

      await requireSignIn(req, res, next);

      expect(JWT.verify).toHaveBeenCalledWith('valid-token', process.env.JWT_SECRET);
      expect(req.user).toEqual(decodedToken);
      expect(next).toHaveBeenCalled();
    });

    it('should log error if token is invalid', async () => {
      const req = {
        headers: {
          authorization: 'invalid-token'
        }
      };
      const res = {};
      const next = jest.fn();
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });

      JWT.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await requireSignIn(req, res, next);

      expect(consoleSpy).toHaveBeenCalledWith(new Error('Invalid token'));
      expect(next).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('isAdmin', () => {
    it('should call next if user is admin', async () => {
      const req = {
        user: {
          _id: '123'
        }
      };
      const res = {};
      const next = jest.fn();
      const user = { role: 1 };

      userModel.findById.mockResolvedValue(user);

      await isAdmin(req, res, next);

      expect(userModel.findById).toHaveBeenCalledWith('123');
      expect(next).toHaveBeenCalled();
    });

    it('should return 401 if user is not admin', async () => {
      const req = {
        user: {
          _id: '123'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };
      const next = jest.fn();
      const user = { role: 0 };

      userModel.findById.mockResolvedValue(user);

      await isAdmin(req, res, next);

      expect(userModel.findById).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: 'UnAuthorized Access'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 and log error if there is an error in isAdmin', async () => {
      const req = {
        user: {
          _id: '123'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };
      const next = jest.fn();
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });

      userModel.findById.mockImplementation(() => {
        throw new Error('Database error');
      });

      await isAdmin(req, res, next);

      expect(consoleSpy).toHaveBeenCalledWith(new Error('Database error'));
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        error: new Error('Database error'),
        message: 'Error in admin middleware'
      });
      expect(next).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});