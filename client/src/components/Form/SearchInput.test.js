/* eslint-disable testing-library/no-wait-for-multiple-assertions */
import React from "react";
import { render, screen, fireEvent, waitFor, cleanup, act } from "@testing-library/react";
import SearchInput from "./SearchInput";
import { useSearch } from "../../context/search";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "@testing-library/jest-dom";

jest.mock("../../context/search");
jest.mock("../../context/search", () => ({
    useSearch: jest.fn(),
}));

jest.mock("axios");
jest.mock("react-router-dom", () => ({
    useNavigate: jest.fn(),
}));

describe("SearchInput component", () => {
    const mockSetValues = jest.fn();
    const mockNavigate = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        useSearch.mockReturnValue([{ keyword: "", results: [] }, mockSetValues]);
        useNavigate.mockReturnValue(mockNavigate);
    });

    afterEach(cleanup);

    test("Renders input field and submit button", () => {
        render(<SearchInput />);

        expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();
    });

    test("Updates keyword on input change", () => {
        render(<SearchInput />);

        const input = screen.getByPlaceholderText("Search");
        fireEvent.change(input, { target: { value: "shoes" } });

        expect(mockSetValues).toHaveBeenCalledWith({ keyword: "shoes", results: [] });
    });

    test("handleSubmit() makes API call with correct keyword", async () => {
        const mockSetValues = jest.fn();
        
        useSearch.mockReturnValue([
            { keyword: "laptop", results: [] },  
            mockSetValues, 
        ]);
    
        axios.get.mockResolvedValueOnce({ data: [{ id: 1, name: "Product 1" }] });
    
        render(<SearchInput />);
    
        const form = screen.getByRole("search");
        fireEvent.submit(form);
    
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith("/api/v1/product/search/laptop");
            expect(mockSetValues).toHaveBeenCalledWith({
                keyword: "laptop",
                results: [{ id: 1, name: "Product 1" }],
            });
        });
    });
    

    test("Does not make an API call with empty keyword", async () => {
        render(<SearchInput />);

        const button = screen.getByRole("button", { name: "Search" });
        fireEvent.click(button);

        await waitFor(() => {
            expect(axios.get).not.toHaveBeenCalled();
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });

    test("Trims whitespace and makes API call with correct keyword", async () => {
        axios.get.mockResolvedValueOnce({ data: [{ id: 2, name: "Product 2" }] });
    
        useSearch.mockReturnValue([
            { keyword: "  phone  ", results: [] },
            mockSetValues,
        ]);
    
        render(<SearchInput />);
    
        expect(mockSetValues).not.toHaveBeenCalled(); 
    
        const button = screen.getByRole("button", { name: "Search" });
        fireEvent.click(button);
    
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith("/api/v1/product/search/phone");
            expect(mockNavigate).toHaveBeenCalledWith("/search");
        });
    });
    

    test("Handles API failure gracefully", async () => {
        axios.get.mockRejectedValueOnce(new Error("Network Error"));
    
        useSearch.mockReturnValue([
            { keyword: "tablet", results: [] },
            mockSetValues,
        ]);
    
        render(<SearchInput />);
    
        expect(mockSetValues).not.toHaveBeenCalled();
    
        const button = screen.getByRole("button", { name: "Search" });
        fireEvent.click(button);
    
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith("/api/v1/product/search/tablet");
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });    
});