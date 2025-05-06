import { Routes, Route } from 'react-router-dom';
import AuthPage from "./pages/AuthPage";
import Dashboard from './pages/Dashboard';
import SellerProductPage from "./pages/SellerProductPage";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/" element={<AuthPage/>} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/seller-products" element={<SellerProductPage />} />
      </Routes>
    </div>
  );
}

export default App;
