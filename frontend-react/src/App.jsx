import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import AddProduct from "./pages/AddProduct";
import StatsPage from "./pages/StatsPage";
import EditProduct from "./pages/EditProduct";
import BrowseProducts from "./pages/BrowseProducts";
import ProtectedRoute from "./components/ProtectedRoute";
import BuyerOrders from "./pages/BuyerOrders";
import AdminRequestList from './pages/AdminRequestList';
import ProductRequestForm from './pages/ProductRequestForm';
import SellerRequestList from './pages/SellerRequestList';
import MyOffers from './pages/MyOffers';
function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        {/* Public route for authentication */}
        <Route path="/" element={<AuthPage />} />

        {/* Authenticated routes for all roles */}
        <Route element={<ProtectedRoute allowedRoles={["Admin", "Seller", "Buyer", "Owner"]} />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        {/* Seller Only */}
        <Route element={<ProtectedRoute allowedRoles={["Seller"]} />}>
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/seller-requests" element={<SellerRequestList />}/>
          <Route path="/seller/my-offers" element={<MyOffers />} />

        </Route>

        {/* Admin Only */}
     <Route element={<ProtectedRoute allowedRoles={["Admin", "Seller"]} />}>
  <Route path="/edit-product/:id" element={<EditProduct />} />
</Route>

        {/* Buyer Only */}
        <Route element={<ProtectedRoute allowedRoles={["Buyer"]} />}>
          <Route path="/browse" element={<BrowseProducts />} />
          <Route path="/my-orders" element={<BuyerOrders />} />
          <Route path="/product-request" element={<ProductRequestForm />} />
        </Route>

        {/* Owner Only */}
        <Route element={<ProtectedRoute allowedRoles={["Owner"]} />}>
          <Route path="/owner-stats" element={<StatsPage />} />
        </Route>

        
        <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
         <Route path="/admin-requests" element={<AdminRequestList />} />
        </Route>

      </Routes>

      {/* Global Toast Container */}
      <ToastContainer position="top-center" autoClose={2000} />
    </div>
  );
}

export default App;
