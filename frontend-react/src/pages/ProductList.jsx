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

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4 text-blue-700">Product List ({role})</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((product) => (
          <div key={product._id} className="border rounded p-4 shadow bg-white dark:bg-gray-800">
            <h3 className="font-semibold text-lg text-gray-800 dark:text-white">{product.name}</h3>
            <p className="text-gray-600 dark:text-gray-300">Price: ${product.price}</p>
            <p className="text-gray-600 dark:text-gray-300">Quantity: {product.quantity}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Location: {product.location}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductList;
