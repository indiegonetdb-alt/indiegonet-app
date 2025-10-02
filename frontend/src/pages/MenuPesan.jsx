import { useEffect, useState } from "react";
import { API_URL } from "../config";   // ✅ pakai API_URL

export default function MenuPesan() {
  const [list, setList] = useState([]);

  // 🔄 Ambil data pesan dari backend
  const loadData = async () => {
    try {
      const res = await fetch(`${API_URL}/messages`);
      const d = await res.json();
      if (d.ok) {
        setList(d.data);
      }
    } catch (err) {
      console.error("Gagal load pesan:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ✅ Tandai sudah dibaca
  const handleRead = async (id) => {
    try {
      const res = await fetch(`${API_URL}/messages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "read" }),
      });
      const d = await res.json();
      if (d.ok) {
        loadData();
      }
    } catch (err) {
      console.error("Gagal update status:", err);
    }
  };

  // ❌ Hapus pesan
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin hapus pesan ini?")) return;
    try {
      const res = await fetch(`${API_URL}/messages/${id}`, {
        method: "DELETE",
      });
      const d = await res.json();
      if (d.ok) {
        loadData();
      }
    } catch (err) {
      console.error("Gagal hapus pesan:", err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Daftar Pesan</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-red-600 text-white">
            <th className="border px-2 py-1">Pengirim</th>
            <th className="border px-2 py-1">Isi Pesan</th>
            <th className="border px-2 py-1">Status</th>
            <th className="border px-2 py-1">Tanggal</th>
            <th className="border px-2 py-1">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {list.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center p-2">
                Tidak ada pesan
              </td>
            </tr>
          ) : (
            list.map((p) => (
              <tr key={p._id} className="border">
                <td className="border px-2 py-1">
                  {p.fromUserId?.nama || p.fromUserId?.username || "Tanpa Nama"}
                </td>
                <td className="border px-2 py-1">{p.isi || p.body}</td>
                <td className="border px-2 py-1">
                  {p.status === "unread" ? (
                    <span className="text-red-600 font-bold">Belum Dibaca</span>
                  ) : (
                    <span className="text-green-600">Sudah Dibaca</span>
                  )}
                </td>
                <td className="border px-2 py-1">
                  {new Date(p.createdAt).toLocaleString("id-ID")}
                </td>
                <td className="border px-2 py-1 space-x-2">
                  {p.status === "unread" && (
                    <button
                      onClick={() => handleRead(p._id)}
                      className="bg-green-500 text-white px-2 py-1 rounded"
                    >
                      Sudah Dibaca
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(p._id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
