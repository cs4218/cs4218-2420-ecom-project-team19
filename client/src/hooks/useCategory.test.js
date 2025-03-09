import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { StrictMode } from "react";
import useCategory from "../hooks/useCategory";
import axios from "axios";

jest.mock("axios");

describe("useCategory Hook Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("Hook initializes with an empty category list", async () => {
        axios.get.mockResolvedValueOnce({ data: { category: [] } });

        const { result } = renderHook(() => useCategory(), {
            wrapper: ({ children }) => <StrictMode>{children}</StrictMode>,
        });

        expect(result.current).toEqual([]);
    });

    test("Hook fetches and updates categories on mount", async () => {
        const mockCategories = [
            { _id: "1", name: "Electronics" },
            { _id: "2", name: "Clothing" },
        ];
        axios.get.mockResolvedValueOnce({ data: { category: mockCategories } });
    
        const { result } = renderHook(() => useCategory(), {
            wrapper: ({ children }) => <StrictMode>{children}</StrictMode>,
        });
    
        await waitFor(() => expect(result.current).toEqual(mockCategories));
    });

    test("Hook handles API returning an empty category list", async () => {
        axios.get.mockResolvedValueOnce({ data: { category: [] } });

        const { result } = renderHook(() => useCategory(), {
            wrapper: ({ children }) => <StrictMode>{children}</StrictMode>,
        });

        expect(result.current).toEqual([]);
    });

    test("Hook handles API failure gracefully (network error)", async () => {
        axios.get.mockRejectedValueOnce(new Error("Network Error"));
    
        const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    
        const { result } = renderHook(() => useCategory(), {
            wrapper: ({ children }) => <StrictMode>{children}</StrictMode>,
        });

        await waitFor(() => {
            expect(result.current).toEqual([]);
        });
    
        expect(consoleSpy).toHaveBeenCalled();
        expect(consoleSpy.mock.calls.length).toBeGreaterThanOrEqual(1);
        expect(consoleSpy.mock.calls.length).toBeLessThanOrEqual(2);
        expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
    
        consoleSpy.mockRestore();
    });

    test("`getCategories()` is called on mount", async () => {
        axios.get.mockResolvedValueOnce({ data: { category: [] } });
    
        renderHook(() => useCategory(), {
            wrapper: ({ children }) => <StrictMode>{children}</StrictMode>,
        });
    
        expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category");
        expect(axios.get).toHaveBeenCalled();
    });
});