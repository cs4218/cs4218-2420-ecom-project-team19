import Header from "./Header";
import React from "react";
import { useAuth } from "../context/auth";
import { useCart } from "../context/cart";
import useCategory from "../hooks/useCategory";
import toast from "react-hot-toast";
import { BrowserRouter } from "react-router-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock useAuth
jest.mock("../context/auth", () => ({
    useAuth: jest.fn()
}));

jest.mock("../context/cart", () => ({
    useCart: jest.fn()
}));

jest.mock("../hooks/useCategory", () => jest.fn());
  
jest.mock("react-hot-toast", () => ({
    success: jest.fn()
}));

jest.mock("antd", () => ({
    Badge: ({ count, children }) => 
        <div data-testid="mockedBadge">
            {count}
            {children}
        </div>,
}));

jest.mock("./Form/SearchInput", () => () => (
    <div>
        SearchInput
    </div>
));

// Test UI
describe("Given Header component and its links", () => {
    beforeEach(() => {
        useAuth.mockReturnValue([{}, jest.fn()]);
        useCart.mockReturnValue([[]]);
        useCategory.mockReturnValue([]);
        jest.clearAllMocks();
    });

    test("When links are rendered", () => {
        render(
            <BrowserRouter>
                <Header/>
            </BrowserRouter>
        );

        expect(screen.getByRole("link", {name: "🛒 Virtual Vault"})).toBeInTheDocument();
        expect(screen.getByRole("link", {name: "Home"})).toBeInTheDocument();
        expect(screen.getByRole("link", {name: "Categories"})).toBeInTheDocument();
        expect(screen.getByRole("link", {name: "All Categories"})).toBeInTheDocument();
        expect(screen.getByRole("link", {name: "Register"})).toBeInTheDocument();
    });

    test("When Search Input is rendered", () => {
        render(
            <BrowserRouter>
                <Header/>
            </BrowserRouter>
        );

        expect(screen.getByText("SearchInput")).toBeInTheDocument();
    })

    // Test Virtual vault link's behavior
    test("When Virtual Vault link is clicked", () => {
        render(
            <BrowserRouter>
                <Header/>
            </BrowserRouter>
        );
        const linkElement = screen.getByRole("link", {name: "🛒 Virtual Vault"});
        expect(linkElement).toHaveAttribute("href", "/");

        fireEvent.click(linkElement);
        expect(window.location.pathname).toBe("/");
    });

    // Test Home link's behavior
    test("When Home link is clicked", () => {
        render(
            <BrowserRouter>
                <Header/>
            </BrowserRouter>
        );
        const linkElement = screen.getByRole("link", {name: "Home"});
        expect(linkElement).toHaveAttribute("href", "/");

        // simulate clicking of link
        fireEvent.click(linkElement);
        expect(window.location.pathname).toBe("/");
    });

    // Test Categories link's behavior
    test("When Categories link is clicked", () => {
        render(
            <BrowserRouter>
                <Header/>
            </BrowserRouter>
        );
        const linkElement = screen.getByRole("link", {name: "Categories"});
        expect(linkElement).toHaveAttribute("href", "/categories");

        fireEvent.click(linkElement);
        expect(window.location.pathname).toBe("/categories");
    });

    // Test All Categories link's behavior
    test("When All Categories link is clicked", () => {
        render(
            <BrowserRouter>
                <Header/>
            </BrowserRouter>
        );
        const linkElement = screen.getByRole("link", {name: "All Categories"});
        expect(linkElement).toHaveAttribute("href", "/categories");

        fireEvent.click(linkElement);
        expect(window.location.pathname).toBe("/categories");
    });
});

// Test different numbers of categories and cart items
describe("Given categories and cart elements", () => {
    beforeEach(() => {
        useAuth.mockReturnValue([{}, jest.fn()]);
        useCart.mockReturnValue([[]]);
        useCategory.mockReturnValue([]);
        jest.clearAllMocks();
    });

    test("When categories are not empty", () => {
        useCategory.mockReturnValue([{ slug: "testCategory", name: "Test Category" }]);
        
        render(
            <BrowserRouter>
                <Header/>
            </BrowserRouter>
        );

        fireEvent.click(screen.getByRole("link", {name: "Categories"}));
        expect(screen.getByText("All Categories")).toBeInTheDocument();
        expect(screen.getByText("Test Category")).toBeInTheDocument();
    });

    test("When a category is clicked", () => {
        useCategory.mockReturnValue([{ slug: "testCategory", name: "Test Category" }]);
        
        render(
            <BrowserRouter>
                <Header/>
            </BrowserRouter>
        );

        fireEvent.click(screen.getByRole("link", {name: "Categories"}));
        
        const linkElement = screen.getByText("Test Category");
        expect(linkElement).toHaveAttribute("href", "/category/testCategory");

        fireEvent.click(linkElement);
        expect(window.location.pathname).toBe("/category/testCategory");
    });

    test("When cart is empty", () => {
        useCart.mockReturnValue([[]]);

        render(
            <BrowserRouter>
                <Header/>
            </BrowserRouter>
        );

        //find badge
        const badgeElement = screen.getByTestId("mockedBadge");
        expect(badgeElement).toHaveTextContent('0'); // Check that the badge displays "0"
        expect(badgeElement).not.toHaveTextContent('1');
    });

    test("When cart is not empty", () => {
        useCart.mockReturnValue([["item1", "item2", "item3"]]);

        render(
            <BrowserRouter>
                <Header/>
            </BrowserRouter>
        );

        //find badge
        const badgeElement = screen.getByTestId("mockedBadge");
        expect(badgeElement).toHaveTextContent('3'); // Check that the badge displays "3"
        expect(badgeElement).not.toHaveTextContent('6');
    });
});


