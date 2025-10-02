import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config";   // ✅ pakai API_URL
export default function ProfilUser() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [foto, setFoto] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user"));
    if (!u || !u._id) {
      window.location.href = "/login";
      return;
    }
    setUsername(u.username || "");

    const savedFoto = localStorage.getItem("fotoProfil");
    if (savedFoto) setFoto(savedFoto);
  }, []);

  const handleUpdate = async () => {
    const u = JSON.parse(localStorage.getItem("user"));
    if (!u || !u._id) return;

    if (!username.trim() || !password.trim()) {
      return alert("Username dan password wajib diisi.");
    }

    const res = await fetch(`${API_URL}/user/${u._id}/profil`, {   // ✅ fix URL
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const d = await res.json();

    if (d.ok) {
      alert("Profil berhasil diupdate. Silakan login ulang.");
      localStorage.clear();
      window.location.href = "/login";
    } else {
      alert(d.error || "Gagal update profil");
    }
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFoto(reader.result);
        localStorage.setItem("fotoProfil", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHapusFoto = () => {
    localStorage.removeItem("fotoProfil");
    setFoto(null);
    alert("Foto profil dihapus. Akan kembali ke avatar default.");
  };

  return (
    <div className="p-6 bg-red-600 min-h-screen text-black flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
        {/* Header dengan tombol Back */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => navigate("/user/dashboard")}
            className="bg-gray-300 hover:bg-gray-400 text-black px-3 py-1 rounded-2xl"
          >
            ⬅ Kembali
          </button>
          <h2 className="text-xl font-bold text-red-600">Edit Profil User</h2>
        </div>

        {/* Foto Profil */}
        <div className="flex flex-col items-center mb-4">
          {foto ? (
            <img
              src={foto}
              alt="Foto Profil"
              className="w-24 h-24 rounded-full object-cover mb-2"
            />
          ) : (
            <img
              src="/avatar.png"
              alt="Default Avatar"
              className="w-24 h-24 rounded-full object-cover mb-2"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFotoChange}
            className="text-sm mb-2"
          />
          {foto && (
            <button
              onClick={handleHapusFoto}
              className="bg-gray-300 hover:bg-gray-400 text-black px-3 py-1 rounded-2xl text-sm"
            >
              Hapus Foto
            </button>
          )}
        </div>

        <label className="block mb-2 font-semibold">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border w-full p-2 rounded mb-4 text-black"
        />

        <label className="block mb-2 font-semibold">Password Baru</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Isi password baru"
          className="border w-full p-2 rounded mb-4 text-black"
        />

        <button
          onClick={handleUpdate}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-2xl w-full"
        >
          Simpan Perubahan
        </button>
      </div>
    </div>
  );
}
