const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Tambah user
router.post("/register", async (req, res) => {
  try {
    const { nama, username, password, role } = req.body;
    const user = new User({ nama, username, password, role });
    await user.save();
    res.json({ message: "User created", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ambil semua user
router.get("/", async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

// Hapus user
router.delete("/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
});

// Edit user
router.put("/:id", async (req, res) => {
  const { nama, username, password, role } = req.body;
  let data = { nama, username, role };
  if (password) {
    const bcrypt = require("bcrypt");
    data.password = await bcrypt.hash(password, 10);
  }
  const user = await User.findByIdAndUpdate(req.params.id, data, { new: true });
  res.json(user);
});

module.exports = router;
