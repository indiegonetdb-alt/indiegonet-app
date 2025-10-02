import { API_URL } from "../config";   // ✅ tambahkan ini
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext"; // ✅ pastikan path benar

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/login`, {   // ✅ ubah
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!data.ok) {
        setError(data.message || data.error || "Login gagal");
        return;
      }

      // simpan user & token ke AuthContext
      login({ ...data.user, token: data.token });

      // redirect sesuai role
      if (data.user.role === "admin") {
        navigate("/dashboard");
      } else if (data.user.role === "user") {
        navigate("/user/dashboard");
      } else {
        setError("Role tidak dikenali");
      }
    } catch (err) {
      setError("Terjadi error koneksi");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #000000, #8B0000)", // hitam + merah
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "#1a1a1a",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.6)",
          color: "#fff",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <img
            src="/Indiegonet Logo.png"
            alt="Indiegonet Logo"
            style={{ width: "80px", marginBottom: "10px" }}
          />
          <h2 style={{ color: "#ff3333", margin: 0 }}>Indiegonet</h2>
          <p style={{ fontSize: "12px", color: "#aaa" }}></p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              display: "block",
              marginBottom: "15px",
              width: "100%",
              padding: "12px",
              borderRadius: "6px",
              border: "1px solid #444",
              background: "#2a2a2a",
              color: "#fff",
            }}
          />

          <div style={{ position: "relative", marginBottom: "15px" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "6px",
                border: "1px solid #444",
                background: "#2a2a2a",
                color: "#fff",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                color: "#ff3333",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              background: "#ff3333",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Login
          </button>
        </form>

        {error && (
          <p style={{ color: "red", marginTop: "15px", textAlign: "center" }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
