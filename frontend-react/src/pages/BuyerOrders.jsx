import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

function BuyerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
   const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/purchase/my-orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!Array.isArray(res.data)) {
        throw new Error("Unexpected response format");
      }

      setOrders(res.data);
    } catch (error) {
      console.error("Order fetch error:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">My Order History</h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="hover:bg-gray-300 bg-gray-200 text-black px-4 py-2 rounded  transition"
        >
          ← Back
        </button>
      </div>
      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Order ID</th>
              <th className="py-2 px-4 border-b">Product Name</th>
              <th className="py-2 px-4 border-b">Unit Price</th>
              <th className="py-2 px-4 border-b">Quantity</th>
              <th className="py-2 px-4 border-b">Total Price</th>
              <th className="py-2 px-4 border-b">Delivery Address</th>
              <th className="py-2 px-4 border-b">Purchased At</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.orderId}>
                <td className="py-2 px-4 border-b">{order.orderId}</td>
                <td className="py-2 px-4 border-b">{order.productName}</td>
                <td className="py-2 px-4 border-b">₹{order.unitPrice}</td>
                <td className="py-2 px-4 border-b">{order.quantity}</td>
                <td className="py-2 px-4 border-b">₹{order.totalPrice}</td>
                <td className="py-2 px-4 border-b">{order.deliveryAddress}</td>
                <td className="py-2 px-4 border-b">
                  {format(new Date(order.purchasedAt), "dd/MM/yyyy, hh:mm:ss a")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default BuyerOrders;
