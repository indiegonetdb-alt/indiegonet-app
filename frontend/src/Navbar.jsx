import { Link, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null; // kalau belum login, jangan tampilkan navbar

  return (
    <nav className="bg-red-600 text-white px-4 py-2 flex justify-between items-center">
      {/* Logo Indiegonet */}
      <div className="flex items-center gap-2">
        <img
          src="/favicon.png" // ✅ logo dari public/favicon.png
          alt="Indiegonet Logo"
          className="w-8 h-8"
        />
        <span className="font-bold">Indiegonet</span>
      </div>

      {/* Menu Navigasi */}
      <div className="flex gap-4">
        {/* Menu Admin */}
        {user.role === "admin" && (
          <>
            <Link
              to="/dashboard"
              className={location.pathname === "/dashboard" ? "font-bold" : ""}
            >
              Dashboard
            </Link>
            <Link
              to="/pelanggan"
              className={location.pathname === "/pelanggan" ? "font-bold" : ""}
            >
              Pelanggan
            </Link>
            <Link
              to="/pengiriman"
              className={location.pathname === "/pengiriman" ? "font-bold" : ""}
            >
              Pengiriman
            </Link>
            <Link
              to="/penagihan"
              className={location.pathname === "/penagihan" ? "font-bold" : ""}
            >
              Penagihan
            </Link>
            <Link
              to="/laporan"
              className={location.pathname === "/laporan" ? "font-bold" : ""}
            >
              Laporan
            </Link>
            <Link
              to="/pesan"
              className={location.pathname === "/pesan" ? "font-bold" : ""}
            >
              Pesan
            </Link>
            <Link
              to="/banners"
              className={location.pathname === "/banners" ? "font-bold" : ""}
            >
              Banners
            </Link>
            <Link
              to="/users"
              className={location.pathname === "/users" ? "font-bold" : ""}
            >
              Users
            </Link>
          </>
        )}

        {/* Menu User */}
        {user.role === "user" && (
          <Link
            to="/user/dashboard"
            className={
              location.pathname === "/user/dashboard" ? "font-bold" : ""
            }
          >
            Dashboard User
          </Link>
        )}
      </div>

      {/* Info user + logout */}
      <div className="flex items-center gap-4">
        <span className="text-sm">
          {user.username} ({user.role})
        </span>
        <button
          onClick={logout}
          className="bg-white text-red-600 px-3 py-1 rounded-2xl"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
