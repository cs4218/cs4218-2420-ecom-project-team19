/* eslint-disable testing-library/no-wait-for-multiple-assertions */
/* eslint-disable testing-library/no-unnecessary-act */
import React from "react";
import { render, screen, waitFor, fireEvent, act, cleanup, within } from "@testing-library/react";
import HomePage from "../../pages/HomePage";
import ProductDetails from "../../pages/ProductDetails";
import axios from "axios";
import { CartProvider } from "../../context/cart";
import { AuthProvider } from "../../context/auth";
import { SearchProvider } from "../../context/search";
import Search from "../Search";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom";

describe("HomePage Integration Tests", () => {
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

    test("Displays products from the real API", async () => {
        await act(async () => {
            render(
                <AuthProvider>
                <SearchProvider>
                    <CartProvider>
                    <MemoryRouter initialEntries={["/"]}>
                        <Routes>
                        <Route path="/" element={<HomePage />} />
                        </Routes>
                    </MemoryRouter>
                    </CartProvider>
                </SearchProvider>
                </AuthProvider>
            );
        });

        await new Promise((resolve) => setTimeout(resolve, 1000));

        await waitFor(() => {
            expect(screen.getByText("All Products")).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByText("Laptop")).toBeInTheDocument();
            expect(screen.getByText("NUS T-shirt")).toBeInTheDocument();
        });
    });

    test("Adding a product to the cart updates the UI", async () => {
        await act(async () => {
            render(
                <AuthProvider>
                <SearchProvider>
                    <CartProvider>
                    <MemoryRouter initialEntries={["/"]}>
                        <Routes>
                        <Route path="/" element={<HomePage />} />
                        </Routes>
                    </MemoryRouter>
                    </CartProvider>
                </SearchProvider>
                </AuthProvider>
            );
        });

        await new Promise((resolve) => setTimeout(resolve, 1000));

        const allCards = screen.getAllByRole("heading", { level: 5 }); // h5.card-title
        const shirtCard = allCards.find(card => card.textContent.includes("NUS T-shirt"));

        expect(shirtCard).toBeDefined();
        const cardBody = shirtCard.closest(".card-body");
        const addToCartBtn = within(cardBody).getByRole("button", { name: "ADD TO CART" });

        fireEvent.click(addToCartBtn);

        await waitFor(() => {
            expect(localStorage.getItem("cart")).toContain("NUS T-shirt");
            expect(screen.getByText("Item Added to Cart")).toBeInTheDocument();
        });

        expect(screen.getByText("Item Added to Cart")).toBeInTheDocument();
    });

    test("Clicking 'View Product' navigates to the product page", async () => {
        await act(async () => {
            render(
                <AuthProvider>
                <SearchProvider>
                    <CartProvider>
                    <MemoryRouter initialEntries={["/"]}>
                        <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/product/:slug" element={<ProductDetails />} />
                        </Routes>
                    </MemoryRouter>
                    </CartProvider>
                </SearchProvider>
                </AuthProvider>
            );
        });

        await new Promise((resolve) => setTimeout(resolve, 2000));

        await waitFor(() => {
            expect(screen.getByText("All Products")).toBeInTheDocument();
        });
        const allCards = screen.getAllByRole("heading", { level: 5 }); // h5.card-title
        const shirtCard = allCards.find(card => card.textContent.includes("NUS T-shirt"));
        expect(shirtCard).toBeDefined();
        const cardBody = shirtCard.closest(".card-body");
        const viewBtn = within(cardBody).getByRole("button", { name: /View Product/i });
        await act(() => {
            fireEvent.click(viewBtn);
        });

        await new Promise((resolve) => setTimeout(resolve, 2000));

        await waitFor(() => {
            expect(screen.getByText("Name : NUS T-shirt")).toBeInTheDocument();
            expect(screen.getByText("Description : Plain NUS T-shirt for sale")).toBeInTheDocument();
        });
    });

    test("Clicking 'View Product' navigates to the product page, and clicking 'Add To Cart' adds the item to the cart", async () => {
        await act(async () => {
            render(
                <AuthProvider>
                <SearchProvider>
                    <CartProvider>
                    <MemoryRouter initialEntries={["/"]}>
                        <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/product/:slug" element={<ProductDetails />} />
                        </Routes>
                    </MemoryRouter>
                    </CartProvider>
                </SearchProvider>
                </AuthProvider>
            );
        });

        await new Promise((resolve) => setTimeout(resolve, 1000));

        await waitFor(() => {
            expect(screen.getByText("All Products")).toBeInTheDocument();
        });

        const allCards = screen.getAllByRole("heading", { level: 5 }); // h5.card-title
        const shirtCard = allCards.find(card => card.textContent.includes("NUS T-shirt"));
        expect(shirtCard).toBeDefined();
        const cardBody = shirtCard.closest(".card-body");
        const viewBtn = within(cardBody).getByRole("button", { name: /View Product/i });
        await act(() => {
            fireEvent.click(viewBtn);
        });

        await new Promise((resolve) => setTimeout(resolve, 1000));

        await waitFor(() => {
            expect(screen.getByText("Name : NUS T-shirt")).toBeInTheDocument();
            expect(screen.getByText("Description : Plain NUS T-shirt for sale")).toBeInTheDocument();
        });

        const addToCartButton = await screen.findAllByRole("button", { name: /ADD TO CART/i });
        fireEvent.click(addToCartButton[0]);

        await waitFor(() => {
            expect(localStorage.getItem("cart")).toContain("NUS T-shirt");
        });

        expect(screen.getAllByText("Item Added to Cart").length).toBeGreaterThan(0);
    });      
});
