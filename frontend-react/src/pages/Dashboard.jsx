import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

function Dashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({ username: "", role: "" });
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUserData({ username: decoded.username, role: decoded.role });
      fetchProducts(token);
    } catch (err) {
      console.error("Invalid token");
      localStorage.removeItem("token");
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth");
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`http://localhost:5000/api/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Product deleted successfully.");
        setProducts(products.filter((p) => p._id !== id));
      } catch (err) {
        console.error("Delete failed:", err);
        alert("Failed to delete product.");
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit-product/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-700 dark:text-white">
            Welcome, {userData.username}!
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Role: <strong>{userData.role}</strong>
          </p>
        </div>

        {/* Seller – Add Product */}
        {userData.role === "Seller" && (
          <div className="text-center mb-6">
            <Link to="/add-product">
              <button className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg">
                Add New Product
              </button>
            </Link>
          </div>
        )}

        {/* Buyer – Browse Products */}
        {userData.role === "Buyer" && (
          <div className="text-center mb-6">
            <Link to="/browse">
              <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg">
                Browse Products
              </button>
            </Link>
          </div>
        )}

        {/* Owner – View Stats */}
        {userData.role === "Owner" && (
          <div className="text-center mb-6">
            <Link to="/owner-stats">
              <button className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg">
                View Statistics
              </button>
            </Link>
          </div>
        )}

        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Products
        </h2>

        {products.length === 0 ? (
          <p className="text-gray-500">No products to display.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((p) => (
              <div key={p._id} className="bg-gray-50 dark:bg-gray-700 rounded p-4 shadow">
                <h3 className="text-lg font-bold text-purple-700">{p.name}</h3>
                <p>Price: ₹{p.price}</p>
                <p>Quantity: {p.quantity}</p>
                <p>Location: {p.location}</p>
                <p className="text-sm text-gray-400 mt-1">By: {p.createdBy}</p>

                {userData.role === "Admin" && (
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleEdit(p._id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-lg"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
