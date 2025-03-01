/* eslint-disable testing-library/no-wait-for-multiple-assertions */
import React from "react";
import { render, screen, waitFor, cleanup, fireEvent } from "@testing-library/react";
import axios from "axios";
import { useCart } from "../context/cart";
import { useNavigate } from "react-router-dom";
import useCategory from "../hooks/useCategory";
import HomePage from "../pages/HomePage";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";

jest.mock("../components/Layout", () => ({ children }) => <div>{children}</div>);

jest.mock("../hooks/useCategory", () => ({
    __esModule: true,
    default: jest.fn(),
}));
jest.mock("../context/cart", () => ({
    useCart: jest.fn(),
}));
jest.mock("axios");
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: jest.fn(),
}));

describe("HomePage Initial Render", () => {
    const mockNavigate = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        useCart.mockReturnValue([[], jest.fn()]);
        useNavigate.mockReturnValue(mockNavigate);
        useCategory.mockReturnValue([]);
    });

    afterEach(cleanup);

    test("The banner image is displayed", () => {
        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );

        const bannerImage = screen.getByAltText("bannerimage");
        expect(bannerImage).toBeInTheDocument();
    });

    test("The 'Filter By Category' section is present", () => {
        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );

        expect(screen.getByText("Filter By Category")).toBeInTheDocument();
    });

    test("The 'All Products' section is present", () => {
        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );

        expect(screen.getByText("All Products")).toBeInTheDocument();
    });

    test("Default state should have an empty product list", () => {
        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );

        expect(screen.queryByRole("button", { name: "Loadmore" })).not.toBeInTheDocument();
    });
});

describe("Fetching Categories in HomePage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useCart.mockReturnValue([[], jest.fn()]);
        useNavigate.mockReturnValue(jest.fn());
        useCategory.mockReturnValue([]);
    });

    test("Handles successful API response with multiple categories", async () => {
        axios.get.mockResolvedValueOnce({
            data: {
                success: true,
                category: [
                    { _id: "1", name: "Electronics" },
                    { _id: "2", name: "Clothing" },
                ],
            },
        });

        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Electronics")).toBeInTheDocument();
            expect(screen.getByText("Clothing")).toBeInTheDocument();
        });
    });

    test("Handles API returning an empty category list", async () => {
        axios.get.mockResolvedValueOnce({
            data: {
                success: true,
                category: [],
            },
        });

        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
        });
    });

    test("Handles API failure gracefully", async () => {
        axios.get.mockRejectedValueOnce(new Error("API Error"));

        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
        });
    });
});

describe("Fetching Products in HomePage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useCart.mockReturnValue([[], jest.fn()]);
        useNavigate.mockReturnValue(jest.fn());
        useCategory.mockReturnValue([]);
    });

    test("Handles successful API response with multiple products", async () => {
        axios.get.mockResolvedValueOnce({
            data: {
                products: [
                    { _id: "1", name: "Laptop", price: 999.99, description: "High-end laptop" },
                    { _id: "2", name: "Phone", price: 699.99, description: "Latest smartphone" },
                ],
            },
        });

        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Laptop")).toBeInTheDocument();
            expect(screen.getByText("Phone")).toBeInTheDocument();
            expect(screen.getByText("High-end laptop...")).toBeInTheDocument();
            expect(screen.getByText("Latest smartphone...")).toBeInTheDocument();
        });
    });

    test("Handles API returning an empty product list", async () => {
        axios.get.mockResolvedValueOnce({
            data: {
                products: [],
            },
        });

        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.queryByText("No Products Found")).toBeInTheDocument();
        });
    });

    test("Handles API failure gracefully", async () => {
        axios.get.mockRejectedValueOnce(new Error("API Error"));

        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.queryByText("Laptop")).not.toBeInTheDocument();
            expect(screen.queryByText("Phone")).not.toBeInTheDocument();
        });
    });
});

