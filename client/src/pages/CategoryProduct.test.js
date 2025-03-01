/* eslint-disable testing-library/no-wait-for-multiple-assertions */
import React from "react";
import axios from "axios";
import { render, screen, waitFor, fireEvent, cleanup, act } from "@testing-library/react";
import { useParams, useNavigate } from "react-router-dom";
import CategoryProduct from "./CategoryProduct";
import "@testing-library/jest-dom";

jest.mock("axios");
jest.mock("react-router-dom", () => ({
    useParams: jest.fn(),
    useNavigate: jest.fn(),
}));
jest.mock("../components/Layout", () => ({ children }) => (
    <div data-testid="layout">
        <div data-testid="header">Mocked Header</div>
        <main>{children}</main>
        <div data-testid="footer">Mocked Footer</div>
    </div>
));

describe("CategoryProduct Component", () => {
    const mockNavigate = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        useNavigate.mockReturnValue(mockNavigate);
    });

    afterEach(async () => {
        await waitFor(() => {
            jest.clearAllMocks();
            axios.get.mockReset();
        });
        cleanup(); // Ensures component unmount after mocks reset
    });

    test("Renders without crashing before data is fetched", () => {
        useParams.mockReturnValue({ slug: "test-category" });

        render(<CategoryProduct />);

        expect(screen.getByText(/Category -/i)).toBeInTheDocument();
        expect(screen.getByText(/0 result found/i)).toBeInTheDocument();
    });

    test("Displays category name and correct number of products", async () => {
        useParams.mockReturnValue({ slug: "test-category" });

        const mockData = {
            category: { name: "Electronics" },
            products: [
                { _id: "1", name: "Phone", description: "Smartphone", price: 299, slug: "phone" },
                { _id: "2", name: "Laptop", description: "Gaming laptop", price: 999, slug: "laptop" },
            ],
        };

        axios.get.mockResolvedValueOnce({ data: mockData });

        expect(await screen.findByText("Category - Electronics")).toBeInTheDocument();
    });

    test("Renders product cards with accurate details", async () => {
        useParams.mockReturnValue({ slug: "test-category" });

        const mockData = {
            category: { name: "Accessories" },
            products: [
                { _id: "1", name: "Watch", description: "Smart watch", price: 150, slug: "watch" },
                { _id: "2", name: "Headphones", description: "Noise-cancelling headphones", price: 200, slug: "headphones" },
            ],
        };

        axios.get.mockResolvedValueOnce({ data: mockData });

        render(<CategoryProduct />);

        await waitFor(() => {
            expect(screen.getByText("Category - Accessories")).toBeInTheDocument();
            expect(screen.getByText("Watch")).toBeInTheDocument();
            expect(screen.getByText("Headphones")).toBeInTheDocument();
            expect(screen.getByText(/Smart watch/i)).toBeInTheDocument();
            expect(screen.getByText(/Noise-cancelling headphones/i)).toBeInTheDocument();
            expect(screen.getByText("$150.00")).toBeInTheDocument();
            expect(screen.getByText("$200.00")).toBeInTheDocument();
        });
    });

    test("Handles case when no products are found", async () => {
        useParams.mockReturnValue({ slug: "empty-category" });

        const mockData = {
            category: { name: "Empty Category" },
            products: [],
        };

        axios.get.mockResolvedValueOnce({ data: mockData });

        await act(async () => {
            render(<CategoryProduct />);
        });

        await waitFor(() => {
            expect(screen.getByText(/Category - Empty Category/i)).toBeInTheDocument();
            expect(screen.getByText(/0 result found/i)).toBeInTheDocument();
            expect(screen.queryByRole("img")).not.toBeInTheDocument(); // No products rendered
        });
    });

    test("Handles API failure gracefully without crashing", async () => {
        useParams.mockReturnValue({ slug: "electronics" });
    
        axios.get.mockRejectedValueOnce(new Error("Network Error"));
    
        render(<CategoryProduct />);
    
        await waitFor(() => {
            expect(screen.getByText(/Category -/i)).toBeInTheDocument();
            expect(screen.getByText("0 result found")).toBeInTheDocument();
        });
    });

    test("Navigates to product details page when 'More Details' is clicked", async () => {
        useParams.mockReturnValue({ slug: "electronics" });
    
        const mockData = {
            category: { name: "Electronics" },
            products: [
                { _id: "1", name: "Phone", description: "A smartphone", price: 500, slug: "phone" },
            ],
        };
    
        axios.get.mockResolvedValueOnce({ data: mockData });
    
        render(<CategoryProduct />);
    
        await waitFor(() => {
            const button = screen.getByRole("button", { name: /More Details/i });
            fireEvent.click(button);
            expect(mockNavigate).toHaveBeenCalledWith("/product/phone");
        });
    });

    test("Ensures correct display of multiple products", async () => {
        useParams.mockReturnValue({ slug: "electronics" });
    
        const mockData = {
            products: [
                { _id: "1", name: "Product A", description: "Description A", price: 100, slug: "product-a" },
                { _id: "2", name: "Product B", description: "Description B", price: 200, slug: "product-b" },
            ],
            category: { name: "Electronics" },
        };
    
        axios.get.mockResolvedValueOnce({ data: mockData });
    
        render(<CategoryProduct />);
    
        await waitFor(() => {
            expect(screen.getByText(/Category - Electronics/i)).toBeInTheDocument();
            
            expect(screen.getByText("2 result found")).toBeInTheDocument();
    
            expect(screen.getByText("Product A")).toBeInTheDocument();
            expect(screen.getByText("Product B")).toBeInTheDocument();
    
            expect(screen.getByText(/Description A.../i)).toBeInTheDocument();
            expect(screen.getByText(/Description B.../i)).toBeInTheDocument();
    
            expect(screen.getByText("$100.00")).toBeInTheDocument();
            expect(screen.getByText("$200.00")).toBeInTheDocument();
        });
    });

    test("Handles case when category name is missing", async () => {
        useParams.mockReturnValue({ slug: "unknown-category" });
    
        const mockData = {
            products: [
                { _id: "1", name: "Random Product", description: "Random item", price: 200 },
            ],
            category: {}, // No name property
        };
    
        axios.get.mockResolvedValueOnce({ data: mockData });
    
        render(<CategoryProduct />);
    
        await waitFor(() => {
            expect(screen.getByText(/Category -/i)).toBeInTheDocument();
            expect(screen.getByText("1 result found")).toBeInTheDocument();
        });
    });

    test("Handles case when product details are partially missing", async () => {
        useParams.mockReturnValue({ slug: "electronics" });
    
        const mockData = {
            products: [
                { _id: "1", name: "Partial Product", description: "", price: null },
            ],
            category: { name: "Electronics" },
        };
    
        axios.get.mockResolvedValueOnce({ data: mockData });
    
        render(<CategoryProduct />);
    
        await waitFor(() => {
            expect(screen.getByText("Partial Product")).toBeInTheDocument();
            expect(screen.queryByText(/description/i)).not.toBeInTheDocument();
            expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
        });
    });
});