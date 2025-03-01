import { useSearch } from "./search";
import { useContext } from "react";

jest.mock("react", () => ({
    ...jest.requireActual("react"),
    useContext: jest.fn(),
}));

describe("SearchContext", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("Initial state should have empty keyword and resuls", () => {
        const defaultState = [{ keyword: "", results: [] }, jest.fn()];
        useContext.mockReturnValue(defaultState);

        const [state] = useSearch();
        expect(state.keyword).toBe("");
        expect(state.results).toEqual([]);
    })

    test("Update keyword to non-empty string", () => {
        const mockSetAuth = jest.fn();
        const initialState = { keyword: "", results: [] };
        useContext.mockReturnValue([initialState, mockSetAuth]);

        const [state, setAuth] = useSearch();
        setAuth({ ...state, keyword: "test" });
        expect(mockSetAuth).toHaveBeenCalledWith({ ...state, keyword: "test" });
    });

    test("Should handle single character keyword", () => {
        const mockSetAuth = jest.fn();
        const initialState = { keyword: "", results: [] };
        useContext.mockReturnValue([initialState, mockSetAuth]);

        const [state, setAuth] = useSearch();
        setAuth({ ...state, keyword: "a"});
        expect(mockSetAuth).toHaveBeenCalledWith({ ...state, keyword: "a"});
    });

    test("Should handle very long keyword", () => {
        const longWord = "a".repeat(10000);
        const mockSetAuth = jest.fn();
        const initialState = { keyword: "", results: [] };
        useContext.mockReturnValue([initialState, mockSetAuth]);

        const [state, setAuth] = useSearch();
        setAuth({ ...state, keyword: longWord });
        expect(mockSetAuth).toHaveBeenCalledWith({ ...state, keyword: longWord});
    });

    test("Update results with one element", () => {
        const mockSetAuth = jest.fn();
        const initialState = { keyword: "", results: [] };
        useContext.mockReturnValue([initialState, mockSetAuth]);

        const fakeProduct = {
            _id: "1",
            name: "Test Product",
            description: "This is a test product description used for demonstration purposes.",
            price: 29.99
        };
        const [state, setAuth] = useSearch();
        setAuth({ ...state, results: [fakeProduct] });
        expect(mockSetAuth).toHaveBeenCalledWith({ ...state, results: [fakeProduct]});
    });

    test("Should handle a large results array", () => {
        const mockSetAuth = jest.fn();
        const initialState = { keyword: "", results: [] };
        useContext.mockReturnValue([initialState, mockSetAuth]);

        const largeResults = new Array(1000).fill({
            _id: "1", 
            name: "Test Product",
            description: "This is a test product description",
            price: 100 
        });
        const [state, setAuth] = useSearch();
        setAuth({ ...state, results: largeResults });
        expect(mockSetAuth).toHaveBeenCalledWith({ ...state, results: largeResults });
    });
});