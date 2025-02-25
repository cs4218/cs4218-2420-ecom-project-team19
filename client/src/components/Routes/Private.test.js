import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Outlet } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/auth';
import PrivateRoute from './Private';
import Spinner from '../Spinner';

jest.mock('axios');
jest.mock('../../context/auth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  useLocation: jest.fn(),
}));

describe('PrivateRoute Component', () => {
  let consoleSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  it('renders Spinner by default if no auth token is present', () => {
    useAuth.mockReturnValue([{}, jest.fn()]);
    
    render(<PrivateRoute />);
    
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
    expect(axios.get).not.toHaveBeenCalled();
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it('renders Spinner if auth token is present but authCheck fails', async () => {
    useAuth.mockReturnValue([{ token: 'token' }, jest.fn()]);
    axios.get.mockResolvedValueOnce({ data: { ok: false } });

    render(<PrivateRoute />);

    await waitFor(() => {
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
      expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/user-auth');
    });

    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it('renders Outlet if auth token is present and authCheck passes', async () => {
    useAuth.mockReturnValue([{ token: 'token' }, jest.fn()]);
    axios.get.mockResolvedValueOnce({ data: { ok: true } });

    render(<PrivateRoute />);

    await waitFor(() => {
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
      expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/user-auth');
    });

    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it('handles API errors gracefully', async () => {
    const error = new Error('Failed to query auth status');
    axios.get.mockRejectedValueOnce(error);
    useAuth.mockReturnValue([{ token: 'token' }, jest.fn()]);

    render(<PrivateRoute />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/user-auth');
    });

    expect(consoleSpy).toHaveBeenCalledWith(error);
  });
});
