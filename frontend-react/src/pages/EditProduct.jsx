import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from 'react-toastify';

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    quantity: "",
    location: "",
    image: "",
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
      fetchProduct(token, decoded);
    } catch {
      navigate("/auth");
    }
  }, [id, navigate]);

  const fetchProduct = async (token, decoded) => {
    try {
      const res = await axios.get("http://localhost:5000/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const product = res.data.find((p) => p._id === id);
      if (!product) {
        toast.error("Product not found");
        navigate("/dashboard");
        return;
      }

      // 🛡️ Role-based access check
      if (decoded.role === "Seller" && product.createdBy !== decoded.username) {
        toast.error("Access denied. You can only edit your own products.");
        navigate("/dashboard");
        return;
      }

      if (decoded.role !== "Admin" && decoded.role !== "Seller") {
        toast.error("Access denied.");
        navigate("/dashboard");
        return;
      }

      setFormData({
        name: product.name,
        price: product.price,
        quantity: product.quantity,
        location: product.location,
        image: product.imageUrl,
      });
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load product.");
      navigate("/dashboard");
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, image: reader.result }));
    };
    if (file) reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/products/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate("/dashboard", { state: { toastMessage: "Product updated successfully." } });
    } catch (error) {
      console.error("Update failed", error);
      toast.error("Failed to update product.");
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-600">Loading...</p>;

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 transition-all duration-300 hover:shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Edit Product</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {["name", "price", "quantity", "location", "image"].map((field) => (
            <div key={field}>
              <label className="block text-gray-700 font-medium capitalize mb-1">
                {field === "location"
                  ? "Warehouse Location"
                  : field === "image"
                    ? "Upload Product Image"
                    : field}
              </label>

              {field === "image" ? (
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange} // <- handle file separately
                  className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 hover:border-blue-400 transition duration-200"
                  required
                />
              ) : (
                <input
                  type={field === "price" || field === "quantity" ? "number" : "text"}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 hover:border-blue-400 transition duration-200"
                  placeholder={`Enter ${field}`}
                  required
                />
              )}
            </div>
          ))}

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 hover:scale-105 transform transition-all duration-200 text-white font-semibold py-2 rounded-lg"
          >
            Update Product
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProduct;
