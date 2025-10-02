import { API_URL } from "../config";   // ✅ tambahkan ini
import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [laporan, setLaporan] = useState([]);
  const [totalPenjualan, setTotalPenjualan] = useState(0);

  const [filterJenis, setFilterJenis] = useState("semua");
  const [totalPelanggan, setTotalPelanggan] = useState({
    semua: 0,
    toko: 0,
    pribadi: 0,
  });

  const [pesanMasuk, setPesanMasuk] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pelangganTerbaik, setPelangganTerbaik] = useState([]);
  const [performaPenjualan, setPerformaPenjualan] = useState([]);

  // Ambil semua laporan & pesan
  useEffect(() => {
    async function fetchData() {
      try {
        const [laporanRes, pesanRes] = await Promise.all([
          fetch(`${API_URL}/laporan`),     // ✅ ubah
          fetch(`${API_URL}/messages`),    // ✅ ubah
        ]);

        const laporanData = await laporanRes.json();
        if (laporanData.ok) {
          setLaporan(laporanData.data);
        }

        const pesanData = await pesanRes.json();
        if (pesanData.ok) {
          const dataPesan = pesanData.data.slice(0, 5);
          setPesanMasuk(dataPesan);

          const unread = pesanData.data.filter(
            (p) => p.status === "unread"
          ).length;
          setUnreadCount(unread);
        }
      } catch (err) {
        console.error("Gagal ambil data:", err);
      }
    }
    fetchData();
  }, []);

  // Ambil total pelanggan dari master pelanggan
  useEffect(() => {
    async function fetchPelanggan() {
      try {
        const res = await fetch(`${API_URL}/pelanggan`);   // ✅ ubah
        const data = await res.json();
        if (data.ok) {
          const semua = data.data.length;
          const toko = data.data.filter((p) => p.jenis === "toko").length;
          const pribadi = data.data.filter((p) => p.jenis === "pribadi").length;
          setTotalPelanggan({ semua, toko, pribadi });
        }
      } catch (err) {
        console.error("Gagal ambil pelanggan:", err);
      }
    }
    fetchPelanggan();
  }, []);

  // Hitung ulang summary setiap filter tanggal berubah
  useEffect(() => {
    if (!laporan.length) return;

    // Filter berdasarkan tanggal
    const filtered = laporan.filter((item) => {
      const tgl = new Date(item.tanggalPenagihan);
      if (startDate && tgl < new Date(startDate)) return false;
      if (endDate && tgl > new Date(endDate)) return false;
      return true;
    });

    // Total penjualan
    const total = filtered.reduce(
      (sum, item) => sum + (item.setoran || item.jumlahPembayaran || 0),
      0
    );
    setTotalPenjualan(total);

    // Pelanggan terbaik (khusus toko)
    const rankingMap = {};
    filtered.forEach((item) => {
      if (item.jenis === "toko") {
        const nama = item.namaPelanggan;
        const nilai = item.setoran || 0;
        rankingMap[nama] = (rankingMap[nama] || 0) + nilai;
      }
    });
    const ranking = Object.entries(rankingMap)
      .map(([nama, total]) => ({ nama, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
    setPelangganTerbaik(ranking);

    // Performa penjualan
    const now = new Date();
    const bulanIni = now.getMonth();
    const tahunIni = now.getFullYear();
    const bulanLalu = bulanIni === 0 ? 11 : bulanIni - 1;
    const tahunLalu = bulanIni === 0 ? tahunIni - 1 : tahunIni;

    const performaMap = {};
    filtered.forEach((item) => {
      if (item.jenis === "toko") {
        const tgl = new Date(item.tanggalPenagihan);
        const nama = item.namaPelanggan;
        if (!performaMap[nama]) {
          performaMap[nama] = { bulanIni: 0, bulanLalu: 0 };
        }
        const nilai = item.setoran || 0;
        if (tgl.getMonth() === bulanIni && tgl.getFullYear() === tahunIni) {
          performaMap[nama].bulanIni += nilai;
        }
        if (tgl.getMonth() === bulanLalu && tgl.getFullYear() === tahunLalu) {
          performaMap[nama].bulanLalu += nilai;
        }
      }
    });
    const performaArr = Object.entries(performaMap).map(([nama, val]) => ({
      nama,
      bulanIni: val.bulanIni,
      bulanLalu: val.bulanLalu,
    }));
    setPerformaPenjualan(performaArr);
  }, [laporan, startDate, endDate]);

  const getTrend = (bulanIni, bulanLalu) => {
    if (bulanIni > bulanLalu) return "🛩️ Naik";
    if (bulanIni < bulanLalu) return "👎 Turun";
    return "🛬 Stabil";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-6">
        Selamat Datang, {user?.nama || "User"} 👋
      </h1>

      {/* Filter tanggal */}
      <div className="bg-gray-800 p-4 rounded-xl mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div>
          <label className="text-sm">Mulai:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="ml-2 p-1 rounded bg-gray-700"
          />
        </div>
        <div>
          <label className="text-sm">Sampai:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="ml-2 p-1 rounded bg-gray-700"
          />
        </div>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-red-700 rounded-xl shadow p-6 text-center">
          <h2 className="text-lg font-semibold">💰 Total Penjualan</h2>
          <p className="text-3xl mt-2">
            Rp {totalPenjualan.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="bg-gray-700 rounded-xl shadow p-6 text-center">
          <h2 className="text-lg font-semibold">👥 Total Pelanggan</h2>
          <select
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
            className="mt-2 bg-black text-white p-1 rounded"
          >
            <option value="semua">Semua</option>
            <option value="toko">Toko</option>
            <option value="pribadi">Pribadi</option>
          </select>
          <p className="text-3xl mt-2">
            {totalPelanggan[filterJenis].toLocaleString()}
          </p>
        </div>
        <div className="bg-black rounded-xl shadow p-6 text-center">
          <h2 className="text-lg font-semibold">💬 Pesan Masuk</h2>
          <p className="text-sm text-gray-400">
            Belum terbaca: {unreadCount}
          </p>
          <ul className="mt-2 text-base text-white max-h-32 overflow-y-auto">
            {pesanMasuk.map((p) => (
              <li key={p._id} className="border-b border-gray-700 py-1">
                <span className="font-bold">{p.subject}</span> -{" "}
                {p.body || p.isi}
                <span className="text-xs text-gray-400 block">
                  {new Date(p.createdAt).toLocaleString("id-ID")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Pelanggan Terbaik */}
      <div className="bg-gray-800 rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">🏆 Pelanggan Terbaik</h2>
        <ul>
          {pelangganTerbaik.map((p, i) => (
            <li
              key={i}
              className="flex justify-between border-b border-gray-700 py-2"
            >
              <span>{p.nama}</span>
              <span>Rp {p.total.toLocaleString("id-ID")}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Performa Penjualan */}
      <div className="bg-gray-800 rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">📊 Performa Penjualan</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-red-700">
                <th className="p-2 text-left">Nama</th>
                <th className="p-2 text-right">Bulan Ini</th>
                <th className="p-2 text-right">Bulan Lalu</th>
                <th className="p-2 text-center">Tren</th>
              </tr>
            </thead>
            <tbody>
              {performaPenjualan.map((row, i) => (
                <tr key={i} className="border-b border-gray-700">
                  <td className="p-2">{row.nama}</td>
                  <td className="p-2 text-right">
                    Rp {row.bulanIni.toLocaleString("id-ID")}
                  </td>
                  <td className="p-2 text-right">
                    Rp {row.bulanLalu.toLocaleString("id-ID")}
                  </td>
                  <td className="p-2 text-center">
                    {getTrend(row.bulanIni, row.bulanLalu)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}