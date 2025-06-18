import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import html2pdf from "html2pdf.js";
import "react-toastify/dist/ReactToastify.css";

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
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/auth");

    try {
      const decoded = jwtDecode(token);
      if (!["Buyer", "Admin", "Owner"].includes(decoded.role)) {
        alert("Access denied");
        return navigate("/dashboard");
      }
      setUserRole(decoded.role);
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
            className="px-4 py-2  text-black rounded-lg shadow bg-gray-200 hover:bg-gray-300 transition"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Filter Section */}
        <div className="flex flex-wrap gap-4 justify-center mb-10">
          <input
            type="text"
            placeholder="🔍 Search by name or location"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-60 px-4 py-2 border rounded-lg shadow-sm"
          />
          <input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-40 px-4 py-2 border rounded-lg shadow-sm"
          />
          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-40 px-4 py-2 border rounded-lg shadow-sm"
          />
          <input
            type="number"
            placeholder="Min Quantity"
            value={minQty}
            onChange={(e) => setMinQty(e.target.value)}
            className="w-40 px-4 py-2 border rounded-lg shadow-sm"
          />
          <input
            type="number"
            placeholder="Max Quantity"
            value={maxQty}
            onChange={(e) => setMaxQty(e.target.value)}
            className="w-40 px-4 py-2 border rounded-lg shadow-sm"
          />
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

        {/* Product Grid or Request Button */}
        {filteredProducts.length === 0 ? (
          <>
            <p className="text-center text-gray-500 text-lg mb-4">
              No products match your filters.
            </p>

            {/* Show Request Button ONLY for Buyer */}
            {userRole === "Buyer" && (
              <div className="text-center">
                <button
                  onClick={() => navigate("/product-request")}
                  className="px-6 py-3 bg-purple-500 text-white rounded-lg shadow hover:bg-purple-600 transition"
                >
                  Request Product
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((p) => (
              <div
                key={p._id}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-transform"
              >
                {p.imageUrl && (
                  <img
                    src={p.imageUrl}
                    alt="product image"
                    className="w-full h-48 object-contain rounded-md mb-4 shadow"
                  />
                )}
                <h3 className="text-xl font-bold text-gray-800 mb-2">{p.name.toUpperCase()}</h3>
                <p className="text-gray-900">Price : ₹{p.price}</p>
                <p className="text-gray-900">Quantity : {p.quantity} available</p>
                <p className="text-gray-900">Location : {p.location}</p>
                <p className="text-sm text-gray-400 mt-2">By: {p.createdBy}</p>
                <button
                  onClick={() => {
                    setSelectedProduct(p);
                    setQuantity(1);
                    setPurchaseError("");
                  }}
                  className="w-full mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
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
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min="1"
                max={selectedProduct.quantity}
                className="w-full px-4 py-2 border rounded-lg mb-4"
                placeholder="Quantity"
              />
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg mb-4"
                placeholder="Delivery Address"
              />
              {purchaseError && <p className="text-red-500 mb-2">{purchaseError}</p>}
              <button
                onClick={() => handlePurchase(selectedProduct)}
                disabled={purchaseLoading}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                {purchaseLoading ? "Processing..." : "Confirm Purchase"}
              </button>
              <button
                onClick={() => setSelectedProduct(null)}
                className="w-full px-4 py-2 bg-gray-400 text-white rounded mt-4 hover:bg-gray-500"
              >
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
              <p className="mb-4">Would you like to download your invoice?</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => {
                    setShowInvoice(true);
                    setShowInvoicePrompt(false);
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowInvoicePrompt(false)}
                  className="px-4 py-2 bg-gray-400 rounded hover:bg-gray-500"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Modal */}
        {showInvoice && latestOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-auto p-6">
            <div
              ref={invoiceRef}
              className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg relative"
            >
              <h2 className="text-2xl font-bold mb-6 text-center">Invoice</h2>
              <p><strong>Order ID:</strong> {latestOrder._id}</p>
              <p><strong>Product:</strong> {selectedProduct.name}</p>
              <p><strong>Quantity:</strong> {latestOrder.quantityPurchased}</p>
              <p><strong>Price per unit:</strong> ₹{selectedProduct.price}</p>
              <p><strong>Total:</strong> ₹{selectedProduct.price * latestOrder.quantityPurchased}</p>
              <p><strong>Delivery Address:</strong> {latestOrder.deliveryAddress}</p>
              <p><strong>Date:</strong> {new Date(latestOrder.purchasedAt).toLocaleString()}</p>


              <div className="flex justify-between mt-6">
                <button
                  onClick={handleDownloadInvoice}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Download PDF
                </button>
                <button
                  onClick={() => setShowInvoice(false)}
                  className="px-4 py-2 bg-gray-400 rounded hover:bg-gray-500"
                >
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
