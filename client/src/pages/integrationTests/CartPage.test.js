/* eslint-disable testing-library/no-unnecessary-act */
/* eslint-disable testing-library/no-wait-for-multiple-assertions */
import React from "react";
import { render, screen, waitFor, fireEvent, act, cleanup } from "@testing-library/react";
import { AuthProvider } from "../../context/auth";
import * as authContext from "../../context/auth";
import { SearchProvider } from "../../context/search";
import { CartProvider } from "../../context/cart";
import Profile from "../user/Profile"
import CartPage from "../CartPage";
import Login from "../Auth/Login"
import axios from "axios";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom";

global.__mockRequestPaymentMethod = jest.fn().mockResolvedValue({ nonce: "test-nonce" });

jest.mock("braintree-web-drop-in-react", () => {
    const React = require("react");
    return {
        __esModule: true,
        default: function MockDropIn({ onInstance }) {
            const hasSet = React.useRef(false);
            React.useEffect(() => {
                if (!hasSet.current && onInstance) {
                    onInstance({
                        requestPaymentMethod: global.__mockRequestPaymentMethod,
                    });
                    hasSet.current = true;
                }
            }, [onInstance]);
            return <div data-testid="braintree-dropin">Mock DropIn</div>;
        },
    };
});

describe("CartPage integration tests", () => {
    beforeAll(async () => {
        axios.defaults.baseURL = "http://localhost:6060";
    })

    beforeEach(async () => {
        jest.spyOn(axios, "get").mockResolvedValue({ data: { clientToken: "mock-token" } });
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
    })

    afterEach(() => {
        jest.restoreAllMocks();
        cleanup();
    })

    afterAll(async () => {
        axios.defaults.baseURL = "";
    })

    test("CartPage renders fallback price if cart is malformed", async () => {
        const brokenCart = [{ price: 10 }, null]; // causes reduce to fail
      
        await act(async () => {
            render(
                <AuthProvider>
                <SearchProvider>
                    <CartProvider>
                    <MemoryRouter initialEntries={["/cart"]}>
                        <Routes>
                        <Route path="/cart" element={<CartPage />} />
                        </Routes>
                    </MemoryRouter>
                    </CartProvider>
                </SearchProvider>
                </AuthProvider>
            );
        });
        localStorage.setItem("cart", JSON.stringify(brokenCart));
      
        // This is the fallback in the catch block
        expect(screen.getByText("Total : $0.00")).toBeInTheDocument();
    });

    test("Removes item from cart when 'Remove' button is clicked", async () => {
        const mockCart = [
          { _id: "1", name: "Laptop", description: "A good one", price: 999 },
          { _id: "2", name: "NUS T-shirt", description: "Blue tee", price: 20 },
        ];
      
        localStorage.setItem("cart", JSON.stringify(mockCart));
      
        await act(async () => {
            render(
                <AuthProvider>
                <SearchProvider>
                    <CartProvider>
                    <MemoryRouter initialEntries={["/cart"]}>
                        <Routes>
                        <Route path="/cart" element={<CartPage />} />
                        </Routes>
                    </MemoryRouter>
                    </CartProvider>
                </SearchProvider>
                </AuthProvider>
            );
        });
      
        expect(screen.getByText("Laptop")).toBeInTheDocument();
      
        const removeButtons = screen.getAllByRole("button", { name: /remove/i });
        fireEvent.click(removeButtons[0]);
      
        await waitFor(() => {
            expect(screen.queryByText("Laptop")).not.toBeInTheDocument();
        });
    });  
    
    test("Displays cart item and shows dropin", async () => {
    
        jest.spyOn(authContext, "useAuth").mockReturnValue([
            { user: { name: "Tester", address: "123 Main St" }, token: "test-token" },
            jest.fn()
        ]);        
        jest.spyOn(axios, "get").mockImplementation((url) => {
            if (url.includes("braintree/token")) {
                return Promise.resolve({ data: { clientToken: "token" } });
            }
            return Promise.resolve({ data: { category: [] } });
        });

        const mockCart = [
            { _id: "1", name: "Laptop", description: "A good one", price: 999 },
            { _id: "2", name: "NUS T-shirt", description: "Blue tee", price: 20 },
          ];
        
        localStorage.setItem("cart", JSON.stringify(mockCart));

        await act(async () => {
            render(
                <AuthProvider>
                <SearchProvider>
                    <CartProvider>
                    <MemoryRouter initialEntries={["/cart"]}>
                        <Routes>
                        <Route path="/cart" element={<CartPage />} />
                        </Routes>
                    </MemoryRouter>
                    </CartProvider>
                </SearchProvider>
                </AuthProvider>
            );
        });

        expect(await screen.findByText("Laptop")).toBeInTheDocument();
        expect(screen.getByTestId("braintree-dropin")).toBeInTheDocument();
    });

    test("Completes payment successfully and clears cart", async () => {
        jest.spyOn(authContext, "useAuth").mockReturnValue([
            { user: { name: "Tester", address: "123 Main St" }, token: "test-token" },
            jest.fn()
        ]);
    
        jest.spyOn(axios, "get").mockImplementation((url) => {
            if (url.includes("braintree/token")) {
                return Promise.resolve({ data: { clientToken: "mock-token" } });
            }
            return Promise.resolve({ data: { category: [] } });
        });
    
        jest.spyOn(axios, "post").mockResolvedValue({ data: { success: true } });
    
        const mockCart = [
            { _id: "1", name: "Laptop", description: "A good one", price: 999 }
        ];
        localStorage.setItem("cart", JSON.stringify(mockCart));
    
        await act(async () => {
            render(
                <AuthProvider>
                    <SearchProvider>
                        <CartProvider>
                            <MemoryRouter initialEntries={["/cart"]}>
                                <Routes>
                                    <Route path="/cart" element={<CartPage />} />
                                    <Route path="/dashboard/user/orders" element={<div>Orders Page</div>} />
                                </Routes>
                            </MemoryRouter>
                        </CartProvider>
                    </SearchProvider>
                </AuthProvider>
            );
        });
    
        const payButton = screen.getByRole("button", { name: /make payment/i });
        fireEvent.click(payButton);
    
        await waitFor(() => {
            expect(global.__mockRequestPaymentMethod).toHaveBeenCalled();
            expect(localStorage.getItem("cart")).toBe("[]");
            expect(screen.getByText("Orders Page")).toBeInTheDocument();
        });
    });
    
    test("Handles payment failure gracefully", async () => {
        const errorMock = new Error("Payment failed");
    
        jest.spyOn(authContext, "useAuth").mockReturnValue([
            { user: { name: "Tester", address: "123 Main St" }, token: "test-token" },
            jest.fn()
        ]);
    
        jest.spyOn(axios, "get").mockImplementation((url) => {
            if (url.includes("braintree/token")) {
                return Promise.resolve({ data: { clientToken: "mock-token" } });
            }
            return Promise.resolve({ data: { category: [] } });
        });
    
        jest.spyOn(axios, "post").mockRejectedValue(errorMock);
    
        const mockCart = [
            { _id: "1", name: "Laptop", description: "A good one", price: 999 }
        ];
        localStorage.setItem("cart", JSON.stringify(mockCart));
    
        const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    
        await act(async () => {
            render(
                <AuthProvider>
                    <SearchProvider>
                        <CartProvider>
                            <MemoryRouter initialEntries={["/cart"]}>
                                <Routes>
                                    <Route path="/cart" element={<CartPage />} />
                                </Routes>
                            </MemoryRouter>
                        </CartProvider>
                    </SearchProvider>
                </AuthProvider>
            );
        });
    
        
        const payButton = screen.getByRole("button", { name: /make payment/i });
        fireEvent.click(payButton);
    
        await waitFor(() => {
            expect(global.__mockRequestPaymentMethod).toHaveBeenCalled();
            expect(axios.post).toHaveBeenCalled();
            expect(consoleSpy).toHaveBeenCalledWith(
                "Error in handlePayment:",
                expect.any(Error)
            );
        });
    
        consoleSpy.mockRestore();
    });  
    
    test("Displays current address and navigates to login page on update address click if not logged in", async () => {
        const mockCart = [
            { _id: "1", name: "Laptop", description: "Powerful", price: 1000 }
        ];
        localStorage.setItem("cart", JSON.stringify(mockCart));
    
        await act(async () => {
            render(
                <AuthProvider>
                    <SearchProvider>
                        <CartProvider>
                            <MemoryRouter initialEntries={["/cart"]}>
                                <Routes>
                                    <Route path="/cart" element={<CartPage />} />
                                    <Route path="/login" element={<Login />} />
                                </Routes>
                            </MemoryRouter>
                        </CartProvider>
                    </SearchProvider>
                </AuthProvider>
            );
        });

        const loginButton = await screen.findByRole("button", { name: /login to checkout/i });
        fireEvent.click(loginButton);

        await waitFor(() => {
            expect(screen.getByText("LOGIN FORM")).toBeInTheDocument();
            expect(screen.getByText("Forgot Password")).toBeInTheDocument();
        });
    });

    test("Displays current address and navigates to profile page on update address click", async () => {
        // const navigateMock = jest.fn();
    
        // // Mock useNavigate
        // jest.spyOn(require("react-router-dom"), "useNavigate").mockReturnValue(navigateMock);
    
        // Mock user with address
        jest.spyOn(authContext, "useAuth").mockReturnValue([
            { user: { name: "Tester", address: "123 Main St" }, token: "mock-token" },
            jest.fn(),
        ]);
    
        const mockCart = [
            { _id: "1", name: "Laptop", description: "Powerful", price: 1000 }
        ];
        localStorage.setItem("cart", JSON.stringify(mockCart));
    
        await act(async () => {
            render(
                <AuthProvider>
                    <SearchProvider>
                        <CartProvider>
                            <MemoryRouter initialEntries={["/cart"]}>
                                <Routes>
                                    <Route path="/cart" element={<CartPage />} />
                                    <Route path="/dashboard/user/profile" element={<Profile />} />
                                </Routes>
                            </MemoryRouter>
                        </CartProvider>
                    </SearchProvider>
                </AuthProvider>
            );
        });
    
        expect(screen.getByText("Current Address")).toBeInTheDocument();
        expect(screen.getByText("123 Main St")).toBeInTheDocument();
    
        const updateBtn = screen.getByRole("button", { name: /update address/i });
        fireEvent.click(updateBtn);
    
        await waitFor(() => {
            expect(screen.getByText("USER PROFILE")).toBeInTheDocument();
            expect(screen.getAllByText("Dashboard").length).toBeGreaterThan(0);
        });
    });    
});