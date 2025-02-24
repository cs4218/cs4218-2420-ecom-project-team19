import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import Pagenotfound from "./Pagenotfound";

// mock layout
jest.mock("./../components/Layout", () => ({children, title}) => (
    <div>
        <title>{title}</title>
        <main>{children}</main>
    </div>
));

describe("Pagenotfound page", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test for correct title
    test("Layout rendered with correct title", () => {
        render(
            <BrowserRouter>
                <Pagenotfound/>
            </BrowserRouter>
        );
        expect(screen.getByText("go back- page not found")).toBeInTheDocument();
    });

    // Test for correct error code
    test("Page rendered with correct error code", () => {
        render(
            <BrowserRouter>
                <Pagenotfound/>
            </BrowserRouter>
        );
        expect(screen.getByText("404")).toBeInTheDocument();
    });

    // Test for correct heading
    test("Page rendered with correct heading", () => {
        render(
            <BrowserRouter>
                <Pagenotfound/>
            </BrowserRouter>
        );
        expect(screen.getByText("Oops ! Page Not Found")).toBeInTheDocument();
    });

    // Test if link is rendered with correct name
    test("Page rendered with link", () => {
        render(
            <BrowserRouter>
                <Pagenotfound/>
            </BrowserRouter>
        );
        expect(screen.getByRole("link", {name: "Go Back"})).toBeInTheDocument();
    });

    // Test link's behaviour
    test("Link in page directs to the correct destination", () => {
        render(
            <BrowserRouter>
                <Pagenotfound/>
            </BrowserRouter>
        );
        const linkElement = screen.getByRole("link", {name: "Go Back"});
        expect(linkElement).toHaveAttribute("href", "/");

        // simulate clicking of link
        fireEvent.click(linkElement);
        expect(window.location.pathname).toBe('/');
    });
});