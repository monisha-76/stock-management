import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

function StatsPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSellers: 0,
    totalBuyers: 0,
    totalQuantity: 0,
    topSellers: []
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

  const topSellersData = {
    labels: stats.topSellers.map((s) => s._id),
    datasets: [
      {
        label: "Quantity Sold",
        data: stats.topSellers.map((s) => s.totalQuantity),
        backgroundColor: ["#f43f5e", "#3b82f6", "#10b981"],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow w-full max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Owner Dashboard - Statistics
        </h2>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 bg-gray-200 text-black rounded-lg shadow hover:bg-gray-300 transition"
        >
          ← Back to Dashboard
        </button>
      </div>

        {/* Text Stats */}
        <div className="space-y-4 text-lg text-gray-800 dark:text-white mb-8 text-center">
          <p>Total Products: <strong>{stats.totalProducts}</strong></p>
          <p>Total Sellers: <strong>{stats.totalSellers}</strong></p>
          <p>Total Buyers: <strong>{stats.totalBuyers}</strong></p>
          <p>Total Quantity in Stock: <strong>{stats.totalQuantity}</strong></p>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-center text-gray-700 dark:text-gray-200 mb-2">Products & Stock</h3>
            <Bar
              data={{
                labels: ["Products", "Quantity"],
                datasets: [
                  {
                    label: "Counts",
                    data: [stats.totalProducts, stats.totalQuantity],
                    backgroundColor: ["#f59e0b", "#10b981"],
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
              }}
            />
          </div>
          <div>
            <h3 className="text-center text-gray-700 dark:text-gray-200 mb-2">Total Sellers</h3>
            <Doughnut
              data={{
                labels: ["Sellers"],
                datasets: [
                  {
                    data: [stats.totalSellers],
                    backgroundColor: ["#3b82f6"],
                  },
                ],
              }}
              options={{ responsive: true }}
            />
          </div>
        </div>

        {/* Top Sellers Bar Chart */}
        <div className="mt-10">
          <h3 className="text-xl font-semibold text-center text-gray-900 mb-4">Top Sellers (By Quantity)</h3>
          {stats.topSellers.length > 0 ? (
            <Bar
              data={topSellersData}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  y: { beginAtZero: true },
                },
              }}
            />
          ) : (
            <p className="text-center text-gray-500">No seller data available</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default StatsPage;
