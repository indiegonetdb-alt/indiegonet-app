import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config";   // ✅ tambahkan
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function DashboardUser() {
  const [banner, setBanner] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [riwayat, setRiwayat] = useState([]);
  const [summary, setSummary] = useState(null);
  const [foto, setFoto] = useState(null);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user || !user._id) return;

    // 🔹 Ringkasan
    fetch(`${API_URL}/user/${user._id}/summary`)
      .then((res) => res.json())
      .then((d) => d.ok && setSummary(d.data));

    // 🔹 Banner
    fetch(`${API_URL}/banner`)
      .then((res) => res.json())
      .then((d) => d.ok && setBanner(d.data));

    // 🔹 Bedakan riwayat berdasarkan jenis
    if (user.jenis === "toko") {
      fetch(`${API_URL}/riwayat/user/${user._id}`)
        .then((res) => res.json())
        .then((d) => d.ok && setRiwayat(d.data))
        .catch((err) => console.error("Error ambil riwayat toko:", err));
    }

    if (user.jenis === "pribadi") {
      fetch(`${API_URL}/penagihan/user/${user._id}`)
        .then((res) => res.json())
        .then((d) => d.ok && setRiwayat(d.data))
        .catch((err) => console.error("Error ambil riwayat pribadi:", err));
    }

    // 🔹 Foto profil
    const savedFoto = localStorage.getItem("fotoProfil");
    if (savedFoto) setFoto(savedFoto);
  }, []);
  
  useEffect(() => {
    if (banner.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banner.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [banner]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Riwayat Pengiriman", 14, 10);
    autoTable(doc, {
      head: [["Tanggal", "Vocer 2000", "Vocer 5000", "Total", "Status"]],
      body: riwayat.map((r) => [
        new Date(r.tanggal).toLocaleDateString("id-ID"),
        r.v2000?.toLocaleString("id-ID"),
        r.v5000?.toLocaleString("id-ID"),
        ((r.v2000 || 0) * 2000 + (r.v5000 || 0) * 5000).toLocaleString("id-ID"),
        r.status || "Belum Ditagih",
      ]),
    });
    doc.save("riwayat-user.pdf");
  };

  if (!summary) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white bg-red-600">
        <p>Loading...</p>
      </div>
    );
  }

  const grandTotal = riwayat.reduce(
    (sum, r) => sum + (r.penerimaanToko || 0),
    0
  );

  return (
    <div className="p-4 md:p-6 bg-red-600 min-h-screen text-black max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/user/dashboard")}
        >
          <img src="/favicon.png" alt="Logo" className="w-8 h-8" />
          <span className="text-white font-bold">Indiegonet</span>
        </div>

        <div className="flex items-center gap-4">
          {/* 📧 Ikon Pesan */}
          <span
            onClick={() => navigate("/user/pesan")}
            title="Pesan"
            className="text-2xl cursor-pointer"
          >
            📧
          </span>

          {/* Avatar → klik untuk Edit Profil */}
          <img
            src={foto || "/avatar.png"}
            alt="Foto Profil"
            onClick={() => navigate("/user/profil")}
            className="w-10 h-10 rounded-full object-cover border-2 border-white cursor-pointer"
            title="Edit Profil"
          />

          {/* Logout */}
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
            className="bg-white text-red-600 px-3 py-1 rounded-2xl text-sm md:text-base hover:bg-red-100"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Banner auto slide */}
      <div className="relative w-full h-40 md:h-48 overflow-hidden rounded-2xl mb-6">
        {banner.length > 0 ? (
          banner.map((b, i) => (
            <div
              key={i}
              className={`absolute w-full h-full transition-opacity duration-1000 ${
                i === currentIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={b.urlGambar}
                alt={b.judul}
                className="w-full h-full object-cover rounded-2xl"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 rounded-b-2xl">
                <h4 className="font-bold text-sm md:text-base">{b.judul}</h4>
                <p className="text-xs md:text-sm">{b.deskripsi}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gray-200 rounded-2xl">
            <p className="text-gray-600">Belum ada banner aktif</p>
          </div>
        )}
      </div>

      {/* Notifikasi */}
      {summary.isBest && (
        <div className="bg-yellow-300 text-yellow-900 p-3 rounded-2xl mb-4 font-semibold text-center text-sm md:text-base">
          🎉 Selamat {summary.nama}, anda pelanggan terbaik bulan ini!
        </div>
      )}

      {/* Ringkasan & Riwayat */}
      {user?.jenis === "pribadi" ? (
        <>
          {/* 🔹 Ringkasan pribadi */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-4">
            <div className="bg-black text-white p-4 rounded-2xl text-center w-full sm:w-64">
              <h4 className="font-semibold text-red-500">Jumlah Pembayaran</h4>
              <p>{summary.jumlahPembayaran?.toLocaleString("id-ID")}</p>
            </div>
            <div className="bg-black text-white p-4 rounded-2xl text-center w-full sm:w-64">
              <h4 className="font-semibold text-red-500">Keterangan</h4>
              <p>Pelanggan Bulanan</p>
            </div>
          </div>

          {/* 🔹 Riwayat Pembayaran */}
          <h3 className="text-base md:text-lg font-semibold text-white mb-2">
            Riwayat Pembayaran
          </h3>
          <div className="bg-white rounded-2xl p-4 mb-4 overflow-x-auto">
            <table className="w-full border-collapse text-xs sm:text-sm md:text-base min-w-[500px]">
              <thead>
                <tr className="bg-black text-white">
                  <th className="px-3 py-2 text-left">Tanggal</th>
                  <th className="px-3 py-2 text-right">Jumlah Pembayaran</th>
                  <th className="px-3 py-2 text-center">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {riwayat.map((r, idx) => (
                  <tr key={idx} className="odd:bg-white even:bg-gray-100 border-t">
                    <td className="px-3 py-2">
                      {new Date(r.tanggal).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {r.jumlahPembayaran?.toLocaleString("id-ID")}
                    </td>
                    <td className="px-3 py-2 text-center">Telah dibayarkan</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          {/* 🔹 Ringkasan toko */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-black text-white p-4 rounded-2xl text-center">
              <h4 className="font-semibold text-red-500">Vocer 2.000</h4>
              <p>{summary.totalV2000?.toLocaleString("id-ID")}</p>
            </div>
            <div className="bg-black text-white p-4 rounded-2xl text-center">
              <h4 className="font-semibold text-red-500">Vocer 5.000</h4>
              <p>{summary.totalV5000?.toLocaleString("id-ID")}</p>
            </div>
            <div className="bg-black text-white p-4 rounded-2xl text-center">
              <h4 className="font-semibold text-red-500">Persenan</h4>
              <p>{summary.persenan?.toLocaleString("id-ID")}%</p>
            </div>
            <div className="bg-black text-white p-4 rounded-2xl text-center">
              <h4 className="font-semibold text-red-500">Penerimaan Toko</h4>
              <p>{summary.penerimaan?.toLocaleString("id-ID")}</p>
            </div>
          </div>

          {/* 🔹 Riwayat Pengiriman */}
          <h3 className="text-base md:text-lg font-semibold text-white mb-2">
            Riwayat Pengiriman
          </h3>
          <div className="bg-white rounded-2xl p-4 mb-4 overflow-x-auto">
            <table className="w-full border-collapse text-xs sm:text-sm md:text-base min-w-[700px]">
              <thead>
                <tr className="bg-black text-white">
                  <th className="px-3 py-2 text-left">Tanggal</th>
                  <th className="px-3 py-2 text-right">Vocer 2.000</th>
                  <th className="px-3 py-2 text-right">Vocer 5.000</th>
                  <th className="px-3 py-2 text-right">Total</th>
                  <th className="px-3 py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {riwayat.map((r, idx) => (
                  <tr key={idx} className="odd:bg-white even:bg-gray-100 border-t">
                    <td className="px-3 py-2">
                      {new Date(r.tanggal).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {(r.v2000 - (r.sisaV2000 || 0))?.toLocaleString("id-ID")}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {(r.v5000 - (r.sisaV5000 || 0))?.toLocaleString("id-ID")}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {r.penerimaanToko?.toLocaleString("id-ID")}
                    </td>
                    <td className="px-3 py-2 text-center">{r.status || "Belum Ditagih"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Grand Total */}
            <div className="mt-3 bg-black text-white p-3 rounded-2xl text-right font-bold text-sm md:text-base">
              Grand Total: {grandTotal.toLocaleString("id-ID")}
            </div>

            {/* Export PDF */}
            <div className="flex justify-start mt-3">
              <button
                onClick={handleExportPDF}
                className="bg-red-600 text-white px-4 py-2 rounded-2xl text-sm md:text-base"
              >
                Export PDF
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