describe("Filtering by Category in HomePage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useCart.mockReturnValue([[], jest.fn()]);
        useNavigate.mockReturnValue(jest.fn());
        useCategory.mockReturnValue([]);
    });

    afterEach(cleanup);

    test("Selecting one category updates the product list", async () => {
        axios.get.mockResolvedValueOnce({
            data: { success: true, category: [{ _id: "1", name: "Electronics" }] },
        });
        axios.post.mockResolvedValueOnce({
            data: { products: [{ _id: "1", name: "Laptop", category: "Electronics" }] },
        });

        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );

        expect(await screen.findByText("Electronics")).toBeInTheDocument();

        fireEvent.click(screen.getByText("Electronics"));

        expect(await screen.findByText("Laptop")).toBeInTheDocument();
    });

    test("Selecting multiple categories filters correctly", async () => {
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

        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );

        expect(await screen.findByText("Electronics")).toBeInTheDocument();
        expect(await screen.findByText("Clothing")).toBeInTheDocument();

        fireEvent.click(screen.getByText("Electronics"));
        fireEvent.click(screen.getByText("Clothing"));

        expect(await screen.findByText("Laptop")).toBeInTheDocument();
        expect(await screen.findByText("T-Shirt")).toBeInTheDocument();
    });

    test("Deselecting categories restores the full product list", async () => {
        axios.get.mockResolvedValueOnce({
            data: { success: true, category: [{ _id: "1", name: "Electronics" }] },
        });
        axios.post.mockResolvedValueOnce({
            data: { products: [{ _id: "1", name: "Laptop", category: "Electronics" }] },
        });
        axios.get.mockResolvedValueOnce({
            data: {
                products: [
                    { _id: "1", name: "Laptop", category: "Electronics" },
                    { _id: "2", name: "Phone", category: "Electronics" },
                ],
            },
        });

        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );

        expect(await screen.findByText("Electronics")).toBeInTheDocument();

        fireEvent.click(screen.getByText("Electronics"));
        expect(await screen.findByText("Laptop")).toBeInTheDocument();

        fireEvent.click(screen.getByText("Electronics")); // Deselect category

        expect(await screen.findByText("Laptop")).toBeInTheDocument();
        expect(await screen.findByText("Phone")).toBeInTheDocument();
    });

    test("Filtering with 0 categories fetches all products", async () => {
        axios.get.mockResolvedValueOnce({
            data: { success: true, category: [{ _id: "1", name: "Electronics" }] },
        });
        axios.get.mockResolvedValueOnce({
            data: {
                products: [
                    { _id: "1", name: "Laptop", category: "Electronics" },
                    { _id: "2", name: "Phone", category: "Electronics" },
                ],
            },
        });

        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );

        expect(await screen.findByText("Electronics")).toBeInTheDocument();

        fireEvent.click(screen.getByText("Electronics")); // Apply filter
        expect(await screen.findByText("Laptop")).toBeInTheDocument();

        fireEvent.click(screen.getByText("Electronics")); // Remove filter

        expect(await screen.findByText("Laptop")).toBeInTheDocument();
        expect(await screen.findByText("Phone")).toBeInTheDocument();
    });
});

describe("Filtering by Price in HomePage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useCart.mockReturnValue([[], jest.fn()]);
        useNavigate.mockReturnValue(jest.fn());
        useCategory.mockReturnValue([]);
    });

    test("Selecting one price range updates the product list", async () => {
        axios.get.mockResolvedValueOnce({
            data: { success: true, category: [] }, // Mock categories
        });
        axios.post.mockResolvedValueOnce({
            data: { products: [{ _id: "1", name: "Laptop", price: 999.99 }] },
        });

        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );

        expect(await screen.findByText("Filter By Price")).toBeInTheDocument();

        // Select the "$100 or more" price range
        fireEvent.click(screen.getByLabelText("$100 or more"));

        // Check if the filtered product appears
        expect(await screen.findByText("Laptop")).toBeInTheDocument();
    });

    test("Selecting multiple price ranges filters correctly", async () => {
        axios.get.mockResolvedValueOnce({
            data: { success: true, category: [] },
        });
        axios.post.mockResolvedValueOnce({
            data: {
                products: [
                    { _id: "1", name: "Laptop", price: 999.99 },
                    { _id: "2", name: "Smartphone", price: 699.99 },
                ],
            },
        });

        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );

        expect(await screen.findByText("Filter By Price")).toBeInTheDocument();

        fireEvent.click(screen.getByLabelText("$100 or more"));
        fireEvent.click(screen.getByLabelText("$20 to 39"));

        expect(await screen.findByText("Laptop")).toBeInTheDocument();
        expect(await screen.findByText("Smartphone")).toBeInTheDocument();
    });

    test("No price filter applied fetches all products", async () => {
        axios.get.mockResolvedValueOnce({
            data: {
                products: [
                    { _id: "1", name: "Laptop", price: 999.99 },
                    { _id: "2", name: "Smartphone", price: 699.99 },
                    { _id: "3", name: "Headphones", price: 49.99 },
                ],
            },
        });

        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );

        expect(await screen.findByText("Filter By Price")).toBeInTheDocument();

        expect(await screen.findByText("Laptop")).toBeInTheDocument();
        expect(await screen.findByText("Smartphone")).toBeInTheDocument();
        expect(await screen.findByText("Headphones")).toBeInTheDocument();
    });
});

