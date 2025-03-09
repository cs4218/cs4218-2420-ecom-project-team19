import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from '@testing-library/user-event'
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

describe("Given Pagenotfound page", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test for correct title
    test("When rendered with title", () => {
        render(
            <BrowserRouter>
                <Pagenotfound/>
            </BrowserRouter>
        );
        expect(screen.getByText("go back- page not found")).toBeInTheDocument();
    });

    // Test for correct error code
    test("When rendered with error code", () => {
        render(
            <BrowserRouter>
                <Pagenotfound/>
            </BrowserRouter>
        );
        expect(screen.getByText("404")).toBeInTheDocument();
    });

    // Test for correct heading
    test("When rendered with heading", () => {
        render(
            <BrowserRouter>
                <Pagenotfound/>
            </BrowserRouter>
        );
        expect(screen.getByText("Oops ! Page Not Found")).toBeInTheDocument();
    });

    // Test if Go back link is rendered
    test("When rendered with link", () => {
        render(
            <BrowserRouter>
                <Pagenotfound/>
            </BrowserRouter>
        );
        expect(screen.getByRole("link", {name: "Go Back"})).toBeInTheDocument();
    });

    // Test link's behaviour
    test("When link is clicked", () => {
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