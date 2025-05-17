import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import html2pdf from "html2pdf.js";

function BrowseProducts() {
  const navigate = useNavigate();
  const invoiceRef = useRef();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minQty, setMinQty] = useState("");
  const [maxQty, setMaxQty] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [purchaseError, setPurchaseError] = useState("");
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [showInvoicePrompt, setShowInvoicePrompt] = useState(false);
  const [latestOrder, setLatestOrder] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/auth");

    try {
      const decoded = jwtDecode(token);
      if (!["Buyer", "Admin", "Owner"].includes(decoded.role)) {
        alert("Access denied");
        return navigate("/dashboard");
      }
      fetchProducts(token);
    } catch {
      navigate("/");
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

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase());

    const withinPrice =
      (!minPrice || p.price >= parseFloat(minPrice)) &&
      (!maxPrice || p.price <= parseFloat(maxPrice));

    const withinQty =
      (!minQty || p.quantity >= parseInt(minQty)) &&
      (!maxQty || p.quantity <= parseInt(maxQty));

    return matchSearch && withinPrice && withinQty;
  });

  const handlePurchase = async (product) => {
    if (!quantity || quantity <= 0) {
      setPurchaseError("Quantity must be at least 1.");
      return;
    }
    if (!deliveryAddress.trim()) {
      setPurchaseError("Delivery address is required.");
      return;
    }
    if (product.quantity < quantity) {
      setPurchaseError("Not enough stock available.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return navigate("/");

    setPurchaseLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/purchase",
        {
          productId: product._id,
          quantity,
          deliveryAddress,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Order placed successfully!");
      setLatestOrder(res.data.order);
      setSelectedProduct(product);
      setShowInvoicePrompt(true);

      // Reset form
      setQuantity(1);
      setDeliveryAddress("");
      setPurchaseError("");
      fetchProducts(token);
    } catch (err) {
      const error = err.response?.data?.error || "Purchase failed.";
      setPurchaseError(error);
      toast.error(error);
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handleDownloadInvoice = () => {
    const element = invoiceRef.current;
    html2pdf().from(element).save("invoice.pdf");
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-10 border border-gray-200">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
          Browse Products
        </h2>

        <div className="mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="flex flex-wrap gap-4 justify-center mb-10">
          <input type="text" placeholder="🔍 Search by name or location" value={search} onChange={(e) => setSearch(e.target.value)} className="w-60 px-4 py-2 border rounded-lg shadow-sm" />
          <input type="number" placeholder="Min Price" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-40 px-4 py-2 border rounded-lg shadow-sm" />
          <input type="number" placeholder="Max Price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-40 px-4 py-2 border rounded-lg shadow-sm" />
          <input type="number" placeholder="Min Quantity" value={minQty} onChange={(e) => setMinQty(e.target.value)} className="w-40 px-4 py-2 border rounded-lg shadow-sm" />
          <input type="number" placeholder="Max Quantity" value={maxQty} onChange={(e) => setMaxQty(e.target.value)} className="w-40 px-4 py-2 border rounded-lg shadow-sm" />
          <button
            onClick={() => {
              setSearch("");
              setMinPrice("");
              setMaxPrice("");
              setMinQty("");
              setMaxQty("");
            }}
            className="px-5 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
          >
            Clear
          </button>
        </div>

        {filteredProducts.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">No products match your filters.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((p) => (
              <div key={p._id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-transform">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{p.name}</h3>
                <p className="text-gray-700">💰 ₹{p.price}</p>
                <p className="text-gray-700">📦 {p.quantity} available</p>
                <p className="text-gray-700">📍 {p.location}</p>
                <p className="text-sm text-gray-400 mt-2">By: {p.createdBy}</p>
                <button
                  onClick={() => {
                    setSelectedProduct(p);
                    setQuantity(1);
                    setPurchaseError("");
                  }}
                  className="w-full mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Purchase
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Purchase Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm">
              <h3 className="text-xl font-bold mb-4">Purchase {selectedProduct.name}</h3>
              <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} min="1" max={selectedProduct.quantity} className="w-full px-4 py-2 border rounded-lg mb-4" placeholder="Quantity" />
              <textarea value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} className="w-full px-4 py-2 border rounded-lg mb-4" placeholder="Delivery Address" />
              {purchaseError && <p className="text-red-500 mb-2">{purchaseError}</p>}
              <button onClick={() => handlePurchase(selectedProduct)} disabled={purchaseLoading} className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                {purchaseLoading ? "Processing..." : "Confirm Purchase"}
              </button>
              <button onClick={() => setSelectedProduct(null)} className="w-full px-4 py-2 bg-gray-400 text-white rounded mt-4 hover:bg-gray-500">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Invoice Prompt */}
        {showInvoicePrompt && latestOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h3 className="text-lg font-bold mb-4">Purchase Successful</h3>
              <p className="mb-4">Generate invoice for your order?</p>
              <div className="flex justify-end gap-4">
                <button onClick={() => {
                  setShowInvoicePrompt(false);
                  setSelectedProduct(null);
                }} className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500">No</button>
                <button onClick={() => {
                  setShowInvoicePrompt(false);
                  setShowInvoice(true);
                }} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Yes, Generate</button>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Modal */}
        {showInvoice && latestOrder && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
             <div ref={invoiceRef} style={{ padding: "20px", fontFamily: "Arial, sans-serif", color: "#333" }}>
  <h2 style={{ textAlign: "center", fontSize: "24px", marginBottom: "20px" }}>Invoice</h2>

  <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
    <tbody>
      <tr>
        <td style={{ padding: "8px", fontWeight: "bold" }}>Product</td>
        <td style={{ padding: "8px" }}>{selectedProduct.name}</td>
      </tr>
      <tr>
        <td style={{ padding: "8px", fontWeight: "bold" }}>Unit Price</td>
        <td style={{ padding: "8px" }}>₹{selectedProduct.price}</td>
      </tr>
      <tr>
        <td style={{ padding: "8px", fontWeight: "bold" }}>Quantity</td>
        <td style={{ padding: "8px" }}>{latestOrder.quantityPurchased}</td>
      </tr>
      <tr>
        <td style={{ padding: "8px", fontWeight: "bold" }}>Total Price</td>
        <td style={{ padding: "8px" }}>₹{latestOrder.totalPrice}</td>
      </tr>
      <tr>
        <td style={{ padding: "8px", fontWeight: "bold" }}>Delivery Address</td>
        <td style={{ padding: "8px" }}>{latestOrder.deliveryAddress}</td>
      </tr>
      <tr>
        <td style={{ padding: "8px", fontWeight: "bold" }}>Order Time</td>
        <td style={{ padding: "8px" }}>{new Date(latestOrder.purchasedAt).toLocaleString()}</td>
      </tr>
    </tbody>
  </table>

  <p style={{ textAlign: "center", fontSize: "14px", marginTop: "30px" }}>
    Thank you for your purchase!
  </p>
</div>

              <div className="mt-6 flex justify-between">
                <button onClick={handleDownloadInvoice} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Download Invoice
                </button>
                <button onClick={() => {
                  setShowInvoice(false);
                  setLatestOrder(null);
                  setSelectedProduct(null);
                }} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BrowseProducts;
