import React from "react";
import { render, screen, act } from "@testing-library/react";
import Spinner from "./Spinner";
import { useNavigate, useLocation } from "react-router-dom";
import "@testing-library/jest-dom";

jest.mock('react-router-dom', () => ({
    useNavigate: jest.fn(),
    useLocation: jest.fn(),
  }));

describe("Given Spinner component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("When it first enters loading", () => {
        render( <Spinner /> );

        expect(screen.getByText("redirecting to you in 3 second")).toBeInTheDocument();
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    test("When timer counts down", () => {
        jest.useFakeTimers();

        render( <Spinner /> );
        
        //expect initial count to be 3
        expect(screen.getByText("redirecting to you in 3 second")).toBeInTheDocument();

        //after 1 second, expect count to be 2
        act(() => {
            jest.advanceTimersByTime(1000);
        });
        expect(screen.getByText("redirecting to you in 2 second")).toBeInTheDocument();

        //after 1 second, expect count to be 1
        act(() => {
            jest.advanceTimersByTime(1000);
        });
        expect(screen.getByText("redirecting to you in 1 second")).toBeInTheDocument();

        jest.useRealTimers();
    });

    
    test("When 3 seconds pass", () => {
        const mockedNavigate = jest.fn();
        const mockedLocation = { pathname: "/mockpath" };

        useNavigate.mockReturnValue(mockedNavigate);
        useLocation.mockReturnValue(mockedLocation);

        jest.useFakeTimers();

        render(<Spinner path="somepath" />);

        // after 3 seconds
        act(() => {
            jest.advanceTimersByTime(3000);
        });

        expect(mockedNavigate).toHaveBeenCalledWith("/somepath", {
            state: "/mockpath"
        });

        jest.useRealTimers();
    });
});
