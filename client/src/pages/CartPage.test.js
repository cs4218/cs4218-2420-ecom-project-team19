import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CartPage from "../pages/CartPage";
import { useCart } from "../context/cart";
import { useAuth } from "../context/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "@testing-library/jest-dom";

// Mock dependencies
jest.mock("../components/Layout", () => ({ children }) => <div>{children}</div>);
jest.mock("braintree-web-drop-in-react", () => () => <div data-testid="braintree-dropin"></div>);
jest.mock("../context/cart", () => ({
    useCart: jest.fn(),
}));
jest.mock("../context/auth", () => ({
    useAuth: jest.fn(),
}));
jest.mock("axios");
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: jest.fn(),
}));

describe("CartPage Tests", () => {
    let setCartMock, mockNavigate;

    beforeEach(() => {
        jest.clearAllMocks();
        setCartMock = jest.fn();
        mockNavigate = jest.fn();
        useNavigate.mockReturnValue(mockNavigate);
    });

    test("Displays an empty cart message when no items are present", () => {
        useCart.mockReturnValue([[], setCartMock]);
        useAuth.mockReturnValue([{ user: { name: "Test User" }, token: "12345" }]);

        render(<CartPage />);

        expect(screen.getByText("Your Cart Is Empty")).toBeInTheDocument();
    });

    test("Displays cart items correctly", () => {
        useCart.mockReturnValue([
            [{ _id: "1", name: "Laptop", price: 999.99, description: "Powerful laptop" }],
            setCartMock,
        ]);
        useAuth.mockReturnValue([{ user: { name: "Test User" }, token: "12345" }]);

        render(<CartPage />);

        expect(screen.getByText("Laptop")).toBeInTheDocument();
        expect(screen.getByText("Powerful laptop")).toBeInTheDocument();
        expect(screen.getByText("Price : 999.99")).toBeInTheDocument();
    });

    test("Displays correct total price", () => {
        useCart.mockReturnValue([
            [
                { _id: "1", price: 50 },
                { _id: "2", price: 100 },
            ],
            setCartMock,
        ]);
        useAuth.mockReturnValue([{ user: { name: "Test User" }, token: "12345" }]);

        render(<CartPage />);

        expect(screen.getByText("Total : $150.00")).toBeInTheDocument();
    });

    test("Clicking 'Remove' button removes the item from the cart", () => {
        const mockCart = [
            { _id: "1", name: "Laptop", price: 999.99 },
            { _id: "2", name: "Phone", price: 699.99 },
        ];
        useCart.mockReturnValue([mockCart, setCartMock]);
        useAuth.mockReturnValue([{ user: { name: "Test User" }, token: "12345" }]);

        render(<CartPage />);

        fireEvent.click(screen.getAllByText("Remove")[0]);

        expect(setCartMock).toHaveBeenCalledWith([{ _id: "2", name: "Phone", price: 699.99 }]);
    });

    test("LocalStorage is updated when item is removed", () => {
        const mockCart = [{ _id: "1", name: "Laptop", price: 999.99 }];
        useCart.mockReturnValue([mockCart, setCartMock]);
        useAuth.mockReturnValue([{ user: { name: "Test User" }, token: "12345" }]);

        render(<CartPage />);

        fireEvent.click(screen.getByText("Remove"));

        expect(localStorage.getItem("cart")).toEqual(JSON.stringify([]));
    });

    test("Displays Braintree DropIn component when clientToken is available", async () => {
        useCart.mockReturnValue([
            [{ _id: "1", price: 50 }],
            setCartMock,
        ]);
        useAuth.mockReturnValue([{ user: { name: "Test User" }, token: "12345" }]);
        axios.get.mockResolvedValueOnce({ data: { clientToken: "mock-token" } });

        render(<CartPage />);

        await waitFor(() => expect(screen.getByTestId("braintree-dropin")).toBeInTheDocument());
    });

    test("Make Payment button is disabled when cart is empty", () => {
        useCart.mockReturnValue([[], setCartMock]);
        useAuth.mockReturnValue([{ user: { name: "Test User" }, token: "12345" }]);

        render(<CartPage />);

        expect(screen.getByText("Make Payment")).toBeDisabled();
    });

    test("Make Payment button is disabled when user is not logged in", () => {
        useCart.mockReturnValue([
            [{ _id: "1", price: 50 }],
            setCartMock,
        ]);
        useAuth.mockReturnValue([{ user: null, token: null }]);

        render(<CartPage />);

        expect(screen.getByText("Make Payment")).toBeDisabled();
    });

    test("Fetches Braintree token on mount", async () => {
        useCart.mockReturnValue([[], setCartMock]);
        useAuth.mockReturnValue([{ user: { name: "Test User" }, token: "12345" }]);

        axios.get.mockResolvedValueOnce({ data: { clientToken: "mock-token" } });

        render(<CartPage />);

        await waitFor(() => expect(axios.get).toHaveBeenCalledWith("/api/v1/product/braintree/token"));
    });

    test("Handles Braintree token fetch failure gracefully", async () => {
        useCart.mockReturnValue([[], setCartMock]);
        useAuth.mockReturnValue([{ user: { name: "Test User" }, token: "12345" }]);

        axios.get.mockRejectedValueOnce(new Error("Failed to fetch token"));

        render(<CartPage />);

        await waitFor(() => expect(screen.queryByTestId("braintree-dropin")).not.toBeInTheDocument());
    });

    test("Handles payment process successfully", async () => {
        useCart.mockReturnValue([
            [{ _id: "1", price: 50 }],
            setCartMock,
        ]);
        useAuth.mockReturnValue([{ user: { name: "Test User", address: "123 Street" }, token: "12345" }]);

        axios.post.mockResolvedValueOnce({ data: { success: true } });

        render(<CartPage />);

        fireEvent.click(screen.getByText("Make Payment"));

        await waitFor(() => expect(axios.post).toHaveBeenCalledWith("/api/v1/product/braintree/payment", expect.any(Object)));
        expect(setCartMock).toHaveBeenCalledWith([]);
        expect(localStorage.getItem("cart")).toBeNull();
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard/user/orders");
    });

    test("Calculates total price correctly", () => {
        const { totalPrice } = require("../pages/CartPage");
    
        expect(totalPrice([{ price: 10 }, { price: 20 }])).toBe("$30.00");
        expect(totalPrice([{ price: 0 }])).toBe("$0.00");
        expect(totalPrice([])).toBe("$0.00");
        expect(totalPrice(undefined)).toBe("$0.00");
    });

    test("Removes item from cart correctly", () => {
        const { removeCartItem } = require("../pages/CartPage");
        let cart = [
            { _id: "1", name: "Laptop", price: 999.99 },
            { _id: "2", name: "Phone", price: 699.99 },
        ];
        const setCartMock = jest.fn();
    
        removeCartItem("1", cart, setCartMock);
    
        expect(setCartMock).toHaveBeenCalledWith([{ _id: "2", name: "Phone", price: 699.99 }]);
    });

    test("getToken() sets clientToken on success", async () => {
        useCart.mockReturnValue([[], jest.fn()]);
        useAuth.mockReturnValue([{ user: { name: "Test User" }, token: "12345" }]);
    
        axios.get.mockResolvedValueOnce({ data: { clientToken: "mock-token" } });
    
        render(<CartPage />);
    
        await waitFor(() => expect(screen.getByTestId("braintree-dropin")).toBeInTheDocument());
    });

    test("Make Payment button disabled when address is missing", () => {
        useCart.mockReturnValue([[{ _id: "1", price: 50 }], jest.fn()]);
        useAuth.mockReturnValue([{ user: { name: "Test User" }, token: "12345", address: "" }]);
    
        render(<CartPage />);
    
        expect(screen.getByText("Make Payment")).toBeDisabled();
    });
    
    test("Make Payment button enabled when cart, token, and address are available", async () => {
        useCart.mockReturnValue([
            [{ _id: "1", price: 50, description: "Test Product" }],
            jest.fn()
        ]);
        useAuth.mockReturnValue([{ user: { name: "Test User", address: "123 Street" }, token: "12345" }]);
    
        axios.get.mockResolvedValueOnce({ data: { clientToken: "mock-client-token" } });
    
        render(<CartPage />);
    
        // Mock the instance required for DropIn
        await waitFor(() => {
            const dropIn = screen.getByTestId("braintree-dropin");
            dropIn.onInstance?.({ requestPaymentMethod: jest.fn() }); // Manually set instance
        });
    
        // Now, check that the button appears and is enabled
        await waitFor(() => expect(screen.getByText("Make Payment")).toBeEnabled());
    });
});
