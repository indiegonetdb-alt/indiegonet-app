import { API_URL } from "../config";   // ✅ tambahkan
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function MenuLaporan() {
  const [laporan, setLaporan] = useState([]);
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [filterJenis, setFilterJenis] = useState("semua");
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, [bulan, tahun, filterJenis]);

  const loadData = async () => {
    const res = await fetch(`${API_URL}/penagihan`);   // ✅ ubah
    const d = await res.json();
    if (d.ok) {
      const filtered = d.data.filter((l) => {
        const raw = l.tanggalPenagihan || l.tanggal || l.createdAt;
        const tgl = raw ? new Date(raw) : null;

        const cocokBulan =
          bulan === "semua" ? true : tgl && tgl.getMonth() + 1 === Number(bulan);
        const cocokTahun =
          tahun === "semua" ? true : tgl && tgl.getFullYear() === Number(tahun);
        const cocokJenis =
          filterJenis === "semua" ? true : l.jenis === filterJenis;

        return cocokBulan && cocokTahun && cocokJenis;
      });

      setLaporan(filtered);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin hapus data ini?")) return;
    try {
      const res = await fetch(`${API_URL}/penagihan/${id}`, {   // ✅ ubah
        method: "DELETE",
      });
      const d = await res.json();
      if (d.ok) {
        loadData();
      } else {
        alert("Gagal hapus: " + (d.error || "Unknown error"));
      }
    } catch (err) {
      console.error("❌ Error hapus laporan:", err);
      alert("Terjadi kesalahan saat hapus laporan.");
    }
  };

  const handleEdit = (row) => {
    setEditId(row._id);
    setEditData({ ...row });
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`${API_URL}/penagihan/${editId}`, {   // ✅ ubah
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      const d = await res.json();
      if (d.ok) {
        setEditId(null);
        setEditData({});
        loadData();
      } else {
        alert("Gagal simpan: " + (d.error || "Unknown error"));
      }
    } catch (err) {
      console.error("❌ Error update laporan:", err);
      alert("Terjadi kesalahan saat menyimpan perubahan."); }
};

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(laporan);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(data, `laporan-${bulan}-${tahun}.xlsx`);
  };

  // Hitung total akumulasi Setoran + Bayar
  const totalSetoran = laporan.reduce((sum, l) => sum + (l.setoran || 0), 0);
  const totalBayar = laporan.reduce(
    (sum, l) => sum + (l.jumlahPembayaran || 0),
    0
  );
  const totalAkumulasi = totalSetoran + totalBayar;

  return (
    <div className="p-6 bg-red-600 min-h-screen">
      <div className="max-w-6xl mx-auto bg-black text-white shadow rounded p-6">
        <h2 className="text-2xl font-bold mb-6">Menu Laporan</h2>

        {/* Filter Bulan, Tahun, Jenis, dan Search */}
        <div className="flex space-x-4 mb-4">
          {/* Filter Bulan */}
          <select
            value={bulan}
            onChange={(e) => setBulan(e.target.value)}
            className="border rounded p-2 text-black"
          >
            <option value="semua">Semua</option>
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>

          {/* Filter Tahun */}
          <select
            value={tahun}
            onChange={(e) => setTahun(e.target.value)}
            className="border rounded p-2 text-black"
          >
            <option value="semua">Semua</option>
            {[...Array(5)].map((_, i) => {
              const y = new Date().getFullYear() - i;
              return (
                <option key={y} value={y}>
                  {y}
                </option>
              );
            })}
          </select>

          {/* Filter Jenis */}
          <select
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
            className="border rounded p-2 text-black"
          >
            <option value="semua">Semua</option>
            <option value="toko">Toko</option>
            <option value="pribadi">Pribadi</option>
          </select>

          {/* 🔍 Search Name */}
          <input
            type="text"
            placeholder="Cari nama pelanggan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded p-2 text-black w-40"
          />

          {/* Tombol Export Excel */}
          <button
            onClick={exportExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Export Excel
          </button>
        </div>

{/* Tabel Laporan */}
<table className="w-full border border-gray-600">
  <thead>
    <tr className="bg-red-700">
      <th className="border px-2 py-1">Tanggal</th>
      <th className="border px-2 py-1">Jenis</th>
      <th className="border px-2 py-1">Nama Pelanggan</th>
      <th className="border px-2 py-1">Jumlah 2000</th>
      <th className="border px-2 py-1">Jumlah 5000</th>
      <th className="border px-2 py-1">Sisa 2000</th>
      <th className="border px-2 py-1">Sisa 5000</th>
      <th className="border px-2 py-1">Hasil 2000</th>
      <th className="border px-2 py-1">Hasil 5000</th>
      <th className="border px-2 py-1">Penerimaan</th>
      <th className="border px-2 py-1">Setoran</th>
      <th className="border px-2 py-1">Jumlah Pembayaran</th>
      <th className="border px-2 py-1">Status</th>
      <th className="border px-2 py-1">Aksi</th>
    </tr>
  </thead>

  <tbody>
  {laporan
    .filter((row) =>
      row.namaPelanggan?.toLowerCase().includes(search.toLowerCase())
    )
    .map((row) =>
      editId === row._id ? (
        <tr key={row._id} className="bg-gray-800">
        
          {/* === EDIT MODE === */}
          <td className="border px-2 py-1">
            {(() => {
              const tgl = row.tanggal ?? row.tanggalPenagihan ?? row.createdAt;
              return tgl ? new Date(tgl).toLocaleDateString("id-ID") : "-";
            })()}
          </td>
          <td className="border px-2 py-1">{row.jenis}</td>
          <td className="border px-2 py-1">{row.namaPelanggan}</td>
          <td className="border px-2 py-1">
            {row.jumlahV2000?.toLocaleString("id-ID")}
          </td>
          <td className="border px-2 py-1">
            {row.jumlahV5000?.toLocaleString("id-ID")}
          </td>
          <td className="border px-2 py-1">
            {row.sisaV2000?.toLocaleString("id-ID")}
          </td>
          <td className="border px-2 py-1">
            {row.sisaV5000?.toLocaleString("id-ID")}
          </td>
          <td className="border px-2 py-1">
            {row.hasilV2000?.toLocaleString("id-ID")}
          </td>
          <td className="border px-2 py-1">
            {row.hasilV5000?.toLocaleString("id-ID")}
          </td>
          <td className="border px-2 py-1">
            {row.penerimaanToko?.toLocaleString("id-ID")}
          </td>
          <td className="border px-2 py-1">
            <input
              type="number"
              value={editData.setoran}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  setoran: Number(e.target.value),
                })
              }
              className="text-black p-1"
            />
          </td>
          <td className="border px-2 py-1">
            {row.jumlahPembayaran?.toLocaleString("id-ID")}
          </td>
          <td className="border px-2 py-1">{row.status}</td>
          <td className="border px-2 py-1">
            <button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded"
            >
              Simpan
            </button>
          </td>
        </tr>
      ) : (
        <tr key={row._id}>
          {/* === NORMAL MODE === */}
          <td className="border px-2 py-1">
            {(() => {
              const tgl = row.tanggal ?? row.tanggalPenagihan ?? row.createdAt;
              return tgl ? new Date(tgl).toLocaleDateString("id-ID") : "-";
            })()}
          </td>
          <td className="border px-2 py-1">{row.jenis}</td>
          <td className="border px-2 py-1">{row.namaPelanggan}</td>
          <td className="border px-2 py-1">
            {row.jumlahV2000?.toLocaleString("id-ID")}
          </td>
          <td className="border px-2 py-1">
            {row.jumlahV5000?.toLocaleString("id-ID")}
          </td>
          <td className="border px-2 py-1">
            {row.sisaV2000?.toLocaleString("id-ID")}
          </td>
          <td className="border px-2 py-1">
            {row.sisaV5000?.toLocaleString("id-ID")}
          </td>
          <td className="border px-2 py-1">
            {row.hasilV2000?.toLocaleString("id-ID")}
          </td>
          <td className="border px-2 py-1">
            {row.hasilV5000?.toLocaleString("id-ID")}
          </td>
          <td className="border px-2 py-1">
            {row.penerimaanToko?.toLocaleString("id-ID")}
          </td>
          <td className="border px-2 py-1">
            {row.setoran?.toLocaleString("id-ID")}
          </td>
          <td className="border px-2 py-1">
            {row.jumlahPembayaran?.toLocaleString("id-ID")}
          </td>
          <td className="border px-2 py-1">{row.status}</td>
          <td className="border px-2 py-1">
            <button
              onClick={() => handleEdit(row)}
              className="bg-yellow-600 hover:bg-yellow-700 px-2 py-1 rounded mr-2"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(row._id)}
              className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
            >
              Hapus
            </button>
          </td>
        </tr>
      )
    )}
  </tbody>
  {/* Baris Total */}
  <tfoot>
    <tr className="bg-gray-700 font-bold text-center">
      <td colSpan={9} className="border px-2 py-1">
        Total (Setoran + Bayar)
      </td>
      <td colSpan={5} className="border px-2 py-1">
        {totalAkumulasi.toLocaleString("id-ID")}
      </td>
      {/* opsional: kolom kosong agar total baris = 15 kolom */}
          </tr>
  </tfoot>
</table>
      </div>
    </div>
  );
}
