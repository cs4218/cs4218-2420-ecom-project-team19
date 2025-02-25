import axios from 'axios';
import { useAuth } from '../../context/auth';
import PrivateRoute from './Private';
import { act } from 'react-dom/test-utils';

jest.mock('axios');
jest.mock('../../context/auth', () => ({
  useAuth: jest.fn(),
}));

describe('PrivateRoute Logic (Node Environment)', () => {
  let consoleSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should call auth check when auth token is present', async () => {
    useAuth.mockReturnValue([{ token: 'token' }, jest.fn()]);
    axios.get.mockResolvedValueOnce({ data: { ok: true } });

    await act(async () => {
      PrivateRoute(); // Calls the function (not rendering)
    });

    expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/user-auth');
  });

  it('should log error if auth check fails', async () => {
    const error = new Error('Failed to query auth status');
    axios.get.mockRejectedValueOnce(error);
    useAuth.mockReturnValue([{ token: 'token' }, jest.fn()]);

    await act(async () => {
      PrivateRoute();
    });

    expect(consoleSpy).toHaveBeenCalledWith(error);
    expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/user-auth');
  });

  it('should not call auth check if no token is present', async () => {
    useAuth.mockReturnValue([{}, jest.fn()]);

    await act(async () => {
      PrivateRoute();
    });

    expect(axios.get).not.toHaveBeenCalled();
  });
});
  