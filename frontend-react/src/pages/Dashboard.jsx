// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // ✅ correct import
import { Link } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({ username: "", role: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth");
      return;
    }

    try {
      const decoded = jwtDecode(token); // ✅ correct usage
      setUserData({ username: decoded.username, role: decoded.role });
    } catch (err) {
      console.error("Invalid token");
      localStorage.removeItem("token");
      navigate("/auth");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 w-full max-w-xl text-center">
        <h1 className="text-2xl font-bold text-blue-700 dark:text-white mb-4">
          Welcome, {userData.username}!
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
          You are logged in as: <strong>{userData.role}</strong>
        </p>

        {/* Role-based sections */}
        {userData.role === "Admin" && (
          <div className="mb-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg mb-2">
              Manage Users
            </button>
            <br />
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg">
              View All Products
            </button>
          </div>
        )}

        {userData.role === "Seller" && (
          <div className="mb-4">
           <Link to="/add-product">
           <button className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg">
             Add New Product
           </button>
           </Link>
         </div>
        )}


        {userData.role === "Buyer" && (
          <div className="mb-4">
            <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg">
              Browse Products
            </button>
          </div>
        )}

        {userData.role === "Owner" && (
          <div className="mb-4">
            <button className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg">
              View Statistics
            </button>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-lg"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
