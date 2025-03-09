/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import Dashboard from "./Dashboard";
import { useAuth } from "../../context/auth";

// Mock hooks
jest.mock("../../context/cart", () => ({ useCart: jest.fn(() => [null, jest.fn()]) }));
jest.mock("../../context/search", () => ({ useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]) }));
jest.mock("../../hooks/useCategory", () => jest.fn(() => []));
jest.mock("../../context/auth", () => ({ useAuth: jest.fn() }));

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe("Dashboard Component", () => {
  const mockUser = { name: "John Doe", email: "john@johnmail.com", address: "John Rd" };

  beforeEach(() => jest.clearAllMocks());

  it("renders user details when authenticated", () => {
    useAuth.mockReturnValue([{ user: mockUser }]);
    renderWithRouter(<Dashboard />);

    expect(screen.getByText(mockUser.email)).toBeInTheDocument();
    expect(screen.getByText(mockUser.address)).toBeInTheDocument();
  });

  it("does not render user details when unauthenticated", () => {
    useAuth.mockReturnValue([null]);
    renderWithRouter(<Dashboard />);

    expect(screen.queryByText(mockUser.email)).not.toBeInTheDocument();
    expect(screen.queryByText(mockUser.address)).not.toBeInTheDocument();
  });
});
