import React from "react";
import Layout from "./Layout";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock('react-hot-toast', () => ({
    Toaster: () => <div>Toaster</div>,
  }));

jest.mock("./Header", () => () => <div>Header</div>);
jest.mock("./Footer", () => () => <div>Footer</div>);

describe("Given Layout page is rendered", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test that Header is rendered
    test("When Header is rendered", () => {
        render(
            <Layout/>
        );

        expect(screen.getByText("Header")).toBeInTheDocument();
    });

    // Test that Footer is rendered
    test("When Footer is rendered", () => {
        render(
            <Layout/>
        );

        expect(screen.getByText("Footer")).toBeInTheDocument();
    });

    // Test that Toaster is rendered
    test("When Toaster is rendered", () => {
        render(
            <Layout/>
        );

        expect(screen.getByText("Toaster")).toBeInTheDocument();
    });

    // Test that Children is rendered
    test("When Children is rendered", () => {
        render(
            <Layout>
                <div>Children</div>
            </Layout>
        );

        expect(screen.getByText("Children")).toBeInTheDocument();
    });
});


// Test Helmet rendering when no inputs are given 
// (meaning title, description, keywords and author will be set to default)
describe("Given Layout Page is rendered with no inputs given for Helmet", () => {
    // Helment is async
    test("When title is rendered", async () => {
        render(
            <Layout />
        );

        // need to wait for Helmet to update the document title
        await waitFor(() => {
            const content = document.querySelector("title");
            expect(content).toHaveTextContent(Layout.defaultProps.title); // Expect title to be set correctly
        });
    });

    test("When description metadata is rendered", async () => {
        render(
            <Layout />
        );

        await waitFor(() => {
            const content = document.querySelector("meta[name='description']");
            expect(content).toHaveAttribute('content', Layout.defaultProps.description);
        });
    });

    test("When keywords metadata is rendered", async () => {
        render(
            <Layout />
        );

        await waitFor(() => {
            const content = document.querySelector("meta[name='keywords']");
            expect(content).toHaveAttribute('content', Layout.defaultProps.keywords);
        });
    });

    test("When author metadata is rendered", async () => {
        render(
            <Layout />
        );

        await waitFor(() => {
            const content = document.querySelector("meta[name='author']");
            expect(content).toHaveAttribute('content', Layout.defaultProps.author);
        });
    });
});


// Test Helmet rendering with custom inputs for 
// title, description, keywords and author
describe("Given Layout Page is rendered with no inputs given for Helmet", () => {
    const title = "title";
    const description = "description";
    const keywords = "keywords";
    const author = "author";

    // Helment is async
    test("When title is rendered", async () => {
        render(
            <Layout title={title} />
        );

        // need to wait for Helmet to update the document title
        await waitFor(() => {
            const content = document.querySelector("title");
            expect(content).toHaveTextContent(title); // Expect title to be set correctly
        });
    });

    test("When description metadata is rendered", async () => {
        render(
            <Layout description={description} />
        );

        await waitFor(() => {
            const content = document.querySelector("meta[name='description']");
            expect(content).toHaveAttribute('content', description);
        });
    });

    test("When keywords metadata is rendered", async () => {
        render(
            <Layout keywords={keywords} />
        );

        await waitFor(() => {
            const content = document.querySelector("meta[name='keywords']");
            expect(content).toHaveAttribute('content', keywords);
        });
    });

    test("When author metadata is rendered", async () => {
        render(
            <Layout author={author} />
        );

        await waitFor(() => {
            const content = document.querySelector("meta[name='author']");
            expect(content).toHaveAttribute('content', author);
        });
    });
});
