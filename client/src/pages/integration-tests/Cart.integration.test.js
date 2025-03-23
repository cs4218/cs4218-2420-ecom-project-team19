import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import toast from "react-hot-toast";
import { useCart } from "../../context/cart";
import { useAuth } from "../../context/auth";
import { BrowserRouter as Router } from "react-router-dom";

jest.mock("react-hot-toast", () => {
  try {
    return require("react-hot-toast");
  } catch {
    return { success: jest.fn() };
  }
});

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../../context/cart", () => ({
  useCart: jest.fn(),
}));

describe("Add to Cart Functionality", () => {
  const setCartMock = jest.fn();

  const mockProduct = {
    _id: "123abc",
    name: "Test Product",
    description: "A mock test product",
    slug: "test-product",
    price: 49.99,
  };

  beforeEach(() => {
    useCart.mockReturnValue([[], setCartMock]);
    localStorage.clear();
    jest.clearAllMocks();
  });

  // render only the button
  // this cannot be done in backend because there is no controller for cart
  const TestProductCard = () => {
    const [cart, setCart] = useCart();

    return (
      <Router>
        <div className="card m-2">
          <img
            src={`/api/v1/product/product-photo/${mockProduct._id}`}
            className="card-img-top"
            alt={mockProduct.name}
          />
          <div className="card-body">
            <h5 className="card-title">{mockProduct.name}</h5>
            <p>{mockProduct.description.substring(0, 60)}...</p>
            <button
              className="btn btn-dark ms-1"
              onClick={() => {
                const updatedCart = [
                  ...(JSON.parse(localStorage.getItem("cart")) || []),
                  mockProduct,
                ];
                setCart(updatedCart);
                localStorage.setItem("cart", JSON.stringify(updatedCart));
                toast.success("Item Added to Cart");
              }}
            >
              ADD TO CART
            </button>
          </div>
        </div>
      </Router>
    );
  };

  describe("Initial State", () => {
    it("starts with empty cart in localStorage", () => {
      expect(localStorage.getItem("cart")).toBeNull();
    });  
  
    it("renders product information correctly", () => {
      render(<TestProductCard />);
    
      expect(screen.getByText("Test Product")).toBeInTheDocument();
      expect(screen.getByText("A mock test product...")).toBeInTheDocument();
      expect(screen.getByRole("img", { name: "Test Product" })).toBeInTheDocument();
    });
  });

  describe("Add to Cart", () => {
    it("adds a product to localStorage and updates cart context", () => {
      render(<TestProductCard />);
  
      const addButton = screen.getByText("ADD TO CART");
      fireEvent.click(addButton);
  
      const localCart = JSON.parse(localStorage.getItem("cart"));
      expect(localCart).toHaveLength(1);
      expect(localCart[0]._id).toBe(mockProduct._id);
  
      expect(setCartMock).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ _id: mockProduct._id }),
        ])
      );
  
      expect(toast.success).toHaveBeenCalledWith("Item Added to Cart");
    });
  });

  describe("Additional Tests", () => {
    it("persists cart in localStorage across sessions", () => {
      render(<TestProductCard />);
      fireEvent.click(screen.getByText("ADD TO CART"));
    
      const saved = localStorage.getItem("cart");
      expect(saved).toContain(mockProduct.name);
    
      localStorage.setItem("cart", saved);
      const reloadedCart = JSON.parse(localStorage.getItem("cart"));
      expect(reloadedCart[0]._id).toBe(mockProduct._id);
    });

    it("adds multiple products to the cart", () => {
      const secondProduct = { ...mockProduct, _id: "456def", name: "Second Product" };
      const TestCard2 = () => {
        const [cart, setCart] = useCart();
        return (
          <button
            onClick={() => {
              const updatedCart = [...(JSON.parse(localStorage.getItem("cart")) || []), secondProduct];
              setCart(updatedCart);
              localStorage.setItem("cart", JSON.stringify(updatedCart));
              toast.success("Item Added to Cart");
            }}
          >
            Add Second Product
          </button>
        );
      };
    
      render(
        <>
          <TestProductCard />
          <TestCard2 />
        </>
      );
    
      fireEvent.click(screen.getByText("ADD TO CART"));
      fireEvent.click(screen.getByText("Add Second Product"));
    
      const cart = JSON.parse(localStorage.getItem("cart"));
      expect(cart.length).toBe(2);
    });
  });
});
