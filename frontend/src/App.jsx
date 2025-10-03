import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MenuPelanggan from "./pages/MenuPelanggan";
import MenuPengiriman from "./pages/MenuPengiriman";
import MenuPenagihan from "./pages/MenuPenagihan";
import MenuLaporan from "./pages/MenuLaporan";
import MenuPesan from "./pages/MenuPesan";
import MenuBanner from "./pages/MenuBanner";
import MenuUser from "./pages/MenuUser";
import Navbar from "./Navbar";
import ProtectedRoute from "./ProtectedRoute";
import Sidebar from "./Sidebar"; // ✅ ditambahkan

// 👉 Halaman User
import DashboardUser from "./pages/user/DashboardUser.jsx";
import ProfilUser from "./pages/user/ProfilUser.jsx"; // ✅ route baru untuk edit profil
import MenuPesanUser from "./pages/user/MenuPesanUser.jsx"; // ✅ import

function Layout() {
  return (
    <div className="flex">
      {/* Sidebar ikut di semua halaman admin */}
      <Sidebar />

      {/* Bagian konten utama */}
      <div className="flex-1">
        <Navbar />
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Login tunggal */}
          <Route path="/login" element={<Login />} />

          {/* Admin hanya untuk role admin */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route element={<Layout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="pelanggan" element={<MenuPelanggan />} />
              <Route path="pengiriman" element={<MenuPengiriman />} />
              <Route path="penagihan" element={<MenuPenagihan />} />
              <Route path="laporan" element={<MenuLaporan />} />
              <Route path="pesan" element={<MenuPesan />} />
              <Route path="banners" element={<MenuBanner />} />
              <Route path="users" element={<MenuUser />} />
              {/* ❌ yang ini dihapus:
              <Route path="*" element={<Navigate to="/dashboard" replace />} /> */}
            </Route>
          </Route>

          {/* User hanya untuk role user */}
          <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
            <Route path="/user/dashboard" element={<DashboardUser />} />
            <Route path="/user/profil" element={<ProfilUser />} />
            <Route path="/user/pesan" element={<MenuPesanUser />} /> {/* ✅ route baru */}
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
