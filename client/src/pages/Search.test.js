import React from "react";
import { render, screen } from "@testing-library/react";
import Search from "./Search";
import { useSearch } from "../context/search";
import "@testing-library/jest-dom";

// Mock useSearch
jest.mock("../context/search", () => ({
    useSearch: jest.fn(),
}));

jest.mock("./../components/Layout", () => ({ children, title }) => (
    <div>
      <title>{title}</title>
      <main>{children}</main>
    </div>
  ));  

describe("Search Page", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test for products found
    test("Display 'No Products Found' when results array is empty", () => {
        useSearch.mockReturnValue([
            { keyword: "", results: [] },
            jest.fn(),
        ]);
        render(<Search />);

        expect(screen.getByText('No Products Found')).toBeInTheDocument();
    });

    test("Display 'Found 1' when results array has 1 item", () => {
        const fakeProduct = [
            { _id: "1", name: "Test Product A", description: "Description A", price: 10 },
        ];
        useSearch.mockReturnValue([
            { keyword: "", results: fakeProduct },
            jest.fn(),
        ]);
        render(<Search />);

        expect(screen.getByText('Found 1')).toBeInTheDocument();
    });

    test("Display 'Found 10000' when results array has 10000 items", () => {
        const fakeProducts = Array.from({ length: 10000 }, (_, i) => ({
            _id: (i + 1).toString(),
            name: `Test Product ${i + 1}`,
            description: `Description for product ${i + 1}`,
            price: (i % 100) + 1,
        }));
        useSearch.mockReturnValue([
            { keyword: "", results: fakeProducts },
            jest.fn(),
        ]);
        render(<Search />);

        expect(screen.getByText('Found 10000')).toBeInTheDocument();
    });

    // Test the map over results
    test("Renders no cards when results contains no items", () => {
        useSearch.mockReturnValue([
            { keyword: "", results: [] },
            jest.fn(),
        ]);
        render(<Search />);

        const productCards = screen.queryAllByTestId("product-card");
        expect(productCards).toHaveLength(0);
    })

    test("Renders correct number of product cards", () => {
        const fakeProducts = [
            { _id: "1", name: "Test Product A", description: "Description A", price: 10 },
        ];
        useSearch.mockReturnValue([
            { keyword: "", results: fakeProducts },
            jest.fn(),
        ]);
        render(<Search />);

        const productCards = screen.getAllByTestId("product-card");
        expect(productCards).toHaveLength(fakeProducts.length);
    });

    test("Renders correct number of product cards for larger number of items", () => {
        const fakeProducts = Array.from({ length: 10000 }, (_, i) => ({
            _id: (i + 1).toString(),
            name: `Test Product ${i + 1}`,
            description: `Description for product ${i + 1}`,
            price: (i % 100) + 1,
        }));
        useSearch.mockReturnValue([
            { keyword: "", results: fakeProducts },
            jest.fn(),
        ]);
        render(<Search />);

        const productCards = screen.getAllByTestId("product-card");
        expect(productCards).toHaveLength(fakeProducts.length);
    });

    // Test for correct display of product details
    test("renders card details for a single product", () => {
        const fakeProduct = {
            _id: "1",
            name: "Test Product",
            description: "This is a test product description that should be truncated",
            price: 29.99,
        };
        useSearch.mockReturnValue([
            { results: [fakeProduct], keyword: "" },
            jest.fn(),
        ]);
        render(<Search />);

    
        const img = screen.getByRole("img", { name: fakeProduct.name });
        expect(img).toHaveAttribute("src", `/api/v1/product/product-photo/${fakeProduct._id}`);
        expect(img).toHaveAttribute("alt", fakeProduct.name);
        expect(screen.getByTestId("product-description")).toHaveTextContent("This is a test product descrip...");
        expect(screen.getByText("$ 29.99")).toBeInTheDocument();
    });

    test("Handles very short product names correctly", () => {
        const fakeProducts = [{ _id: "1", name: "A", description: "Short name", price: 10 }];
        useSearch.mockReturnValue([{ results: fakeProducts, keyword: "" }, jest.fn()]);
    
        render(<Search />);
        expect(screen.getByText("A")).toBeInTheDocument();
    });

    test("Handles very long product names correctly", () => {
        const longName = "A".repeat(300);
        const fakeProducts = [{ _id: "1", name: longName, description: "Long name test", price: 10 }];
        useSearch.mockReturnValue([{ results: fakeProducts, keyword: "" }, jest.fn()]);
    
        render(<Search />);
        expect(screen.getByText(longName)).toBeInTheDocument();
    });

    test("Truncates description correctly at 30 characters", () => {
        const fakeProduct = {
            _id: "1",
            name: "Test Product",
            description: "123456789012345678901234567890", // Exactly 30 characters
            price: 29.99,
        };
        useSearch.mockReturnValue([{ results: [fakeProduct], keyword: "" }, jest.fn()]);
    
        render(<Search />);
        expect(screen.getByTestId("product-description")).toHaveTextContent("123456789012345678901234567890...");
    });

    test("Handles minimum product price correctly", () => {
        const fakeProducts = [{ _id: "1", name: "Cheap Product", description: "Low price", price: 0.01 }];
        useSearch.mockReturnValue([{ results: fakeProducts, keyword: "" }, jest.fn()]);
    
        render(<Search />);
        expect(screen.getByText("$ 0.01")).toBeInTheDocument();
    });

    test("Handles maximum product price correctly", () => {
        const fakeProducts = [{ _id: "1", name: "Expensive Product", description: "High price", price: 99999.99 }];
        useSearch.mockReturnValue([{ results: fakeProducts, keyword: "" }, jest.fn()]);
    
        render(<Search />);
        expect(screen.getByText("$ 99999.99")).toBeInTheDocument();
    });

    // Test for how Layout renders the correct words
    test("Renders the Layout component with the correct title", () => {
        useSearch.mockReturnValue([
            { results: [], keyword: "" },
            jest.fn(),
        ]);
    
        render(<Search />);

        expect(screen.getByText("Search results")).toBeInTheDocument();
    });

    // Test usage of useSearch
    test("Calls useSearch on mount and uses returned data", () => {
        const fakeProducts = [
            { _id: "1", name: "Test Product", description: "Description", price: 10 },
        ];
        useSearch.mockReturnValue([
            { keyword: "abc", results: fakeProducts },
            jest.fn(),
        ]);
        render(<Search />);

        expect(useSearch).toHaveBeenCalledTimes(1);
        expect(screen.getByText("Found 1")).toBeInTheDocument();
        expect(screen.getByText("Test Product")).toBeInTheDocument();
    });
});