import { useEffect, useState } from "react";
import { API_URL } from "../config";   // ✅ pakai API_URL

export default function MenuUser() {
  const [list, setList] = useState([]);
  const [pelanggan, setPelanggan] = useState([]);

  const [role, setRole] = useState("user");
  const [nama, setNama] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [jenis, setJenis] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    loadUsers();
    loadPelanggan();
  }, []);

  const loadUsers = async () => {
    const res = await fetch(`${API_URL}/users`);
    const d = await res.json();
    if (d.ok) setList(d.data);
  };

  const loadPelanggan = async () => {
    const res = await fetch(`${API_URL}/pelanggan`);
    const d = await res.json();
    if (d.ok) setPelanggan(d.data);
  };

  const resetForm = () => {
    setRole("user");
    setNama("");
    setUsername("");
    setPassword("");
    setJenis("");
    setEditId(null);
  };

  const simpan = async (e) => {
    e.preventDefault();
    const payload = { nama, username, role };

    if (role === "admin") {
      payload.jenis = "admin";
    } else {
      payload.jenis = jenis || "pribadi";
    }

    if (password) payload.password = password;

    let res;
    if (editId) {
      res = await fetch(`${API_URL}/users/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      res = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    const d = await res.json();
    if (d.ok) {
      alert("User disimpan");
      resetForm();
      loadUsers();
    } else {
      alert(d.error || "Gagal simpan user");
    }
  };

  const edit = (u) => {
    setEditId(u._id);
    setRole(u.role);
    setNama(u.nama);
    setUsername(u.username);
    setJenis(u.jenis || "");
    setPassword("");
  };

  const hapus = async (id) => {
    if (!window.confirm("Hapus user ini?")) return;
    await fetch(`${API_URL}/users/${id}`, { method: "DELETE" });
    loadUsers();
  };

  return (
    <div
      style={{
        padding: 20,
        backgroundColor: "#111",
        minHeight: "100vh",
        color: "#fff",
      }}
    >
      <h2 style={{ color: "red", marginBottom: 20 }}>Menu Pengguna</h2>

      {/* Form */}
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
          <label>Role:</label>
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              if (e.target.value === "admin") {
                setJenis("admin");
              } else {
                setJenis("");
              }
            }}
            style={{
              marginLeft: 10,
              padding: 8,
              borderRadius: 5,
              border: "1px solid red",
              backgroundColor: "#111",
              color: "#fff",
            }}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {role === "user" ? (
          <div>
            <label>Nama (dari pelanggan):</label>
            <select
              value={nama}
              onChange={(e) => {
                setNama(e.target.value);
                const p = pelanggan.find((x) => x.nama === e.target.value);
                if (p) {
                  setJenis(p.jenis);
                } else {
                  setJenis("pribadi");
                }
              }}
              style={{
                marginLeft: 10,
                padding: 8,
                borderRadius: 5,
                border: "1px solid red",
                backgroundColor: "#111",
                color: "#fff",
              }}
            >
              <option value="">-- pilih pelanggan --</option>
              {pelanggan.map((p) => (
                <option key={p._id} value={p.nama}>
                  {p.nama}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label>Nama Admin:</label>
            <input
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
              style={{
                marginLeft: 10,
                padding: 8,
                borderRadius: 5,
                border: "1px solid red",
                backgroundColor: "#111",
                color: "#fff",
              }}
            />
          </div>
        )}

        <div>
          <label>Username:</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{
              marginLeft: 10,
              padding: 8,
              borderRadius: 5,
              border: "1px solid red",
              backgroundColor: "#111",
              color: "#fff",
            }}
          />
        </div>

        <div>
          <label>Password:</label>
          <input
            type={showPass ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!editId}
            style={{
              marginLeft: 10,
              padding: 8,
              borderRadius: 5,
              border: "1px solid red",
              backgroundColor: "#111",
              color: "#fff",
            }}
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            style={{
              marginLeft: 10,
              backgroundColor: "black",
              border: "1px solid red",
              color: "red",
              padding: "5px 10px",
              borderRadius: 5,
              cursor: "pointer",
            }}
          >
            {showPass ? "Hide" : "Show"}
          </button>
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
            {editId ? "Update" : "Simpan"}
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

      {/* Tabel */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          backgroundColor: "#222",
          color: "#fff",
          border: "1px solid red",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "red", color: "#fff" }}>
            <th style={{ padding: 10 }}>Nama</th>
            <th style={{ padding: 10 }}>Username</th>
            <th style={{ padding: 10 }}>Role</th>
            <th style={{ padding: 10 }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {list.map((u) => (
            <tr key={u._id} style={{ borderBottom: "1px solid #444" }}>
              <td style={{ padding: 10 }}>{u.nama}</td>
              <td style={{ padding: 10 }}>{u.username}</td>
              <td style={{ padding: 10 }}>{u.role}</td>
              <td style={{ padding: 10 }}>
                <button
                  onClick={() => edit(u)}
                  style={{
                    backgroundColor: "#444",
                    color: "#fff",
                    padding: "5px 10px",
                    border: "none",
                    borderRadius: 5,
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => hapus(u._id)}
                  style={{
                    marginLeft: 10,
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
              </td>
            </tr>
          ))}
          {list.length === 0 && (
            <tr>
              <td colSpan="4" align="center" style={{ padding: 15 }}>
                Belum ada user
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
