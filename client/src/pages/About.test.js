import React from "react";
import About from "./About";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// mock layout
jest.mock("./../components/Layout", () => ({children, title}) => (
    <div>
        <title>{title}</title>
        <main>{children}</main>
    </div>
));

/* Since About page is purely UI components with no functionality,
the focus is to test for correct rendering, styling and structure */

describe("Given About Page", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test for correct title
    test("When Layout is rendered with title", () => {
        render(<About/>);
        expect(screen.getByText("About us - Ecommerce app")).toBeInTheDocument();
    });

    // Test for image
    test("When rendered with image", () => {
        render(<About/>);
        const img = screen.getByRole("img");
        expect(img).toHaveAttribute("src", "/images/about.jpeg");
        expect(img).toHaveAttribute("alt", "contactus");
        expect(img).toHaveStyle("width: 100%");
    });

    // Test for correct paragraph
    test("When rendered with paragraph", () => {
        render(<About/>);
        expect(screen.getByText("Add text")).toBeInTheDocument();
    });
})