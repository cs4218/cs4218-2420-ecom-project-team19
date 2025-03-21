/* eslint-disable testing-library/no-wait-for-multiple-assertions */
/* eslint-disable testing-library/no-unnecessary-act */
import React from "react";
import { render, screen, waitFor, fireEvent, act, cleanup } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import HomePage from "../../pages/HomePage";
import ProductDetails from "../../pages/ProductDetails";
import axios from "axios";
import { useCart } from "../../context/cart";
import { useAuth } from "../../context/auth";
import useCategory from "../../hooks/useCategory";
import { useSearch } from "../../context/search";
import { useNavigate } from "react-router-dom";
import "@testing-library/jest-dom";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

jest.mock("../../context/cart", () => ({
    useCart: jest.fn(() => [[], jest.fn()]),
}));
jest.mock("../../context/search", () => ({
    useSearch: jest.fn(() => [[], jest.fn()]),
}));
jest.mock("../../context/auth", () => ({
    useAuth: jest.fn(() => [{ user: null, token: "" }, jest.fn()]),
}));

jest.mock("../../hooks/useCategory", () => ({
    __esModule: true,
    default: jest.fn(() => []),
}));
jest.mock("axios");
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: jest.fn(),
}));


describe("HomePage Integration Tests", () => {
    let mockNavigate;

    beforeEach(async () => {
        jest.clearAllMocks();
        const mockNavigate = jest.fn();
        useNavigate.mockReturnValue(mockNavigate);
        useAuth.mockReturnValue([{ user: null, token: "" }, jest.fn()]);
        useCart.mockReturnValue([[], jest.fn()]);
        useCategory.mockReturnValue([]);
        Object.defineProperty(window, "matchMedia", {
            writable: true,
            value: jest.fn().mockImplementation((query) => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: jest.fn(),
                removeListener: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                dispatchEvent: jest.fn(),
            })),
        });
    });

    afterEach(() => {
        cleanup();
    })

    test("Displays products from the real API", async () => {
        axios.get.mockResolvedValue({
            data: {
                success: true,
                category: [
                    { _id: "1", name: "Electronics" },
                    { _id: "2", name: "Clothing" },
                ],
            },
        });
        axios.get.mockResolvedValue({
            data: {
                products: [
                    { _id: "1", name: "Laptop", category: "Electronics" },
                    { _id: "2", name: "T-Shirt", category: "Clothing" },
                ],
            },
        });
        await act(async () => {
            render(
                <BrowserRouter>
                    <HomePage />
                </BrowserRouter>
            );
        });

        await waitFor(() => {
            expect(screen.getByText("All Products")).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByText("Laptop")).toBeInTheDocument();
            expect(screen.getByText("T-Shirt")).toBeInTheDocument();
        });
    });

    test("Filters products correctly by category", async () => {
        axios.get.mockResolvedValueOnce({
            data: {
                success: true,
                category: [
                    { _id: "1", name: "Electronics" },
                    { _id: "2", name: "Clothing" },
                ],
            },
        });
        axios.post.mockResolvedValueOnce({
            data: {
                products: [
                    { _id: "1", name: "Laptop", category: "Electronics" },
                    { _id: "2", name: "T-Shirt", category: "Clothing" },
                ],
            },
        });

        await act(async () => {
            render(
                <BrowserRouter>
                    <HomePage />
                </BrowserRouter>
            );
        });

        const categoryCheckbox = await screen.findByText("Electronics");
        fireEvent.click(categoryCheckbox);

        await waitFor(() => {
            expect(screen.getByText("Laptop")).toBeInTheDocument();
        });
    });

    test("Adding a product to the cart updates the UI", async () => {
        axios.get.mockResolvedValueOnce({
            data: {
                success: true,
                category: [
                    { _id: "1", name: "Electronics" },
                    { _id: "2", name: "Clothing" },
                ],
            },
        });
        axios.post.mockResolvedValueOnce({
            data: {
                products: [
                    { _id: "1", name: "Laptop", category: "Electronics" },
                ],
            },
        });

        await act(async () => {
            render(
                <BrowserRouter>
                    <HomePage />
                </BrowserRouter>
            );
        });

        const addToCartButton = await screen.findAllByRole("button", { name: "ADD TO CART" });
        fireEvent.click(addToCartButton[0]);

        await waitFor(() => {
            expect(localStorage.getItem("cart")).toContain("Laptop");
        });

        expect(screen.getByText("Item Added to Cart")).toBeInTheDocument();
    });

    test("Clicking 'View Product' navigates to the product page", async () => {
        axios.get.mockResolvedValueOnce({
            data: {
                success: true,
                category: [
                    { _id: "1", name: "Electronics" },
                    { _id: "2", name: "Clothing" },
                ],
            },
        });
        axios.post.mockResolvedValueOnce({
            data: {
                products: [
                    { _id: "1", name: "Laptop", category: "Electronics", slug: "laptop" },
                ],
            },
        });

        await act(async () => {
            render(
                <BrowserRouter>
                    <HomePage />
                </BrowserRouter>
            );
        });
        const viewProductButton = await screen.findAllByRole("button", { name: /View Product/i });
        fireEvent.click(viewProductButton[0]);

        await waitFor(() => {
            expect(screen.getByText("Laptop")).toBeInTheDocument();
        });
    });

    test("Clicking 'View Product' navigates to the product page, and clicking 'Add To Cart' adds the item to the cart", async () => {
        axios.get.mockResolvedValueOnce({
            data: {
                success: true,
                category: [
                    { _id: "1", name: "Electronics" },
                    { _id: "2", name: "Clothing" },
                ],
            },
        });

        axios.post.mockResolvedValueOnce({
            data: {
                products: [
                    { _id: "1", name: "Laptop", category: "Electronics", slug: "laptop" },
                ],
            },
        });

        await act(async () => {
            render(
                <BrowserRouter>
                    <HomePage />
                </BrowserRouter>
            );
        });

        await waitFor(() => {
            expect(screen.getByText("Laptop")).toBeInTheDocument();
        });

        axios.get.mockResolvedValueOnce({
            data: {
                product: { _id: "1", name: "Laptop", category: "Electronics", slug: "laptop" },
            },
        });

        const viewProductButton = await screen.findAllByRole("button", { name: /View Product/i });
        fireEvent.click(viewProductButton[1]);

        cleanup();

        await act(async () => {
            render(
                <BrowserRouter>
                    <ProductDetails />
                </BrowserRouter>
            );
        });

        const addToCartButton = await screen.findAllByRole("button", { name: /ADD TO CART/i });
        fireEvent.click(addToCartButton[0]);

        await waitFor(() => {
            expect(localStorage.getItem("cart")).toContain("Laptop");
        });

        expect(screen.getByText("Item Added to Cart")).toBeInTheDocument();
    });

    test("Clicking 'Load More' fetches and displays additional products", async () => {
        axios.get.mockImplementation((url) => {
            if (url === "/api/v1/category/get-category") {
                return Promise.resolve({
                data: { success: true, category: [] },
                });
            } else if (url === "/api/v1/product/product-count") {
                return Promise.resolve({ data: { total: 8 } });
            } else if (url === "/api/v1/product/product-list/1") {
                return Promise.resolve({
                data: {
                    success: true,
                    products: [
                    { _id: "1", name: "Product 1", slug: "p1" },
                    { _id: "2", name: "Product 2", slug: "p2" },
                    { _id: "3", name: "Product 3", slug: "p3" },
                    { _id: "4", name: "Product 4", slug: "p4" },
                    { _id: "5", name: "Product 5", slug: "p5" },
                    { _id: "6", name: "Product 6", slug: "p6" },
                    ],
                },
                });
            } else if (url === "/api/v1/product/product-list/2") {
                return Promise.resolve({
                data: {
                    success: true,
                    products: [
                    { _id: "7", name: "Product 7", slug: "p7" },
                    { _id: "8", name: "Product 8", slug: "p8" },
                    ],
                },
                });
            }
            return Promise.resolve({ data: {} });
        });

        await act(async () => {
          render(
            <BrowserRouter>
              <HomePage />
            </BrowserRouter>
          );
        });
    
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith("/api/v1/product/product-list/1");
            expect(screen.getByText("Product 6")).toBeInTheDocument();
        });
    
        act(() => {
            fireEvent.click(screen.getByTestId("load-more-button"));
        });
    
        await waitFor(() => {
          expect(screen.getByText("Product 7")).toBeInTheDocument();
          expect(screen.getByText("Product 8")).toBeInTheDocument();
        });
    });

    test("Gracefully handles error when 'Load More' fails", async () => {
        axios.get.mockImplementation((url) => {
            if (url === "/api/v1/category/get-category") {
            return Promise.resolve({ data: { success: true, category: [] } });
            } else if (url === "/api/v1/product/product-count") {
            return Promise.resolve({ data: { total: 8 } });
            } else if (url === "/api/v1/product/product-list/1") {
            return Promise.resolve({
                data: {
                success: true,
                products: [
                    { _id: "1", name: "Product 1", slug: "p1" },
                    { _id: "2", name: "Product 2", slug: "p2" },
                    { _id: "3", name: "Product 3", slug: "p3" },
                    { _id: "4", name: "Product 4", slug: "p4" },
                    { _id: "5", name: "Product 5", slug: "p5" },
                    { _id: "6", name: "Product 6", slug: "p6" },
                ],
                },
            });
            } else if (url === "/api/v1/product/product-list/2") {
            return Promise.reject(new Error("Load More Failed"));
            }
            return Promise.resolve({ data: {} });
        });
        
        await act(async () => {
            render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
            );
        });
        
        expect(await screen.findByText("Product 6")).toBeInTheDocument();
        
        fireEvent.click(screen.getByTestId("load-more-button"));
        
        await waitFor(() => {
            expect(screen.queryByText("Product 7")).not.toBeInTheDocument();
            expect(screen.queryByText("Product 8")).not.toBeInTheDocument();
        });
        });           
});
