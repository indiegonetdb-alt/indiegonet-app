// src/pages/user/MenuPesanUser.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config";   // ✅ tambahkan

export default function MenuPesanUser() {
  const [pesan, setPesan] = useState("");
  const navigate = useNavigate();

  const handleKirimPesan = async () => {
    if (!pesan.trim()) return alert("Pesan tidak boleh kosong!");
    const u = JSON.parse(localStorage.getItem("user"));
    if (!u || !u._id) {
      console.log("❌ User kosong di localStorage:", u);
      return;
    }

    console.log("✅ User terdeteksi:", u);

    try {
      const res = await fetch(`${API_URL}/pesan`, {   // ✅ pakai API_URL
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: u._id, isi: pesan }),
      });

      const d = await res.json();
      console.log("📨 Respon dari server:", d);

      setPesan("");
      alert("Pesan terkirim.");
    } catch (err) {
      alert("Gagal kirim pesan: " + err.message);
    }
  };

  return (
    <div className="p-6 bg-red-600 min-h-screen text-black">
      {/* Header dengan logo (back ke dashboard) */}
      <div className="flex justify-between items-center mb-4">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/user/dashboard")}
        >
          <img
            src="/favicon.png"
            alt="Indiegonet Logo"
            className="w-8 h-8"
          />
          <span className="text-white font-bold">Indiegonet</span>
        </div>

        <h2 className="text-xl font-bold text-white">Kirim Pesan</h2>
      </div>

      {/* Form pesan */}
      <div className="bg-white rounded-2xl p-4">
        <textarea
          value={pesan}
          onChange={(e) => setPesan(e.target.value)}
          className="w-full border p-2 rounded text-black"
          placeholder="Kritik, saran, atau permintaan vocer..."
          rows={5}
        />
        <button
          onClick={handleKirimPesan}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded-2xl"
        >
          Kirim Pesan
        </button>
      </div>
    </div>
  );
}
