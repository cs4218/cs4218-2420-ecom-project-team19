import React from 'react';
import { render, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import Policy from '../pages/Policy';
import axios from 'axios';

jest.mock('axios');
jest.mock('react-hot-toast');

jest.mock('../context/auth', () => ({
    useAuth: jest.fn(() => [null, jest.fn()])
}));

jest.mock('../context/cart', () => ({
    useCart: jest.fn(() => [null, jest.fn()])
}));
    
jest.mock('../context/search', () => ({
    useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()])
}));  

Object.defineProperty(window, 'localStorage', {
    value: {
        setItem: jest.fn(),
        getItem: jest.fn(),
        removeItem: jest.fn(),
    },
    writable: true,
});

window.matchMedia = window.matchMedia || function() {
    return {
      matches: false,
      addListener: function() {},
      removeListener: function() {}
    };
};

describe("Policy Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        axios.get.mockResolvedValue({ data: { categories: [] } });
    });

    it('should allow user to view the add privacy policy', async () => {
        await act(async () => {
            render(
                <MemoryRouter initialEntries={['/policy']}>
                    <Routes>
                        <Route path="/policy" element={<Policy />} />
                    </Routes>
                </MemoryRouter>
            );
        });

        expect(document.querySelector('body')).toHaveTextContent("add privacy policy");
    });
});
