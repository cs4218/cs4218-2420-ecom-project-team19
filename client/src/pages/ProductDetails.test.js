/* eslint-disable testing-library/no-wait-for-multiple-assertions */
import React from "react";
import { render, screen, waitFor, cleanup, fireEvent } from "@testing-library/react";
import { useAuth } from "../context/auth";
import { useCart } from "../context/cart";
import useCategory from "../hooks/useCategory";
import ProductDetails from "./ProductDetails";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "@testing-library/jest-dom";

jest.mock("../components/Footer", () => () => <div data-testid="footer">Mocked Footer</div>);
jest.mock("../components/Header", () => () => <div data-testid="header">Mocked Header</div>);
jest.mock("../hooks/useCategory", () => ({
    __esModule: true,
    default: jest.fn(),
  }));
jest.mock("../context/cart", () => ({
    useCart: jest.fn(() => [[]]),  // Mock cart as empty array
  }));
jest.mock("../context/auth", () => ({
    useAuth: jest.fn(),
  }));
jest.mock("axios");
jest.mock("react-router-dom", () => ({
    useParams: jest.fn(),
    useNavigate: jest.fn(),
}));

describe("ProductDeatils Component", () => {
    const mockNavigate = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        useNavigate.mockReturnValue(mockNavigate);
        useAuth.mockReturnValue([{ user: null }, jest.fn()]);
        useCategory.mockReturnValue([]);
        cleanup();
    });

    afterEach(async () => {
        await waitFor(() => {
            jest.clearAllMocks();
            axios.get.mockReset();
        });
        cleanup(); // Ensures component unmount after mocks reset
    });

    test("Renders without crashing before data is fetched", () => {
        useParams.mockReturnValue({ slug: "test-product" });
      
        render(<ProductDetails />);
      
        expect(screen.getByText(/Name :/)).toBeInTheDocument();
        expect(screen.queryByText(/Name : \w+/)).not.toBeInTheDocument();
    });

    test("Displays product details when fetched successfully", async () => {
        useParams.mockReturnValue({ slug: "test-product" });

        const mockProduct = {
            product: {
                _id: "1",
                name: "Test Product",
                description: "A sample product for testing",
                price: 99.99,
                category: { name: "Electronics" },
            },
        };

        axios.get.mockResolvedValueOnce({ data: mockProduct }).mockResolvedValueOnce({ data: { products: [] } });

        render(<ProductDetails />);

        await waitFor(() => {
            expect(screen.getByText("Product Details")).toBeInTheDocument();
            expect(screen.getByText("Name : Test Product")).toBeInTheDocument();
            expect(screen.getByText("Description : A sample product for testing")).toBeInTheDocument();
            expect(screen.getByText(/\$99\.99/)).toBeInTheDocument();
            expect(screen.getByText("Category : Electronics")).toBeInTheDocument();
        });
    });

    test("Renders fallback when product fields are missing", async () => {
        useParams.mockReturnValue({ slug: "incomplete-product" });

        const mockProductWithMissingFields = {
            product: {
                _id: "2",
                name: "Incomplete Product",
                price: null,  // Missing price
                category: null,  // Missing category
            },
        };

        axios.get.mockResolvedValueOnce({ data: mockProductWithMissingFields }).mockResolvedValueOnce({ data: { products: [] } });

        render(<ProductDetails />);

        await waitFor(() => {
            expect(screen.getByText("Product Details")).toBeInTheDocument();
            expect(screen.getByText("Name : Incomplete Product")).toBeInTheDocument();
            expect(screen.getByText("Description :")).toBeInTheDocument();
            expect(screen.getByText("Price :")).toBeInTheDocument();
            expect(screen.getByText("Category :")).toBeInTheDocument();
        });
    });

    test('Displays "No Similar Products found" when there are no related products', async () => {
        useParams.mockReturnValue({ slug: 'test-product' });
    
        const mockProduct = {
            product: {
                _id: '1',
                name: 'Test Product',
                description: 'Sample product for testing',
                price: 50,
                category: { name: 'Electronics', _id: 'cat1' },
            },
        };
    
        axios.get
            .mockResolvedValueOnce({ data: mockProduct }) // For getProduct
            .mockResolvedValueOnce({ data: { products: [] } }); // For getSimilarProduct
    
        render(<ProductDetails />);
    
        await waitFor(() => {
            expect(screen.getByText('No Similar Products found')).toBeInTheDocument();
        });
    });

    test('Displays related products when available', async () => {
        useParams.mockReturnValue({ slug: 'test-product' });
    
        const mockProduct = {
            product: {
                _id: '1',
                name: 'Test Product',
                description: 'Sample product for testing',
                price: 75,
                category: { name: 'Electronics', _id: 'cat1' },
            },
        };
    
        const relatedProducts = [
            { _id: '2', name: 'Related Product 1', description: 'First related product', price: 45, slug: 'related-product-1' },
            { _id: '3', name: 'Related Product 2', description: 'Second related product', price: 55, slug: 'related-product-2' },
        ];
    
        axios.get
            .mockResolvedValueOnce({ data: mockProduct }) // getProduct call
            .mockResolvedValueOnce({ data: { products: relatedProducts } }); // getSimilarProduct call
    
        render(<ProductDetails />);
    
        await screen.findByRole('heading', { name: /Similar Products/i });
    
        for (const product of relatedProducts) {
            expect(await screen.findByText(new RegExp(product.name, 'i'))).toBeInTheDocument();
    
            const truncatedDescription = product.description.substring(0, 60) + '...';
            expect(await screen.findByText(new RegExp(truncatedDescription, 'i'))).toBeInTheDocument();
    
            expect(await screen.findByText(product.price.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
            }))).toBeInTheDocument();
        }
    });    
    
    test('Handles API failure gracefully without crashing', async () => {
        useParams.mockReturnValue({ slug: 'test-product' });
        axios.get.mockRejectedValueOnce(new Error('API Error'));
    
        render(<ProductDetails />);
    
        const productDetailsSection = screen.queryByRole('heading', { name: /Product Details/i });

        expect(productDetailsSection).toBeInTheDocument();
        expect(screen.queryByText(/Test Product/i)).not.toBeInTheDocument();
    });

    test("Navigates to related product details when 'More Details' button is clicked", async () => {
        useParams.mockReturnValue({ slug: "test-product" });
    
        const mockProduct = {
            product: {
                _id: "1",
                name: "Test Product",
                description: "Sample product for testing",
                price: 99.99,
                category: { name: "Electronics", _id: "cat1" },
            },
        };
    
        const relatedProducts = [
            { _id: "2", name: "Related Product 1", description: "First related product", price: 45, slug: "related-product-1" },
        ];
    
        axios.get
            .mockResolvedValueOnce({ data: mockProduct }) // For getProduct
            .mockResolvedValueOnce({ data: { products: relatedProducts } }); // For getSimilarProduct
    
        render(<ProductDetails />);
    
        const moreDetailsButton = await screen.findByRole("button", { name: /more details/i });
        fireEvent.click(moreDetailsButton);
    
        expect(mockNavigate).toHaveBeenCalledWith("/product/related-product-1");
    });
    
    test('Displays "No Similar Products found" when no related products are returned', async () => {
        useParams.mockReturnValue({ slug: "test-product" });
    
        const mockProduct = {
            product: {
                _id: "1",
                name: "Test Product",
                description: "Sample product for testing",
                price: 75,
                category: { name: "Electronics", _id: "cat1" },
            },
        };
    
        axios.get
            .mockResolvedValueOnce({ data: mockProduct }) // getProduct
            .mockResolvedValueOnce({ data: { products: [] } }); // No related products
    
        render(<ProductDetails />);
    
        expect(await screen.findByText(/no similar products found/i)).toBeInTheDocument();
    });
    
    test("Handles case when product details are partially missing", async () => {
        useParams.mockReturnValue({ slug: "test-product" });
    
        const mockProduct = {
            product: {
                _id: "1",
                name: "Test Product",
                description: null, // Missing description
                price: 49.99,
                category: null, // Missing category
            },
        };
    
        axios.get.mockResolvedValueOnce({ data: mockProduct });
    
        render(<ProductDetails />);
    
        expect(await screen.findByText(/name :/i)).toHaveTextContent("Name : Test Product");
        expect(screen.queryByText(/description :/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/category :/i)).not.toBeInTheDocument();
        expect(await screen.findByText(/\$49\.99/)).toBeInTheDocument(); // Price still shows up
    });
    
    test("Prevents multiple API calls when params remain the same", async () => {
        useParams.mockReturnValue({ slug: "test-product" });
    
        const mockProduct = {
            product: {
                _id: "1",
                name: "Test Product",
                description: "Test description",
                price: 60,
                category: { name: "Books", _id: "cat2" },
            },
        };
    
        axios.get.mockResolvedValueOnce({ data: mockProduct });
    
        const { rerender } = render(<ProductDetails />);
    
        expect(axios.get).toHaveBeenCalledTimes(1); // Initial fetch
    
        // Rerender with the same slug
        rerender(<ProductDetails />);
        expect(axios.get).toHaveBeenCalledTimes(1); // No new API call
    });    
});