import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import axios from 'axios'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import '@testing-library/jest-dom/extend-expect'
import toast from 'react-hot-toast'
import Products from './Products'

jest.mock('axios')
jest.mock('react-hot-toast')

jest.mock("../../components/Layout", () => ({ children, title }) => (
    <div>
      <title>{title}</title>
      <main>{children}</main>
    </div>
));

jest.mock('../../components/AdminMenu', () => () => <div>Admin Menu</div>);

describe('Products Component', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    });

    describe('Rendering & UI', () => {
        // ensures list and menu are rendered
        it('renders products list and AdminMenu', async () => {
            axios.get.mockResolvedValueOnce({ data: { products: [] } });

            render(
                <MemoryRouter>
                    <Routes>
                        <Route path='/' element={<Products />} />
                    </Routes>
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByText('All Products List')).toBeInTheDocument();
                expect(screen.getByText('Admin Menu')).toBeInTheDocument();
            });
        });

        // bva: empty list
        it('handles empty product list', async () => {
            axios.get.mockResolvedValueOnce({ data: { products: [] } });

            render(
                <MemoryRouter>
                    <Routes>
                        <Route path='/' element={<Products />} />
                    </Routes>
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.queryByText('Product 1')).not.toBeInTheDocument();
            });
        });

        // bva: long list, probably could be a load test instead?
        it('renders large number of products without crashing', async () => {
            const mockProducts = Array.from({ length: 100 }, (_, i) => ({
                _id: `${i + 1}`,
                name: `Product ${i + 1}`,
                description: `Description ${i + 1}`,
                slug: `product-${i + 1}`,
            }));
            axios.get.mockResolvedValueOnce({ data: { products: mockProducts } });
        
            render(
                <MemoryRouter>
                    <Routes>
                        <Route path='/' element={<Products />} />
                    </Routes>
                </MemoryRouter>
            );
        
            await waitFor(() => {
                expect(screen.getByText('Product 1')).toBeInTheDocument();
                expect(screen.getByText('Product 100')).toBeInTheDocument();
            });
        });
    });

    describe('Product Display', () => {
        // combination of rendering, and ordering product (instead of splitting into 2 cases)
        it('fetches and displays products and renders products in correct order', async () => {
            const mockProducts = [
                { _id: '2', name: 'Product 2', description: 'Description 2', slug: 'product-2' },
                { _id: '1', name: 'Product 1', description: 'Description 1', slug: 'product-1' },
            ];
            axios.get.mockResolvedValueOnce({ data: { products: mockProducts } });
        
            render(
                <MemoryRouter>
                    <Routes>
                        <Route path='/' element={<Products />} />
                    </Routes>
                </MemoryRouter>
            );
        
            await waitFor(() => {
                const productNames = screen.getAllByRole('heading', { level: 5 }).map((el) => el.textContent);
                expect(productNames).toEqual(['Product 2', 'Product 1']);
            });
        });

        // ep: product image
        it('renders product images correctly', async () => {
            const mockProducts = [
                { _id: '1', name: 'Product 1', description: 'Description 1', slug: 'product-1' },
            ];
            axios.get.mockResolvedValueOnce({ data: { products: mockProducts } });

            render(
                <MemoryRouter>
                    <Routes>
                        <Route path='/' element={<Products />} />
                    </Routes>
                </MemoryRouter>
            );

            await waitFor(() => {
                const productImage = screen.getByAltText('Product 1');
                expect(productImage).toHaveAttribute('src', '/api/v1/product/product-photo/1');
            });
        });

        // ep: missing product image
        it('does not display an image when product image is missing', async () => {
            const mockProducts = [
                { _id: '1', name: 'Product 1', description: 'Description 1', slug: 'product-1' },
            ];
            axios.get.mockResolvedValueOnce({ data: { products: mockProducts } });
        
            render(
                <MemoryRouter>
                    <Routes>
                        <Route path='/' element={<Products />} />
                    </Routes>
                </MemoryRouter>
            );
        
            await waitFor(() => {
                expect(screen.queryByAltText('Product 1')).not.toBeInTheDocument();
                expect(screen.queryByRole('img')).not.toBeInTheDocument();
            });
        });

        // funny name product
        it('renders product names and descriptions with special characters', async () => {
            const mockProducts = [
                { _id: '1', name: 'Product ❤️🔥', description: 'Amazing product! 🌟', slug: 'product-special' },
            ];
            axios.get.mockResolvedValueOnce({ data: { products: mockProducts } });
        
            render(
                <MemoryRouter>
                    <Routes>
                        <Route path='/' element={<Products />} />
                    </Routes>
                </MemoryRouter>
            );
        
            await waitFor(() => {
                expect(screen.getByText('Product ❤️🔥')).toBeInTheDocument();
                expect(screen.getByText('Amazing product! 🌟')).toBeInTheDocument();
            });
        });

        // long name product
        it('handles very long product names and descriptions', async () => {
            const longText1 = 'A'.repeat(500);
            const longText2 = 'B'.repeat(500);
            const mockProducts = [
                { _id: '1', name: longText1, description: longText2, slug: 'long-product' },
            ];
            axios.get.mockResolvedValueOnce({ data: { products: mockProducts } });
        
            render(
                <MemoryRouter>
                    <Routes>
                        <Route path='/' element={<Products />} />
                    </Routes>
                </MemoryRouter>
            );
        
            await waitFor(() => {
                expect(screen.getByText(longText1)).toBeInTheDocument();
                expect(screen.getByText(longText2)).toBeInTheDocument();
            });
        });
    });

    // nav
    describe('Navigation', () => {
        it('creates correct link for each product', async () => {
            const mockProducts = [
                { _id: '1', name: 'Product 1', description: 'Description 1', slug: 'product-1' },
            ];
            axios.get.mockResolvedValueOnce({ data: { products: mockProducts } });

            render(
                <MemoryRouter>
                    <Routes>
                        <Route path='/' element={<Products />} />
                    </Routes>
                </MemoryRouter>
            );

            await waitFor(() => {
                const productLink = screen.getByRole('link', { name: /Product 1/i });
                expect(productLink).toHaveAttribute('href', '/dashboard/admin/product/product-1');
            });
        });
    });

    describe('Error Handling', () => {
        // error handling
        it('handles API error', async () => {
            axios.get.mockRejectedValueOnce(new Error('API Error'));

            render(
                <MemoryRouter>
                    <Routes>
                        <Route path='/' element={<Products />} />
                    </Routes>
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Something Went Wrong');
            });
        });

        // error handling: missing product
        it('handles unexpected API response format', async () => {
            axios.get.mockResolvedValueOnce({ data: {} });
        
            render(
                <MemoryRouter>
                    <Routes>
                        <Route path='/' element={<Products />} />
                    </Routes>
                </MemoryRouter>
            );
        
            await waitFor(() => {
                expect(screen.queryByText('All Products List')).toBeInTheDocument();
                expect(screen.queryByText('Product 1')).not.toBeInTheDocument();
            });
        });
    });
});