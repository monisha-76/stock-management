import { Routes, Route } from 'react-router-dom';
import AuthPage from "./pages/AuthPage";
import Dashboard from './pages/Dashboard';
import AddProduct from "./pages/AddProduct";
import StatsPage from "./pages/StatsPage";
import EditProduct from "./pages/EditProduct";
import BrowseProducts from "./pages/BrowseProducts";




function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-product" element={<AddProduct />} /> {/* ✅ New route */}
        <Route path="/owner-stats" element={<StatsPage />} />
        <Route path="/edit-product/:id" element={<EditProduct />} />
        <Route path="/browse" element={<BrowseProducts />} />

      </Routes>
    </div>
  );
}

export default App;
