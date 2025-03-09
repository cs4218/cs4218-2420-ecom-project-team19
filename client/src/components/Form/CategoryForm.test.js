import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import CategoryForm from "./CategoryForm";

describe("CategoryForm Component", () => {
    let mockHandleSubmit, mockSetValue, mockValue;

    beforeEach(() => {
        mockHandleSubmit = jest.fn((e) => e.preventDefault());
        mockSetValue = jest.fn();
        mockValue = "";
    });

    it("renders without crashing", () => {
        render(
            <CategoryForm 
                handleSubmit={mockHandleSubmit} 
                value={mockValue} 
                setValue={mockSetValue} 
            />
        );

        expect(screen.getByPlaceholderText("Enter new category")).toBeInTheDocument();
        expect(screen.getByText("Submit")).toBeInTheDocument();
    });

    it("updates input field when user types", () => {
        render(
            <CategoryForm 
                handleSubmit={mockHandleSubmit} 
                value={mockValue} 
                setValue={mockSetValue} 
            />
        );

        const inputField = screen.getByPlaceholderText("Enter new category");
        fireEvent.change(inputField, { target: { value: "Electronics" } });

        expect(mockSetValue).toHaveBeenCalledWith("Electronics");
    });

    it("calls handleSubmit when the form is submitted", () => {
        const mockHandleSubmit = jest.fn();
        const mockSetValue = jest.fn();
        
        render(
          <CategoryForm handleSubmit={mockHandleSubmit} value="Electronics" setValue={mockSetValue} />
        );
    
        const form = screen.getByTestId("category-form");
        fireEvent.submit(form);
    
        expect(mockHandleSubmit).toHaveBeenCalled();
      });

      it("prevents submission when input is empty", () => {
        const mockHandleSubmit = jest.fn();
        const mockSetValue = jest.fn();
    
        render(
          <CategoryForm handleSubmit={mockHandleSubmit} value="" setValue={mockSetValue} />
        );
    
        const form = screen.getByTestId("category-form");
        fireEvent.submit(form);
    
        expect(mockHandleSubmit).not.toHaveBeenCalled();
      });
});
