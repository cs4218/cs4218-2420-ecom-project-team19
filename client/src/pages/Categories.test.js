import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import useCategory from "../hooks/useCategory";
import Categories from "../pages/Categories";
import "@testing-library/jest-dom";

jest.mock("../components/Layout", () => ({ children }) => <div data-testid="layout">{children}</div>);
jest.mock("../hooks/useCategory");

describe("Categories Page Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("Renders the page correctly with Layout", () => {
        useCategory.mockReturnValue([]);

        render(
            <BrowserRouter>
                <Categories />
            </BrowserRouter>
        );

        expect(screen.getByTestId("layout")).toBeInTheDocument();
    });

    test("Calls `useCategory()` to fetch categories", () => {
        useCategory.mockReturnValue([]);

        render(
            <BrowserRouter>
                <Categories />
            </BrowserRouter>
        );

        expect(useCategory).toHaveBeenCalledTimes(1);
    });

    test("Displays category buttons when categories exist", () => {
        useCategory.mockReturnValue([
            { _id: "1", name: "Electronics", slug: "electronics" },
            { _id: "2", name: "Clothing", slug: "clothing" },
        ]);

        render(
            <BrowserRouter>
                <Categories />
            </BrowserRouter>
        );

        expect(screen.getByText("Electronics")).toBeInTheDocument();
        expect(screen.getByText("Clothing")).toBeInTheDocument();
    });

    test("Links are generated correctly for each category", () => {
        useCategory.mockReturnValue([
            { _id: "1", name: "Electronics", slug: "electronics" },
            { _id: "2", name: "Clothing", slug: "clothing" },
        ]);

        render(
            <BrowserRouter>
                <Categories />
            </BrowserRouter>
        );

        expect(screen.getByText("Electronics").closest("a")).toHaveAttribute("href", "/category/electronics");
        expect(screen.getByText("Clothing").closest("a")).toHaveAttribute("href", "/category/clothing");
    });

    test("Shows nothing if no categories exist", () => {
        useCategory.mockReturnValue([]);

        render(
            <BrowserRouter>
                <Categories />
            </BrowserRouter>
        );

        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
});
