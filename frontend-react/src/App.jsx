import { Routes, Route } from 'react-router-dom';
import AuthPage from "./pages/AuthPage";
import Dashboard from './pages/Dashboard';
import AddProduct from "./pages/AddProduct";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-product" element={<AddProduct />} /> {/* ✅ New route */}
      </Routes>
    </div>
  );
}

export default App;
