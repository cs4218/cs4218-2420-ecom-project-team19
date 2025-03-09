// import { hashPassword, comparePassword } from './authHelper';
import { expect, jest } from '@jest/globals';

jest.unstable_mockModule('bcrypt', () => ({
  __esModule: true,
  default: {
    hash: jest.fn(),
    compare: jest.fn(),
  }
}));

jest.unstable_mockModule('console', () => ({
  log: jest.fn(),
}));

const bcrypt = await import('bcrypt');
const { hashPassword, comparePassword } = await import('./authHelper');

// const bcrypt = jest.requireMock('bcrypt');

describe('authHelper', () => {
  describe('hashPassword', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.spyOn(console, 'log').mockImplementation(() => { });
    });

    it('should hash the password correctly', async () => {
      const password = 'testPassword';
      const hashedPassword = 'hashedPassword';
      bcrypt.default.hash.mockResolvedValue(hashedPassword);

      const result = await hashPassword(password);

      expect(bcrypt.default.hash).toHaveBeenCalledWith(password, 10);
      expect(result).toBe(hashedPassword);
    });

    it('should handle errors', async () => {
      const password = 'testPassword';
      const error = new Error('Hashing error');
      bcrypt.default.hash.mockRejectedValue(error);

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
      bcrypt.default.compare.mockResolvedValue(true);

      const result = await comparePassword(password, hashedPassword);

      expect(bcrypt.default.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false for non-matching passwords', async () => {
      const password = 'testPassword';
      const hashedPassword = 'hashedPassword';
      bcrypt.default.compare.mockResolvedValue(false);

      const result = await comparePassword(password, hashedPassword);

      expect(bcrypt.default.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(false);
    });
  });
});