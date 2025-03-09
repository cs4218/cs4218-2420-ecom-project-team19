import React from 'react';
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Footer from './Footer';
import "@testing-library/jest-dom";

describe ("Given Footer UI", () => {
    // Test if link is rendered with About Link
    test("When page is rendered with the About Link", () => {
        render(
            <BrowserRouter>
                <Footer/>
            </BrowserRouter>
        );
        expect(screen.getByRole("link", {name: "About"})).toBeInTheDocument();
    });

    // Test if link is rendered with Contact Link
    test("When page is rendered with the About Link", () => {
        render(
            <BrowserRouter>
                <Footer/>
            </BrowserRouter>
        );
        expect(screen.getByRole("link", {name: "Contact"})).toBeInTheDocument();
    });

    // Test if link is rendered with Privacy Policy Link
    test("When page is rendered with the About Link", () => {
        render(
            <BrowserRouter>
                <Footer/>
            </BrowserRouter>
        );
        expect(screen.getByRole("link", {name: "Privacy Policy"})).toBeInTheDocument();
    });
});

describe ("Given Footer is rendered", () => {
    // Test About Link functionality
    test("When About Link is clicked", () => {
        render(
            <BrowserRouter>
                <Footer/>
            </BrowserRouter>
        );
        
        const linkElement = screen.getByRole("link", {name: "About"});
        expect(linkElement).toHaveAttribute("href", "/about");

        // simulate clicking of link
        fireEvent.click(linkElement);
        expect(window.location.pathname).toBe('/about');
    });

    // Test Contact Link functionality
    test("When Contact Link is clicked", () => {
        render(
            <BrowserRouter>
                <Footer/>
            </BrowserRouter>
        );
        const linkElement = screen.getByRole("link", {name: "Contact"});
        expect(linkElement).toHaveAttribute("href", "/contact");

        // simulate clicking of link
        fireEvent.click(linkElement);
        expect(window.location.pathname).toBe('/contact');
    });

    // Test Privacy Policy Link functionality
    test("When Privacy Policy Link is clicked", () => {
        render(
            <BrowserRouter>
                <Footer/>
            </BrowserRouter>
        );
        const linkElement = screen.getByRole("link", {name: "Privacy Policy"});
        expect(linkElement).toHaveAttribute("href", "/policy");

        // simulate clicking of link
        fireEvent.click(linkElement);
        expect(window.location.pathname).toBe('/policy');
    });
});
