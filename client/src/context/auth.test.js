import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import toast from 'react-hot-toast';
import { useAuth, AuthProvider } from './auth';
import { clear } from 'console';

// mock external modules
jest.mock('axios');
jest.mock('react-hot-toast');

const mockStorage = (() => {
  let store = {};
  return {
    setItem: (key, value) => {
      store[key] = value;
    },
    getItem: (key) => store[key],
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: mockStorage,
  writable: true,
});

const TestComponent = () => {
  const [auth, setAuth] = useAuth();
  return (
    <div>
      <div data-testid="user">{auth.user?.name}</div>
      <div data-testid="token">{auth.token}</div>
    </div >
  )
}

describe('Auth Provider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('renders children components', () => {
    render(
      <AuthProvider>
        <div data-testid="children">Children</div>
        <div data-testid="children2">Children 234</div>
      </AuthProvider>
    );
    expect(screen.getByTestId('children')).toBeInTheDocument();
    expect(screen.getByText('Children')).toBeInTheDocument();
    expect(screen.getByTestId('children')).toHaveTextContent('Children');

    expect(screen.getByTestId('children2')).toBeInTheDocument();
    expect(screen.getByText('Children 234')).toBeInTheDocument();
    expect(screen.getByTestId('children2')).toHaveTextContent('Children 234');
  });

  it('loads auth from local storage', () => {
    localStorage.setItem('auth', JSON.stringify({
      user: { name: 'John' }, token: 'fake-token'
    }));
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(screen.getByTestId('user')).toHaveTextContent('John');
    expect(screen.getByTestId('token')).toHaveTextContent('fake-token');
  });

  it('sets axios default authorization header to token', () => {
    localStorage.setItem('auth', JSON.stringify({
      user: { name: 'John' }, token: 'fake-token'
    }));
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(axios.defaults.headers.common['Authorization']).toBe('fake-token');
  });

});