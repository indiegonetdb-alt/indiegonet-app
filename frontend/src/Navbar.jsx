import { Link, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return null; // kalau belum login, jangan tampilkan navbar

  return (
    <nav className="bg-red-600 text-white px-4 py-2 flex flex-col md:flex-row md:justify-between md:items-center">
      {/* Bagian Atas: Logo dan Tombol Hamburger */}
      <div className="flex justify-between items-center">
        {/* Logo Indiegonet */}
        <div className="flex items-center gap-2">
          <img
            src="/favicon.png" // ✅ logo dari public/favicon.png
            alt="Indiegonet Logo"
            className="w-8 h-8"
          />
          <span className="font-bold">Indiegonet</span>
        </div>
        </div>

      {/* Menu Navigasi */}
      <div
        className={`${
          menuOpen ? "flex" : "hidden"
        } flex-col md:flex md:flex-row md:items-center md:gap-4 mt-2 md:mt-0`}
      >
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

        {/* Info user + logout */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 mt-2 md:mt-0 border-t border-white md:border-none pt-2 md:pt-0">
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
      </div>
    </nav>
  );
}
