import { API_URL } from "../config";   // ✅ tambahkan
import { useEffect, useState } from "react";

export default function MenuBanner() {
  const [list, setList] = useState([]);
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [urlGambar, setUrlGambar] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await fetch(`${API_URL}/banner`);   // ✅ ubah
    const d = await res.json();
    if (d.ok) setList(d.data);
  };

  const resetForm = () => {
    setJudul("");
    setDeskripsi("");
    setUrlGambar("");
    setEditId(null);
  };

  const simpan = async (e) => {
    e.preventDefault();
    const payload = { judul, deskripsi, urlGambar };
    let res;
    if (editId) {
      res = await fetch(`${API_URL}/banner/` + editId, {   // ✅ ubah
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      res = await fetch(`${API_URL}/banner`, {   // ✅ ubah
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    const d = await res.json();
    if (d.ok) {
      alert("Banner disimpan");
      resetForm();
      load();
    } else {
      alert(d.error || "Gagal simpan banner");
    }
  };

  const edit = (b) => {
    setEditId(b._id);
    setJudul(b.judul);
    setDeskripsi(b.deskripsi);
    setUrlGambar(b.urlGambar);
  };

  const hapus = async (id) => {
    if (!window.confirm("Hapus banner ini?")) return;
    await fetch(`${API_URL}/banner/` + id, { method: "DELETE" });   // ✅ ubah
    load();
  };

  return (
    <div style={{ padding: 20, backgroundColor: "#111", minHeight: "100vh", color: "#fff" }}>
      <h2 style={{ color: "red", marginBottom: 20 }}>Menu Banner</h2>

      {/* Form input */}
      <form
        onSubmit={simpan}
        style={{
          marginBottom: 20,
          display: "grid",
          gap: 12,
          backgroundColor: "#222",
          padding: 20,
          borderRadius: 8,
        }}
      >
        <div>
          <label>Judul:</label>
          <input
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            required
            style={{
              marginLeft: 10,
              padding: 8,
              borderRadius: 5,
              border: "1px solid red",
              backgroundColor: "#111",
              color: "#fff",
              width: "60%",
            }}
          />
        </div>

        <div>
          <label>Deskripsi:</label>
          <input
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            style={{
              marginLeft: 10,
              padding: 8,
              borderRadius: 5,
              border: "1px solid red",
              backgroundColor: "#111",
              color: "#fff",
              width: "60%",
            }}
          />
        </div>

        <div>
          <label>URL Gambar:</label>
          <input
            value={urlGambar}
            onChange={(e) => setUrlGambar(e.target.value)}
            required
            style={{
              marginLeft: 10,
              padding: 8,
              borderRadius: 5,
              border: "1px solid red",
              backgroundColor: "#111",
              color: "#fff",
              width: "60%",
            }}
          />
        </div>

        <div>
          <button
            type="submit"
            style={{
              backgroundColor: "red",
              color: "#fff",
              padding: "8px 16px",
              border: "none",
              borderRadius: 5,
              cursor: "pointer",
            }}
          >
            {editId ? "Update" : "Tambah Banner"}
          </button>
          {editId && (
            <button
              type="button"
              onClick={resetForm}
              style={{
                marginLeft: 10,
                backgroundColor: "#444",
                color: "#fff",
                padding: "8px 16px",
                border: "none",
                borderRadius: 5,
                cursor: "pointer",
              }}
            >
              Batal
            </button>
          )}
        </div>
      </form>

      {/* Daftar Banner */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 20,
        }}
      >
        {list.map((b) => (
          <div
            key={b._id}
            style={{
              backgroundColor: "#222",
              border: "1px solid red",
              borderRadius: 8,
              padding: 10,
              color: "#fff",
            }}
          >
            {b.urlGambar && (
              <img
                src={b.urlGambar}
                alt={b.judul}
                style={{
                  width: "100%",
                  height: 120,
                  objectFit: "cover",
                  borderRadius: 5,
                  marginBottom: 10,
                }}
              />
            )}
            <h4 style={{ color: "red", margin: "5px 0" }}>{b.judul}</h4>
            <p style={{ fontSize: 14 }}>{b.deskripsi}</p>
            <div style={{ marginTop: 10 }}>
              <button
                onClick={() => edit(b)}
                style={{
                  backgroundColor: "#444",
                  color: "#fff",
                  padding: "5px 10px",
                  border: "none",
                  borderRadius: 5,
                  cursor: "pointer",
                  marginRight: 10,
                }}
              >
                Edit
              </button>
              <button
                onClick={() => hapus(b._id)}
                style={{
                  backgroundColor: "black",
                  color: "red",
                  border: "1px solid red",
                  padding: "5px 10px",
                  borderRadius: 5,
                  cursor: "pointer",
                }}
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center" }}>
            Belum ada banner
          </div>
        )}
      </div>
    </div>
  );
}
