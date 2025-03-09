import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import Contact from '../pages/Contact';
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


describe("Contact Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        axios.get.mockResolvedValue({ data: { categories: [] } });
    });

    it("should display the contact us text", async () => {
        await act(async () => {
            render(
                <MemoryRouter initialEntries={['/contact']}>
                    <Routes>
                        <Route path="/contact" element={<Contact />} />
                    </Routes>
                </MemoryRouter>
            );
        });

        expect(screen.getByText("CONTACT US")).toBeInTheDocument();
    });

    it("should display the contact us description", async () => {
        await act(async () => {
            render(
                <MemoryRouter initialEntries={['/contact']}>
                    <Routes>
                        <Route path="/contact" element={<Contact />} />
                    </Routes>
                </MemoryRouter>
            );
        });

        expect(screen.getByText("For any query or info about product, feel free to call anytime. We are available 24X7.")).toBeInTheDocument();
    });

    it("should display the company's email address", async () => {
        await act(async () => {
            render(
                <MemoryRouter initialEntries={['/contact']}>
                    <Routes>
                        <Route path="/contact" element={<Contact />} />
                    </Routes>
                </MemoryRouter>
            );
        });

        expect(screen.getByText(": www.help@ecommerceapp.com")).toBeInTheDocument();
    });

    it("should display the company's telephone number", async () => {
        await act(async () => {
            render(
                <MemoryRouter initialEntries={['/contact']}>
                    <Routes>
                        <Route path="/contact" element={<Contact />} />
                    </Routes>
                </MemoryRouter>
            );
        });

        expect(screen.getByText(": 012-3456789")).toBeInTheDocument();
    });

    it("should display the company's toll-free number", async () => {
        await act(async () => {
            render(
                <MemoryRouter initialEntries={['/contact']}>
                    <Routes>
                        <Route path="/contact" element={<Contact />} />
                    </Routes>
                </MemoryRouter>
            );
        });

        expect(screen.getByText(": 1800-0000-0000 (toll free)")).toBeInTheDocument();
    });
});

