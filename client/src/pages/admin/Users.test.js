import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import '@testing-library/jest-dom/extend-expect'
import { useAuth } from "../../context/auth";
import Users from "./Users";

jest.mock("../../components/Layout", () => ({ children, title }) => (
    <div>
      <title>{title}</title>
      <main>{children}</main>
    </div>
  ));

jest.mock("../../context/auth", () => ({
    useAuth: jest.fn(),
}));

const mockUseAuth = (user) => {
    useAuth.mockReturnValue([user ? { user } : null, jest.fn()]);
};

jest.mock("../../components/AdminMenu", () => () => <div data-testid="admin-menu">Admin Menu</div>);

  describe("Users Component", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe("Rendering and Basic Structure", () => {
        // test to make sure the text is correct
        it('renders the Users component correctly', () => {

            render(
                <MemoryRouter initialEntries={['/admin/users']}>
                    <Routes>
                        <Route path="/admin/users" element={<Users />} />
                    </Routes>
                </MemoryRouter>
            );

            expect(screen.getByText('All Users')).toBeInTheDocument();
        });

        // test to make sure the layout component is correct
        it("renders the Layout component with the correct title", () => {
            render(<MemoryRouter><Users /></MemoryRouter>);
            expect(screen.getByText("Dashboard - All Users")).toBeInTheDocument();
        });

        // test to make sure the adminmenu component is correct
        it("renders the AdminMenu component", () => {
            render(<MemoryRouter><Users /></MemoryRouter>);
            expect(screen.getByTestId("admin-menu")).toBeInTheDocument();
        });
    });
    
    // using equivalence partitioning, we want to make sure
    // that the system works correctly for
    // different types of users
    // admin, user, and not logged in
    describe("User Role-Based Rendering", () => {
        it("renders correctly for an admin user", () => {
            mockUseAuth({ role: "admin", name: "Admin" });
            render(<MemoryRouter><Users /></MemoryRouter>);
            expect(screen.getByText("All Users")).toBeInTheDocument();
        });

        it("renders correctly for a regular user", () => {
            mockUseAuth({ role: "user", name: "User" });
            render(<MemoryRouter><Users /></MemoryRouter>);
            expect(screen.getByText("All Users")).toBeInTheDocument();
        });

        it("renders correctly for a guest user (not logged in)", () => {
            mockUseAuth(null);
            render(<MemoryRouter><Users /></MemoryRouter>);
            expect(screen.getByText("All Users")).toBeInTheDocument();
        });
    });
});