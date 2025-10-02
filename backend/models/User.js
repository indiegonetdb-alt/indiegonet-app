const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
  nama: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], required: true },

  // ✅ enum ditambah "admin"
  // ✅ required hanya kalau role = "user"
  jenis: {
    type: String,
    enum: ["toko", "pribadi", "admin"],
    required: function () {
      return this.role === "user"; // wajib kalau role user
    },
  },

  createdAt: { type: Date, default: Date.now },
});

// Hash password sebelum simpan
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Cek password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
