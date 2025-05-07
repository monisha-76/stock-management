import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

function AddProduct() {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    quantity: "",
    location: "",
  });

  const navigate = useNavigate();
  const [role, setRole] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setRole(decoded.role);

      // ✅ Only Seller allowed
      if (decoded.role !== "Seller") {
        alert("Access Denied: Only Sellers can add products.");
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Invalid token");
      navigate("/auth");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      await axios.post("http://localhost:5000/api/products", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Product added successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Error adding product:", err);
      alert("❌ Failed to add product.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="max-w-lg w-full p-8 bg-white rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-indigo-600 mb-8">Add New Product</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-lg font-medium text-gray-700">
              Product Name
            </label>
            <input
              name="name"
              placeholder="Enter product name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="price" className="text-lg font-medium text-gray-700">
              Price
            </label>
            <input
              name="price"
              type="number"
              placeholder="Enter price"
              value={formData.price}
              onChange={handleChange}
              required
              className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="quantity" className="text-lg font-medium text-gray-700">
              Quantity
            </label>
            <input
              name="quantity"
              type="number"
              placeholder="Enter quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
              className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="location" className="text-lg font-medium text-gray-700">
              Warehouse Location
            </label>
            <input
              name="location"
              placeholder="Enter warehouse location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition duration-300 ease-in-out"
          >
            Add Product
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddProduct;