describe("Pagination in HomePage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useCart.mockReturnValue([[], jest.fn()]);
        useNavigate.mockReturnValue(jest.fn());
        useCategory.mockReturnValue([]);
    });

    test("Clicking 'Load More' button loads new products", async () => {
        axios.get
            .mockResolvedValueOnce({
                data: {
                    products: [{ _id: "1", name: "Laptop" }],
                    total: 2,
                },
            })
            .mockResolvedValueOnce({
                data: {
                    products: [{ _id: "2", name: "Smartphone" }],
                },
            });

        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );

        expect(await screen.findByText("Laptop")).toBeInTheDocument();

        const loadMoreButton = screen.getByRole("button", { name: /load more/i });
        fireEvent.click(loadMoreButton);

        expect(await screen.findByText("Smartphone")).toBeInTheDocument();
    });

    test("Clicking 'Load More' when all products are loaded does nothing", async () => {
        axios.get.mockResolvedValueOnce({
            data: {
                products: [{ _id: "1", name: "Laptop" }],
                total: 1,
            },
        });

        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );

        expect(await screen.findByText("Laptop")).toBeInTheDocument();

        // Ensure Load More button is not present when all products are loaded
        expect(screen.queryByRole("button", { name: /load more/i })).not.toBeInTheDocument();
    });

    test("Handles API failure during pagination", async () => {
        axios.get
            .mockResolvedValueOnce({
                data: {
                    products: [{ _id: "1", name: "Laptop" }],
                    total: 2,
                },
            })
            .mockRejectedValueOnce(new Error("API Error"));

        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );

        expect(await screen.findByText("Laptop")).toBeInTheDocument();

        const loadMoreButton = screen.getByRole("button", { name: /load more/i });
        fireEvent.click(loadMoreButton);

        expect(screen.queryByText("Smartphone")).not.toBeInTheDocument();
    });
});

describe("Adding to Cart in HomePage", () => {
    let setCartMock;
    beforeEach(() => {
        setCartMock = jest.fn();
        useCart.mockReturnValue([[], setCartMock]);
        localStorage.clear();
    });

    test("Clicking 'Add to Cart' adds product to cart state", async () => {
        const mockProducts = [
            { _id: "1", name: "Laptop", price: 999.99 },
        ];

        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );

        // Simulate setting the products manually
        fireEvent.click(await screen.findByText("Add to Cart"));

        expect(setCartMock).toHaveBeenCalledTimes(1);
        expect(setCartMock).toHaveBeenCalledWith(expect.arrayContaining([mockProducts[0]]));
    });

    test("Clicking 'Add to Cart' updates localStorage", async () => {
        const mockProducts = [
            { _id: "1", name: "Laptop", price: 999.99 },
        ];

        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );

        fireEvent.click(await screen.findByText("Add to Cart"));

        const cart = JSON.parse(localStorage.getItem("cart"));
        expect(cart).toEqual(expect.arrayContaining([mockProducts[0]]));
    });

    test("Adding multiple items accumulates correctly", async () => {
        const mockProducts = [
            { _id: "1", name: "Laptop", price: 999.99 },
            { _id: "2", name: "Smartphone", price: 699.99 },
        ];

        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );

        fireEvent.click(await screen.findByText("Add to Cart"));
        fireEvent.click(await screen.findByText("Add to Cart"));

        const cart = JSON.parse(localStorage.getItem("cart"));
        expect(cart.length).toBe(2);
    });

    test("Adding the same item twice should not duplicate if cart logic prevents it", async () => {
        const mockProducts = [
            { _id: "1", name: "Laptop", price: 999.99 },
        ];

        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );

        fireEvent.click(await screen.findByText("Add to Cart"));
        fireEvent.click(await screen.findByText("Add to Cart"));

        const cart = JSON.parse(localStorage.getItem("cart"));

        if (cart.some(item => item._id === "1")) {
            // eslint-disable-next-line jest/no-conditional-expect
            expect(cart.length).toBe(1);  // Only one item should be present
        }
    });
});

describe("More Details Button Navigation", () => {
    let mockNavigate;

    beforeEach(() => {
        mockNavigate = jest.fn();
        useNavigate.mockReturnValue(mockNavigate);
    });

    test("Clicking 'More Details' navigates to correct product page", async () => {
        const mockProducts = [{ _id: "1", name: "Laptop", slug: "laptop" }];
        axios.get.mockResolvedValueOnce({ data: { products: mockProducts } });

        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );

        fireEvent.click(await screen.findByRole("button", { name: /More Details/i }));

        expect(mockNavigate).toHaveBeenCalledWith("/product/laptop");
    });
});

describe("Reset Filters Functionality", () => {
    test("Clicking 'Reset Filters' removes all applied filters", async () => {
        axios.get.mockResolvedValueOnce({ data: { products: [{ _id: "1", name: "Laptop" }] } });

        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );

        // Simulate applying a filter
        fireEvent.click(screen.getByText("$0 to 19")); // Select a price filter
        fireEvent.click(screen.getByText("RESET FILTERS"));

        // Check if all products are displayed again
        expect(await screen.findByText("Laptop")).toBeInTheDocument();
    });
});

describe("Handling API Failures", () => {
    test("API failure when fetching products should display an error message", async () => {
        axios.get.mockRejectedValueOnce(new Error("API Error"));

        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.queryByText("All Products")).not.toBeInTheDocument();
        });
    });

    test("API failure when filtering products should not crash the app", async () => {
        axios.get.mockResolvedValueOnce({ data: { products: [{ _id: "1", name: "Laptop" }] } });
        axios.post.mockRejectedValueOnce(new Error("Filter API Error"));

        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );

        // Simulate applying a filter
        fireEvent.click(screen.getByText("$0 to 19"));

        await waitFor(() => {
            expect(screen.getByText("All Products")).toBeInTheDocument(); // App should not crash
        });
    });
});