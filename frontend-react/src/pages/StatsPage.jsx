import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

function StatsPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSellers: 0,
    totalQuantity: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth");
      return;
    }

    try {
      const decoded = jwtDecode(token);

      if (decoded.role !== "Owner") {
        alert("Access denied. Only Owners can view statistics.");
        navigate("/dashboard");
        return;
      }

      fetchStats(token);
    } catch (err) {
      console.error("Invalid token");
      navigate("/auth");
    }
  }, [navigate]);

  const fetchStats = async (token) => {
    try {
      const res = await axios.get("http://localhost:5000/api/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-6">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow w-full max-w-xl">
        <h2 className="text-2xl font-bold text-yellow-600 mb-6 text-center">
          Owner Dashboard - Statistics
        </h2>
        <div className="space-y-4 text-lg text-gray-800 dark:text-white">
          <p>Total Products: <strong>{stats.totalProducts}</strong></p>
          <p>Total Sellers: <strong>{stats.totalSellers}</strong></p>
          <p>Total Quantity in Stock: <strong>{stats.totalQuantity}</strong></p>
        </div>
      </div>
    </div>
  );
}

export default StatsPage;