// Given no user is logged in, we test for register and login links
describe("Given that no user is logged in", () => {
    beforeEach(() => {
        useAuth.mockReturnValue([ {}, jest.fn() ]);
        useCart.mockReturnValue([[]]);
        useCategory.mockReturnValue([]);
        jest.clearAllMocks();
    });

    test("When Register and Login links are rendered", () => {
        render(
            <BrowserRouter>
                <Header/>
            </BrowserRouter>
        );

        expect(screen.getByRole("link", {name: "Login"})).toBeInTheDocument();
        expect(screen.getByRole("link", {name: "Cart"})).toBeInTheDocument();
    });

    // Test Register link's behavior
    test("When Register link is clicked", () => {
        render(
            <BrowserRouter>
                <Header/>
            </BrowserRouter>
        );
        const linkElement = screen.getByRole("link", {name: "Register"});
        expect(linkElement).toHaveAttribute("href", "/register");

        fireEvent.click(linkElement);
        expect(window.location.pathname).toBe("/register");
    });

    // Test Login link's behavior
    test("When Login link is clicked", () => {
        render(
            <BrowserRouter>
                <Header/>
            </BrowserRouter>
        );
        const linkElement = screen.getByRole("link", {name: "Login"});
        expect(linkElement).toHaveAttribute("href", "/login");

        fireEvent.click(linkElement);
        expect(window.location.pathname).toBe('/login');
    });
});

// Test for user info, dashboard and logout (when user is logged in)
describe("Given that a user is logged in", () => {
    beforeEach(() => {
        useAuth.mockReturnValue([
            {user: {name: "User A", role: 0}},
            jest.fn()
        ]);
        useCart.mockReturnValue([[]]);
        useCategory.mockReturnValue([]);
        jest.clearAllMocks();
    });

    test("When user info and links are rendered", () => {
        render(
            <BrowserRouter>
                <Header/>
            </BrowserRouter>
        );

        expect(screen.getByText("User A")).toBeInTheDocument();
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
        expect(screen.getByText("Logout")).toBeInTheDocument();
    });


    test("When link to user dashboard is clicked", () => {
        render(
            <BrowserRouter>
                <Header/>
            </BrowserRouter>
        );

        const navLinkElement = screen.getByText("Dashboard");
        expect(navLinkElement).toHaveAttribute("href", "/dashboard/user");

        fireEvent.click(navLinkElement);
        expect(window.location.pathname).toBe("/dashboard/user");
    });

    test("When logout is clicked", () => {
        const mockedSetAuth = jest.fn();
        useAuth.mockReturnValue([
            {user: {name: "User A", role: 0}},
            mockedSetAuth
        ]);

        render(
            <BrowserRouter>
              <Header />
            </BrowserRouter>
        );
      
        const logoutButton = screen.getByText("Logout");
        fireEvent.click(logoutButton);

        expect(mockedSetAuth).toHaveBeenCalledWith({
            user: null,
            token: "",
        });
        expect(localStorage.getItem("auth")).toBeNull();
        expect(toast.success).toHaveBeenCalledWith("Logout Successfully");
    });
});

// Test for admin info, dashboard and logout (when admin is logged in)
describe("Given that a admin is logged in", () => {
    beforeEach(() => {
        useAuth.mockReturnValue([
            {user: {name: "Admin B", role: 1}},
            jest.fn()
        ]);
        useCart.mockReturnValue([[]]);
        useCategory.mockReturnValue([]);
        jest.clearAllMocks();
    });

    test("When admin info and links are rendered", () => {
        render(
            <BrowserRouter>
                <Header/>
            </BrowserRouter>
        );

        expect(screen.getByText("Admin B")).toBeInTheDocument();
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
        expect(screen.getByText("Logout")).toBeInTheDocument();
    });


    test("When link to admin dashboard is clicked", () => {
        render(
            <BrowserRouter>
                <Header/>
            </BrowserRouter>
        );

        const navLinkElement = screen.getByText("Dashboard");
        expect(navLinkElement).toHaveAttribute("href", "/dashboard/admin");

        fireEvent.click(navLinkElement);
        expect(window.location.pathname).toBe("/dashboard/admin");
    });

    test("When logout is clicked", () => {
        const mockedSetAuth = jest.fn();
        useAuth.mockReturnValue([
            {user: {name: "Admin B", role: 0}},
            mockedSetAuth
        ]);

        render(
            <BrowserRouter>
              <Header />
            </BrowserRouter>
        );
      
        const logoutButton = screen.getByText("Logout");
        fireEvent.click(logoutButton);

        expect(mockedSetAuth).toHaveBeenCalledWith({
            user: null,
            token: "",
        });
        expect(localStorage.getItem("auth")).toBeNull();
        expect(toast.success).toHaveBeenCalledWith("Logout Successfully");
    });
});
