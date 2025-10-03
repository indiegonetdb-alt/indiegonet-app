import { API_URL } from "../config";   // ✅ sudah ada
import { useEffect, useState } from "react";

export default function MenuPelanggan() {
  // ==== STATE ====
  const [pelanggan, setPelanggan] = useState([]);
  const [form, setForm] = useState({
    nama: "",
    jenis: "toko",
    persenan: "",
    jumlahPembayaran: "",
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterJenis, setFilterJenis] = useState("semua");
  const [searchNama, setSearchNama] = useState("");

  // ==== HELPER ====
  function formatNumber(num) {
    if (num === undefined || num === null || num === "") return "-";
    return new Intl.NumberFormat("id-ID").format(num);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function resetForm() {
    setForm({ nama: "", jenis: "toko", persenan: "", jumlahPembayaran: "" });
    setEditId(null);
  }

  // ==== FETCH DATA ====
  async function fetchData() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/pelanggan`, {   // ✅ API
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setPelanggan(data);
      } else if (data && Array.isArray(data.data)) {
        setPelanggan(data.data);
      } else {
        setPelanggan([]);
      }
    } catch (err) {
      console.error("Error fetching pelanggan:", err);
      setPelanggan([]);
    }
  }

  // ==== USE EFFECT ====
  useEffect(() => {
    fetchData();
  }, []);

  // ==== SUBMIT ====
  async function handleSubmit(e) {
    e.preventDefault();

    if (
      pelanggan.some(
        (p) =>
          p.nama.toLowerCase() === form.nama.toLowerCase() && p._id !== editId
      )
    ) {
      alert("Nama pelanggan sudah ada, gunakan nama lain!");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const url = editId
        ? `${API_URL}/pelanggan/${editId}`    // ✅ update
        : `${API_URL}/pelanggan`;            // ✅ tambah
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      await res.json();

      fetchData();
      resetForm();
    } catch (err) {
      console.error("Error saving pelanggan:", err);
    } finally {
      setLoading(false);
    }
  }

  // ==== HAPUS ====
  async function handleDelete(id) {
    if (!window.confirm("Yakin ingin hapus pelanggan ini?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/pelanggan/${id}`, {   // ✅ hapus
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      await res.json();

      fetchData();
    } catch (err) {
      console.error("Error deleting pelanggan:", err);
    } finally {
      setLoading(false);
    }
  }

  // ==== EDIT ====
  function handleEdit(item) {
    setForm({
      nama: item.nama,
      jenis: item.jenis,
      persenan: item.persenan || "",
      jumlahPembayaran: item.jumlahPembayaran || "",
    });
    setEditId(item._id);
  }

  // ==== DUPLIKAT HAPUS (tidak dihapus, biarkan tetap ada) ====
  async function handleDelete(id) {
    if (!window.confirm("Yakin ingin hapus pelanggan ini?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/pelanggan/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      await res.json();

      fetchData();
    } catch (err) {
      console.error("Error deleting pelanggan:", err);
    }
  }

  // ==== FILTER DATA ====
  const filteredPelanggan = pelanggan.filter((p) => {
    const cocokJenis = filterJenis === "semua" ? true : p.jenis === filterJenis;
    const cocokNama = p.nama.toLowerCase().includes(searchNama);
    return cocokJenis && cocokNama;
  });

  // ==== RENDER ====
  return (
    <div className="p-6 space-y-6 bg-black min-h-screen text-white">
      <h1 className="text-2xl font-bold text-red-600">👥 Menu Pelanggan</h1>

      {/* Form input */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 shadow-lg rounded-lg p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-red-500">
            Nama
          </label>
          <input
            type="text"
            name="nama"
            value={form.nama}
            onChange={handleChange}
            required
            className="mt-1 w-full bg-gray-800 text-white border border-red-500 rounded px-2 py-2 focus:ring-2 focus:ring-red-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-red-500">
            Jenis Pelanggan
          </label>
          <select
            name="jenis"
            value={form.jenis}
            onChange={handleChange}
            className="mt-1 w-full bg-gray-800 text-white border border-red-500 rounded px-2 py-2 focus:ring-2 focus:ring-red-400"
          >
            <option value="toko">Toko</option>
            <option value="pribadi">Bulanan</option>
          </select>
        </div>

        {form.jenis === "toko" ? (
          <div>
            <label className="block text-sm font-medium text-red-500">
              Persenan (%)
            </label>
            <input
              type="number"
              name="persenan"
              value={form.persenan}
              onChange={handleChange}
              className="mt-1 w-full bg-gray-800 text-white border border-red-500 rounded px-2 py-2 focus:ring-2 focus:ring-red-400"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-red-500">
              Jumlah Pembayaran
            </label>
            <input
              type="number"
              name="jumlahPembayaran"
              value={form.jumlahPembayaran}
              onChange={handleChange}
              className="mt-1 w-full bg-gray-800 text-white border border-red-500 rounded px-2 py-2 focus:ring-2 focus:ring-red-400"
            />
          </div>
        )}

        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            {editId ? "Update" : "Simpan"}
          </button>
          {editId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Batal
            </button>
          )}
        </div>
      </form>

      {/* Filter + Tabel pelanggan */}
      <div className="bg-gray-900 shadow-lg rounded-lg p-4">
        <div className="flex items-center space-x-3 mb-3">
          <h2 className="text-lg font-semibold text-red-500">Daftar Pelanggan</h2>
          <input
            type="text"
            placeholder="Cari nama..."
            onChange={(e) => setSearchNama(e.target.value.toLowerCase())}
            className="w-48 bg-gray-800 text-white border border-red-500 rounded px-2 py-1 focus:ring-2 focus:ring-red-400"
          />
          <select
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
            className="bg-gray-800 text-white border border-red-500 rounded px-2 py-1 focus:ring-2 focus:ring-red-400"
          >
            <option value="semua">Semua</option>
            <option value="toko">Toko</option>
            <option value="pribadi">Bulanan</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-red-600 text-white uppercase text-xs">
              <tr>
                <th className="px-4 py-2">Nama</th>
                <th className="px-4 py-2">Jenis</th>
                <th className="px-4 py-2">Persenan</th>
                <th className="px-4 py-2">Jumlah Pembayaran</th>
                <th className="px-4 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredPelanggan.map((p, idx) => (
                <tr
                  key={p._id}
                  className={idx % 2 === 0 ? "bg-black" : "bg-gray-800"}
                >
                  <td className="px-4 py-2">{p.nama}</td>
                  <td className="px-4 py-2">{p.jenis}</td>
                  <td className="px-4 py-2">{formatNumber(p.persenan)}</td>
                  <td className="px-4 py-2">{formatNumber(p.jumlahPembayaran)}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => handleEdit(p)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-1 rounded-lg"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded-lg"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}

              {filteredPelanggan.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center text-gray-400 py-4">
                    Tidak ada data pelanggan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
