import bcrypt from 'bcrypt';
import { hashPassword, comparePassword } from './authHelper';

jest.mock('bcrypt');

describe('authHelper', () => {
  describe('hashPassword', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.spyOn(console, 'log').mockImplementation(() => { });
    });

    it('should hash the password correctly', async () => {
      const password = 'testPassword';
      const hashedPassword = 'hashedPassword';
      bcrypt.hash.mockResolvedValue(hashedPassword);

      const result = await hashPassword(password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(result).toBe(hashedPassword);
    });

    it('should handle errors', async () => {
      const password = 'testPassword';
      const error = new Error('Hashing error');
      bcrypt.hash.mockRejectedValue(error);

      console.log = jest.fn();

      const result = await hashPassword(password);

      expect(console.log).toHaveBeenCalledWith(error);
      expect(result).toBeUndefined();
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching passwords', async () => {
      const password = 'testPassword';
      const hashedPassword = 'hashedPassword';
      bcrypt.compare.mockResolvedValue(true);

      const result = await comparePassword(password, hashedPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false for non-matching passwords', async () => {
      const password = 'testPassword';
      const hashedPassword = 'hashedPassword';
      bcrypt.compare.mockResolvedValue(false);

      const result = await comparePassword(password, hashedPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(false);
    });
  });
});