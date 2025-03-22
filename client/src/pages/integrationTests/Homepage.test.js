/* eslint-disable testing-library/no-wait-for-multiple-assertions */
/* eslint-disable testing-library/no-unnecessary-act */
import React from "react";
import { render, screen, waitFor, fireEvent, act, cleanup } from "@testing-library/react";
import HomePage from "../../pages/HomePage";
import ProductDetails from "../../pages/ProductDetails";
import CategoryProduct from "../CategoryProduct";
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

    // test("Filters products correctly by category", async () => {
    //     await act(async () => {
    //         render(
    //             <AuthProvider>
    //             <SearchProvider>
    //                 <CartProvider>
    //                 <MemoryRouter initialEntries={["/"]}>
    //                     <Routes>
    //                     <Route path="/" element={<HomePage />} />
    //                     <Route path="/category/:slug" element={<CategoryProduct />} />
    //                     </Routes>
    //                 </MemoryRouter>
    //                 </CartProvider>
    //             </SearchProvider>
    //             </AuthProvider>
    //         );
    //     });

    //     await new Promise((resolve) => setTimeout(resolve, 1000));

    //     await waitFor(() => {
    //         expect(screen.getByText("Laptop")).toBeInTheDocument();
    //         expect(screen.getByText("NUS T-shirt")).toBeInTheDocument();
    //     });
    //     const categoryLink = await screen.findByRole("link", { name: /Electronics/i });
    //     fireEvent.click(categoryLink);

    //     await new Promise((resolve) => setTimeout(resolve, 1000));

    //     await waitFor(() => {
    //         expect(screen.getByText("Laptop")).toBeInTheDocument();
    //         expect(screen.queryByText("NUS T-shirt")).not.toBeInTheDocument();
    //     });
    // });

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

        const addToCartButton = await screen.findAllByRole("button", { name: "ADD TO CART" });
        fireEvent.click(addToCartButton[0]);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        await waitFor(() => {
            expect(localStorage.getItem("cart")).toContain("NUS T-shirt");
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

        await new Promise((resolve) => setTimeout(resolve, 1000));

        await waitFor(() => {
            expect(screen.getByText("All Products")).toBeInTheDocument();
        });
        const viewProductButton = await screen.findAllByRole("button", { name: /View Product/i });
        await act(() => {
            fireEvent.click(viewProductButton[0]);
        });

        await new Promise((resolve) => setTimeout(resolve, 1000));

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
        const viewProductButton = await screen.findAllByRole("button", { name: /View Product/i });
        await act(() => {
            fireEvent.click(viewProductButton[0]);
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
});
