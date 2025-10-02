import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ allowedRoles }) {
  const { user } = useAuth();
  const location = useLocation();

  // Jika belum login, arahkan ke /login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Jika role user tidak sesuai dengan allowedRoles, arahkan ke /login
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  // Jika lolos semua, render child route
  return <Outlet />;
}
