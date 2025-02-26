/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import UserMenu from "./UserMenu";
import "@testing-library/jest-dom";

const renderUserMenu = () =>
  render(
    <Router>
      <UserMenu />
    </Router>
  );

describe("UserMenu", () => {
  it("renders UserMenu correctly", () => {
    renderUserMenu();

    // Check for Dashboard heading
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();

    // Verify Profile link
    const profileLink = screen.getByRole("link", { name: /Profile/i });
    expect(profileLink).toBeInTheDocument();
    expect(profileLink).toHaveAttribute("href", "/dashboard/user/profile");

    // Verify Orders link
    const ordersLink = screen.getByRole("link", { name: /Orders/i });
    expect(ordersLink).toBeInTheDocument();
    expect(ordersLink).toHaveAttribute("href", "/dashboard/user/orders");
  });

  it("applies correct class names to links", () => {
    renderUserMenu();

    ["Profile", "Orders"].forEach((linkText) => {
      const link = screen.getByRole("link", { name: new RegExp(linkText, "i") });
      expect(link).toHaveClass("list-group-item", "list-group-item-action");
    });
  });
});
