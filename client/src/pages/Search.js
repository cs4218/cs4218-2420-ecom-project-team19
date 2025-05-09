import React from "react";
import { useNavigate } from "react-router-dom";

import Layout from "./../components/Layout";
import { useSearch } from "../context/search";
import { useCart } from "../context/cart";
import toast from "react-hot-toast";

const Search = () => {
  const [cart, setCart] = useCart();
  const [values, setValues] = useSearch();
  const navigate = useNavigate();
  return (
    <Layout title={"Search results"}>
      <div className="container">
        <div className="text-center">
          <h1>Search Resuts</h1>
          <h6>
            {values?.results.length < 1
              ? "No Products Found"
              : `Found ${values?.results.length}`}
          </h6>
          <div className="d-flex flex-wrap mt-4">
            {values?.results.map((p) => (
              <div key={p._id} className="card m-2" style={{ width: "18rem" }} data-testid="product-card">
                <img
                  src={`/api/v1/product/product-photo/${p._id}`}
                  className="card-img-top"
                  alt={p.name}
                />
                <div className="card-body">
                  <h5 className="card-title">{p.name}</h5>
                  <p className="card-text" data-testid="product-description">
                    {p.description.substring(0, 30)}...
                  </p>
                  <p className="card-text"> $ {p.price}</p>
                  <button className="btn btn-primary ms-1" onClick={() => navigate(`/product/${p.slug}`)}>More Details</button>
                  <button className="btn btn-secondary ms-1" onClick={() => {
                    const updatedCart = [...(JSON.parse(localStorage.getItem("cart")) || []), p];
                    setCart(updatedCart);
                    localStorage.setItem("cart", JSON.stringify(updatedCart));
                    toast.success("Item Added to Cart");
                  }}>ADD TO CART</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Search;