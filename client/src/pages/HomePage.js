// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { Checkbox, Radio } from "antd";
// import { Prices } from "../components/Prices";
// import { useCart } from "../context/cart";
// import axios from "axios";
// import toast from "react-hot-toast";
// import Layout from "./../components/Layout";
// import { AiOutlineReload } from "react-icons/ai";
// import "../styles/Homepages.css";

// const HomePage = () => {
//   const navigate = useNavigate();
//   const [cart, setCart] = useCart();
//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [checked, setChecked] = useState([]);
//   const [radio, setRadio] = useState([]);
//   const [total, setTotal] = useState(0);
//   const [page, setPage] = useState(1);
//   const [loading, setLoading] = useState(false);

//   // Get all categories
//   const getAllCategory = async () => {
//     try {
//       const { data } = await axios.get("/api/v1/category/get-category");
//       if (data?.success) {
//         setCategories(data?.category);
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   useEffect(() => {
//     getAllCategory();
//     getTotal();
//   }, []);

//   // Get products
//   const getAllProducts = async () => {
//     try {
//       setLoading(true);
//       const { data } = await axios.get(`/api/v1/product/product-list/${page}`);
//       setLoading(false);
//       setProducts(data.products);
//     } catch (error) {
//       setLoading(false);
//       console.log(error);
//     }
//   };

//   // Get total count
//   const getTotal = async () => {
//     try {
//       const { data } = await axios.get("/api/v1/product/product-count");
//       setTotal(data?.total);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   useEffect(() => {
//     if (page === 1) return;
//     loadMore();
//   }, [page]);

//   // Load more products
//   const loadMore = async () => {
//     try {
//       setLoading(true);
//       const { data } = await axios.get(`/api/v1/product/product-list/${page}`);
//       setLoading(false);
//       setProducts([...products, ...data?.products]);
//     } catch (error) {
//       console.log(error);
//       setLoading(false);
//     }
//   };

//   // Filter by category
//   const handleFilter = (value, id) => {
//     let all = [...checked];
//     if (value) {
//       all.push(id);
//     } else {
//       all = all.filter((c) => c !== id);
//     }
//     setChecked(all);
//   };

//   useEffect(() => {
//     if (!checked.length || !radio.length) getAllProducts();
//   }, [checked.length, radio.length]);

//   useEffect(() => {
//     if (checked.length || radio.length) filterProduct();
//   }, [checked, radio]);

//   useEffect(() => {
//     if (checked.length || radio.length) {
//         filterProduct();
//     }
//   }, [checked, radio]);

//   // Get filtered products
//   const filterProduct = async () => {
//     try {
//         const { data } = await axios.post("/api/v1/product/product-filters", {
//             checked,
//             radio,
//         });

//         const filteredProducts = Array.isArray(data.products) ? data.products : [];
//         setProducts(filteredProducts);
//     } catch (error) {
//         console.error("Error fetching filtered products:", error);
//         setProducts([]); // Prevent UI crash
//     }
//   };


//   const uniquePrices = Prices?.filter(
//     (p, index, self) => index === self.findIndex((t) => JSON.stringify(t.array) === JSON.stringify(p.array))
//   );

//   return (
//     <Layout title={"ALL Products - Best offers "}>
//       {/* Banner Image */}
//       <img src="/images/Virtual.png" className="banner-img" alt="bannerimage" width={"100%"} />

//       <div className="container-fluid row mt-3 home-page">
//         <div className="col-md-3 filters">
//           <h4 className="text-center">Filter By Category</h4>
//           <div className="d-flex flex-column">
//             {categories?.map((c) => (
//               <Checkbox key={c._id} onChange={(e) => handleFilter(e.target.checked, c._id)}>
//                 {c.name}
//               </Checkbox>
//             ))}
//           </div>

//           {/* Price filter */}
//           <h4 className="text-center mt-4">Filter By Price</h4>
//           <div className="d-flex flex-column">
//             <Radio.Group onChange={(e) => setRadio(e.target.value)}>
//               {uniquePrices?.map((p, index) => (
//                 <div key={`${p._id || `price-${index}`}`}>
//                   <Radio value={index.toString()}>{p.name}</Radio>
//                 </div>
//               ))}
//             </Radio.Group>
//           </div>

//           <div className="d-flex flex-column">
//             <button className="btn btn-danger" onClick={() => window.location.reload()}>
//               RESET FILTERS
//             </button>
//           </div>
//         </div>

//         {/* Product Listing */}
//         <div className="col-md-9 ">
//           <h1 className="text-center">All Products</h1>
//           <div className="d-flex flex-wrap">
//             {products.length === 0 ? (
//                 <h5 data-testid="no-products-message">No Products Found</h5> // ✅ New condition for empty product list
//             ) : (
//                 products.map((p, index) => (
//                     <div className="card m-2" key={p._id || index} data-testid={`product-card-${p._id}`}>
//                         <img
//                             src={`/api/v1/product/product-photo/${p._id}`}
//                             className="card-img-top"
//                             alt={p.name}
//                         />
//                         <div className="card-body">
//                             <div className="card-name-price">
//                                 <h5 className="card-title" data-testid={`product-name-${p._id}`}>{p.name}</h5>
//                                 <h5 className="card-title card-price" data-testid={`product-price-${p._id}`}>
//                                     {p.price.toLocaleString("en-US", {
//                                         style: "currency",
//                                         currency: "USD",
//                                     })}
//                                 </h5>
//                             </div>
//                             <p className="card-text" data-testid={`product-desc-${p._id}`}>
//                                 {p.description.substring(0, 60)}...
//                             </p>
//                             <div className="card-name-price">
//                                 <button
//                                     className="btn btn-info ms-1"
//                                     onClick={() => navigate(`/product/${p.slug}`)}
//                                 >
//                                     More Details
//                                 </button>
//                                 <button
//                                     className="btn btn-dark ms-1"
//                                     onClick={() => {
//                                         setCart([...cart, p]);
//                                         localStorage.setItem(
//                                             "cart",
//                                             JSON.stringify([...cart, p])
//                                         );
//                                         toast.success("Item Added to cart");
//                                     }}
//                                 >
//                                     ADD TO CART
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 ))
//             )}
//         </div>
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default HomePage;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Checkbox, Radio } from "antd";
import { Prices } from "../components/Prices";
import { useCart } from "../context/cart";
import axios from "axios";
import toast from "react-hot-toast";
import Layout from "./../components/Layout";
import { AiOutlineReload } from "react-icons/ai";
import "../styles/Homepages.css";

