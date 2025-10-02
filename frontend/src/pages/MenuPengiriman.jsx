import { useEffect, useMemo, useState } from "react";
import { API_URL } from "../config";   // ✅ pakai API_URL dari config.js

/** Util: format integer "1000" -> "1.000" (locale Indonesia) */
const fmtInt = (n) =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(
    Number.isFinite(n) ? n : 0
  );

export default function MenuPengiriman() {
  const [pengiriman, setPengiriman] = useState([]);
  const [pelangganList, setPelangganList] = useState([]);

  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [namaPelanggan, setNamaPelanggan] = useState("");
  const [v2000, setV2000] = useState("");
  const [v5000, setV5000] = useState("");
  const [editId, setEditId] = useState(null);

  const [loadingList, setLoadingList] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [okMsg, setOkMsg] = useState("");

  // Ambil data pelanggan (filter jenis = toko) & pengiriman
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoadingList(true);
        setErrMsg("");
        // Pelanggan
        const resPlg = await fetch(`${API_URL}/pelanggan`);
        const dataPlg = await resPlg.json();
        if (isMounted && dataPlg?.ok) {
          const tokoOnly =
            dataPlg.data?.filter(
              (plg) => plg.jenis && plg.jenis.toLowerCase() === "toko"
            ) || [];
          setPelangganList(tokoOnly);
        }
        // Pengiriman
        await fetchPengiriman(isMounted);
      } catch (e) {
        if (isMounted) setErrMsg("Gagal memuat data awal. Periksa server.");
        console.error(e);
      } finally {
        if (isMounted) setLoadingList(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPengiriman = async (isMountedFlag = true) => {
    try {
      const res = await fetch(`${API_URL}/pengiriman`);
      const data = await res.json();
      if (isMountedFlag && data?.ok) {
        const sorted =
          data.data?.slice()?.sort((a, b) => {
            const da = new Date(a.tanggal || 0).getTime();
            const db = new Date(b.tanggal || 0).getTime();
            return db - da;
          }) || [];
        setPengiriman(sorted);
      }
    } catch (e) {
      console.error("Gagal fetch pengiriman:", e);
      if (isMountedFlag) setErrMsg("Gagal memuat riwayat pengiriman.");
    }
  };

  const resetForm = () => {
    setTanggal(new Date().toISOString().slice(0, 10));
    setNamaPelanggan("");
    setV2000("");
    setV5000("");
    setEditId(null);
  };

  // Validasi sederhana
  const v2000Num = Number.parseInt(v2000 || "0", 10);
  const v5000Num = Number.parseInt(v5000 || "0", 10);
  const formValid =
    !!tanggal &&
    !!namaPelanggan &&
    Number.isFinite(v2000Num) &&
    Number.isFinite(v5000Num) &&
    v2000Num >= 0 &&
    v5000Num >= 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrMsg("");
    setOkMsg("");

    if (!formValid) {
      setErrMsg(
        "Lengkapi form: tanggal & pelanggan wajib, angka tidak boleh negatif."
      );
      return;
    }

    const payload = {
      tanggal,
      namaPelanggan,
      v2000: v2000Num,
      v5000: v5000Num,
    };

    try {
      setLoadingSave(true);
      let res;
      if (editId) {
        res = await fetch(`${API_URL}/pengiriman/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_URL}/pengiriman`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      const data = await res.json();
      if (data?.ok) {
        await fetchPengiriman(true);
        setOkMsg(editId ? "Berhasil mengubah data." : "Berhasil menyimpan.");
        resetForm();
      } else {
        setErrMsg(data?.message || "Gagal menyimpan data.");
      }
    } catch (err) {
      console.error("Gagal simpan pengiriman:", err);
      setErrMsg("Terjadi kesalahan saat menyimpan.");
    } finally {
      setLoadingSave(false);
      setTimeout(() => {
        setOkMsg("");
        setErrMsg("");
      }, 2000);
    }
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setTanggal(item.tanggal?.slice(0, 10) || "");
    setNamaPelanggan(item.namaPelanggan || "");
    setV2000(String(item.v2000 ?? "0"));
    setV5000(String(item.v5000 ?? "0"));
    setOkMsg("");
    setErrMsg("");
  };

  const handleDelete = async (id) => {
    setOkMsg("");
    setErrMsg("");
    if (!window.confirm("Yakin hapus data ini?")) return;
    try {
      const res = await fetch(`${API_URL}/pengiriman/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data?.ok) {
        await fetchPengiriman(true);
        setOkMsg("Berhasil menghapus data.");
      } else {
        setErrMsg(data?.message || "Gagal menghapus.");
      }
    } catch (err) {
      console.error("Gagal hapus pengiriman:", err);
      setErrMsg("Terjadi kesalahan saat menghapus.");
    } finally {
      setTimeout(() => {
        setOkMsg("");
        setErrMsg("");
      }, 2000);
    }
  };

  const total = useMemo(() => {
    let t2 = 0;
    let t5 = 0;
    for (const row of pengiriman) {
      t2 += Number(row.v2000 || 0);
      t5 += Number(row.v5000 || 0);
    }
    return { t2, t5 };
  }, [pengiriman]);

  return (
    <div className="p-6 bg-red-600 min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Menu Pengiriman Vocer</h2>

        <div className="flex gap-2">
          {loadingList && (
            <span className="text-sm text-gray-100">Memuat data…</span>
          )}
          {okMsg && (
            <span className="text-sm px-2 py-1 rounded bg-green-600 text-white">
              {okMsg}
            </span>
          )}
          {errMsg && (
            <span className="text-sm px-2 py-1 rounded bg-black text-white">
              {errMsg}
            </span>
          )}
        </div>
      </div>

      {/* Form Input */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 mb-6 bg-black text-white p-4 rounded-2xl shadow"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 opacity-80">Tanggal</label>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="border px-3 py-2 w-full rounded text-black"
            />
          </div>

          <div>
            <label className="block mb-1 opacity-80">
              Nama Pelanggan (Toko)
            </label>
            <select
              value={namaPelanggan}
              onChange={(e) => setNamaPelanggan(e.target.value)}
              className="border px-3 py-2 w-full rounded text-black"
            >
              <option value="">-- Pilih Pelanggan Toko --</option>
              {pelangganList.map((plg) => (
                <option key={plg._id} value={plg.nama}>
                  {plg.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 opacity-80">Vocer 2.000</label>
            <input
              type="number"
              min="0"
              value={v2000}
              onChange={(e) => setV2000(e.target.value)}
              className="border px-3 py-2 w-full rounded text-black"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block mb-1 opacity-80">Vocer 5.000</label>
            <input
              type="number"
              min="0"
              value={v5000}
              onChange={(e) => setV5000(e.target.value)}
              className="border px-3 py-2 w-full rounded text-black"
              placeholder="0"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            type="submit"
            disabled={!formValid || loadingSave}
            className={`px-5 py-2 rounded-2xl font-semibold shadow
              ${
                formValid && !loadingSave
                  ? "bg-red-700 hover:bg-red-800"
                  : "bg-gray-500 cursor-not-allowed"
              }`}
          >
            {loadingSave ? "Menyimpan…" : editId ? "Update" : "Simpan"}
          </button>

          {editId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-2xl font-semibold bg-gray-700 hover:bg-gray-800"
            >
              Batal
            </button>
          )}
        </div>
      </form>

      {/* Riwayat Pengiriman */}
      <h3 className="text-lg font-semibold mb-2 text-white">
        Riwayat Pengiriman
      </h3>
      <div className="overflow-x-auto border rounded-2xl bg-white">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-black text-white uppercase tracking-wide">
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">Tanggal</th>
              <th className="px-3 py-2 text-left">Pelanggan</th>
              <th className="px-3 py-2 text-right">Vocer 2.000</th>
              <th className="px-3 py-2 text-right">Vocer 5.000</th>
              <th className="px-3 py-2 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pengiriman.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-4 text-black">
                  Belum ada data
                </td>
              </tr>
            )}

            {pengiriman.map((item, idx) => (
              <tr
                key={item._id}
                className="odd:bg-white even:bg-gray-50 border-t border-gray-300 hover:bg-gray-100"
              >
                <td className="px-3 py-2 text-black">{idx + 1}</td>
                <td className="px-3 py-2 text-black">
                  {item.tanggal ? String(item.tanggal).slice(0, 10) : "-"}
                </td>
                <td className="px-3 py-2 text-black">
                  {item.namaPelanggan || "-"}
                </td>
                <td className="px-3 py-2 text-right text-black">
                  {fmtInt(Number(item.v2000 || 0))}
                </td>
                <td className="px-3 py-2 text-right text-black">
                  {fmtInt(Number(item.v5000 || 0))}
                </td>
                <td className="px-3 py-2 text-center space-x-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="px-3 py-1 rounded-2xl bg-yellow-500 text-white hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="px-3 py-1 rounded-2xl bg-red-600 text-white hover:bg-red-700"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}

            {pengiriman.length > 0 && (
              <tr className="bg-gray-200 font-semibold border-t-2 border-gray-400">
                <td className="px-3 py-2 text-black" colSpan={3}>
                  Total
                </td>
                <td className="px-3 py-2 text-right text-black">
                  {fmtInt(total.t2)}
                </td>
                <td className="px-3 py-2 text-right text-black">
                  {fmtInt(total.t5)}
                </td>
                <td className="px-3 py-2" />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
