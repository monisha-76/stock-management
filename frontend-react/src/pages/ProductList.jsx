import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/auth");

    try {
      const decoded = jwtDecode(token);
      setRole(decoded.role);

      axios
        .get("http://localhost:5000/api/products", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setProducts(res.data))
        .catch((err) => console.error("Fetch error:", err));
    } catch (err) {
      console.error("Invalid token");
      localStorage.removeItem("token");
      navigate("/auth");
    }
  }, [navigate]);

  console.log(products);

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">Product List ({role})</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product._id}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-transform duration-200"
          >
            {product.imageUrl && (
              <div className="w-full h-48 flex items-center justify-center bg-gray-100 rounded-md mb-4 overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt="product"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            )}
            <h3 className="text-xl font-bold text-gray-800 mb-2">{product.name}</h3>
            <p className="text-gray-700">Price: ₹{product.price}</p>
            <p className="text-gray-700">Quantity: {product.quantity}</p>
            <p className="text-gray-700">Location: {product.location}</p>
            <p className="text-sm text-gray-400 mt-2">By: {product.createdBy || "N/A"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductList;