const HomePage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [checked, setChecked] = useState([]);
  const [radio, setRadio] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Get all categories
  const getAllCategory = async () => {
    try {
      const { data } = await axios.get("/api/v1/category/get-category");
      if (data?.success) {
        setCategories(data?.category);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    getAllCategory();
    getTotal();
  }, []);

  // Get products
  const getAllProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/v1/product/product-list/${page}`);
      setLoading(false);
      setProducts(data.products);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching products:", error);
    }
  };

  // Get total count
  const getTotal = async () => {
    try {
      const { data } = await axios.get("/api/v1/product/product-count");
      setTotal(data?.total);
    } catch (error) {
      console.error("Error fetching total product count:", error);
    }
  };

  useEffect(() => {
    if (page === 1) return;
    loadMore();
  }, [page]);

  // Load more products
  const loadMore = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/v1/product/product-list/${page}`);
      setLoading(false);
      setProducts([...products, ...data?.products]);
    } catch (error) {
      console.error("Error loading more products:", error);
      setLoading(false);
    }
  };

  // Filter by category
  const handleFilter = (value, id) => {
    let all = [...checked];
    if (value) {
      all.push(id);
    } else {
      all = all.filter((c) => c !== id);
    }
    setChecked(all);
  };

  useEffect(() => {
    if (!checked.length && !radio.length) getAllProducts();
  }, [checked.length, radio.length]);

  useEffect(() => {
    if (checked.length || radio.length) filterProduct();
  }, [checked, radio]);

  // Get filtered products
  const filterProduct = async () => {
    try {
      const { data } = await axios.post("/api/v1/product/product-filters", {
        checked,
        radio,
      });
      setProducts(Array.isArray(data.products) ? data.products : []);
    } catch (error) {
      console.error("Error fetching filtered products:", error);
      setProducts([]); // Prevent UI crash
    }
  };

  return (
    <Layout title={"ALL Products - Best offers "}>
      {/* Banner Image */}
      <img src="/images/Virtual.png" className="banner-img" alt="bannerimage" width={"100%"} />

      <div className="container-fluid row mt-3 home-page">
        <div className="col-md-3 filters">
          <h4 className="text-center">Filter By Category</h4>
          <div className="d-flex flex-column">
            {categories?.map((c) => (
              <Checkbox key={c._id} onChange={(e) => handleFilter(e.target.checked, c._id)}>
                {c.name}
              </Checkbox>
            ))}
          </div>

          {/* Price filter */}
          <h4 className="text-center mt-4">Filter By Price</h4>
          <div className="d-flex flex-column">
            <Radio.Group onChange={(e) => setRadio(e.target.value)}>
              {Prices?.map((p) => (
                <div key={p._id}>
                  <Radio value={p.array}>{p.name}</Radio>
                </div>
              ))}
            </Radio.Group>
          </div>

          <div className="d-flex flex-column">
          <button
            className="btn btn-danger"
            onClick={async () => {
              setChecked([]); // Clear category filters
              setRadio([]); // Clear price filters
              await getAllProducts(); // 🔥 Re-fetch all products!
            }}
          >
              RESET FILTERS
          </button>
          </div>
        </div>

        {/* Product Listing */}
        <div className="col-md-9 ">
          <h1 className="text-center">All Products</h1>
          <div className="d-flex flex-wrap">
            {products.length === 0 ? (
              <h5 data-testid="no-products-message">No Products Found</h5>
            ) : (
              products.map((p, index) => (
                <div className="card m-2" key={p._id || index}>
                  <img src={`/api/v1/product/product-photo/${p._id}`} className="card-img-top" alt={p.name} />
                  <div className="card-body">
                    <h5 className="card-title">{p.name}</h5>
                    <p>{p.description ? p.description.substring(0, 60) : "No description available"}...</p>
                    <button className="btn btn-info" onClick={() => navigate(`/product/${p.slug}`)}>
                      View Product
                    </button>
                    <button
                      className="btn btn-dark ms-1"
                      onClick={() => {
                        const updatedCart = [...(JSON.parse(localStorage.getItem("cart")) || []), p]; // ✅ Append new item
                        setCart(updatedCart);
                        localStorage.setItem("cart", JSON.stringify(updatedCart)); // ✅ Store updated cart
                        toast.success("Item Added to Cart");
                      }}
                    >
                      ADD TO CART
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
