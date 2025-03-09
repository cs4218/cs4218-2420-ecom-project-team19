import React from "react";
import Orders from "./Orders";
import axios from "axios";
import { useAuth } from "../../context/auth";
import moment from "moment";
import { act, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("axios");
jest.mock("../../context/auth");

jest.mock("moment", () => jest.fn(() => ({
    fromNow: jest.fn()
})));

jest.mock("./../../components/Layout", () => ({children, title}) => (
    <div>
        <title>{title}</title>
        <main>{children}</main>
    </div>
));

jest.mock("./../../components/UserMenu", () => () => (
    <div>
        UserMenu
    </div>
));

const mockedOrder1 = {
    status: "Completed",
    buyer: { name: "User1" },
    createAt: "2023-02-05T11:00:00Z",
    payment: { success: true },
    products: [{ _id: "1", name: "Product1", description: "Desc", price: 1 }]
};

const mockedFailedOrder = {
    status: "Completed",
    buyer: { name: "User2" },
    createAt: "2023-02-05T11:00:00Z",
    payment: { success: false },
    products: [{ _id: "1", name: "Product1", description: "Desc", price: 1 }]
};

const mockedMissingProductOrder = {
    status: "Completed",
    buyer: { name: "User3" },
    createAt: "2023-02-05T11:00:00Z",
    payment: { success: true },
    products: []
};

describe("Given Orders component", () => {
    const mockedAuth = {token: "mock token"};

    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue([mockedAuth, jest.fn()]);
        moment.mockReturnValue({ fromNow: jest.fn().mockReturnValue("just") });
    });

    // Test UI
    test("When orders components are rendered", () => {
        render(<Orders/>);

        expect(screen.getByText("Your Orders")).toBeInTheDocument();
        expect(screen.getByText("All Orders")).toBeInTheDocument();
        expect(screen.getByText("UserMenu")).toBeInTheDocument();
    });

    // test that getOrders is called when auth token is present
    test("When auth token is present", async () => {
        useAuth.mockReturnValue([mockedAuth, jest.fn()]);

        render(<Orders/>);
        await waitFor(() => expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/orders"));
    });

    test("When auth token is absent", async () => {
        useAuth.mockReturnValue([undefined, jest.fn()]);
        
        render(<Orders/>);
        await waitFor(() => expect(axios.get).not.toHaveBeenCalled());
    });
});

describe("Given user is authenticated and orders are fetched", () => {
    const mockedAuth = {token: "mock token"};

    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue([mockedAuth, jest.fn()]);
        moment.mockReturnValue({ fromNow: jest.fn().mockReturnValue("just") });
    });

    test("When success order data is fetched successfully", async () => {
        axios.get.mockResolvedValueOnce({ data: [mockedOrder1] });

        await act(async () => {
            render(<Orders/>);
        });
        
        // wait for orders to be fetched
        await waitFor(() => expect(screen.getByText("Completed")).toBeInTheDocument());

        expect(screen.getByText("User1")).toBeInTheDocument();
        expect(screen.getByText("just")).toBeInTheDocument();
        expect(screen.getByText("Success")).toBeInTheDocument();
        expect(screen.getByText("Product1")).toBeInTheDocument();
        expect(screen.getByText("Desc")).toBeInTheDocument();
        expect(screen.getByText("Price : 1")).toBeInTheDocument();
    });

    test("When a payment failed order is fetched successfully", async () => {
        axios.get.mockResolvedValueOnce({ data: [mockedFailedOrder] });

        await act(async () => {
            render(<Orders/>);
        });
        
        // wait for orders to be fetched
        await waitFor(() => expect(screen.getByText("Completed")).toBeInTheDocument());

        expect(screen.getByText("User2")).toBeInTheDocument();
        expect(screen.getByText("just")).toBeInTheDocument();
        expect(screen.getByText("Failed")).toBeInTheDocument();
        expect(screen.getByText("Product1")).toBeInTheDocument();
        expect(screen.getByText("Desc")).toBeInTheDocument();
        expect(screen.getByText("Price : 1")).toBeInTheDocument();
    });

    test("When a missing products order is fetched successfully", async () => {
        axios.get.mockResolvedValueOnce({ data: [mockedMissingProductOrder] });

        await act(async () => {
            render(<Orders/>);
        });
        
        await waitFor(() => expect(axios.get).toHaveBeenCalled());

        expect(screen.queryByTestId("products-test")).not.toBeInTheDocument();
    });

    test("When no order data exists", async() => {
        axios.get.mockResolvedValueOnce({ data: [] });

        render(<Orders/>);

        await waitFor(() => expect(screen.queryByRole("table")).not.toBeInTheDocument());
    });

    test("When API call fails", async () => {
        const mockError = new Error("Failed to fetch orders")
        axios.get.mockRejectedValueOnce(mockError);
        const mockedConsoleLog = jest.spyOn(console, "log").mockImplementation(() => {});

        render(<Orders/>);

        await waitFor(() => expect(axios.get).toHaveBeenCalled());

        await waitFor(() => expect(mockedConsoleLog).toHaveBeenCalledWith(mockError));
        expect(screen.queryByRole("table")).not.toBeInTheDocument();
        mockedConsoleLog.mockRestore();
    });
});
