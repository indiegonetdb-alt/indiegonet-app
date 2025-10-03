import { Link, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useState } from "react";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  // fungsi untuk close sidebar (khusus mobile)
  const handleClose = () => setOpen(false);

  return (
    <>
      {/* Tombol Toggle (Mobile) */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-4 left-4 z-50 bg-red-600 text-white px-3 py-2 rounded"
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-60 bg-red-700 text-white transform ${
          open ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 md:translate-x-0 md:static md:w-60 z-40`}
      >
        <div className="p-4 font-bold text-lg border-b border-white">
          Indiegonet
        </div>

        <nav className="flex flex-col gap-3 p-4">
          {user.role === "admin" && (
            <>
              <Link
                to="/dashboard"
                onClick={handleClose}
                className={location.pathname === "/dashboard" ? "font-bold" : ""}
              >
                Dashboard
              </Link>
              <Link
                to="/pelanggan"
                onClick={handleClose}
                className={location.pathname === "/pelanggan" ? "font-bold" : ""}
              >
                Pelanggan
              </Link>
              <Link
                to="/pengiriman"
                onClick={handleClose}
                className={location.pathname === "/pengiriman" ? "font-bold" : ""}
              >
                Pengiriman
              </Link>
              <Link
                to="/penagihan"
                onClick={handleClose}
                className={location.pathname === "/penagihan" ? "font-bold" : ""}
              >
                Penagihan
              </Link>
              <Link
                to="/laporan"
                onClick={handleClose}
                className={location.pathname === "/laporan" ? "font-bold" : ""}
              >
                Laporan
              </Link>
              <Link
                to="/pesan"
                onClick={handleClose}
                className={location.pathname === "/pesan" ? "font-bold" : ""}
              >
                Pesan
              </Link>
              <Link
                to="/banners"
                onClick={handleClose}
                className={location.pathname === "/banners" ? "font-bold" : ""}
              >
                Banners
              </Link>
              <Link
                to="/users"
                onClick={handleClose}
                className={location.pathname === "/users" ? "font-bold" : ""}
              >
                Users
              </Link>
            </>
          )}

          {user.role === "user" && (
            <Link
              to="/user/dashboard"
              onClick={handleClose}
              className={
                location.pathname === "/user/dashboard" ? "font-bold" : ""
              }
            >
              Dashboard User
            </Link>
          )}

          <div className="mt-6 border-t border-white pt-3">
            <span className="text-sm block">
              {user.username} ({user.role})
            </span>
            <button
              onClick={logout}
              className="bg-white text-red-600 px-3 py-1 rounded-2xl mt-2"
            >
              Logout
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}
