import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

function BrowseProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minQty, setMinQty] = useState("");
  const [maxQty, setMaxQty] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (!["Buyer", "Admin", "Owner"].includes(decoded.role)) {
        alert("Access denied");
        navigate("/dashboard");
        return;
      }

      fetchProducts(token);
    } catch {
      navigate("/auth");
    }
  }, [navigate]);

  const fetchProducts = async (token) => {
    try {
      const res = await axios.get("http://localhost:5000/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase());

    const withinPrice =
      (!minPrice || p.price >= parseFloat(minPrice)) &&
      (!maxPrice || p.price <= parseFloat(maxPrice));

    const withinQty =
      (!minQty || p.quantity >= parseInt(minQty)) &&
      (!maxQty || p.quantity <= parseInt(maxQty));

    return matchSearch && withinPrice && withinQty;
  });

  return (
    <div className="min-h-screen bg-[#f9fafb] p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-10 border border-gray-200">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Browse Products</h2>
        {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          ← Back to Dashboard
        </button>
      </div>
  
        {/* Filters */}
        <div className="flex flex-wrap gap-4 justify-center mb-10">
          <input
            type="text"
            placeholder="🔍 Search by name or location"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-60 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          />
          <input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-40 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          />
          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-40 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          />
          <input
            type="number"
            placeholder="Min Quantity"
            value={minQty}
            onChange={(e) => setMinQty(e.target.value)}
            className="w-40 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          />
          <input
            type="number"
            placeholder="Max Quantity"
            value={maxQty}
            onChange={(e) => setMaxQty(e.target.value)}
            className="w-40 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          />
          <button
            onClick={() => {
              setSearch("");
              setMinPrice("");
              setMaxPrice("");
              setMinQty("");
              setMaxQty("");
            }}
            className="px-5 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition"
          >
            Clear
          </button>
        </div>
  
        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">No products match your filters.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((p) => (
              <div
              key={p._id}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-transform duration-200"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-2">{p.name}</h3>
              <p className="text-gray-700">💰 Price: ₹{p.price}</p>
              <p className="text-gray-700">📦 Quantity: {p.quantity}</p>
              <p className="text-gray-700">📍 Location: {p.location}</p>
              <p className="text-sm text-gray-400 mt-2">By: {p.createdBy}</p>
            </div>
            
            ))}
          </div>
        )}
      </div>
    </div>
  );
  
}

export default BrowseProducts;
