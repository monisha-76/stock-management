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
    image: ""
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setRole(decoded.role);

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
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Product name is required.";
    if (!formData.price || isNaN(formData.price) || Number(formData.price) <= 0)
      newErrors.price = "Enter a valid price.";
    if (
      !formData.quantity ||
      isNaN(formData.quantity) ||
      Number(formData.quantity) < 0 ||
      !Number.isInteger(Number(formData.quantity))
    )
      newErrors.quantity = "Enter a valid quantity.";
    if (!formData.location.trim()) newErrors.location = "Location is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleImageChange = (e) => {
  setImageFile(e.target.files[0]);
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

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
        {/* Back Button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="absolute top-4 left-4 text-gray-500 font-semibold hover:text-gray-600 flex items-center"
        >
          ← Back to Dashboard
        </button>
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Add New Product</h2>
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
            {errors.name && <span className="text-red-500 text-sm">{errors.name}</span>}
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
            {errors.price && <span className="text-red-500 text-sm">{errors.price}</span>}
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
            {errors.quantity && <span className="text-red-500 text-sm">{errors.quantity}</span>}
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
            {errors.location && <span className="text-red-500 text-sm">{errors.location}</span>}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="image" className="text-lg font-medium text-gray-700">
              Product Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
              className="w-full p-2 border-2 border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.image && <span className="text-red-500 text-sm">{errors.image}</span>}
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition duration-300 ease-in-out"
          >
            Add Product
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddProduct;
