import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

const ProtectedRoute = ({ allowedRoles }) => {
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsAuthorized(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const userRole = decoded.role;

      if (allowedRoles.includes(userRole)) {
        setIsAuthorized(true);
      } else {
        toast.error("Access denied: You are not authorized to view this page.", {
          toastId: "unauthorized",
        });
        setIsAuthorized(false);
      }
    } catch (err) {
      localStorage.removeItem("token");
      setIsAuthorized(false);
    }
  }, [allowedRoles]);

  if (isAuthorized === null) return null; // or a loading indicator

  return isAuthorized ? (
    <Outlet />
  ) : (
    <Navigate to="/dashboard" state={{ from: location }} replace />
  );
};

export default ProtectedRoute;
