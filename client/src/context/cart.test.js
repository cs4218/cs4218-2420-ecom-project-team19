import React from "react";
import { render, act } from "@testing-library/react";
import { CartProvider, useCart } from "../context/cart";
import { createContext } from "react";

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = value.toString(); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { store = {}; }
    };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("CartContext Tests", () => {
    beforeEach(() => {
        localStorage.clear(); // Reset before each test
    });

    test("CartProvider initializes with an empty cart", () => {
        let cartState;
        const TestComponent = () => {
            cartState = useCart();
            return null;
        };

        render(
            <CartProvider>
                <TestComponent />
            </CartProvider>
        );

        expect(cartState[0]).toEqual([]);
    });

    test("CartProvider loads cart data from localStorage", () => {
        localStorage.setItem("cart", JSON.stringify([{ _id: "1", name: "Laptop" }]));

        let cartState;
        const TestComponent = () => {
            cartState = useCart();
            return null;
        };

        render(
            <CartProvider>
                <TestComponent />
            </CartProvider>
        );

        expect(cartState[0]).toEqual([{ _id: "1", name: "Laptop" }]);
    });

    test("setCart updates cart state correctly", () => {
        let cartState, setCart;
        const TestComponent = () => {
            [cartState, setCart] = useCart();
            return null;
        };

        render(
            <CartProvider>
                <TestComponent />
            </CartProvider>
        );

        act(() => {
            setCart([{ _id: "2", name: "Phone" }]);
        });

        expect(cartState).toEqual([{ _id: "2", name: "Phone" }]);
    });

    test("useCart provides access to cart state", () => {
        let cartState;
        const TestComponent = () => {
            cartState = useCart();
            return null;
        };

        render(
            <CartProvider>
                <TestComponent />
            </CartProvider>
        );

        expect(cartState).toHaveLength(2);
        expect(typeof cartState[1]).toBe("function");
    });

    test("CartProvider does not modify localStorage on first render", () => {
        render(
            <CartProvider>
                <></>
            </CartProvider>
        );

        expect(localStorage.getItem("cart")).toEqual(JSON.stringify([]));
    });

    test("Updates to cart reflect in localStorage", () => {
        let setCart;
        const TestComponent = () => {
            [, setCart] = useCart();
            return null;
        };

        render(
            <CartProvider>
                <TestComponent />
            </CartProvider>
        );

        act(() => {
            setCart([{ _id: "3", name: "Tablet" }]);
        });

        expect(localStorage.getItem("cart")).toEqual(JSON.stringify([{ _id: "3", name: "Tablet" }]));
    });

    test("Context remains persistent across re-renders", () => {
        let cartState;
        const TestComponent = () => {
            cartState = useCart();
            return null;
        };

        const { rerender } = render(
            <CartProvider>
                <TestComponent />
            </CartProvider>
        );

        expect(cartState[0]).toEqual([]);

        act(() => {
            cartState[1]([{ _id: "4", name: "Monitor" }]);
        });

        rerender(
            <CartProvider>
                <TestComponent />
            </CartProvider>
        );

        expect(cartState[0]).toEqual([{ _id: "4", name: "Monitor" }]);
    });
});
