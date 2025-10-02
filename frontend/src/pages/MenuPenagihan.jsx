import { useEffect, useState } from "react";
import { API_URL } from "../config";   // ✅ pakai API_URL
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function MenuPenagihan() {
  const [jenis, setJenis] = useState("toko");
  const [pelangganList, setPelangganList] = useState([]);
  const [pelangganId, setPelangganId] = useState("");
  const [nama, setNama] = useState("");
  const [persenan, setPersenan] = useState(0);
  const [tanggalPenagihan, setTanggalPenagihan] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [mulaiTanggal, setMulaiTanggal] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .slice(0, 10)
  );
  const [sampaiTanggal, setSampaiTanggal] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [jumlah2000, setJumlah2000] = useState(0);
  const [jumlah5000, setJumlah5000] = useState(0);
  const [sisa2000, setSisa2000] = useState(0);
  const [sisa5000, setSisa5000] = useState(0);

  // Ambil daftar pelanggan
  useEffect(() => {
    fetch(`${API_URL}/pelanggan`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) setPelangganList(data.data);
      });
  }, []);

  // Set nama & persenan saat pilih pelanggan
  useEffect(() => {
    if (!pelangganId) return;
    const plg = pelangganList.find((p) => p._id === pelangganId);
    if (plg) {
      setNama(plg.nama);
      if (plg.jenis === "toko") {
        setPersenan(plg.persenan || 0);
      } else {
        setPersenan(plg.jumlahPembayaran || 0);
      }
    }
  }, [pelangganId, pelangganList]);

  // Hitung akumulasi dari pengiriman (khusus toko)
  useEffect(() => {
    if (!pelangganId || jenis !== "toko") return;

    fetch(
      `${API_URL}/pengiriman/akumulasi?namaPelanggan=${encodeURIComponent(
        nama
      )}&mulai=${mulaiTanggal}&sampai=${sampaiTanggal}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setJumlah2000(data.total2000);
          setJumlah5000(data.total5000);
        }
      });
  }, [pelangganId, mulaiTanggal, sampaiTanggal, jenis, nama]);

  // Hitung hasil
  const hasil2000 = (jumlah2000 - sisa2000) * 2000;
  const hasil5000 = (jumlah5000 - sisa5000) * 5000;
  const total = hasil2000 + hasil5000;
  const penerimaanToko =
    jenis === "toko" ? Math.round((total * persenan) / 100) : 0;
  const setoran = jenis === "toko" ? total - penerimaanToko : 0;

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();

    try {
      doc.addImage("/favicon.png", "PNG", 14, 8, 25, 25);
    } catch (e) {
      console.warn("Logo dilewati:", e?.message || e);
    }

    doc.setFontSize(16);
    doc.text("Nota Penagihan", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.text(`Nama Pelanggan : ${nama}`, 14, 40);
    doc.text(`Tanggal Penagihan : ${tanggalPenagihan}`, 14, 48);

    if (jenis === "toko") {
      autoTable(doc, {
        head: [[
          "Pelanggan",
          "Persenan",
          "V.2.000 Terjual",
          "V.5.000 Terjual",
          "Hasil 2000",
          "Hasil 5000",
          "Penerimaan",
          "Setoran",
        ]],
        body: [[
          nama,
          persenan + "%",
          (jumlah2000 - sisa2000),
          (jumlah5000 - sisa5000),
          hasil2000.toLocaleString("id-ID"),
          hasil5000.toLocaleString("id-ID"),
          penerimaanToko.toLocaleString("id-ID"),
          setoran.toLocaleString("id-ID"),
        ]],
        startY: 60,
        styles: { halign: "center" },
        headStyles: { fillColor: [200, 0, 0], textColor: 255 },
      });
    } else {
      doc.text(
        `Jumlah Pembayaran : ${persenan.toLocaleString("id-ID")}`,
        14,
        56
      );
    }

    doc.save(`penagihan-${nama}.pdf`);
  };

  // Simpan ke laporan (Penagihan)
  const handleSimpan = async () => {
    try {
      const res = await fetch(`${API_URL}/penagihan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tanggalPenagihan,
          jenis,
          namaPelanggan: nama,
          jumlahV2000: jumlah2000 ?? 0,
          jumlahV5000: jumlah5000 ?? 0,
          sisaV2000: sisa2000 ?? 0,
          sisaV5000: sisa5000 ?? 0,
          hasilV2000: hasil2000,
          hasilV5000: hasil5000,
          penerimaanToko,
          setoran,
          jumlahPembayaran: jenis === "pribadi" ? persenan : 0,
          status: "Sudah Ditagih",
          mulaiTanggal,
          sampaiTanggal,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        alert("✅ Penagihan berhasil disimpan!");
        exportPDF();
      } else {
        alert("❌ Gagal simpan penagihan: " + (data.error || data.message));
      }
    } catch (err) {
      alert("⚠️ Error: " + err.message);
    }
  };

  return (
    <div className="p-6 bg-red-600 min-h-screen">
      <div className="max-w-3xl mx-auto bg-black text-white shadow rounded p-6">
        <h2 className="text-2xl font-bold mb-6">Menu Penagihan</h2>

        {/* Jenis Pelanggan */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Jenis Pelanggan</label>
          <select
            value={jenis}
            onChange={(e) => setJenis(e.target.value)}
            className="border rounded p-2 w-full text-black"
          >
            <option value="toko">Toko</option>
            <option value="pribadi">Pribadi</option>
          </select>
        </div>

        {/* Form Toko */}
        {jenis === "toko" && (
          <div className="space-y-4 mb-6">
            <div>
              <label className="block font-semibold mb-1">Nama Pelanggan</label>
              <select
                value={pelangganId}
                onChange={(e) => setPelangganId(e.target.value)}
                className="border rounded p-2 w-full text-black"
              >
                <option value="">-- Pilih Pelanggan Toko --</option>
                {pelangganList
                  .filter((p) => p.jenis?.toLowerCase() === "toko")
                  .map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.nama}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Persenan</label>
              <input
                type="text"
                value={`${persenan}%`}
                readOnly
                className="border rounded p-2 w-full bg-gray-200 text-black"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold mb-1">
                  Tanggal Penagihan
                </label>
                <input
                  type="date"
                  value={tanggalPenagihan}
                  onChange={(e) => setTanggalPenagihan(e.target.value)}
                  className="border rounded p-2 w-full text-black"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Mulai</label>
                <input
                  type="date"
                  value={mulaiTanggal}
                  onChange={(e) => setMulaiTanggal(e.target.value)}
                  className="border rounded p-2 w-full text-black"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Sampai</label>
                <input
                  type="date"
                  value={sampaiTanggal}
                  onChange={(e) => setSampaiTanggal(e.target.value)}
                  className="border rounded p-2 w-full text-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">
                  Jumlah Voucher 2000
                </label>
                <input
                  type="number"
                  value={jumlah2000}
                  readOnly
                  className="border rounded p-2 w-full bg-gray-200 text-black"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  Jumlah Voucher 5000
                </label>
                <input
                  type="number"
                  value={jumlah5000}
                  readOnly
                  className="border rounded p-2 w-full bg-gray-200 text-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">
                  Sisa Voucher 2000
                </label>
                <input
                  type="number"
                  value={sisa2000}
                  onChange={(e) => setSisa2000(Number(e.target.value))}
                  className="border rounded p-2 w-full text-black"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  Sisa Voucher 5000
                </label>
                <input
                  type="number"
                  value={sisa5000}
                  onChange={(e) => setSisa5000(Number(e.target.value))}
                  className="border rounded p-2 w-full text-black"
                />
              </div>
            </div>

            <div className="p-4 bg-gray-800 rounded space-y-1">
              <p><b>Hasil Voucher 2000:</b> Rp {hasil2000.toLocaleString("id-ID")}</p>
              <p><b>Hasil Voucher 5000:</b> Rp {hasil5000.toLocaleString("id-ID")}</p>
              <p><b>Penerimaan Toko:</b> Rp {penerimaanToko.toLocaleString("id-ID")}</p>
              <p><b>Setoran:</b> Rp {setoran.toLocaleString("id-ID")}</p>
            </div>
          </div>
        )}

        {/* Form Pribadi */}
        {jenis === "pribadi" && (
          <div className="space-y-4 mb-6">
            <div>
              <label className="block font-semibold mb-1">Nama Pelanggan</label>
              <select
                value={pelangganId}
                onChange={(e) => setPelangganId(e.target.value)}
                className="border rounded p-2 w-full text-black"
              >
                <option value="">-- Pilih Pelanggan Pribadi --</option>
                {pelangganList
                  .filter((p) => p.jenis?.toLowerCase() === "pribadi")
                  .map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.nama}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">
                Tanggal Penagihan
              </label>
              <input
                type="date"
                value={tanggalPenagihan}
                onChange={(e) => setTanggalPenagihan(e.target.value)}
                className="border rounded p-2 w-full text-black"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Jumlah Pembayaran</label>
              <input
                type="number"
                value={persenan}
                readOnly
                className="border rounded p-2 w-full bg-gray-200 text-black"
              />
            </div>
          </div>
        )}

        <button
          onClick={handleSimpan}
          className="bg-red-700 hover:bg-red-800 text-white px-5 py-2 rounded-2xl font-semibold"
        >
          Simpan & Export PDF
        </button>
      </div>
    </div>
  );
}
