/* eslint-disable testing-library/no-unnecessary-act */
/* eslint-disable testing-library/no-wait-for-multiple-assertions */
import React from "react";
import { render, screen, waitFor, fireEvent, act, cleanup } from "@testing-library/react";
import HomePage from "../../pages/HomePage";
import axios from "axios";
import { SearchProvider } from "../../context/search";
import * as searchContext from "../../context/search"
import { CartProvider } from "../../context/cart";
import { AuthProvider } from "../../context/auth";
import Search from "../Search";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom";

describe("Integration tests for Search function", () => {
    beforeAll(async () => {
        axios.defaults.baseURL = "http://localhost:6060";
        console.log("Waiting for backend...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
    });
    beforeEach(async () => {
        cleanup();
        localStorage.clear();
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
        jest.restoreAllMocks();
    })

    afterAll(() => {
        axios.defaults.baseURL = "";
    })
    test("Search with no results displays no product message correctly", async () => {
        jest.spyOn(searchContext, "useSearch").mockReturnValue([
            { keyword: "laptop", results: [] },
            jest.fn(),
        ]);
        await act(async () => {
            render(
                <AuthProvider>
                    <SearchProvider>
                        <CartProvider>
                        <MemoryRouter initialEntries={["/"]}>
                            <Routes>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/search" element={<Search />} />
                            </Routes>
                        </MemoryRouter>
                        </CartProvider>
                    </SearchProvider>
                </AuthProvider>
            );
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const input = screen.getByPlaceholderText("Search");
        fireEvent.change(input, { target: { value: "Laptop" } });

        const searchButton = screen.getByRole("button", { name: /search/i });
        fireEvent.click(searchButton);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        await waitFor(() => {
            expect(screen.queryByText("All Products")).not.toBeInTheDocument();
            expect(screen.getByText("No Products Found")).toBeInTheDocument();
        });
    });

    test("Search filters products correctly", async () => {
        await act(async () => {
            render(
                <AuthProvider>
                    <SearchProvider>
                        <CartProvider>
                        <MemoryRouter initialEntries={["/"]}>
                            <Routes>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/search" element={<Search />} />
                            </Routes>
                        </MemoryRouter>
                        </CartProvider>
                    </SearchProvider>
                </AuthProvider>
            );
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const input = screen.getByPlaceholderText("Search");
        fireEvent.change(input, { target: { value: "Laptop" } });

        const searchButton = screen.getByRole("button", { name: /search/i });
        fireEvent.click(searchButton);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        await waitFor(() => {
            expect(screen.getByText("Laptop")).toBeInTheDocument();
            expect(screen.queryByText("NUS T-shirt")).not.toBeInTheDocument();
        });
    });

    test("Search gives correct number of results", async () => {
        await act(async () => {
            render(
                <AuthProvider>
                    <SearchProvider>
                        <CartProvider>
                        <MemoryRouter initialEntries={["/"]}>
                            <Routes>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/search" element={<Search />} />
                            </Routes>
                        </MemoryRouter>
                        </CartProvider>
                    </SearchProvider>
                </AuthProvider>
            );
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const input = screen.getByPlaceholderText("Search");
        fireEvent.change(input, { target: { value: "book" } });
        const searchButton = screen.getByRole("button", { name: /search/i });
        fireEvent.click(searchButton);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        await waitFor(() => {
            expect(screen.getByText("Textbook")).toBeInTheDocument();
            expect(screen.getByText("The Law of Contract in Singapore")).toBeInTheDocument();
            expect(screen.queryByText("Laptop")).not.toBeInTheDocument();
            expect(screen.getByText("Found 2")).toBeInTheDocument();
            expect(screen.getAllByTestId("product-card")).toHaveLength(2);
        });
    });

    test("Buttons 'More details' and 'Add to cart' show up for the product", async () => {
        await act(async () => {
            render(
                <AuthProvider>
                    <SearchProvider>
                        <CartProvider>
                        <MemoryRouter initialEntries={["/"]}>
                            <Routes>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/search" element={<Search />} />
                            </Routes>
                        </MemoryRouter>
                        </CartProvider>
                    </SearchProvider>
                </AuthProvider>
            );
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const input = screen.getByPlaceholderText("Search");
        fireEvent.change(input, { target: { value: "Laptop" } });

        const searchButton = screen.getByRole("button", { name: /search/i });
        fireEvent.click(searchButton);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        await waitFor(() => {
            expect(screen.getByText("Laptop")).toBeInTheDocument();
            expect(screen.queryByText("NUS T-shirt")).not.toBeInTheDocument();
            expect(screen.getByRole("button", { name: /more details/i })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /add to cart/i })).toBeInTheDocument();
        });
    });
});